import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const energyComponents = [
  { id: 'solar', name: '太阳辐射', value: 100, unit: '%', color: '#FFD700', description: '到达大气上界的太阳辐射总量' },
  { id: 'reflected', name: '大气反射', value: 20, unit: '%', color: '#87CEEB', description: '云层和大气分子反射回太空' },
  { id: 'absorbed_atm', name: '大气吸收', value: 23, unit: '%', color: '#FFA500', description: '大气吸收的太阳辐射' },
  { id: 'surface', name: '到达地面', value: 57, unit: '%', color: '#228B22', description: '到达地面的太阳辐射' },
  { id: 'terrestrial', name: '地面长波辐射', value: 114, unit: '%', color: '#8B4513', description: '地面发射的长波辐射' },
  { id: 'atm_emission', name: '大气逆辐射', value: 106, unit: '%', color: '#4169E1', description: '大气向地面的逆辐射' },
  { id: 'net_radiation', name: '净辐射', value: 0, unit: '%', color: '#9370DB', description: '能量收支平衡' },
]

const circulationTypes = [
  {
    id: 'land-sea',
    name: '海陆风',
    description: '由于海陆热力性质差异形成的局地环流',
    dayPattern: '海风：海洋→陆地',
    nightPattern: '陆风：陆地→海洋',
    conditions: ['白天陆地升温快', '夜晚陆地降温快'],
  },
  {
    id: 'mountain-valley',
    name: '山谷风',
    description: '由于山坡与山谷热力差异形成的局地环流',
    dayPattern: '谷风：山谷→山坡',
    nightPattern: '山风：山坡→山谷',
    conditions: ['白天山坡升温快', '夜晚山坡降温快'],
  },
  {
    id: 'monsoon',
    name: '季风',
    description: '大范围季节性的风向转变现象',
    summerPattern: '夏季风：海洋→陆地（湿润）',
    winterPattern: '冬季风：陆地→海洋（干燥）',
    conditions: ['海陆热力差异', '行星风系季节移动'],
  },
]

const tasks = [
  {
    id: 'task-1',
    title: '任务1：分析大气能量收支',
    description: '观察能量流动示意图，理解太阳辐射、地面辐射和大气逆辐射之间的关系。',
    hint: '注意能量收支平衡的原理，理解大气保温作用。',
  },
  {
    id: 'task-2',
    title: '任务2：模拟海陆风形成',
    description: '切换昼夜模式，观察海陆风的形成过程和风向变化。',
    hint: '海陆热力性质差异是根本原因。',
  },
  {
    id: 'task-3',
    title: '任务3：比较不同热力环流',
    description: '分析海陆风、山谷风和季风的形成条件和特点差异。',
    hint: '尺度差异是关键：海陆风<山谷风<季风。',
  },
]

const examQuestions = [
  {
    id: 'q1',
    stem: '大气对地面的保温作用主要是通过（ ）实现的',
    options: [
      'A. 太阳辐射',
      'B. 地面辐射',
      'C. 大气逆辐射',
      'D. 大气散射',
    ],
    answer: 'C',
    explanation: '大气逆辐射是大气向地面发射的长波辐射，能够补偿地面损失的热量，对地面起到保温作用，这就是温室效应。',
  },
  {
    id: 'q2',
    stem: '下列关于海陆风的叙述，正确的是（ ）',
    options: [
      'A. 白天吹陆风，夜晚吹海风',
      'B. 白天吹海风，夜晚吹陆风',
      'C. 海陆风是由气压梯度力形成的',
      'D. 海陆风只在冬季出现',
    ],
    answer: 'B',
    explanation: '白天陆地升温快，气压低，海洋升温慢，气压高，风从海洋吹向陆地（海风）；夜晚相反，风从陆地吹向海洋（陆风）。',
  },
  {
    id: 'q3',
    stem: '大气中最重要的温室气体是（ ）',
    options: ['A. 氮气', 'B. 氧气', 'C. 二氧化碳', 'D. 氩气'],
    answer: 'C',
    explanation: '二氧化碳能够强烈吸收地面长波辐射，并通过大气逆辐射将热量返还地面，是最重要的温室气体。',
  },
]

function RequiredSix() {
  const [timeOfDay, setTimeOfDay] = useState('day')
  const [selectedCirculation, setSelectedCirculation] = useState('land-sea')
  const [showAnswers, setShowAnswers] = useState(false)
  const [showAnimation, setShowAnimation] = useState(true)

  const selectedCirculationData = useMemo(() => {
    return circulationTypes.find((c) => c.id === selectedCirculation)
  }, [selectedCirculation])

  const energyFlow = useMemo(() => [
    { source: '太阳', target: '大气上界', value: 100, label: '太阳辐射' },
    { source: '大气上界', target: '太空', value: 20, label: '反射' },
    { source: '大气上界', target: '大气', value: 23, label: '大气吸收' },
    { source: '大气上界', target: '地面', value: 57, label: '直达地面' },
    { source: '地面', target: '大气', value: 114, label: '地面辐射' },
    { source: '大气', target: '太空', value: 64, label: '大气辐射' },
    { source: '大气', target: '地面', value: 106, label: '大气逆辐射' },
  ], [])

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：大气热力作用实验</h1>
            <p className="muted">对应教材：必修一 第三章《地球上的大气》第2节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">返回首页</Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>大气能量收支和热力环流过程抽象，学生难以理解能量转换和流动机制。本实验通过可视化能量流动和动态环流模拟，帮助学生直观理解热力环流原理。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>理解大气能量收支平衡原理</li>
                    <li>掌握大气保温作用（温室效应）机制</li>
                    <li>了解热力环流的形成过程</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析大气能量流动过程</li>
                    <li>学会解释海陆风、山谷风的形成</li>
                    <li>培养地理因果分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>理解人类活动对气候的影响</li>
                    <li>树立节能减排意识</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>能量收支数据</h2>
              <div className="energy-table">
                <table>
                  <thead>
                    <tr>
                      <th>能量形式</th>
                      <th>数值</th>
                      <th>描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {energyComponents.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="color-dot" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </td>
                        <td>{item.value}{item.unit}</td>
                        <td>{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel-block">
              <h2>热力环流类型</h2>
              <div className="circulation-selector">
                {circulationTypes.map((circ) => (
                  <button
                    key={circ.id}
                    type="button"
                    className={`circ-btn ${selectedCirculation === circ.id ? 'active' : ''}`}
                    onClick={() => setSelectedCirculation(circ.id)}
                  >
                    {circ.name}
                  </button>
                ))}
              </div>
              {selectedCirculationData && (
                <div className="circulation-info">
                  <h4>{selectedCirculationData.name}</h4>
                  <p>{selectedCirculationData.description}</p>
                  <div className="pattern-grid">
                    <div>
                      <span>🌞 白天</span>
                      <p>{selectedCirculationData.dayPattern}</p>
                    </div>
                    <div>
                      <span>🌙 夜晚</span>
                      <p>{selectedCirculationData.nightPattern}</p>
                    </div>
                  </div>
                  <div className="conditions">
                    <span>形成条件：</span>
                    {selectedCirculationData.conditions.map((cond, i) => (
                      <span key={i} className="condition-tag">{cond}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.description}</p>
                    <span className="task-hint">💡 {task.hint}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <button type="button" className="btn small" onClick={() => setShowAnswers(!showAnswers)}>
                {showAnswers ? '隐藏答案' : '显示答案'}
              </button>
              <div className="exam-list">
                {examQuestions.map((question) => (
                  <div key={question.id} className="exam-card">
                    <p className="quiz-stem">{question.stem}</p>
                    <ul>
                      {question.options.map((option) => (
                        <li
                          key={option}
                          className={showAnswers && option.charAt(0) === question.answer ? 'correct' : ''}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                    {showAnswers && (
                      <div className="quiz-answer">
                        <strong>答案：{question.answer}</strong>
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel canvas circulation-canvas">
            <div className="circulation-header">
              <div>
                <h3>热力环流模拟</h3>
                <p>观察能量流动与环流形成</p>
              </div>
              <div className="controls">
                <button
                  type="button"
                  className={`btn small ${timeOfDay === 'day' ? 'active' : ''}`}
                  onClick={() => setTimeOfDay('day')}
                >
                  🌞 白天
                </button>
                <button
                  type="button"
                  className={`btn small ${timeOfDay === 'night' ? 'active' : ''}`}
                  onClick={() => setTimeOfDay('night')}
                >
                  🌙 夜晚
                </button>
                <button
                  type="button"
                  className={`btn small ${showAnimation ? 'active' : ''}`}
                  onClick={() => setShowAnimation(!showAnimation)}
                >
                  {showAnimation ? '⏸️ 暂停' : '▶️ 播放'}
                </button>
              </div>
            </div>

            <div className="energy-diagram">
              <h4>🔆 大气能量收支示意图</h4>
              <div className="diagram-container">
                <div className="sun">☀️</div>
                <div className="atmosphere-layer">
                  <div className="atm-label">大气</div>
                  <div className="energy-arrows">
                    {energyFlow.map((flow, index) => (
                      <div
                        key={index}
                        className={`energy-arrow ${showAnimation ? 'animated' : ''}`}
                        style={{ animationDelay: `${index * 0.5}s` }}
                      >
                        <span className="arrow-label">{flow.label} ({flow.value}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ground-layer">
                  <div className="ground-label">地面</div>
                </div>
                <div className="space">
                  <span>太空</span>
                  <span className="emoji">🌌</span>
                </div>
              </div>
              <div className="legend">
                <div className="legend-item">
                  <span className="arrow up">↑</span>
                  <span>向上辐射</span>
                </div>
                <div className="legend-item">
                  <span className="arrow down">↓</span>
                  <span>向下辐射</span>
                </div>
              </div>
            </div>

            <div className="circulation-simulation">
              <h4>🌬️ {selectedCirculationData?.name || '海陆风'}环流模拟</h4>
              <div className={`circulation-box ${timeOfDay}`}>
                <div className="ocean">
                  <span className="ocean-label">海洋</span>
                  <span className="ocean-temperature">
                    {timeOfDay === 'day' ? '25°C' : '23°C'}
                  </span>
                </div>
                <div className="land">
                  <span className="land-label">陆地</span>
                  <span className="land-temperature">
                    {timeOfDay === 'day' ? '35°C' : '18°C'}
                  </span>
                </div>
                <div className={`wind-arrows ${showAnimation ? 'animated' : ''}`}>
                  {timeOfDay === 'day' ? (
                    <>
                      <div className="wind-arrow sea-to-land">🌊→🏝️</div>
                      <div className="wind-arrow land-up">↑</div>
                      <div className="wind-arrow land-to-sea">🏝️→🌊</div>
                      <div className="wind-arrow sea-down">↓</div>
                    </>
                  ) : (
                    <>
                      <div className="wind-arrow land-to-sea">🏝️→🌊</div>
                      <div className="wind-arrow sea-up">↑</div>
                      <div className="wind-arrow sea-to-land">🌊→🏝️</div>
                      <div className="wind-arrow land-down">↓</div>
                    </>
                  )}
                </div>
                <div className="pressure-labels">
                  {timeOfDay === 'day' ? (
                    <>
                      <span className="high-pressure">高</span>
                      <span className="low-pressure">低</span>
                    </>
                  ) : (
                    <>
                      <span className="low-pressure">低</span>
                      <span className="high-pressure">高</span>
                    </>
                  )}
                </div>
              </div>
              <div className="explanation">
                <p>
                  {timeOfDay === 'day'
                    ? '白天：陆地升温快，形成低压；海洋升温慢，形成高压。风从海洋吹向陆地（海风）。'
                    : '夜晚：陆地降温快，形成高压；海洋降温慢，形成低压。风从陆地吹向海洋（陆风）。'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default RequiredSix
