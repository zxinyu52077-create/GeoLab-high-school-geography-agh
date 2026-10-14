import { useMemo, useState } from 'react'
import { getGeoSimExperimentCatalog, getGeoSimExperimentDefaults } from './GeoSimExperimentEngine'
import { normalizeAGHEvidence, runGeoLabThroughBackend } from './AGHBackendClient'
import './GeoLabWorkbench.css'

const catalog = getGeoSimExperimentCatalog()

const intentRules = [
  [['宇宙', '宜居', '行星', '太阳能量', '液态水'], 'required-01'],
  [['太阳辐射', '昼长', '正午太阳高度', '太阳活动', '纬度'], 'required-02'],
  [['地层', '化石', '地质年代', '挖掘'], 'required-03'],
  [['圈层', '地震波', '地核', '地幔'], 'required-04'],
  [['大气成分', '大气分层', '对流层', '臭氧'], 'required-05'],
  [['热力环流', '海陆风', '风向偏转', '能量收支'], 'required-06'],
  [['水循环', '径流', '下渗', '水量平衡', '流域'], 'required-07'],
  [['海水性质', '盐度', '密度', '温跃层'], 'required-08'],
  [['洋流', '海浪', '潮汐', '厄尔尼诺', 'ENSO'], 'required-09'],
  [['地球运动', '方位角', '昼夜'], 'elective-01'],
  [['气压带', '风带', '季风', '三圈环流'], 'elective-02'],
  [['锋面', '气旋', '冷锋', '暖锋'], 'elective-03'],
  [['褶皱', '断层', '构造运动', '地貌演化'], 'elective-04'],
  [['流水地貌', '侵蚀', '沉积', '冲积扇', '曲流'], 'elective-05'],
  [['地震', '火山', '灾害'], 'elective-06'],
  [['厄尔尼诺', '拉尼娜', '区域水量', '洋流与水循环'], 'elective-07'],
]

function inferExperiment(question) {
  const text = question.toLowerCase()
  const matched = intentRules.find(([keywords]) => keywords.some((keyword) => text.includes(keyword.toLowerCase())))
  return matched?.[1] || 'required-01'
}

function displayValue(value) {
  if (typeof value === 'boolean') return value ? '是' : '否'
  return value == null ? '—' : String(value)
}

export default function GeoLabWorkbench() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('植被覆盖率降低后，流域的地表径流和洪峰会怎样变化？请用数据验证。')
  const [experimentId, setExperimentId] = useState('required-07')
  const [autoSelected, setAutoSelected] = useState('required-07')
  const [running, setRunning] = useState(false)
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  const definition = useMemo(() => catalog.find((item) => item.id === experimentId) || catalog[0], [experimentId])
  const evidence = payload?.result ? normalizeAGHEvidence(payload.result) : null

  const handleQuestionChange = (event) => {
    const value = event.target.value
    setQuestion(value)
    const inferred = inferExperiment(value)
    setAutoSelected(inferred)
    setExperimentId(inferred)
    setPayload(null)
    setError('')
  }

  const handleExperimentChange = (event) => {
    setExperimentId(event.target.value)
    setPayload(null)
    setError('')
  }

  const run = async () => {
    setRunning(true)
    setError('')
    setPayload(null)
    try {
      const result = await runGeoLabThroughBackend({
        experimentId,
        question: question.trim() || definition.prompt,
        params: getGeoSimExperimentDefaults(experimentId),
        pageState: { source: 'homepage-natural-language-entry', autoSelectedExperiment: autoSelected },
      })
      setPayload(result)
    } catch (runError) {
      setError(runError.message || '实验运行失败')
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <button type="button" className="geolab-workbench__launch" onClick={() => setOpen(true)}>
        <span className="geolab-workbench__launch-mark">AGH</span>
        <span><strong>GeoLab AI 实验台</strong><small>自然语言提问 · 自动验证</small></span>
      </button>

      {open ? (
        <div className="geolab-workbench" role="dialog" aria-modal="true" aria-label="GeoLab AI 可验证实验台">
          <button type="button" className="geolab-workbench__backdrop" aria-label="关闭实验台" onClick={() => setOpen(false)} />
          <section className="geolab-workbench__panel">
            <header className="geolab-workbench__header">
              <div>
                <span className="geolab-workbench__kicker">AGNES HARNESS · VERIFIABLE LAB</span>
                <h2>GeoLab AI 可验证实验台</h2>
                <p>用一句话提出高中地理问题，AGH 会选择原有仿真实验，运行并返回数据证据。</p>
              </div>
              <button type="button" className="geolab-workbench__close" onClick={() => setOpen(false)}>关闭</button>
            </header>

            <div className="geolab-workbench__body">
              <label className="geolab-workbench__question">
                <span>你的探究问题</span>
                <textarea value={question} onChange={handleQuestionChange} rows={4} placeholder="例如：为什么植被减少会增加洪峰？请用原实验数据验证。" />
              </label>
              <div className="geolab-workbench__controls">
                <label>
                  <span>自动选择的实验</span>
                  <select value={experimentId} onChange={handleExperimentChange}>
                    {catalog.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
                  </select>
                </label>
                <div className="geolab-workbench__intent">
                  <span>AGH 任务规划</span>
                  <strong>{definition.chapter}</strong>
                  <small>{definition.prompt}</small>
                </div>
              </div>
              <button type="button" className="geolab-workbench__run" onClick={run} disabled={running || !question.trim()}>
                {running ? 'AGH 正在设计、运行并核验…' : '运行可验证仿真实验'}
              </button>

              {error ? <div className="geolab-workbench__error" role="alert">{error}</div> : null}
              {evidence ? (
                <div className="geolab-workbench__result">
                  <div className="geolab-workbench__result-head">
                    <div><span>验证结果</span><h3>{evidence.summary}</h3></div>
                    <strong className={evidence.checks.length && evidence.checks.every((item) => item.ok) ? 'is-pass' : 'is-warn'}>
                      {evidence.checks.filter((item) => item.ok).length}/{evidence.checks.length} PASS
                    </strong>
                  </div>
                  <div className="geolab-workbench__metrics">
                    {evidence.metrics.slice(0, 4).map((metric) => <span key={metric.label}><small>{metric.label}</small><b>{displayValue(metric.value)}</b></span>)}
                  </div>
                  {evidence.rows.length ? (
                    <div className="geolab-workbench__table-wrap"><table><thead><tr>{evidence.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{evidence.rows.slice(0, 8).map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{displayValue(value)}</td>)}</tr>)}</tbody></table></div>
                  ) : null}
                  <div className="geolab-workbench__checks">
                    {evidence.checks.map((check) => <div key={check.id || check.name || check.label}><b>{check.ok ? 'PASS' : 'WARN'}</b><span>{check.label || check.name || check.id}</span><small>{check.detail || check.reason || ''}</small></div>)}
                  </div>
                  <div className="geolab-workbench__trace">
                    {(payload.trace || []).map((item, index) => <span key={`${item.action}-${index}`}><b>{item.node}</b><em>{item.action}</em><small>{item.detail}</small></span>)}
                  </div>
                  <div className="geolab-workbench__footer-note">{payload.warning || 'AGH 已返回结构化实验结果。'} · 当前实验：{definition.title}</div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
