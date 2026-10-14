import { useEffect, useMemo, useState } from 'react'
import { formatEvidenceReport, getGeoSimExperimentDefinition, getGeoSimExperimentDefaults } from './GeoSimExperimentEngine'
import { getAGHBackendStatus, normalizeAGHEvidence, runGeoLabThroughBackend } from './AGHBackendClient'
import './AGHExperimentAgent.css'

function makeTrace(definition, result, question, values) {
  const compactParams = Object.entries(values).slice(0, 4).map(([key, value]) => `${key}=${value}`).join('，')
  return [
    { node: 'Agnes', action: '问题解析', status: 'completed', detail: `识别为“${definition.title}”，提取探究目标：${question.slice(0, 36)}${question.length > 36 ? '…' : ''}` },
    { node: 'Agnes', action: '实验规划', status: 'completed', detail: `沿用当前 GeoLab 原有仿真 ${definition.chapter}，选择控制变量并保留边界说明` },
    { node: 'AGH', action: 'geosim_run_original_experiment', status: 'completed', detail: `调用原实验适配器；${compactParams}` },
    { node: 'AGH', action: 'evidence.verify', status: 'completed', detail: `通过 ${result.checks.filter(item => item.ok).length}/${result.checks.length} 项公式、边界和因果核验` },
  ]
}

export default function AGHExperimentAgent({ experimentId }) {
  const definition = useMemo(() => getGeoSimExperimentDefinition(experimentId), [experimentId])
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState(definition.prompt)
  const [liveState, setLiveState] = useState(null)
  const [stage, setStage] = useState(-1)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [trace, setTrace] = useState([])
  const [report, setReport] = useState('')
  const [notice, setNotice] = useState('')
  const [backendStatus, setBackendStatus] = useState(null)
  const [executedParams, setExecutedParams] = useState(null)

  useEffect(() => {
    setQuestion(definition.prompt)
    setResult(null)
    setTrace([])
    setReport('')
  }, [definition])

  useEffect(() => {
    const receiveState = (event) => {
      if (event.detail?.experimentId === experimentId) setLiveState(event.detail)
    }
    window.addEventListener('geosim:experiment-state', receiveState)
    return () => window.removeEventListener('geosim:experiment-state', receiveState)
  }, [experimentId])

  useEffect(() => {
    if (!open) return
    getAGHBackendStatus().then(setBackendStatus).catch((error) => setBackendStatus({ connected: false, error: error.message }))
  }, [open])

  const run = async () => {
    const values = { ...getGeoSimExperimentDefaults(experimentId), ...(liveState?.values || {}) }
    setRunning(true)
    setStage(0)
    setNotice('GeoLab 后台正在把任务交给 AGH；AGH 将组织 Agnes 与地理工具…')
    ;[1, 2, 3].forEach((index) => window.setTimeout(() => setStage(index), 420 * index))
    try {
      const payload = await runGeoLabThroughBackend({ experimentId, question, params: values, pageState: liveState })
      const next = normalizeAGHEvidence(payload.result)
      const nextTrace = payload.trace || makeTrace(definition, next, question, values)
      setExecutedParams(payload.params || values)
      setResult(next)
      setTrace(nextTrace)
      setReport(payload.report || formatEvidenceReport(experimentId, question, payload.params || values, next, nextTrace))
      setRunning(false)
      const modeText = ['agh-service', 'agh-cli'].includes(payload.mode) ? '真实 AGH 服务' : '本地可复现适配器'
      setNotice(`已完成：经${modeText}运行原实验，${next.checks.filter(item => item.ok).length}/${next.checks.length} 项核验通过。`)
    } catch (error) {
      setRunning(false)
      setStage(-1)
      setNotice(`后台调用失败：${error.message}`)
    }
  }

  const download = (content, name, type) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const downloadReport = () => report && download(report, `GeoLab-${experimentId}-AGH验证报告.md`, 'text/markdown')
  const downloadEvidence = () => result && download(JSON.stringify({ schema: 'geolab.original-experiment.evidence.v1', experimentId, question, params: executedParams || liveState?.values || getGeoSimExperimentDefaults(experimentId), result, trace }, null, 2), `GeoLab-${experimentId}-AGH数据证据.json`, 'application/json')

  return <>
  <button type="button" className="agh-agent-fab" onClick={() => setOpen(true)} aria-label="打开 GeoLab AI 可验证实验台">
    <span className="agh-fab-icon" aria-hidden="true"><span>AGH</span></span>
    <span className="agh-fab-copy">
      <b>可验证实验台</b>
      <small>自然语言 · 自动核验</small>
    </span>
    <span className="agh-fab-arrow" aria-hidden="true">↗</span>
  </button>
    {open && <div className="agh-agent-shell" role="dialog" aria-modal="true" aria-label="GeoLab AI 可验证实验台">
      <div className="agh-agent-backdrop" onClick={() => setOpen(false)} />
      <section className="agh-agent-panel">
        <header className="agh-agent-header"><div><span className="agh-kicker">AGNES HARNESS · VERIFIABLE LAB</span><h2>GeoLab AI 可验证实验台</h2><p>{definition.title} · {experimentId}</p></div><button type="button" onClick={() => setOpen(false)} aria-label="关闭">×</button></header>
        <div className="agh-agent-body">
          <div className="agh-agent-context"><strong>当前页面已接入 GeoLab 原有地理仿真</strong><span>{liveState ? '已读取页面实时参数，可直接用于规划与计算' : '将使用该实验的默认教学参数'}</span><small className={backendStatus?.connected ? 'agh-bridge-live' : 'agh-bridge-preview'}>{backendStatus?.connected ? '● GeoLab后台 → AGH 服务已连接' : '○ GeoLab后台已启用；AGH服务未配置，当前为本地适配器预览'}</small></div>
          <label className="agh-question"><span>用自然语言提出探究问题</span><textarea rows="3" value={question} onChange={(event) => setQuestion(event.target.value)} /></label>
          <div className="agh-stage-row">{['问题解析', '实验规划', '原实验运行', '证据核验'].map((label, index) => <span className={index <= stage ? 'is-done' : ''} key={label}><b>{index < stage ? '✓' : `0${index + 1}`}</b>{label}</span>)}</div>
          <button type="button" className="agh-run-button" onClick={run} disabled={running}>{running ? 'AGH 正在运行可验证实验…' : '让 Agnes 设计并运行当前实验'}<span>→</span></button>
          {notice && <p className="agh-notice" role="status">{notice}</p>}
          {result && <div className="agh-result"><div className="agh-result-title"><div><span>STRUCTURED EVIDENCE</span><h3>{result.title}</h3></div><em>{result.checks.filter(item => item.ok).length}/{result.checks.length} PASS</em></div><p className="agh-summary">{result.summary}</p><div className="agh-metrics">{result.metrics.map(metric => <div key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></div>)}</div><div className="agh-table-wrap"><table><thead><tr>{result.columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div><div className="agh-checks">{result.checks.map(check => <div key={check.label}><b className={check.ok ? 'pass' : 'warn'}>{check.ok ? '✓' : '!'}</b><span>{check.label}<small>{check.value}</small></span></div>)}</div><div className="agh-trace"><strong>AGH 执行轨迹</strong>{trace.map((item, index) => <div key={`${item.action}-${index}`}><b>{index + 1}</b><span>{item.node} · {item.action}<small>{item.detail}</small></span></div>)}</div><div className="agh-actions"><button type="button" onClick={downloadEvidence}>下载 JSON 数据证据</button><button type="button" onClick={downloadReport}>下载 Markdown 报告</button></div></div>}
        </div>
      </section>
    </div>}
  </>
}
