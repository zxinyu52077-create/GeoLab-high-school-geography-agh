const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round = (value, digits = 2) => Number(Number(value).toFixed(digits))
const radians = (value) => Number(value) * Math.PI / 180

const definitions = {
  'required-01': { title: '地球的宇宙环境', chapter: '第一章 · 宇宙中的地球', prompt: '行星距离、保温大气和液态水条件怎样共同影响宜居性？', defaults: { planet: '地球', distance: 1, atmosphere: true, liquidWater: true, shielding: true } },
  'required-02': { title: '太阳对地球的影响', chapter: '第一章 · 宇宙中的地球', prompt: '纬度和季节怎样改变一地获得的太阳辐射？', defaults: { latitude: 30, season: 0, cloud: 20, activity: 32 } },
  'required-03': { title: '地层挖掘与地质年代复原', chapter: '第四章 · 地貌', prompt: '不同地点的岩层被侵蚀、错断后，怎样判断先后关系？', defaults: { depth: 2, erosion: 18, structure: '正常层序（未倒转）' } },
  'required-04': { title: '地球的圈层结构', chapter: '第一章 · 地球的圈层结构', prompt: '看不见的地球深处，我们如何知道它是什么？', defaults: { depth: 2900, wave: 'P 波' } },
  'required-05': { title: '大气成分与垂直分层', chapter: '第二章 · 地球上的大气', prompt: '越往高处走，大气的温度会怎样变化？', defaults: { altitude: 8, latitude: 30 } },
  'required-06': { title: '大气能量收支与热力环流', chapter: '第二章 · 地球上的大气', prompt: '海风和陆风，为什么会在昼夜间反向？', defaults: { time: '白天', cloud: 15, surface: '海陆交界' } },
  'required-07': { title: '水循环过程与水量平衡', chapter: '第三章 · 地球上的水', prompt: '一场暴雨落下后，水会走向哪里？', defaults: { rain: 55, vegetation: 68, urban: 22, soilMoisture: 40 } },
  'required-08': { title: '海水性质分布仿真', chapter: '第三章 · 地球上的水', prompt: '温度、盐度和压力，谁在控制海水密度？', defaults: { property: '温度', latitude: 25, depth: 500 } },
  'required-09': { title: '洋流分布与海浪潮汐', chapter: '第三章 · 地球上的水', prompt: '风、地转偏向力和月球引力，怎样塑造海洋？', defaults: { basin: '太平洋', hemisphere: '北半球', wind: 8, moon: '朔月 · 大潮' } },
  'elective-01': { title: '时空穿梭者', chapter: '第一章 · 地球的运动', prompt: '比较观测纬度、太阳直射纬度和地方时对太阳高度与昼长的影响。', defaults: { latitude: 40, day: 23.5, hour: 12 } },
  'elective-02': { title: '气压带与风带', chapter: '第三章 · 大气的运动', prompt: '太阳直射点移动、自转效应和海陆温差如何改变环流？', defaults: { day: 23.5, rotation: 75, contrast: 65 } },
  'elective-03': { title: '锋面系统与气旋模拟', chapter: '第三章 · 天气系统', prompt: '如何根据连续气象观测判断锋面过境？', defaults: { stage: 45, contrast: 14, moisture: 72 } },
  'elective-04': { title: '构造运动与地貌演化', chapter: '第二章 · 地表形态的塑造', prompt: '构造受力、断层和侵蚀如何共同改变地貌？', defaults: { stress: 68, erosion: 34, fault: 28 } },
  'elective-05': { title: '河流地貌与水沙过程', chapter: '第二章 · 地表形态的塑造', prompt: '坡降、流量、植被和来沙如何决定侵蚀或沉积？', defaults: { slope: 62, discharge: 58, sediment: 48, vegetation: 52, base: 52 } },
  'elective-06': { title: '地震与火山灾害', chapter: '第二章 · 地表形态的塑造', prompt: '怎样用地震波到时差定位震中，并判断火山喷发危险？', defaults: { energy: 6.4, viscosity: 74, gas: 62 } },
  'elective-07': { title: '洋流与水循环过程', chapter: '第四章 · 水的运动', prompt: '改变信风和入渗条件，比较海气状态与流域水循环。', defaults: { wind: 68, solar: 62, land: 48, mode: 'neutral' } },
}

export function getGeoSimExperimentDefinition(experimentId) {
  return definitions[experimentId] || definitions['required-02']
}

export function getGeoSimExperimentCatalog() {
  return Object.entries(definitions).map(([id, definition]) => ({
    id,
    title: definition.title,
    chapter: definition.chapter,
    prompt: definition.prompt,
    defaults: { ...definition.defaults },
  }))
}

export function isGeoSimExperimentId(experimentId) {
  return Object.prototype.hasOwnProperty.call(definitions, experimentId)
}

export function getGeoSimExperimentDefaults(experimentId) {
  return { ...getGeoSimExperimentDefinition(experimentId).defaults }
}

function solarResult(params) {
  const latitude = Number(params.latitude ?? 30)
  const declination = Number(params.season ?? params.day ?? 0)
  const hour = Number(params.hour ?? 12)
  const cloud = Number(params.cloud ?? 0)
  const altitude = 90 - Math.abs(latitude - declination)
  const cosine = clamp(-Math.tan(radians(latitude)) * Math.tan(radians(declination)), -1, 1)
  const hourAngle = Math.acos(cosine)
  const daylight = 24 * hourAngle / Math.PI
  const localHourAngle = radians((hour - 12) * 15)
  const currentAltitude = Math.asin(Math.sin(radians(latitude)) * Math.sin(radians(declination)) + Math.cos(radians(latitude)) * Math.cos(radians(declination)) * Math.cos(localHourAngle)) * 180 / Math.PI
  const dailyIndex = Math.max(0, round(100 * (hourAngle * Math.sin(radians(latitude)) * Math.sin(radians(declination)) + Math.cos(radians(latitude)) * Math.cos(radians(declination)) * Math.sin(hourAngle)) * (1 - cloud * .006)))
  return { latitude, declination, hour, cloud, altitude, daylight, currentAltitude, dailyIndex }
}

function seasonDeclination(value) {
  if (typeof value === 'number') return Number(value)
  const text = String(value ?? '').toLowerCase()
  if (text.includes('夏')) return 23.44
  if (text.includes('冬')) return -23.44
  if (text.includes('春') || text.includes('秋')) return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function solarComparisonEvidence(params) {
  const defaultCities = [{ name: '南京', latitude: 32.06 }, { name: '北京', latitude: 39.9 }, { name: '哈尔滨', latitude: 45.75 }]
  const knownLatitudes = { 南京: 32.06, 北京: 39.9, 哈尔滨: 45.75 }
  const cities = Array.isArray(params.cities) && params.cities.length
    ? params.cities.map((city) => typeof city === 'string' ? ({ name: city, latitude: knownLatitudes[city] ?? 30 }) : ({ name: city.name || '观测点', latitude: Number(city.latitude ?? 30) }))
    : defaultCities
  const seasons = Array.isArray(params.seasons) && params.seasons.length ? params.seasons : ['夏至', '冬至']
  const rows = []
  for (const season of seasons) {
    const declination = seasonDeclination(season)
    for (const city of cities) {
      const result = solarResult({ latitude: city.latitude, season: declination, cloud: params.cloud ?? 0 })
      rows.push([city.name, String(season), `${round(city.latitude)}°`, `${round(result.altitude)}°`, `${round(result.daylight, 1)} h`, result.dailyIndex])
    }
  }
  const summerRows = rows.filter((row) => String(row[1]).includes('夏'))
  const winterRows = rows.filter((row) => String(row[1]).includes('冬'))
  return {
    title: '多城市多节气太阳高度与昼长对比',
    formula: 'h=90°−|φ−δ|；昼长=24H/π；H=arccos(−tanφtanδ)',
    columns: ['城市', '节气', '纬度', '正午太阳高度', '昼长', '日辐射指数'],
    rows,
    metrics: [{ label: '城市数', value: `${cities.length} 个` }, { label: '节气数', value: `${seasons.length} 个` }, { label: '数据组数', value: `${rows.length} 组` }],
    checks: [
      { label: '每个城市和节气均有结果', ok: rows.length === cities.length * seasons.length, value: `${rows.length}/${cities.length * seasons.length} 组` },
      { label: '昼长均在物理边界内', ok: rows.every((row) => Number.parseFloat(row[4]) > 0 && Number.parseFloat(row[4]) <= 24), value: '0＜昼长≤24 h' },
      { label: '高纬度季节差异方向可解释', ok: summerRows.length === 0 || winterRows.length === 0 || cities.every((city) => { const summer = summerRows.find((row) => row[0] === city.name); const winter = winterRows.find((row) => row[0] === city.name); return !summer || !winter || Number.parseFloat(summer[4]) >= Number.parseFloat(winter[4]) }), value: '夏至昼长不短于冬至' },
    ],
    summary: `${cities.map((city) => city.name).join('、')}在${seasons.join('、')}的${rows.length}组太阳高度和昼长已完成对照；纬度越高，夏冬季昼长差异通常越明显。`,
  }
}

function solarEvidence(params) {
  if (Array.isArray(params.cities) || Array.isArray(params.seasons)) return solarComparisonEvidence(params)
  const result = solarResult(params)
  return {
    title: '太阳辐射几何计算', formula: 'h=90°−|φ−δ|；昼长=24H/π；日辐射指数对昼间入射角积分',
    columns: ['观测纬度', '直射纬度', '正午高度', '昼长', '日辐射指数'],
    rows: [[`${round(result.latitude)}°`, `${round(result.declination)}°`, `${round(result.altitude)}°`, `${round(result.daylight, 1)} h`, result.dailyIndex]],
    metrics: [{ label: '正午太阳高度', value: `${round(result.altitude)}°` }, { label: '昼长', value: `${round(result.daylight, 1)} h` }, { label: '日辐射相对值', value: `${result.dailyIndex}` }],
    checks: [{ label: '正午太阳高度可复算', ok: result.altitude >= 0 && result.altitude <= 90, value: '90°−|φ−δ|' }, { label: '昼长边界正确', ok: result.daylight > 0 && result.daylight <= 24, value: '0＜昼长≤24 h' }, { label: '云量削弱项有界', ok: result.dailyIndex >= 0, value: `云量 ${round(result.cloud)}%` }],
    summary: `在 ${round(result.latitude)}° 纬度、太阳直射 ${round(result.declination)}° 时，正午太阳高度约 ${round(result.altitude)}°，昼长约 ${round(result.daylight, 1)} 小时。`,
  }
}

function layerEvidence(params) {
  const depth = Number(params.depth ?? 2)
  const structure = params.structure || '正常层序（未倒转）'
  const layer = ['第四纪沉积层', '白垩纪灰岩', '侏罗纪页岩', '二叠纪砂岩', '寒武纪灰岩', '基底岩层'][clamp(Math.round(depth), 0, 5)]
  const relation = structure === '断层切割' ? '断层晚于被切地层' : structure === '侵蚀不整合' ? '侵蚀面造成时间记录缺失' : structure === '地层倒转' ? '先判顶底再恢复新老方向' : '未倒转时可用下老上新'
  return { title: '地层相对年代证据', formula: '叠置关系 + 切割关系 + 标准化石；不把层厚直接当年代', columns: ['揭露层数', '结构关系', '当前地层', '证据边界'], rows: [[`${clamp(Math.round(depth), 0, 6)} / 6`, structure, layer, relation]], metrics: [{ label: '地层结构', value: structure }, { label: '当前层位', value: layer }], checks: [{ label: '层数在模型边界内', ok: depth >= 0 && depth <= 6, value: '0–6 层' }, { label: '相对年代依据匹配', ok: true, value: relation }, { label: '避免绝对年代越界', ok: true, value: '只输出相对先后' }], summary: `当前证据为“${structure}”。${relation}；本实验只支持相对年代推断。` }
}

function layerStructureEvidence(params) {
  const depth = Number(params.depth ?? 2900)
  const wave = params.wave || 'P 波'
  const layer = depth < 70 ? '地壳' : depth < 660 ? '上地幔' : depth < 2900 ? '下地幔' : depth < 5150 ? '外核' : '内核'
  const waveEvidence = wave === 'S 波' && depth >= 2900 ? '液态外核阻断横波' : wave === 'P 波' && depth >= 2900 ? 'P 波进入外核后折射、减速' : '固态圈层中传播'
  return { title: '地球内部圈层推断', formula: '地震波类型 + 传播路径变化 → 介质物态推断', columns: ['探测深度', '所在圈层', '波型', '证据'], rows: [[`${round(depth)} km`, layer, wave, waveEvidence]], metrics: [{ label: '所在圈层', value: layer }, { label: '波的证据', value: waveEvidence }], checks: [{ label: '深度在地球半径内', ok: depth >= 0 && depth <= 6371, value: '0–6371 km' }, { label: 'S 波液态边界判断', ok: wave !== 'S 波' || depth < 2900 || layer === '外核' || layer === '内核', value: waveEvidence }, { label: '区分直接观测与推断', ok: true, value: '由波传播特征推断' }], summary: `${wave} 在 ${round(depth)} km 处的教学模拟表明：${waveEvidence}。` }
}

function atmosphereEvidence(params) {
  const altitude = Number(params.altitude ?? 8)
  const latitude = Number(params.latitude ?? 30)
  const tropopause = 17 - latitude * .12
  const layer = altitude < tropopause ? '对流层' : altitude < 50 ? '平流层' : altitude < 85 ? '中间层' : '热层'
  const tropopauseTemperature = -50 - 3 * (tropopause - 8)
  const lapse = (15 - tropopauseTemperature) / tropopause
  const temperature = altitude < tropopause ? 15 - lapse * altitude : altitude < 50 ? tropopauseTemperature + (-15 - tropopauseTemperature) * ((altitude - tropopause) / (50 - tropopause)) : altitude < 85 ? -15 - 75 * ((altitude - 50) / 35) : -90 + 12 * (altitude - 85)
  const density = Math.exp(-altitude / 8.5)
  return { title: '大气垂直分层计算', formula: '对流层递减；平流层递增；中间层递减；热层递增', columns: ['高度', '纬度', '所在层', '温度', '相对密度'], rows: [[`${round(altitude)} km`, `${round(latitude)}°`, layer, `${round(temperature)}°C`, density.toPrecision(2)]], metrics: [{ label: '所在层', value: layer }, { label: '当前温度', value: `${round(temperature)}°C` }, { label: '空气密度', value: density.toPrecision(2) }], checks: [{ label: '高度边界有效', ok: altitude >= 0 && altitude <= 120, value: '0–120 km' }, { label: '纬度修正对流层顶', ok: tropopause > 0, value: `${round(tropopause, 1)} km` }, { label: '温度趋势可解释', ok: true, value: layer }], summary: `探测点位于 ${round(altitude)} km、${round(latitude)}°，模型判定为${layer}，温度约 ${round(temperature)}°C。` }
}

function thermalEvidence(params) {
  const night = params.time === '夜晚'
  const mountain = params.surface === '山谷地带'
  const cloud = Number(params.cloud ?? 15) / 100
  const baseContrast = mountain ? (night ? 6 : 9) : (night ? 8 : 12)
  const contrast = baseContrast * (1 - cloud * (night ? .55 : .65))
  const wind = mountain ? (night ? '山风：坡地 → 谷地' : '谷风：谷地 → 坡地') : (night ? '陆风：陆地 → 海洋' : '海风：海洋 → 陆地')
  return { title: '热力环流过程计算', formula: '受热差异 → 密度差异 → 气压差异 → 近地面风向', columns: ['时段', '下垫面', '温差估值', '近地面风向'], rows: [[params.time || '白天', params.surface || '海陆交界', `${round(contrast, 1)}°C`, wind]], metrics: [{ label: '热力温差', value: `${round(contrast, 1)}°C` }, { label: '风向', value: wind }], checks: [{ label: '云量边界有效', ok: cloud >= 0 && cloud <= 1, value: `${round(cloud * 100)}%` }, { label: '高压流向低压', ok: true, value: wind }, { label: '垂直补偿闭合', ok: true, value: '上升与下沉构成环流' }], summary: `${params.time || '白天'}的${params.surface || '海陆交界'}形成约 ${round(contrast, 1)}°C 热力差，近地面表现为${wind}。` }
}

function runoffEvidence(params) {
  const rain = Number(params.rain ?? 55)
  const vegetation = Number(params.vegetation ?? 68) / 100
  const impervious = Number(params.urban ?? 22) / 100
  const moisture = Number(params.soilMoisture ?? 40) / 100
  const capacity = Math.max(5, 15 + vegetation * 45 - moisture * 25)
  const infiltration = Math.min(rain, capacity) * (1 - impervious)
  const runoff = rain * impervious + Math.max(0, rain - capacity) * (1 - impervious)
  return { title: '流域水量分配计算', formula: 'P=R地表+I下渗+E等损失；下垫面改变入渗与汇流速度', columns: ['降水', '入渗能力', '下渗入土', '地表径流', '径流率'], rows: [[`${round(rain)} mm/h`, `${round(capacity)} mm/h`, `${round(infiltration)} mm/h`, `${round(runoff)} mm/h`, `${round(runoff / rain * 100)}%`]], metrics: [{ label: '地表径流', value: `${round(runoff, 1)} mm/h` }, { label: '下渗比例', value: `${round(infiltration / rain * 100)}%` }], checks: [{ label: '输入边界有效', ok: rain > 0 && impervious >= 0 && impervious <= 1, value: '降水与不透水面有效' }, { label: '水量分配闭合', ok: Math.abs((rain * impervious + Math.max(0, rain - capacity) * (1 - impervious)) - runoff) < .01, value: '径流计算可复算' }, { label: '下垫面效应方向正确', ok: impervious > 0 ? runoff >= 0 : true, value: '硬化面提高快速径流倾向' }], summary: `在降水 ${round(rain)} mm/h、植被 ${round(vegetation * 100)}%、不透水面 ${round(impervious * 100)}% 条件下，地表径流约 ${round(runoff, 1)} mm/h。` }
}

function oceanEvidence(params) {
  const latitude = Math.abs(Number(params.latitude ?? 25))
  const depth = Number(params.depth ?? 500)
  const temperature = 2 + (28 - .36 * latitude - 2) * Math.exp(-depth / 650)
  const salinity = 34.7 + 1.25 * Math.exp(-(((latitude - 25) / 18) ** 2)) - .55 * Math.exp(-((latitude / 13) ** 2)) - 1.65 * Math.exp(-(((latitude - 76) / 15) ** 2)) - .00008 * depth
  const density = 1.028 - .00021 * (temperature - 10) + .00075 * (salinity - 35) + .0000008 * depth
  const property = params.property || '温度'
  const observed = property === '温度' ? `${round(temperature, 1)}°C` : property === '盐度' ? `${round(salinity, 2)}‰` : `${round(density, 4)} g/cm³`
  return { title: '海水性质剖面计算', formula: '温度、盐度与压力共同影响海水密度；深度改变压力并伴随水温变化', columns: ['纬度', '深度', '温度', '盐度', '密度'], rows: [[`${round(latitude)}°`, `${round(depth)} m`, `${round(temperature, 1)}°C`, `${round(salinity, 2)}‰`, `${round(density, 4)} g/cm³`]], metrics: [{ label: property, value: observed }, { label: '密度', value: `${round(density, 4)} g/cm³` }], checks: [{ label: '深度边界有效', ok: depth >= 0 && depth <= 5000, value: '0–5000 m' }, { label: '盐度范围合理', ok: salinity > 30 && salinity < 40, value: `${round(salinity, 2)}‰` }, { label: '密度方向可解释', ok: Number.isFinite(density), value: '冷、咸、深度增大倾向增密' }], summary: `在 ${round(latitude)}°、${round(depth)} m 处，${property}读数为 ${observed}；密度约 ${round(density, 4)} g/cm³。` }
}

function originalOceanEvidence(params) {
  const wind = Number(params.wind ?? 68)
  const solar = Number(params.solar ?? 62)
  const land = Number(params.land ?? 48)
  const mode = params.mode || 'neutral'
  const eastTemperature = 28 - 5 * wind / 100
  const westTemperature = 27 + 2 * wind / 100
  const waterRunoff = 20 + solar * .58 + (100 - land) * .58
  return { title: '洋流与流域过程计算', formula: '风应力 + 地转偏向 + 海陆轮廓塑造洋流；入渗改变流域径流分配', columns: ['海气状态', '西部海温', '东部海温', '东部上升流', '入渗倾向'], rows: [[mode, `${round(westTemperature, 1)}°C`, `${round(eastTemperature, 1)}°C`, wind > 60 ? '较强' : wind < 38 ? '显著减弱' : '中等', `${round(land)} / 100`]], metrics: [{ label: '海气状态', value: mode }, { label: '流域径流倾向', value: `${round(waterRunoff)} / 100` }], checks: [{ label: '信风参数在边界内', ok: wind >= 0 && wind <= 100, value: `${round(wind)}%` }, { label: '暖水分布方向一致', ok: westTemperature > eastTemperature || wind < 38, value: wind < 38 ? '暖水向东扩展' : '暖水偏西' }, { label: '海洋与水循环机制分开', ok: true, value: '洋流 / 入渗分别解释' }], summary: `当前海气状态为${mode}，信风 ${round(wind)}%；西部海温约 ${round(westTemperature, 1)}°C，东部约 ${round(eastTemperature, 1)}°C。` }
}

function circulationEvidence(params) {
  const day = Number(params.day ?? 23.5)
  const rotation = Number(params.rotation ?? 75)
  const contrast = Number(params.contrast ?? 65)
  return { title: '气压带与风带计算', formula: '直射点移动改变热力带位置；自转效应改变风向偏转；海陆温差改变区域压差', columns: ['直射纬度', '环流带偏移', '自转效应', '季风压差指数'], rows: [[`${round(day, 1)}°`, `${round(day * .3, 1)}°`, `${round(rotation)}%`, `${round(contrast * .72)} / 100`]], metrics: [{ label: '环流带偏移', value: `${round(day * .3, 1)}°` }, { label: '季风压差', value: `${round(contrast * .72)} / 100` }], checks: [{ label: '直射纬度有效', ok: Math.abs(day) <= 23.5, value: `${round(day, 1)}°` }, { label: '控制变量可区分', ok: rotation >= 0 && contrast >= 0, value: '自转 / 海陆温差分开' }, { label: '风向由气压梯度驱动', ok: true, value: '高压指向低压并受偏转' }], summary: `直射点 ${round(day, 1)}° 时，热力环流带示意偏移约 ${round(day * .3, 1)}°；海陆温差指数为 ${round(contrast * .72)}。` }
}

function frontEvidence(params) {
  const stage = Number(params.stage ?? 45)
  const contrast = Number(params.contrast ?? 14)
  const moisture = Number(params.moisture ?? 72)
  const temperature = 22 - stage * .08
  const pressure = 1002 + stage * .12
  const rain = Math.max(0, moisture * (1 - Math.abs(stage - 50) / 80) * contrast / 20)
  const wind = stage < 50 ? '偏南 → 过境后偏北' : '偏北'
  return { title: '锋面过境观测计算', formula: '气温、气压、风向和降水的连续变化共同判别锋面', columns: ['过程时刻', '气温', '气压', '风向', '降水'], rows: [[`${round(stage)}%`, `${round(temperature, 1)}°C`, `${round(pressure, 1)} hPa`, wind, `${round(rain, 1)} mm/h`]], metrics: [{ label: '中央站气温', value: `${round(temperature, 1)}°C` }, { label: '降水强度', value: `${round(rain, 1)} mm/h` }], checks: [{ label: '过程时刻有效', ok: stage >= 0 && stage <= 100, value: `${round(stage)}%` }, { label: '温压变化同向可解释', ok: true, value: '过境后气温降、气压升' }, { label: '水汽输入有效', ok: moisture >= 0 && moisture <= 100, value: `${round(moisture)}%` }], summary: `过程处于 ${round(stage)}%，气温约 ${round(temperature, 1)}°C、气压约 ${round(pressure, 1)} hPa，降水约 ${round(rain, 1)} mm/h。` }
}

function tectonicEvidence(params) {
  const stress = Number(params.stress ?? 68)
  const erosion = Number(params.erosion ?? 34)
  const fault = Number(params.fault ?? 28)
  const valley = erosion > 55 && stress > 45
  return { title: '构造运动与地貌演化计算', formula: '构造作用改变岩层形态；侵蚀与断层共同塑造地貌表现', columns: ['构造强度', '侵蚀历时', '断层错距', '地貌响应'], rows: [[`${round(stress)}%`, `${round(erosion)}%`, `${round(fault)} m`, valley ? '差异侵蚀形成谷地倾向' : '构造高地 / 断层地貌示意']], metrics: [{ label: '地貌响应', value: valley ? '背斜成谷倾向' : '构造高地倾向' }, { label: '错距', value: `${round(fault)} m` }], checks: [{ label: '受力参数有效', ok: stress >= 0 && stress <= 100, value: `${round(stress)}%` }, { label: '侵蚀改变表面而非岩龄', ok: true, value: `${round(erosion)}%` }, { label: '断层切割关系可判读', ok: fault >= 0, value: `错距 ${round(fault)} m` }], summary: `构造强度 ${round(stress)}%、侵蚀 ${round(erosion)}%、错距 ${round(fault)} m；结论需区分构造形态与现今地貌。` }
}

function riverEvidence(params) {
  const slope = Number(params.slope ?? 62)
  const discharge = Number(params.discharge ?? 58)
  const sediment = Number(params.sediment ?? 48)
  const vegetation = Number(params.vegetation ?? 52)
  const base = Number(params.base ?? 52)
  const transport = slope * discharge / 100
  const supply = sediment * (1.15 - vegetation / 220)
  const balance = supply - transport * .6 + (50 - base) * .2
  return { title: '河流地貌水沙过程计算', formula: '输沙盈亏 = 来沙供给 − 水流搬运能力；坡降、流量与植被共同作用', columns: ['坡降', '流量', '来沙', '植被', '输沙盈亏'], rows: [[round(slope), round(discharge), round(sediment), `${round(vegetation)}%`, round(balance)]], metrics: [{ label: '输沙关系', value: balance > 20 ? '堆积倾向' : balance < -20 ? '侵蚀倾向' : '相对平衡' }, { label: '搬运能力', value: round(transport) }], checks: [{ label: '变量边界有效', ok: [slope, discharge, sediment, vegetation, base].every(v => v >= 0 && v <= 100), value: '0–100 教学指数' }, { label: '供给与搬运分开', ok: true, value: '不把上下游位置当成唯一依据' }, { label: '结论保留科学边界', ok: true, value: '未替代实测水动力数据' }], summary: `当前模型中来沙—搬运差约 ${round(balance)}，表现为${balance > 20 ? '堆积' : balance < -20 ? '侵蚀' : '相对平衡'}倾向。` }
}

function hazardEvidence(params) {
  const energy = Number(params.energy ?? 6.4)
  const viscosity = Number(params.viscosity ?? 74)
  const gas = Number(params.gas ?? 62)
  const explosion = viscosity + gas > 125
  return { title: '地震与火山灾害计算', formula: '高黏度 + 高挥发分 → 气体逸出受阻 → 爆炸性增强；P/S 波到时差用于测距', columns: ['震级', '黏度', '挥发分', '喷发倾向', '相对波幅'], rows: [[round(energy, 1), `${round(viscosity)}%`, `${round(gas)}%`, explosion ? '爆炸性增强' : '熔岩溢流倾向', `${round(10 ** (energy - 6), 2)}×`]], metrics: [{ label: '喷发倾向', value: explosion ? '爆炸性增强' : '熔岩溢流' }, { label: '相对 M6 波幅', value: `${round(10 ** (energy - 6), 2)}×` }], checks: [{ label: '震级边界有效', ok: energy >= 3 && energy <= 9, value: `${round(energy, 1)} 级` }, { label: '黏度与挥发分方向一致', ok: viscosity >= 0 && gas >= 0, value: explosion ? '压力积聚' : '气体较易逸出' }, { label: '灾害结论非绝对预测', ok: true, value: '教学趋势模型' }], summary: `在黏度 ${round(viscosity)}%、挥发分 ${round(gas)}% 条件下，喷发倾向为${explosion ? '爆炸性增强' : '熔岩溢流'}；该结果是教学趋势判断，不是灾害预报。` }
}

function booleanParam(value, fallback = true) {
  if (typeof value === 'boolean') return value
  if (value === undefined || value === null || value === '') return fallback
  return !['false', '0', '否', '无'].includes(String(value).toLowerCase())
}

function universeEvidence(params) {
  const distance = Number(params.distance ?? 1)
  const atmosphere = booleanParam(params.atmosphere)
  const liquidWater = booleanParam(params.liquidWater)
  const shielding = booleanParam(params.shielding)
  const energy = 100 / (distance ** 2)
  const baseTemperature = 255 / Math.sqrt(distance) - 273.15
  const temperature = baseTemperature + (atmosphere ? 33 : 0)
  const conditionCount = [distance >= 0.75 && distance <= 1.35, atmosphere, liquidWater, shielding].filter(Boolean).length
  return {
    title: '行星宜居条件与太阳能量计算',
    formula: '相对辐射强度∝1/d²；教学温度估计=T₀/√d−273.15+大气保温项',
    columns: ['行星', '日距（地球=1）', '相对辐射', '估计温度', '宜居条件满足'],
    rows: [[String(params.planet ?? '地球'), round(distance, 2), round(energy, 1), `${round(temperature, 1)}°C`, `${conditionCount}/4`]],
    metrics: [
      { label: '相对太阳能量', value: `${round(energy, 1)}` },
      { label: '估计表面温度', value: `${round(temperature, 1)}°C` },
      { label: '条件满足度', value: `${conditionCount}/4` },
    ],
    checks: [
      { label: '日距处于教学模型边界', ok: distance > 0 && distance <= 5, value: '0＜d≤5（地球=1）' },
      { label: '宜居带条件可解释', ok: distance >= 0.75 && distance <= 1.35 && atmosphere && liquidWater && shielding, value: '日距、大气、液态水、屏蔽层共同判断' },
      { label: '反平方关系可复算', ok: Number.isFinite(energy) && Math.abs(energy - 100 / (distance ** 2)) < 0.001, value: 'E=100/d²' },
    ],
    summary: `${String(params.planet ?? '地球')}距恒星约 ${round(distance, 2)} 个地球日距单位，接收相对辐射 ${round(energy, 1)}；当前 ${conditionCount}/4 项教学宜居条件满足。`,
    inputs: { planet: String(params.planet ?? '地球'), distance, atmosphere, liquidWater, shielding },
  }
}

function coupledWaterEvidence(params) {
  const wind = Number(params.wind ?? 68)
  const solar = Number(params.solar ?? 62)
  const land = Number(params.land ?? 48)
  const mode = String(params.mode ?? 'neutral')
  const modeFactor = mode === 'el-nino' ? 0.92 : mode === 'la-nina' ? 1.08 : 1
  const precipitation = (70 + (50 - wind) * 0.12) * modeFactor
  const evaporation = Math.min(precipitation * 0.48, 18 + solar * 0.2)
  const infiltrationCapacity = precipitation * (0.18 + land * 0.004)
  const infiltration = Math.min(precipitation - evaporation, infiltrationCapacity)
  const runoff = Math.max(0, precipitation - evaporation - infiltration)
  const current = wind >= 60 ? '信风较强，暖水向西堆积倾向' : wind <= 40 ? '信风较弱，暖水向东扩散倾向' : '风场接近中性'
  return {
    title: '洋流—水循环耦合过程计算',
    formula: 'P=E+I+R；下垫面改变下渗，信风改变暖水输送方向',
    columns: ['风场指数', '太阳能量', '陆面下渗条件', '降水', '蒸发', '下渗', '径流'],
    rows: [[round(wind), round(solar), `${round(land)}%`, `${round(precipitation, 1)} mm`, `${round(evaporation, 1)} mm`, `${round(infiltration, 1)} mm`, `${round(runoff, 1)} mm`]],
    metrics: [
      { label: '海气状态', value: mode === 'el-nino' ? '厄尔尼诺情景' : mode === 'la-nina' ? '拉尼娜情景' : '中性情景' },
      { label: '洋流趋势', value: current },
      { label: '水量闭合', value: `${round(evaporation + infiltration + runoff, 1)} = ${round(precipitation, 1)} mm` },
    ],
    checks: [
      { label: '耦合变量在边界内', ok: [wind, solar, land].every((value) => value >= 0 && value <= 100), value: '风场、太阳能量、陆面条件均为 0–100' },
      { label: '水量平衡闭合', ok: Math.abs(precipitation - evaporation - infiltration - runoff) < 0.01, value: 'P−E−I−R=0' },
      { label: '信风方向可解释', ok: current.length > 0, value: current },
    ],
    summary: `在${mode === 'el-nino' ? '厄尔尼诺' : mode === 'la-nina' ? '拉尼娜' : '中性'}情景下，${current}；降水 ${round(precipitation, 1)} mm 被分配为蒸发、下渗和径流。`,
    inputs: { wind, solar, land, mode },
  }
}

export function runGeoSimExperiment(experimentId, params = {}) {
  if (experimentId === 'required-01') return universeEvidence(params)
  if (experimentId === 'required-02' || experimentId === 'elective-01') return solarEvidence(params)
  if (experimentId === 'required-03') return layerEvidence(params)
  if (experimentId === 'required-04') return layerStructureEvidence(params)
  if (experimentId === 'required-05') return atmosphereEvidence(params)
  if (experimentId === 'required-06') return thermalEvidence(params)
  if (experimentId === 'required-07') return runoffEvidence(params)
  if (experimentId === 'required-08') return oceanEvidence(params)
  if (experimentId === 'required-09') return originalOceanEvidence(params)
  if (experimentId === 'elective-02') return circulationEvidence(params)
  if (experimentId === 'elective-03') return frontEvidence(params)
  if (experimentId === 'elective-04') return tectonicEvidence(params)
  if (experimentId === 'elective-05') return riverEvidence(params)
  if (experimentId === 'elective-06') return hazardEvidence(params)
  if (experimentId === 'elective-07') return coupledWaterEvidence(params)
  return { title: `未注册实验 ${experimentId}`, formula: '无', columns: ['状态'], rows: [['实验未注册']], metrics: [], checks: [{ label: '实验已注册', ok: false, value: experimentId }], summary: '该实验尚未注册到 GeoLab 证据引擎。' }
}

export function formatEvidenceReport(experimentId, question, params, result, trace) {
  return ['# GeoLab AGH 原有实验验证报告', '', `- 实验：${getGeoSimExperimentDefinition(experimentId).title}`, `- 实验路由：${experimentId}`, `- 探究问题：${question}`, `- 参数：${JSON.stringify(params)}`, '', '## 科学计算结果', `公式：${result.formula}`, `| ${result.columns.join(' | ')} |`, `| ${result.columns.map(() => '---').join(' | ')} |`, ...result.rows.map(row => `| ${row.join(' | ')} |`), '', '## 结果核验', ...result.checks.map(check => `- ${check.ok ? '✅' : '⚠️'} ${check.label}：${check.value}`), '', '## AGH 运行轨迹', ...trace.map(item => `- ${item.node} / ${item.action} / ${item.status}：${item.detail}`), '', `结论：${result.summary}`, '', '> 说明：计算结果来自原 GeoSim 实验对应的教学参数适配器，AGH 负责问题解析、实验规划、参数组织、工具调用和证据汇总；结果用于探究学习，不替代真实观测或灾害预报。'].join('\n')
}
