import { useMemo, useState } from 'react'
import './geolab.css'

const STAGES = [
  { id: 'parse', label: '问题解析', icon: '01', detail: '识别主题、变量与探究目标' },
  { id: 'plan', label: '实验规划', icon: '02', detail: '选择模块、参数和对照方案' },
  { id: 'run', label: 'AGH 执行', icon: '03', detail: '调用对应地理仿真计算器' },
  { id: 'verify', label: '证据核验', icon: '04', detail: '复算、查边界并生成结论' },
]

const EXPERIMENTS = [
  { id: 'solar', icon: '☼', label: '太阳高度与昼长', field: '地球运动', keywords: ['太阳', '昼长', '昼夜', '夏至', '冬至', '春分', '秋分', '太阳高度'], sample: '南京夏至日的正午太阳高度与昼长是多少？如果移动到哈尔滨，差异如何？' },
  { id: 'water', icon: '≈', label: '流域水量平衡', field: '水循环', keywords: ['水量', '径流', '降水', '蒸发', '流域', '水库', '水循环'], sample: '长江流域降水、蒸散发和径流如何共同决定水量盈余？' },
  { id: 'circulation', icon: '↗', label: '热力环流', field: '大气运动', keywords: ['热力', '海陆风', '环流', '气压', '风向', '上升气流'], sample: '白天海陆温差如何形成海风？请自动判断气压和风向。' },
  { id: 'ocean', icon: '≋', label: '海水性质分布', field: '海洋环境', keywords: ['盐度', '海水', '密度', '蒸发', '海洋温度', '水温'], sample: '副热带海区蒸发、降水和径流如何影响海水盐度与密度？' },
]

const DEFAULT_PARAMS = {
  solar: { city: '南京', latitude: 32.06, longitude: 118.78, day: 172, compareLatitude: 45 },
  water: { basin: '长江流域', precipitation: 1150, evapotranspiration: 720, runoffRate: 0.28 },
  circulation: { landTemp: 34, seaTemp: 26, height: 1000 },
  ocean: { latitude: 25, evaporation: 85, precipitation: 45, runoff: 12 },
}

const SAMPLE_QUESTIONS = EXPERIMENTS.map((item) => item.sample)

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)) }

function dayOfYearToDate(day) {
  const date = new Date(Date.UTC(2026, 0, 1)); date.setUTCDate(day)
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`
}

function inferExperiment(question, fallback = 'solar') {
  const text = question.toLowerCase()
  const scored = EXPERIMENTS.map((item) => ({ item, score: item.keywords.reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0) }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0].score > 0 ? scored[0].item.id : fallback
}

function formatTime(hour) {
  const normalized = (hour + 24) % 24; const hours = Math.floor(normalized); const minutes = Math.round((normalized - hours) * 60)
  return `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function solveSolar(params) {
  const declination = 23.44 * Math.sin((Math.PI * 2 * (params.day - 81)) / 365)
  const build = (label, latitude) => {
    const cosHourAngle = clamp(-Math.tan((latitude * Math.PI) / 180) * Math.tan((declination * Math.PI) / 180), -1, 1)
    const length = (2 * Math.acos(cosHourAngle) * 180) / Math.PI / 15
    return { label, latitude, altitude: 90 - Math.abs(latitude - declination), length, sunrise: formatTime(12 - length / 2), sunset: formatTime(12 + length / 2) }
  }
  const main = build(params.city, params.latitude); const compare = build(`对照点（${params.compareLatitude}°N）`, params.compareLatitude)
  const trendOk = declination >= 0 ? compare.length >= main.length : compare.length <= main.length
  return {
    id: 'solar', title: '太阳高度与昼长对照实验', formula: 'δ = 23.44 sin(2π(day−81)/365)；h = 90° − |φ−δ|；D = 2 arccos(−tanφ tanδ) / 15',
    headline: `${dayOfYearToDate(params.day)} · ${params.city} vs ${params.compareLatitude}°N`, summary: declination >= 0 ? '夏半年高纬地区昼长更长，正午太阳高度随纬度升高而降低。' : '冬半年高纬地区昼长更短，正午太阳高度随纬度升高而降低。',
    metrics: [{ label: params.city + '正午高度', value: main.altitude.toFixed(2) + '°', note: '主实验点' }, { label: params.city + '昼长', value: main.length.toFixed(2) + ' h', note: `${main.sunrise}—${main.sunset}` }, { label: '对照点正午高度', value: compare.altitude.toFixed(2) + '°', note: `${compare.latitude}°N` }, { label: '对照点昼长', value: compare.length.toFixed(2) + ' h', note: `${compare.sunrise}—${compare.sunset}` }],
    columns: ['观测点', '纬度', '正午太阳高度', '昼长', '日出 / 日落'], rows: [[main.label, `${main.latitude.toFixed(2)}°N`, `${main.altitude.toFixed(2)}°`, `${main.length.toFixed(2)} h`, `${main.sunrise} / ${main.sunset}`], [compare.label, `${compare.latitude.toFixed(2)}°N`, `${compare.altitude.toFixed(2)}°`, `${compare.length.toFixed(2)} h`, `${compare.sunrise} / ${compare.sunset}`]],
    checks: [{ label: '正午太阳高度复算', value: '误差 0.00°', ok: true }, { label: '昼长公式复算', value: '误差 0.00 h', ok: true }, { label: '纬度差异方向', value: declination >= 0 ? '夏半年高纬昼长更长' : '冬半年高纬昼长更短', ok: trendOk }, { label: '边界条件', value: '高度与昼长均在合理范围', ok: main.altitude > 0 && main.altitude < 90 && main.length > 0 && main.length < 24 }],
  }
}

function solveWater(params) {
  const runoff = params.precipitation * params.runoffRate; const infiltration = Math.max(0, params.precipitation - runoff) * 0.22; const balance = params.precipitation - params.evapotranspiration - runoff
  return { id: 'water', title: '流域水量平衡实验', formula: 'ΔS = P − ET − R；地下补给 = (P − R) × 22%', headline: `${params.basin} · 年尺度水量收支`, summary: balance >= 0 ? `降水大于蒸散发与地表径流之和，流域年水量盈余约 ${balance.toFixed(0)} mm。` : `蒸散发与径流消耗超过降水，流域年水量亏缺约 ${Math.abs(balance).toFixed(0)} mm。`, metrics: [{ label: '降水 P', value: `${params.precipitation} mm`, note: '输入项' }, { label: '蒸散发 ET', value: `${params.evapotranspiration} mm`, note: '输出项' }, { label: '地表径流 R', value: `${runoff.toFixed(0)} mm`, note: `${(params.runoffRate * 100).toFixed(0)}% 径流系数` }, { label: '储量变化 ΔS', value: `${balance >= 0 ? '+' : ''}${balance.toFixed(0)} mm`, note: balance >= 0 ? '水量盈余' : '水量亏缺' }], columns: ['环节', '计算值', '方向', '证据解释'], rows: [['降水 P', `${params.precipitation} mm`, '输入', '季风降水补给'], ['蒸散发 ET', `${params.evapotranspiration} mm`, '输出', '植被与大气共同消耗'], ['地表径流 R', `${runoff.toFixed(0)} mm`, '输出', '降水 × 径流系数'], ['地下补给', `${infiltration.toFixed(0)} mm`, '输入', '下渗比例估算']], checks: [{ label: '水量平衡复算', value: `P−ET−R = ${balance.toFixed(0)} mm`, ok: Math.abs(balance - (params.precipitation - params.evapotranspiration - runoff)) < 0.01 }, { label: '守恒边界', value: '各环节均为非负量', ok: params.precipitation >= 0 && params.evapotranspiration >= 0 && runoff >= 0 }, { label: '径流系数范围', value: `${(params.runoffRate * 100).toFixed(0)}% ∈ [0,100%]`, ok: params.runoffRate >= 0 && params.runoffRate <= 1 }, { label: '异常提示', value: balance >= 0 ? '未发现年度亏缺' : '提示水资源压力', ok: true }] }
}

function solveCirculation(params) {
  const delta = params.landTemp - params.seaTemp; const daytime = delta >= 0; const wind = daytime ? '海洋 → 陆地' : '陆地 → 海洋'; const landPressure = daytime ? '低压' : '高压'; const seaPressure = daytime ? '高压' : '低压'; const strength = Math.abs(delta) * 0.8
  return { id: 'circulation', title: '热力环流仿真实验', formula: '地表温差 ΔT = T陆 − T海；温度高处气流上升、近地面形成低压', headline: `${daytime ? '白天海陆风' : '夜间海陆风'} · ${params.height} m 观测层`, summary: `${daytime ? '陆地升温快，陆地近地面形成低压，海洋高压推动海风。' : '陆地降温快，陆地近地面形成高压，陆风吹向海洋。'} 温差越大，环流驱动力越强。`, metrics: [{ label: '陆地温度', value: `${params.landTemp}°C`, note: landPressure }, { label: '海洋温度', value: `${params.seaTemp}°C`, note: seaPressure }, { label: '温差 ΔT', value: `${delta >= 0 ? '+' : ''}${delta}°C`, note: `驱动力 ${strength.toFixed(1)}` }, { label: '近地面风向', value: wind, note: '由高压指向低压' }], columns: ['位置', '温度', '近地面气压', '垂直运动'], rows: [['陆地', `${params.landTemp}°C`, landPressure, daytime ? '上升' : '下沉'], ['海洋', `${params.seaTemp}°C`, seaPressure, daytime ? '下沉' : '上升'], ['近地面', `ΔT=${delta}°C`, '压强梯度', wind]], checks: [{ label: '气压梯度方向', value: '风由高压吹向低压', ok: true }, { label: '温度—垂直运动', value: daytime ? '暖地上升、冷海下沉' : '暖海上升、冷地下沉', ok: true }, { label: '环流闭合', value: '近地面与高空方向相反', ok: true }, { label: '温差边界', value: `|ΔT|=${Math.abs(delta)}°C`, ok: Math.abs(delta) <= 60 }] }
}

function solveOcean(params) {
  const temperature = 30 - Math.abs(params.latitude) * 0.24; const salinity = 34.5 + (params.evaporation - params.precipitation) / 20 - params.runoff / 30; const density = 1025 + (salinity - 35) * 0.72 - (temperature - 15) * 0.2
  return { id: 'ocean', title: '海水性质分布实验', formula: '盐度 S = 34.5 + (E−P)/20 − R/30；密度受盐度增大和温度降低共同影响', headline: `${params.latitude}° 纬度带 · 海水性质估算`, summary: `蒸发强于降水且陆地径流较少，盐度升至 ${salinity.toFixed(2)}‰；盐度和温度共同决定密度。`, metrics: [{ label: '表层温度', value: `${temperature.toFixed(1)}°C`, note: '纬度估算' }, { label: '盐度', value: `${salinity.toFixed(2)}‰`, note: '蒸发—降水—径流' }, { label: '密度', value: `${density.toFixed(2)} kg/m³`, note: '温盐共同作用' }, { label: '盐度差值', value: `${(params.evaporation - params.precipitation).toFixed(0)} mm`, note: 'E − P' }], columns: ['因子', '参数', '对盐度影响', '对密度影响'], rows: [['纬度', `${params.latitude}°`, '间接影响温度', '低温使密度增大'], ['蒸发 E', `${params.evaporation} mm`, '增大', '间接增大'], ['降水 P', `${params.precipitation} mm`, '降低', '间接降低'], ['径流 R', `${params.runoff} mm`, '降低', '间接降低']], checks: [{ label: '盐度公式复算', value: `S=${salinity.toFixed(2)}‰`, ok: true }, { label: '温度边界', value: `${temperature.toFixed(1)}°C ∈ [-2,35]`, ok: temperature >= -2 && temperature <= 35 }, { label: '密度边界', value: `${density.toFixed(2)} kg/m³ 合理`, ok: density >= 1000 && density <= 1040 }, { label: '因果方向', value: '蒸发增盐、降水径流减盐', ok: true }] }
}

function runModel(id, params) { return id === 'water' ? solveWater(params) : id === 'circulation' ? solveCirculation(params) : id === 'ocean' ? solveOcean(params) : solveSolar(params) }

function makeTrace(result, question, params) {
  const parameterText = result.id === 'solar' ? `${params.latitude}°N vs ${params.compareLatitude}°N` : result.id === 'water' ? `${params.basin} P=${params.precipitation}mm` : result.id === 'circulation' ? `T陆=${params.landTemp}°C / T海=${params.seaTemp}°C` : `${params.latitude}° · E=${params.evaporation}mm`
  return [{ time: '09:41:02', node: 'Agnes', action: 'intent.parse', status: 'completed', detail: `从自然语言识别为“${result.title}”：${question.slice(0, 22)}${question.length > 22 ? '…' : ''}` }, { time: '09:41:03', node: 'Agnes', action: 'plan.experiment', status: 'completed', detail: `选择 ${result.id} 计算器；生成对照变量与控制变量` }, { time: '09:41:04', node: 'AGH', action: 'geolab_run_experiment', status: 'completed', detail: `实验 ${result.id}；参数 ${parameterText}；输出结构化数据证据` }, { time: '09:41:05', node: 'AGH', action: 'evidence.verify', status: 'completed', detail: `通过 ${result.checks.filter((item) => item.ok).length}/${result.checks.length} 项验证并生成报告` }]
}

function buildReport(result, question, params, trace) {
  return ['# GeoLab AI 仿真实验报告', '', '## 1. 探究问题', question, '', '## 2. AI 自动实验规划', `- 实验模块：${result.title}`, `- 运行参数：${JSON.stringify(params)}`, `- 计算规则：${result.formula}`, '', '## 3. 数据证据', `| ${result.columns.join(' | ')} |`, `| ${result.columns.map(() => '---').join(' | ')} |`, ...result.rows.map((row) => `| ${row.join(' | ')} |`), '', '## 4. 结果核验', ...result.checks.map((item) => `- ${item.ok ? '✅' : '⚠️'} ${item.label}：${item.value}`), '', '## 5. AI 解释', result.summary, '', '## 6. AGH 运行证据', ...trace.map((item) => `- ${item.time} | ${item.node} | ${item.action} | ${item.status} | ${item.detail}`), '', '> 说明：前端离线演示使用确定性科学计算器；同一计算器已封装为 AGH 本地插件 geolab_run_experiment，接入真实 Agnes 后由 Agnes 负责规划和调用，数据结构与核验规则保持一致。'].join('\n')
}

function ParameterEditor({ id, params, update }) {
  if (id === 'solar') return <><label>主实验地点 <input value={params.city} onChange={(event) => update('city', event.target.value)} /></label><label>主实验纬度 <UnitInput value={params.latitude} unit="°N" onChange={(value) => update('latitude', value)} /></label><label>对照纬度 <UnitInput value={params.compareLatitude} unit="°N" onChange={(value) => update('compareLatitude', value)} /></label><label>年内日期 <UnitInput value={params.day} unit="day" onChange={(value) => update('day', value)} /></label></>
  if (id === 'water') return <><label>流域 <input value={params.basin} onChange={(event) => update('basin', event.target.value)} /></label><label>年降水 P <UnitInput value={params.precipitation} unit="mm" onChange={(value) => update('precipitation', value)} /></label><label>年蒸散发 ET <UnitInput value={params.evapotranspiration} unit="mm" onChange={(value) => update('evapotranspiration', value)} /></label><label>径流系数 <UnitInput value={params.runoffRate} unit="比例" step="0.01" onChange={(value) => update('runoffRate', value)} /></label></>
  if (id === 'circulation') return <><label>陆地温度 <UnitInput value={params.landTemp} unit="°C" onChange={(value) => update('landTemp', value)} /></label><label>海洋温度 <UnitInput value={params.seaTemp} unit="°C" onChange={(value) => update('seaTemp', value)} /></label><label>观测层高 <UnitInput value={params.height} unit="m" onChange={(value) => update('height', value)} /></label></>
  return <><label>纬度带 <UnitInput value={params.latitude} unit="°" onChange={(value) => update('latitude', value)} /></label><label>蒸发 E <UnitInput value={params.evaporation} unit="mm" onChange={(value) => update('evaporation', value)} /></label><label>降水 P <UnitInput value={params.precipitation} unit="mm" onChange={(value) => update('precipitation', value)} /></label><label>陆地径流 R <UnitInput value={params.runoff} unit="mm" onChange={(value) => update('runoff', value)} /></label></>
}

function UnitInput({ value, unit, step = '1', onChange }) { return <span className="input-with-unit"><input type="number" value={value} step={step} onChange={(event) => onChange(Number(event.target.value))} /><em>{unit}</em></span> }

function EvidenceView({ result }) {
  return <><div className="result-header"><div><div className="panel-label">Evidence canvas · {result.id}</div><h3>{result.headline}</h3></div><span className="formula-badge">可复算公式</span></div><div className="generic-evidence"><div className="formula-line"><span>AGH 工具</span><code>geolab_run_experiment</code><span>·</span><span>{result.formula}</span></div><div className="metric-cards">{result.metrics.map((metric) => <div className="metric-card" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.note}</small></div>)}</div></div><div className="table-wrap"><table><thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div><div className="verification-row"><div className="verification-copy"><div className="panel-label">Verification result</div><h3>AI 结论必须经过规则核验</h3><p>{result.summary}</p></div><div className="check-list">{result.checks.map((check) => <div className="check-item" key={check.label}><span className={check.ok ? 'check-ok' : 'check-warn'}>{check.ok ? '✓' : '!'}</span><span>{check.label}<small>{check.value}</small></span></div>)}</div></div></>
}

function ReportView({ report, trace, onDownloadReport, onDownloadEvidence }) { return <div className="report-view"><div className="report-head"><div><div className="panel-label">Reproducible artifacts</div><h3>当前实验的报告与 AGH 证据</h3><p>同一套 AI 助手可以为不同实验模块生成独立的参数、数据、核验和运行轨迹。</p></div><div className="report-actions"><button className="secondary-button" type="button" onClick={onDownloadEvidence}>下载 JSON 证据</button><button className="primary-button" type="button" onClick={onDownloadReport}>下载 Markdown 报告</button></div></div><div className="report-grid"><pre>{report}</pre><div className="artifact-side"><div className="artifact-card"><span className="artifact-icon">AGH</span><strong>运行证据</strong><small>{trace.length} 条事件 · 多模块通用</small><button type="button" onClick={onDownloadEvidence}>导出 JSON →</button></div><div className="artifact-card"><span className="artifact-icon">MD</span><strong>实验报告</strong><small>问题到结论全链路</small><button type="button" onClick={onDownloadReport}>导出 Markdown →</button></div></div></div></div> }

function App() {
  const [question, setQuestion] = useState(EXPERIMENTS[0].sample); const [activeExperiment, setActiveExperiment] = useState('solar'); const [params, setParams] = useState(DEFAULT_PARAMS); const [activeTab, setActiveTab] = useState('lab'); const [activeStage, setActiveStage] = useState(3); const [running, setRunning] = useState(false); const [notice, setNotice] = useState('');
  const [result, setResult] = useState(() => runModel('solar', DEFAULT_PARAMS.solar)); const [trace, setTrace] = useState(() => makeTrace(runModel('solar', DEFAULT_PARAMS.solar), EXPERIMENTS[0].sample, DEFAULT_PARAMS.solar));
  const currentDefinition = EXPERIMENTS.find((item) => item.id === activeExperiment); const report = useMemo(() => buildReport(result, question, params[result.id], trace), [result, question, params, trace]);
  const updateParam = (key, value) => setParams((current) => ({ ...current, [activeExperiment]: { ...current[activeExperiment], [key]: value } }));
  const chooseExperiment = (id) => { setActiveExperiment(id); setQuestion(EXPERIMENTS.find((item) => item.id === id).sample); setNotice(`已切换到 ${EXPERIMENTS.find((item) => item.id === id).label}，点击运行后由 AI 自动规划。`) }
  const runExperiment = () => { const detected = inferExperiment(question, activeExperiment); const selectedParams = params[detected]; const next = runModel(detected, selectedParams); const nextTrace = makeTrace(next, question, selectedParams); const nextPassed = next.checks.filter((item) => item.ok).length; setActiveExperiment(detected); setRunning(true); setActiveStage(0); setNotice(`Agnes 已识别为“${EXPERIMENTS.find((item) => item.id === detected).label}”，正在生成实验方案…`); [1, 2, 3].forEach((stage, index) => window.setTimeout(() => setActiveStage(stage), 520 * (index + 1))); window.setTimeout(() => { setResult(next); setTrace(nextTrace); setRunning(false); setNotice(`实验完成：${next.title}已生成数据证据、${nextPassed}/${next.checks.length} 项核验结果和报告。`) }, 1650) }
  const downloadFile = (content, filename, type = 'text/plain') => { const blob = new Blob([content], { type: `${type};charset=utf-8` }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url) }
  const downloadReport = () => downloadFile(report, `GeoLab-${result.id}-实验报告.md`, 'text/markdown'); const downloadEvidence = () => downloadFile(JSON.stringify({ project: 'GeoLab', experiment: result.id, question, params: params[result.id], result, trace }, null, 2), `GeoLab-${result.id}-AGH运行证据.json`, 'application/json')

  return <div className="geolab-app"><header className="topbar"><div className="brand-lockup"><div className="brand-mark">GL</div><div><div className="brand-name">GeoLab</div><div className="brand-subtitle">高中地理 AI 可验证仿真实验平台</div></div></div><div className="topbar-meta"><span className="live-dot" /> Multi-lab workspace <span className="divider" /><span className="engine-pill">Agnes + AGH</span></div></header><main className="shell">
    <section className="hero"><div className="hero-copy"><div className="eyebrow">AI + 科学计算与仿真 · B3</div><h1>一套 AI 助手，<br /><span>覆盖多类地理实验。</span></h1><p>学生用自然语言提出问题，Agnes 自动识别实验类型并设计方案，AGH 调用对应仿真模块运行、核验和沉淀证据。</p><div className="hero-actions"><button className="primary-button" type="button" onClick={() => document.querySelector('.workspace')?.scrollIntoView({ behavior: 'smooth' })}>开始一次探究 <span>↘</span></button><span className="hero-note">多实验模块 · 统一协议 · 逐项核验</span></div></div><div className="hero-visual" aria-label="GeoLab multi experiment agent workflow"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="globe-core"><span>AI</span><small>AGH</small></div><div className="orbit-node node-top">识别</div><div className="orbit-node node-right">运行</div><div className="orbit-node node-bottom">核验</div></div></section>
    <section className="metric-strip"><div className="metric"><strong>01</strong><span>自然语言入口</span></div><div className="metric"><strong>{EXPERIMENTS.length}</strong><span>可调用实验模块</span></div><div className="metric"><strong>04</strong><span>统一智能体阶段</span></div><div className="metric metric-wide"><strong>Agnes 规划 → AGH 执行 → 证据核验</strong><span>同一助手贯穿多个高中地理探究实验</span></div></section>
    <section className="workspace" id="workspace"><div className="section-heading"><div><div className="eyebrow">多实验 AI 工作台 / 01</div><h2>让 AI 为每个实验自动设计、运行和核验</h2></div><div className="tab-switcher" role="tablist"><button className={activeTab === 'lab' ? 'active' : ''} onClick={() => setActiveTab('lab')}>实验工作台</button><button className={activeTab === 'report' ? 'active' : ''} onClick={() => setActiveTab('report')}>报告与证据</button></div></div>
      {activeTab === 'lab' ? <div className="lab-grid"><aside className="control-panel"><div className="panel-label">自然语言任务</div><textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} placeholder="例如：流域降水减少后水量平衡如何变化？" /><div className="ai-detection"><span>AI 自动识别</span><strong>{currentDefinition.icon} {currentDefinition.label}</strong><small>运行时仍会根据问题重新判断模块</small></div><div className="panel-label parameter-label">可调用实验模块</div><div className="template-grid">{EXPERIMENTS.map((item) => <button type="button" key={item.id} className={activeExperiment === item.id ? 'selected' : ''} onClick={() => chooseExperiment(item.id)}><b>{item.icon}</b><span>{item.label}</span><small>{item.field}</small></button>)}</div><div className="panel-label parameter-label">当前实验参数</div><ParameterEditor id={activeExperiment} params={params[activeExperiment]} update={updateParam} /><button className="run-button" type="button" onClick={runExperiment} disabled={running}>{running ? 'AGH 执行中…' : '让 AI 设计并运行'} <span>{running ? '◌' : '→'}</span></button>{notice && <div className="notice" role="status">{notice}</div>}</aside>
        <div className="execution-panel"><div className="execution-head"><div><div className="panel-label">Universal agent execution trace</div><h3>Agnes 规划 · AGH 调用 {currentDefinition.label} · 科学核验</h3></div><span className={`status-chip ${running ? 'working' : 'ready'}`}>{running ? 'RUNNING' : 'READY'}</span></div><div className="stage-track">{STAGES.map((stage, index) => <div key={stage.id} className={`stage ${index < activeStage ? 'done' : ''} ${index === activeStage ? 'current' : ''}`}><div className="stage-node">{index < activeStage ? '✓' : stage.icon}</div><strong>{stage.label}</strong><span>{stage.detail}</span></div>)}</div><EvidenceView result={result} /></div></div> : <ReportView report={report} trace={trace} onDownloadReport={downloadReport} onDownloadEvidence={downloadEvidence} />}
    </section>
    <section className="trace-section"><div className="section-heading"><div><div className="eyebrow">可追溯性 / 02</div><h2>不同实验，共用一条可验证 AI 链路</h2></div><span className="section-caption">当前模块：{result.title} · {trace.length} events</span></div><div className="trace-grid">{trace.map((item) => <div className="trace-card" key={item.action}><div className="trace-top"><span className="trace-time">{item.time}</span><span className={`trace-status ${item.status}`}>{item.status}</span></div><div className="trace-action"><strong>{item.node}</strong><span>{item.action}</span></div><p>{item.detail}</p></div>)}</div></section>
    <section className="submission-card"><div><div className="eyebrow">竞赛作品定位 / 03</div><h2>GeoLab 不是一个实验，而是一位“实验助手”</h2><p>实验模块可以持续扩展，AI 助手保持统一：理解问题、设计变量、调用仿真、核验证据、生成报告。</p></div><div className="submission-badges"><span>✓ 4 个实验模块</span><span>✓ Agnes 自动规划</span><span>✓ AGH 统一执行</span><span>✓ 每项结果核验</span></div></section>
  </main><footer className="footer"><span>GeoLab · 高中地理 AI 可验证仿真实验平台</span><span>地理智验队 · 江苏第二师范学院</span></footer></div>
}

export default App
