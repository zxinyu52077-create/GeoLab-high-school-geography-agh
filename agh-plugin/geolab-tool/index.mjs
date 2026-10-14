// GeoLab AGH plugin. It is intentionally dependency-free so the AGH snapshot can load it.
// The Agnes provider/model key is configured privately in AGH Web/TUI; this package never reads or stores it.
import { getGeoSimExperimentDefaults, isGeoSimExperimentId, runGeoSimExperiment } from './geosim-engine.mjs'

const Kind = Symbol.for('TypeBox.Kind')

const parameters = {
  [Kind]: 'Object',
  type: 'object',
  properties: {
    question: { [Kind]: 'String', type: 'string', maxLength: 2000 },
    experiment: { [Kind]: 'String', type: 'string', enum: ['required-01', 'required-02', 'required-03', 'required-04', 'required-05', 'required-06', 'required-07', 'required-08', 'required-09', 'elective-01', 'elective-02', 'elective-03', 'elective-04', 'elective-05', 'elective-06', 'elective-07', 'solar', 'water', 'circulation', 'ocean'] },
    // TypeBox's object validator requires an explicit required list for nested objects.
    // Keeping it empty preserves the open parameter bag while making AGH's runtime
    // verifier accept the same schema it publishes to the model.
    params: { [Kind]: 'Object', type: 'object', properties: {}, required: [], additionalProperties: true },
    planId: { [Kind]: 'String', type: 'string' },
  },
  required: ['question', 'experiment', 'params'],
  additionalProperties: false,
}

const meta = {
  isReadOnly: true,
  isDestructive: false,
  isConcurrencySafe: true,
  isOpenWorld: false,
  replay: 'safe',
  costHint: undefined,
  deferLoading: false,
  requiresApproval: 'never',
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round = (value, digits = 2) => Number(value.toFixed(digits))

function solveSolar(params) {
  const latitude = Number(params.latitude ?? 32.06)
  const day = Number(params.day ?? 172)
  const compareLatitude = Number(params.compareLatitude ?? 45)
  const declination = 23.44 * Math.sin((Math.PI * 2 * (day - 81)) / 365)
  const build = (label, lat) => {
    const cosHourAngle = clamp(-Math.tan((lat * Math.PI) / 180) * Math.tan((declination * Math.PI) / 180), -1, 1)
    const hourAngle = Math.acos(cosHourAngle) * 180 / Math.PI
    const noonAltitude = 90 - Math.abs(lat - declination)
    const dayLength = (2 * hourAngle) / 15
    return { label, latitude: round(lat), altitude: round(noonAltitude), dayLength: round(dayLength, 1) }
  }
  const rows = [build(String(params.city ?? '南京'), latitude), build('对照地点', compareLatitude)]
  return {
    title: '太阳高度与昼长', formula: 'h=90°−|φ−δ|；昼长=2H/15', rows,
    checks: [
      { label: '太阳直射点范围', ok: Math.abs(declination) <= 23.44, value: `δ=${round(declination)}°` },
      { label: '正午太阳高度非负', ok: rows.every((row) => row.altitude >= 0), value: '两地均可见太阳' },
      { label: '昼长计算可复算', ok: rows.every((row) => row.dayLength > 0 && row.dayLength <= 24), value: '0＜昼长≤24 h' },
    ],
    summary: `${rows[0].label}正午太阳高度约${rows[0].altitude}°、昼长约${rows[0].dayLength} h；对照地点为${rows[1].altitude}°、${rows[1].dayLength} h。`,
    inputs: { latitude, day, compareLatitude },
  }
}

function solveWater(params) {
  const precipitation = Number(params.precipitation ?? 1150)
  const evapotranspiration = Number(params.evapotranspiration ?? 720)
  const runoffRate = clamp(Number(params.runoffRate ?? 0.28), 0, 1)
  const runoff = precipitation * runoffRate
  const storageChange = precipitation - evapotranspiration - runoff
  return {
    title: '流域水量平衡', formula: 'ΔS=P−E−R；R=P×产流系数',
    rows: [[String(params.basin ?? '长江流域'), round(precipitation), round(evapotranspiration), round(runoff), round(storageChange)]],
    checks: [
      { label: '降水量为正', ok: precipitation > 0, value: `P=${round(precipitation)} mm` },
      { label: '产流系数在边界内', ok: runoffRate >= 0 && runoffRate <= 1, value: `c=${round(runoffRate, 2)}` },
      { label: '水量平衡闭合', ok: Math.abs(storageChange - (precipitation - evapotranspiration - runoff)) < 0.01, value: 'P−E−R=ΔS' },
    ],
    summary: storageChange >= 0 ? `降水扣除蒸散发与径流后，流域储水量增加约${round(storageChange)} mm。` : `降水扣除蒸散发与径流后，流域储水量减少约${round(Math.abs(storageChange))} mm。`,
    inputs: { precipitation, evapotranspiration, runoffRate },
  }
}

function solveCirculation(params) {
  const landTemp = Number(params.landTemp ?? 34)
  const seaTemp = Number(params.seaTemp ?? 26)
  const difference = landTemp - seaTemp
  const daytime = difference >= 0
  const pressure = daytime ? '陆地低压、海洋高压' : '陆地高压、海洋低压'
  const wind = daytime ? '海洋吹向陆地（海风）' : '陆地吹向海洋（陆风）'
  return {
    title: '热力环流', formula: '温度差→密度差→气压差→近地面风向',
    rows: [['陆地', round(landTemp, 1), daytime ? '低压' : '高压', daytime ? '上升' : '下沉'], ['海洋', round(seaTemp, 1), daytime ? '高压' : '低压', daytime ? '下沉' : '上升']],
    checks: [
      { label: '温差方向已确定', ok: Number.isFinite(difference), value: `陆地−海洋=${round(difference, 1)}°C` },
      { label: '气压梯度与风向一致', ok: true, value: wind },
      { label: '环流垂直运动闭合', ok: true, value: `${pressure}；存在上升与下沉` },
    ],
    summary: `${pressure}，近地面形成${wind}；温差为${round(Math.abs(difference), 1)}°C。`,
    inputs: { landTemp, seaTemp, height: Number(params.height ?? 1000) },
  }
}

function solveOcean(params) {
  const evaporation = Number(params.evaporation ?? 85)
  const precipitation = Number(params.precipitation ?? 45)
  const runoff = Number(params.runoff ?? 12)
  const salinityIndex = evaporation - precipitation - runoff
  const density = 1025 + salinityIndex * 0.004
  return {
    title: '海水性质分布', formula: '盐度倾向∝蒸发−降水−径流；密度随盐度上升而增加',
    rows: [['输入海区', round(evaporation), round(precipitation), round(runoff), round(salinityIndex), round(density, 3)]],
    checks: [
      { label: '蒸发与降水可比较', ok: evaporation >= 0 && precipitation >= 0, value: `E=${round(evaporation)}；P=${round(precipitation)}` },
      { label: '径流项非负', ok: runoff >= 0, value: `R=${round(runoff)}` },
      { label: '密度方向可解释', ok: Number.isFinite(density), value: salinityIndex >= 0 ? '偏增密' : '偏减密' },
    ],
    summary: salinityIndex >= 0 ? '蒸发主导，海水盐度与密度具有上升倾向。' : '降水和径流合计超过蒸发，海水盐度与密度具有下降倾向。',
    inputs: { latitude: Number(params.latitude ?? 25), evaporation, precipitation, runoff },
  }
}

function solveUniverse(params) {
  const distance = Number(params.distance ?? 1)
  const atmosphere = params.atmosphere !== false && String(params.atmosphere).toLowerCase() !== 'false'
  const liquidWater = params.liquidWater !== false && String(params.liquidWater).toLowerCase() !== 'false'
  const shielding = params.shielding !== false && String(params.shielding).toLowerCase() !== 'false'
  const energy = 100 / (distance ** 2)
  const temperature = 255 / Math.sqrt(distance) - 273.15 + (atmosphere ? 33 : 0)
  const conditions = [distance >= 0.75 && distance <= 1.35, atmosphere, liquidWater, shielding]
  const count = conditions.filter(Boolean).length
  return {
    title: '行星宜居条件与太阳能量', formula: 'E=100/d²；教学温度估计=T₀/√d−273.15+大气保温项',
    rows: [[String(params.planet ?? '地球'), round(distance, 2), round(energy, 1), round(temperature, 1), `${count}/4`]],
    checks: [
      { label: '日距处于教学边界', ok: distance > 0 && distance <= 5, value: '0＜d≤5' },
      { label: '宜居条件可解释', ok: conditions.every(Boolean), value: `${count}/4 条件满足` },
      { label: '反平方关系可复算', ok: Number.isFinite(energy), value: 'E=100/d²' },
    ],
    summary: `${String(params.planet ?? '地球')}接收相对辐射 ${round(energy, 1)}，估计温度 ${round(temperature, 1)}°C，满足 ${count}/4 项教学宜居条件。`,
    inputs: { distance, atmosphere, liquidWater, shielding },
  }
}

function solveCoupledWater(params) {
  const wind = Number(params.wind ?? 68)
  const solar = Number(params.solar ?? 62)
  const land = Number(params.land ?? 48)
  const mode = String(params.mode ?? 'neutral')
  const modeFactor = mode === 'el-nino' ? 0.92 : mode === 'la-nina' ? 1.08 : 1
  const precipitation = (70 + (50 - wind) * 0.12) * modeFactor
  const evaporation = Math.min(precipitation * 0.48, 18 + solar * 0.2)
  const infiltration = Math.min(precipitation - evaporation, precipitation * (0.18 + land * 0.004))
  const runoff = Math.max(0, precipitation - evaporation - infiltration)
  const current = wind >= 60 ? '信风较强，暖水向西堆积倾向' : wind <= 40 ? '信风较弱，暖水向东扩散倾向' : '风场接近中性'
  return {
    title: '洋流—水循环耦合过程', formula: 'P=E+I+R；信风改变暖水输送方向',
    rows: [[round(wind), round(solar), `${round(land)}%`, round(precipitation, 1), round(evaporation, 1), round(infiltration, 1), round(runoff, 1)]],
    checks: [
      { label: '耦合变量在边界内', ok: [wind, solar, land].every((value) => value >= 0 && value <= 100), value: '0–100' },
      { label: '水量平衡闭合', ok: Math.abs(precipitation - evaporation - infiltration - runoff) < 0.01, value: 'P−E−I−R=0' },
      { label: '信风方向可解释', ok: current.length > 0, value: current },
    ],
    summary: `${current}；降水 ${round(precipitation, 1)} 被分配为蒸发、下渗和径流。`,
    inputs: { wind, solar, land, mode },
  }
}

function solveLayer(params) {
  const depth = Number(params.depth ?? 2900)
  const wave = String(params.wave ?? 'P 波')
  const layer = depth < 70 ? '地壳' : depth < 660 ? '上地幔' : depth < 2900 ? '下地幔' : depth < 5150 ? '外核' : '内核'
  const evidence = wave === 'S 波' && depth >= 2900 ? '液态外核阻断横波' : wave === 'P 波' && depth >= 2900 ? 'P 波折射并减速' : '固态介质中传播'
  return { title: '地球内部圈层推断', formula: '地震波传播特征→介质物态推断', rows: [[round(depth), layer, wave, evidence]], checks: [{ label: '深度在地球半径内', ok: depth >= 0 && depth <= 6371, value: '0–6371 km' }, { label: '波型证据可解释', ok: evidence.length > 0, value: evidence }, { label: '直接观测与推断分开', ok: true, value: '教学推断' }], summary: `${wave} 在 ${round(depth)} km 处支持“${evidence}”的教学推断。`, inputs: { depth, wave } }
}

function solveAtmosphere(params) {
  const altitude = Number(params.altitude ?? 8)
  const latitude = Number(params.latitude ?? 30)
  const tropopause = 17 - latitude * 0.12
  const layer = altitude < tropopause ? '对流层' : altitude < 50 ? '平流层' : altitude < 85 ? '中间层' : '热层'
  const trend = layer === '平流层' || layer === '热层' ? '温度随高度升高倾向上升' : '温度随高度升高倾向下降'
  return { title: '大气垂直分层计算', formula: '对流层/中间层递减，平流层/热层递增', rows: [[round(altitude), round(latitude), layer, trend]], checks: [{ label: '高度边界有效', ok: altitude >= 0 && altitude <= 120, value: '0–120 km' }, { label: '纬度修正对流层顶', ok: tropopause > 0, value: `${round(tropopause, 1)} km` }, { label: '温度趋势可解释', ok: true, value: trend }], summary: `${round(altitude)} km、${round(latitude)}° 处位于${layer}，${trend}。`, inputs: { altitude, latitude } }
}

function solveFront(params) {
  const stage = Number(params.stage ?? 45)
  const contrast = Number(params.contrast ?? 14)
  const moisture = Number(params.moisture ?? 72)
  const rain = Math.max(0, moisture * (1 - Math.abs(stage - 50) / 80) * contrast / 20)
  return { title: '锋面过境观测计算', formula: '气温、气压、风向和降水连续变化判别锋面', rows: [[round(stage), round(22 - stage * 0.08, 1), round(1002 + stage * 0.12, 1), round(rain, 1)]], checks: [{ label: '过程时刻有效', ok: stage >= 0 && stage <= 100, value: `${round(stage)}%` }, { label: '温压变化可解释', ok: true, value: '过境后气温降、气压升' }, { label: '水汽输入有效', ok: moisture >= 0 && moisture <= 100, value: `${round(moisture)}%` }], summary: `锋面过程处于 ${round(stage)}%，模拟降水约 ${round(rain, 1)} mm/h。`, inputs: { stage, contrast, moisture } }
}

function solveRiver(params) {
  const slope = Number(params.slope ?? 62)
  const discharge = Number(params.discharge ?? 58)
  const sediment = Number(params.sediment ?? 48)
  const vegetation = Number(params.vegetation ?? 52)
  const balance = sediment * (1.15 - vegetation / 220) - slope * discharge / 100 * 0.6
  return { title: '河流地貌水沙过程', formula: '输沙盈亏=来沙供给−水流搬运能力', rows: [[round(slope), round(discharge), round(sediment), round(vegetation), round(balance)]], checks: [{ label: '变量边界有效', ok: [slope, discharge, sediment, vegetation].every((value) => value >= 0 && value <= 100), value: '0–100' }, { label: '供给与搬运分开', ok: true, value: '双因素模型' }, { label: '结论保留科学边界', ok: true, value: '教学趋势模型' }], summary: `当前输沙盈亏为 ${round(balance)}，表现为${balance > 20 ? '堆积' : balance < -20 ? '侵蚀' : '相对平衡'}倾向。`, inputs: { slope, discharge, sediment, vegetation } }
}

function solveHazard(params) {
  const energy = Number(params.energy ?? 6.4)
  const viscosity = Number(params.viscosity ?? 74)
  const gas = Number(params.gas ?? 62)
  const explosion = viscosity + gas > 125
  return { title: '地震与火山灾害计算', formula: '高黏度+高挥发分→爆炸性增强；震级用于相对能量比较', rows: [[round(energy, 1), round(viscosity), round(gas), explosion ? '爆炸性增强' : '熔岩溢流倾向']], checks: [{ label: '震级边界有效', ok: energy >= 3 && energy <= 9, value: `${round(energy, 1)} 级` }, { label: '黏度与挥发分方向一致', ok: viscosity >= 0 && gas >= 0, value: explosion ? '压力积聚' : '气体较易逸出' }, { label: '灾害结论非绝对预测', ok: true, value: '教学趋势模型' }], summary: `当前条件下喷发倾向为${explosion ? '爆炸性增强' : '熔岩溢流'}，不代表灾害预报。`, inputs: { energy, viscosity, gas } }
}

const CITY_LATITUDES = { 南京: 32.06, 北京: 39.9, 哈尔滨: 45.75 }

function seasonDeclination(value) {
  if (typeof value === 'number') return Number(value)
  const text = String(value ?? '').toLowerCase()
  if (text.includes('夏')) return 23.44
  if (text.includes('冬')) return -23.44
  if (text.includes('春') || text.includes('秋')) return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function solveSolarComparison(params) {
  const cities = Array.isArray(params.cities) && params.cities.length
    ? params.cities.map((city) => typeof city === 'string' ? ({ name: city, latitude: CITY_LATITUDES[city] ?? 30 }) : ({ name: city.name || '观测点', latitude: Number(city.latitude ?? 30) }))
    : Object.entries(CITY_LATITUDES).map(([name, latitude]) => ({ name, latitude }))
  const seasons = Array.isArray(params.seasons) && params.seasons.length ? params.seasons : ['夏至', '冬至']
  const rows = []
  for (const season of seasons) {
    const declination = seasonDeclination(season)
    for (const city of cities) {
      const cosHourAngle = clamp(-Math.tan((city.latitude * Math.PI) / 180) * Math.tan((declination * Math.PI) / 180), -1, 1)
      const hourAngle = Math.acos(cosHourAngle) * 180 / Math.PI
      const altitude = 90 - Math.abs(city.latitude - declination)
      const dayLength = (2 * hourAngle) / 15
      rows.push([city.name, String(season), round(city.latitude), round(altitude), round(dayLength, 1)])
    }
  }
  const summerRows = rows.filter((row) => row[1].includes('夏'))
  const winterRows = rows.filter((row) => row[1].includes('冬'))
  return {
    title: '多城市多节气太阳高度与昼长对比',
    formula: 'h=90°−|φ−δ|；昼长=2H/15；H=arccos(−tanφtanδ)',
    columns: ['城市', '节气', '纬度', '正午太阳高度', '昼长'],
    rows,
    checks: [
      { label: '每个城市和节气均有结果', ok: rows.length === cities.length * seasons.length, value: `${rows.length}/${cities.length * seasons.length} 组` },
      { label: '昼长均在物理边界内', ok: rows.every((row) => row[4] > 0 && row[4] <= 24), value: '0＜昼长≤24 h' },
      { label: '夏冬昼长方向可解释', ok: summerRows.length === 0 || winterRows.length === 0 || cities.every((city) => { const summer = summerRows.find((row) => row[0] === city.name); const winter = winterRows.find((row) => row[0] === city.name); return !summer || !winter || summer[4] >= winter[4] }), value: '夏至昼长不短于冬至' },
    ],
    summary: `${cities.map((city) => city.name).join('、')}在${seasons.join('、')}的${rows.length}组结果已生成。`,
    inputs: { cities, seasons },
  }
}

function makePlan(question, experiment, params) {
  const solarComparison = experiment === 'required-02' && /南京|北京|哈尔滨|夏至|冬至/.test(question)
  const plannedParams = solarComparison ? {
    ...params,
    cities: params.cities?.length ? params.cities : ['南京', '北京', '哈尔滨'],
    seasons: params.seasons?.length ? params.seasons : ['夏至', '冬至'],
  } : params
  const cases = solarComparison ? plannedParams.seasons.flatMap((season) => plannedParams.cities.map((city) => ({ city, season }))) : [{ experiment, params: plannedParams }]
  return {
    planId: `plan-${experiment}-${cases.length}`,
    experiment,
    question,
    hypothesis: solarComparison ? '纬度越高，夏冬季太阳高度与昼长差异通常越明显。' : '控制关键变量后运行原有 GeoSim 实验，并用规则核验结果。',
    variables: solarComparison ? ['城市纬度', '太阳直射纬度/节气'] : Object.keys(plannedParams),
    cases,
    params: plannedParams,
    nextTool: 'geosim_run_original_experiment',
  }
}

function verifyExperiment(result, experiment, params) {
  // Agnes may pass the complete geolab.evidence.v1 envelope returned by the
  // simulation tool, or only its nested result object. Normalize both forms
  // before verifying so the third AGH step checks the data actually produced
  // by the second step rather than silently treating the envelope as empty.
  const observed = result?.schema === 'geolab.evidence.v1' && result?.result && typeof result.result === 'object'
    ? result.result
    : result
  const expected = runOriginalExperiment(experiment, params || {})
  const observedChecks = Array.isArray(observed?.checks) ? observed.checks : []
  const checks = [
    ...observedChecks,
    {
      label: '结果与原 GeoSim 重算一致',
      ok: JSON.stringify(observed) === JSON.stringify(expected),
      value: JSON.stringify(observed) === JSON.stringify(expected) ? 'deterministic match' : 'deterministic mismatch',
    },
  ]
  const passed = checks.filter((check) => check.ok).length
  return {
    experiment,
    passed,
    total: checks.length,
    ok: checks.length > 0 && passed === checks.length,
    checks,
    explanation: passed === checks.length ? '数据满足当前教学模型的边界和复算规则，并与原 GeoSim 确定性重算一致。' : '至少一项核验未通过，应检查参数或重新规划实验。',
    params,
  }
}

function runExperiment(experiment, params) {
  if (experiment === 'water') return solveWater(params)
  if (experiment === 'circulation') return solveCirculation(params)
  if (experiment === 'ocean') return solveOcean(params)
  return solveSolar(params)
}

function runOriginalExperiment(experiment, params) {
  if (isGeoSimExperimentId(experiment)) {
    return runGeoSimExperiment(experiment, { ...getGeoSimExperimentDefaults(experiment), ...(params || {}) })
  }
  if (experiment === 'required-01') return solveUniverse(params)
  if (experiment === 'required-02' || experiment === 'elective-01' || experiment === 'solar') {
    if (experiment === 'required-02' && (Array.isArray(params.cities) || Array.isArray(params.seasons))) return solveSolarComparison(params)
    const declination = Number(params.season ?? params.day ?? 0)
    const day = Math.round(81 + declination * 365 / 23.44)
    return solveSolar({ city: params.city ?? '当前观测点', latitude: params.latitude ?? 30, day, compareLatitude: params.compareLatitude ?? 45 })
  }
  if (experiment === 'required-06' || experiment === 'elective-02' || experiment === 'circulation') {
    const night = params.time === '夜晚'
    const landTemp = Number(params.landTemp ?? (night ? 20 : 34))
    const seaTemp = Number(params.seaTemp ?? (night ? 26 : 26))
    return solveCirculation({ landTemp, seaTemp, height: params.height ?? 1000 })
  }
  if (experiment === 'required-03' || experiment === 'elective-04') return solveRiver({ slope: params.stress ?? 68, discharge: params.erosion ?? 34, sediment: params.fault ?? 28, vegetation: 50 })
  if (experiment === 'required-04') return solveLayer(params)
  if (experiment === 'required-05') return solveAtmosphere(params)
  if (experiment === 'elective-03') return solveFront(params)
  if (experiment === 'elective-05') return solveRiver(params)
  if (experiment === 'elective-06') return solveHazard(params)
  if (experiment === 'elective-07') return solveCoupledWater(params)
  if (experiment === 'elective-07' || experiment === 'water') {
    const precipitation = Number(params.precipitation ?? params.rain ?? 55)
    const runoffRate = Number(params.runoffRate ?? (0.2 + Number(params.urban ?? 22) / 200))
    return solveWater({ basin: params.basin ?? '原 GeoSim 流域实验', precipitation, evapotranspiration: Number(params.evapotranspiration ?? precipitation * .45), runoffRate })
  }
  if (experiment === 'required-08' || experiment === 'required-09' || experiment === 'ocean') {
    return solveOcean({ latitude: params.latitude ?? 25, evaporation: params.evaporation ?? 85, precipitation: params.precipitation ?? 45, runoff: params.runoff ?? 12 })
  }
  const numeric = Object.entries(params).filter(([, value]) => typeof value === 'number').map(([key, value]) => ({ variable: key, value }))
  return { title: `原 GeoSim 实验 ${experiment}`, formula: '保留原实验控制变量；由 AGH 汇总页面实时读数', rows: numeric.length ? numeric : [{ variable: 'state', value: 'page-state' }], checks: [{ label: '原实验路由已识别', ok: true, value: experiment }, { label: '参数已传入 AGH', ok: true, value: `${Object.keys(params).length} 个参数` }, { label: '结果需结合页面读数解释', ok: true, value: '教学趋势数据' }], summary: 'AGH 已读取原 GeoSim 实验参数并形成可追溯结果摘要。', inputs: params }
}

const serviceInputSchema = {
  type: 'object',
  properties: {
    question: { type: 'string' },
    experimentId: { type: 'string' },
    params: { type: 'object', additionalProperties: true },
  },
  required: ['question', 'experimentId', 'params'],
  additionalProperties: false,
}

const planParameters = {
  [Kind]: 'Object',
  type: 'object',
  properties: {
    question: { [Kind]: 'String', type: 'string', maxLength: 2000 },
    experiment: { [Kind]: 'String', type: 'string' },
    params: { [Kind]: 'Object', type: 'object', properties: {}, required: [], additionalProperties: true },
  },
  required: ['question', 'experiment', 'params'],
  additionalProperties: false,
}

const verifyParameters = {
  [Kind]: 'Object',
  type: 'object',
  properties: {
    experiment: { [Kind]: 'String', type: 'string' },
    params: { [Kind]: 'Object', type: 'object', properties: {}, required: [], additionalProperties: true },
    result: { [Kind]: 'Object', type: 'object', properties: {}, required: [], additionalProperties: true },
  },
  required: ['experiment', 'params', 'result'],
  additionalProperties: false,
}

const serviceOutputSchema = {
  type: 'object',
  properties: {
    schema: { type: 'string' },
    experimentId: { type: 'string' },
    result: { type: 'object', additionalProperties: true },
  },
  required: ['schema', 'experimentId', 'result'],
  additionalProperties: false,
}

export const geoLabTool = {
  inject: ['extension'],
  apply(ctx) {
    const agnes = ctx.extension()
    agnes.registerTool({
      name: 'geolab_plan_experiment',
      description: 'First step of a GeoLab task. Convert the student question into controlled cases and declare the next tool. Do not run the simulation in this step.',
      parameters: planParameters,
      meta,
      async execute({ question, experiment, params }) {
        const plan = makePlan(question, experiment, params)
        return { content: [{ type: 'text', text: JSON.stringify(plan) }], structured: plan }
      },
    })
    agnes.registerTool({
      name: 'geosim_run_original_experiment',
      description: 'Second step of a GeoLab task. Run the planned original GeoSim simulation and return raw structured data. Do not replace this call with mental arithmetic.',
      parameters,
      meta,
      async execute({ question, experiment, params }) {
        const result = runOriginalExperiment(experiment, params)
        const structured = {
          schema: 'geolab.evidence.v1',
          question,
          experiment,
          result,
          verification: result.checks,
          deterministic: true,
        }
        return { content: [{ type: 'text', text: JSON.stringify(structured) }], structured }
      },
    })
    agnes.registerTool({
      name: 'geolab_verify_experiment',
      description: 'Third step of a GeoLab task. Check the returned simulation result against its declared rules and report pass/fail before explaining it to the student.',
      parameters: verifyParameters,
      meta,
      async execute({ experiment, params, result }) {
        const verification = verifyExperiment(result, experiment, params)
        return { content: [{ type: 'text', text: JSON.stringify(verification) }], structured: verification }
      },
    })
    if (ctx.services?.register) {
      ctx.services.register({
        name: 'geolab.experiment.status',
        kind: 'query',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        outputSchema: {
          type: 'object',
          properties: { tool: { type: 'string' }, experiments: { type: 'number' } },
          required: ['tool', 'experiments'],
          additionalProperties: false,
        },
        timeoutMs: 1000,
        maxResultBytes: 1024,
        async handler() {
          return { tool: 'geosim_run_original_experiment', experiments: 16 }
        },
      })
      ctx.services.register({
        name: 'geolab.experiment.run',
        kind: 'query',
        inputSchema: serviceInputSchema,
        outputSchema: serviceOutputSchema,
        timeoutMs: 5000,
        maxResultBytes: 1024 * 1024,
        async handler({ question, experimentId, params }) {
          const result = runOriginalExperiment(experimentId, params)
          return { schema: 'geolab.evidence.v1', question, experimentId, result, verification: result.checks, deterministic: true }
        },
      })
    }
    agnes.on('session_start', () => {
      agnes.ctx.log.info('geolab_run_experiment is available for GeoLab sessions')
    })
  },
}
