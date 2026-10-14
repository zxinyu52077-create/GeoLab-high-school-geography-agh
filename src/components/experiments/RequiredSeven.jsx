import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const waterCycleComponents = [
  {
    id: 'evaporation',
    name: '蒸发',
    englishName: 'Evaporation',
    process: '水从液态转变为气态',
    location: '海洋、湖泊、河流、土壤',
    amount: '约505,000 km³/年',
    color: '#4169E1',
    icon: '💧',
  },
  {
    id: 'transpiration',
    name: '蒸腾',
    englishName: 'Transpiration',
    process: '植物通过气孔释放水汽',
    location: '陆地植被',
    amount: '约71,000 km³/年',
    color: '#228B22',
    icon: '🌿',
  },
  {
    id: 'condensation',
    name: '凝结',
    englishName: 'Condensation',
    process: '水汽转变为液态或固态',
    location: '大气中',
    amount: '约577,000 km³/年',
    color: '#87CEEB',
    icon: '☁️',
  },
  {
    id: 'precipitation',
    name: '降水',
    englishName: 'Precipitation',
    process: '水汽凝结后降落到地面',
    location: '陆地、海洋',
    amount: '约577,000 km³/年',
    color: '#00CED1',
    icon: '🌧️',
  },
  {
    id: 'runoff',
    name: '径流',
    englishName: 'Runoff',
    process: '水沿地表或地下流动',
    location: '陆地表面、地下',
    amount: '约45,000 km³/年',
    color: '#1E90FF',
    icon: '🏔️',
  },
  {
    id: 'infiltration',
    name: '下渗',
    englishName: 'Infiltration',
    process: '水渗透到地下',
    location: '土壤、含水层',
    amount: '约33,000 km³/年',
    color: '#8B4513',
    icon: '🕳️',
  },
]

const globalWaterBalance = {
  oceans: {
    evaporation: 425000,
    precipitation: 385000,
    runoff: 40000,
    balance: 0,
  },
  land: {
    evaporation: 71000,
    transpiration: 45000,
    precipitation: 111000,
    runoff: 40000,
    infiltration: 33000,
    balance: 0,
  },
  atmosphere: {
    inflow: 496000,
    outflow: 496000,
    balance: 0,
  },
}

const waterReservoirs = [
  { id: 'oceans', name: '海洋', volume: 1338000000, percentage: 96.5, color: '#006994' },
  { id: 'ice', name: '冰川与冰盖', volume: 24064000, percentage: 1.74, color: '#E0FFFF' },
  { id: 'groundwater', name: '地下水', volume: 23400000, percentage: 1.69, color: '#8B7355' },
  { id: 'surface', name: '地表水', volume: 230000, percentage: 0.017, color: '#4169E1' },
  { id: 'atmosphere', name: '大气水', volume: 12900, percentage: 0.001, color: '#87CEEB' },
  { id: 'biological', name: '生物水', volume: 1120, percentage: 0.0001, color: '#228B22' },
]

const tasks = [
  {
    id: 'task-1',
    title: '任务1：认识水循环环节',
    description: '点击各环节查看详细信息，理解水循环的完整过程。',
    hint: '注意各环节之间的联系和能量驱动。',
  },
  {
    id: 'task-2',
    title: '任务2：分析水量平衡',
    description: '观察全球水量平衡数据，理解海洋、陆地和大气之间的水量交换。',
    hint: '总蒸发量等于总降水量是水循环平衡的关键。',
  },
  {
    id: 'task-3',
    title: '任务3：探究水资源分布',
    description: '分析不同水体的储量和占比，理解淡水资源的稀缺性。',
    hint: '冰川是最大的淡水储存库。',
  },
]

const examQuestions = [
  {
    id: 'q1',
    stem: '下列关于水循环的叙述，正确的是（ ）',
    options: [
      'A. 水循环只发生在海洋和大气之间',
      'B. 水循环的能量主要来自地球内部',
      'C. 水循环是地球上物质迁移和能量转换的重要过程',
      'D. 人类活动不会影响水循环',
    ],
    answer: 'C',
    explanation: '水循环是地球上物质迁移和能量转换的重要过程，它发生在海洋、陆地和大气之间，能量主要来自太阳辐射，人类活动会显著影响水循环。',
  },
  {
    id: 'q2',
    stem: '地球上储量最大的水体是（ ）',
    options: ['A. 冰川', 'B. 地下水', 'C. 海洋水', 'D. 湖泊水'],
    answer: 'C',
    explanation: '海洋水约占地球总水量的96.5%，是地球上储量最大的水体。',
  },
  {
    id: 'q3',
    stem: '下列属于水循环中水汽输送环节的是（ ）',
    options: [
      'A. 海水蒸发',
      'B. 台风带来的降水',
      'C. 河流入海',
      'D. 地下水补给河流',
    ],
    answer: 'B',
    explanation: '台风将海洋上空的水汽输送到陆地，属于水汽输送环节。海水蒸发是蒸发环节，河流入海是径流环节，地下水补给河流是地下径流。',
  },
]

function RequiredSeven() {
  const [selectedComponent, setSelectedComponent] = useState('evaporation')
  const [showAnimation, setShowAnimation] = useState(true)
  const [showAnswers, setShowAnswers] = useState(false)

  const selectedComponentData = useMemo(() => {
    return waterCycleComponents.find((comp) => comp.id === selectedComponent)
  }, [selectedComponent])

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：水循环实验</h1>
            <p className="muted">对应教材：必修一 第三章《地球上的水》第1节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">返回首页</Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>水循环过程涉及多个环节，学生难以建立完整的系统概念。本实验通过动态演示和数据可视化，帮助学生理解水循环的各个环节及其相互关系。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>了解水循环的主要环节</li>
                    <li>掌握全球水量平衡原理</li>
                    <li>理解不同水体的分布特征</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析水循环各环节的相互关系</li>
                    <li>学会解读水量平衡数据</li>
                    <li>培养综合分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>认识水资源的循环性和有限性</li>
                    <li>树立节约用水的意识</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>水循环环节</h2>
              <div className="component-selector">
                {waterCycleComponents.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    className={`comp-btn ${selectedComponent === comp.id ? 'active' : ''}`}
                    onClick={() => setSelectedComponent(comp.id)}
                    style={{ '--comp-color': comp.color }}
                  >
                    <span>{comp.icon}</span>
                    <span>{comp.name}</span>
                  </button>
                ))}
              </div>
              {selectedComponentData && (
                <div className="component-detail">
                  <h4>{selectedComponentData.icon} {selectedComponentData.name}</h4>
                  <div className="detail-grid">
                    <div>
                      <span>英文名称</span>
                      <strong>{selectedComponentData.englishName}</strong>
                    </div>
                    <div>
                      <span>过程描述</span>
                      <strong>{selectedComponentData.process}</strong>
                    </div>
                    <div>
                      <span>主要位置</span>
                      <strong>{selectedComponentData.location}</strong>
                    </div>
                    <div>
                      <span>年输送量</span>
                      <strong>{selectedComponentData.amount}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="panel-block">
              <h2>全球水量平衡</h2>
              <div className="balance-grid">
                <div className="balance-card ocean">
                  <h4>🌊 海洋</h4>
                  <div className="balance-item">
                    <span>蒸发</span>
                    <strong>{globalWaterBalance.oceans.evaporation.toLocaleString()} km³/年</strong>
                  </div>
                  <div className="balance-item">
                    <span>降水</span>
                    <strong>{globalWaterBalance.oceans.precipitation.toLocaleString()} km³/年</strong>
                  </div>
                  <div className="balance-item">
                    <span>径流补给</span>
                    <strong>{globalWaterBalance.oceans.runoff.toLocaleString()} km³/年</strong>
                  </div>
                  <div className="balance-total">
                    <span>平衡</span>
                    <strong>0</strong>
                  </div>
                </div>
                <div className="balance-card land">
                  <h4>🏔️ 陆地</h4>
                  <div className="balance-item">
                    <span>降水</span>
                    <strong>{globalWaterBalance.land.precipitation.toLocaleString()} km³/年</strong>
                  </div>
                  <div className="balance-item">
                    <span>蒸发</span>
                    <strong>{globalWaterBalance.land.evaporation.toLocaleString()} km³/年</strong>
                  </div>
                  <div className="balance-item">
                    <span>蒸腾</span>
                    <strong>{globalWaterBalance.land.transpiration.toLocaleString()} km³/年</strong>
                  </div>
                  <div className="balance-item">
                    <span>径流</span>
                    <strong>{globalWaterBalance.land.runoff.toLocaleString()} km³/年</strong>
                  </div>
                  <div className="balance-total">
                    <span>平衡</span>
                    <strong>0</strong>
                  </div>
                </div>
              </div>
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

          <section className="panel canvas water-canvas">
            <div className="water-header">
              <div>
                <h3>水循环动态演示</h3>
                <p>点击环节查看详情 · 观察水循环过程</p>
              </div>
              <button
                type="button"
                className={`btn small ${showAnimation ? 'active' : ''}`}
                onClick={() => setShowAnimation(!showAnimation)}
              >
                {showAnimation ? '⏸️ 暂停' : '▶️ 播放'}
              </button>
            </div>

            <div className="water-cycle-diagram">
              <div className="diagram-wrapper">
                <div className="sun">☀️</div>
                <div className="clouds">
                  <span className="cloud cloud-1">☁️</span>
                  <span className="cloud cloud-2">☁️</span>
                  <span className="cloud cloud-3">☁️</span>
                </div>
                <div className="precipitation">
                  <span className="rain rain-1">🌧️</span>
                  <span className="rain rain-2">🌧️</span>
                </div>
                <div className="mountains">
                  <span>⛰️</span>
                </div>
                <div className="river">
                  <span>🌊</span>
                </div>
                <div className="lake">
                  <span>🏞️</span>
                </div>
                <div className="ocean">
                  <span>🌊</span>
                </div>
                <div className="forest">
                  <span>🌲</span>
                </div>
                
                <div className={`cycle-arrows ${showAnimation ? 'animated' : ''}`}>
                  <div className="arrow evaporation" title="蒸发">↑</div>
                  <div className="arrow transpiration" title="蒸腾">↑</div>
                  <div className="arrow condensation" title="凝结">↻</div>
                  <div className="arrow precipitation" title="降水">↓</div>
                  <div className="arrow runoff" title="径流">→</div>
                  <div className="arrow infiltration" title="下渗">↓</div>
                </div>
              </div>
              <div className="cycle-legend">
                <h4>水循环环节图例</h4>
                <div className="legend-grid">
                  {waterCycleComponents.map((comp) => (
                    <div key={comp.id} className="legend-item">
                      <span>{comp.icon}</span>
                      <span>{comp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="water-reservoirs">
              <h4>💧 地球水体分布</h4>
              <div className="reservoir-chart">
                {waterReservoirs.map((reservoir) => (
                  <div
                    key={reservoir.id}
                    className="reservoir-bar"
                    style={{
                      height: `${Math.min(reservoir.percentage * 2, 100)}%`,
                      backgroundColor: reservoir.color,
                    }}
                    title={`${reservoir.name}: ${reservoir.percentage}%`}
                  >
                    <span className="bar-label">{reservoir.name}</span>
                    <span className="bar-percent">{reservoir.percentage}%</span>
                  </div>
                ))}
              </div>
              <div className="reservoir-list">
                {waterReservoirs.map((reservoir) => (
                  <div key={reservoir.id} className="reservoir-item">
                    <span className="reservoir-color" style={{ backgroundColor: reservoir.color }} />
                    <span>{reservoir.name}</span>
                    <span className="reservoir-volume">
                      {reservoir.volume.toLocaleString()} km³ ({reservoir.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default RequiredSeven
