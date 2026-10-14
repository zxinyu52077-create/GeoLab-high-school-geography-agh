import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const oceanCurrents = {
  pacific: [
    { name: '北赤道暖流', direction: 'east→west', lat: 10, speed: '2-3 kn', color: '#FFD700' },
    { name: '南赤道暖流', direction: 'east→west', lat: -10, speed: '2-3 kn', color: '#FFD700' },
    { name: '日本暖流（黑潮）', direction: 'south→north', lat: 30, speed: '3-4 kn', color: '#FF6B35' },
    { name: '东澳大利亚暖流', direction: 'south→north', lat: -25, speed: '1-2 kn', color: '#FF6B35' },
    { name: '秘鲁寒流', direction: 'north→south', lat: -15, speed: '1-2 kn', color: '#00CED1' },
    { name: '加利福尼亚寒流', direction: 'north→south', lat: 35, speed: '1-2 kn', color: '#00CED1' },
    { name: '北太平洋暖流', direction: 'west→east', lat: 40, speed: '1-2 kn', color: '#FFD700' },
    { name: '西风漂流', direction: 'west→east', lat: -50, speed: '2-3 kn', color: '#4169E1' },
  ],
  atlantic: [
    { name: '北赤道暖流', direction: 'east→west', lat: 10, speed: '2-3 kn', color: '#FFD700' },
    { name: '南赤道暖流', direction: 'east→west', lat: -10, speed: '2-3 kn', color: '#FFD700' },
    { name: '墨西哥湾暖流', direction: 'south→north', lat: 30, speed: '3-4 kn', color: '#FF6B35' },
    { name: '巴西暖流', direction: 'south→north', lat: -20, speed: '1-2 kn', color: '#FF6B35' },
    { name: '加那利寒流', direction: 'north→south', lat: 25, speed: '1-2 kn', color: '#00CED1' },
    { name: '本格拉寒流', direction: 'north→south', lat: -20, speed: '1-2 kn', color: '#00CED1' },
    { name: '北大西洋暖流', direction: 'west→east', lat: 45, speed: '2-3 kn', color: '#FFD700' },
    { name: '西风漂流', direction: 'west→east', lat: -50, speed: '2-3 kn', color: '#4169E1' },
  ],
  indian: [
    { name: '南赤道暖流', direction: 'east→west', lat: 5, speed: '2-3 kn', color: '#FFD700' },
    { name: '马达加斯加暖流', direction: 'south→north', lat: -20, speed: '1-2 kn', color: '#FF6B35' },
    { name: '西澳大利亚寒流', direction: 'north→south', lat: -25, speed: '1-2 kn', color: '#00CED1' },
    { name: '季风洋流', direction: 'seasonal', lat: 10, speed: 'varies', color: '#9370DB' },
    { name: '西风漂流', direction: 'west→east', lat: -50, speed: '2-3 kn', color: '#4169E1' },
  ],
}

const tideTypes = [
  {
    id: 'semi-diurnal',
    name: '半日潮',
    description: '一天中有两次高潮和两次低潮',
    period: '约12小时25分',
    example: '中国渤海、东海',
    features: ['两次高潮高度相近', '两次低潮高度相近'],
  },
  {
    id: 'diurnal',
    name: '全日潮',
    description: '一天中有一次高潮和一次低潮',
    period: '约24小时50分',
    example: '中国北部湾',
    features: ['一天只有一次涨落'],
  },
  {
    id: 'mixed',
    name: '混合潮',
    description: '介于半日潮和全日潮之间',
    period: '不规则',
    example: '中国南海',
    features: ['两次高潮高度差异明显'],
  },
]

const tidalPhases = [
  { phase: '朔月', moon: '🌑', sunMoon: '同一直线', tide: '大潮', reason: '引潮力叠加' },
  { phase: '上弦月', moon: '🌓', sunMoon: '垂直', tide: '小潮', reason: '引潮力抵消' },
  { phase: '望月', moon: '🌕', sunMoon: '同一直线', tide: '大潮', reason: '引潮力叠加' },
  { phase: '下弦月', moon: '🌗', sunMoon: '垂直', tide: '小潮', reason: '引潮力抵消' },
]

const tasks = [
  {
    id: 'task-1',
    title: '任务1：识别洋流分布',
    description: '观察世界大洋洋流分布，区分暖流和寒流，理解洋流的形成原因。',
    hint: '注意洋流与盛行风的关系。',
  },
  {
    id: 'task-2',
    title: '任务2：分析潮汐现象',
    description: '观察不同月相的潮汐变化，理解引潮力的作用原理。',
    hint: '太阳和月亮的相对位置决定潮汐大小。',
  },
  {
    id: 'task-3',
    title: '任务3：探究洋流对气候的影响',
    description: '分析洋流对沿岸气候的影响，解释为什么西欧气候温和湿润。',
    hint: '北大西洋暖流的增温增湿作用。',
  },
]

const examQuestions = [
  {
    id: 'q1',
    stem: '下列关于洋流的叙述，正确的是（ ）',
    options: [
      'A. 暖流都是从低纬流向高纬',
      'B. 寒流都是从高纬流向低纬',
      'C. 洋流对全球热量平衡有重要作用',
      'D. 洋流只分布在海洋表层',
    ],
    answer: 'C',
    explanation: '洋流对全球热量平衡有重要作用，暖流和寒流的划分是相对的，不是绝对按纬度方向划分。洋流不仅分布在表层，还有深层洋流。',
  },
  {
    id: 'q2',
    stem: '引起潮汐现象的主要原因是（ ）',
    options: [
      'A. 风力作用',
      'B. 太阳和月球的引力',
      'C. 海水密度差异',
      'D. 地球自转',
    ],
    answer: 'B',
    explanation: '潮汐是由太阳和月球对地球的引力（引潮力）引起的，其中月球的引潮力起主要作用。',
  },
  {
    id: 'q3',
    stem: '下列洋流中，属于寒流的是（ ）',
    options: ['A. 日本暖流', 'B. 墨西哥湾暖流', 'C. 秘鲁寒流', 'D. 巴西暖流'],
    answer: 'C',
    explanation: '秘鲁寒流是从高纬流向低纬的寒流，对沿岸气候有降温减湿作用。其他三个选项都是暖流。',
  },
]

function RequiredNine() {
  const [selectedOcean, setSelectedOcean] = useState('pacific')
  const [selectedTideType, setSelectedTideType] = useState('semi-diurnal')
  const [showAnimation, setShowAnimation] = useState(true)
  const [showAnswers, setShowAnswers] = useState(false)

  const selectedCurrents = useMemo(() => {
    return oceanCurrents[selectedOcean] || []
  }, [selectedOcean])

  const selectedTideData = useMemo(() => {
    return tideTypes.find((t) => t.id === selectedTideType)
  }, [selectedTideType])

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：海洋环流与潮汐实验</h1>
            <p className="muted">对应教材：必修一 第三章《地球上的水》第2-3节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">返回首页</Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>洋流分布和潮汐现象复杂，学生难以理解其形成机制和影响。本实验通过可视化洋流系统和动态潮汐模拟，帮助学生直观理解海洋环流和潮汐规律。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>了解世界大洋主要洋流的分布</li>
                    <li>掌握洋流对气候和海洋生态的影响</li>
                    <li>理解潮汐现象的成因和类型</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析洋流的形成原因</li>
                    <li>学会解释潮汐现象</li>
                    <li>培养空间分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>认识海洋对全球气候的调节作用</li>
                    <li>理解海洋资源的重要性</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>大洋选择</h2>
              <div className="ocean-selector">
                {Object.entries(oceanCurrents).map(([key]) => (
                  <button
                    key={key}
                    type="button"
                    className={`ocean-btn ${selectedOcean === key ? 'active' : ''}`}
                    onClick={() => setSelectedOcean(key)}
                  >
                    <span>{key === 'pacific' ? '🌊' : key === 'atlantic' ? '🌊' : '🌊'}</span>
                    <span>
                      {key === 'pacific' ? '太平洋' : key === 'atlantic' ? '大西洋' : '印度洋'}
                    </span>
                  </button>
                ))}
              </div>
              <div className="current-list">
                {selectedCurrents.map((current, index) => (
                  <div key={index} className="current-item">
                    <span className="current-color" style={{ backgroundColor: current.color }} />
                    <span className="current-name">{current.name}</span>
                    <span className="current-direction">{current.direction}</span>
                    <span className="current-speed">{current.speed}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>潮汐类型</h2>
              <div className="tide-selector">
                {tideTypes.map((tide) => (
                  <button
                    key={tide.id}
                    type="button"
                    className={`tide-btn ${selectedTideType === tide.id ? 'active' : ''}`}
                    onClick={() => setSelectedTideType(tide.id)}
                  >
                    {tide.name}
                  </button>
                ))}
              </div>
              {selectedTideData && (
                <div className="tide-info">
                  <h4>{selectedTideData.name}</h4>
                  <p>{selectedTideData.description}</p>
                  <div className="tide-props">
                    <span>周期：{selectedTideData.period}</span>
                    <span>实例：{selectedTideData.example}</span>
                  </div>
                  <div className="tide-features">
                    {selectedTideData.features.map((feature, i) => (
                      <span key={i} className="feature-tag">{feature}</span>
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

          <section className="panel canvas ocean-canvas">
            <div className="ocean-header">
              <div>
                <h3>洋流与潮汐模拟</h3>
                <p>观察洋流分布与潮汐变化</p>
              </div>
              <button
                type="button"
                className={`btn small ${showAnimation ? 'active' : ''}`}
                onClick={() => setShowAnimation(!showAnimation)}
              >
                {showAnimation ? '⏸️ 暂停' : '▶️ 播放'}
              </button>
            </div>

            <div className="ocean-map">
              <div className={`map-container ${showAnimation ? 'animated' : ''}`}>
                <div className="ocean-label">
                  {selectedOcean === 'pacific' ? '太平洋' : selectedOcean === 'atlantic' ? '大西洋' : '印度洋'}
                </div>
                <div className="current-arrows">
                  {selectedCurrents.map((current, index) => (
                    <div
                      key={index}
                      className={`current-arrow ${current.direction.includes('west') ? 'west' : 'east'} ${current.direction.includes('north') ? 'north' : 'south'}`}
                      style={{
                        backgroundColor: current.color,
                        left: `${20 + (index % 4) * 20}%`,
                        top: `${20 + Math.floor(index / 4) * 15}%`,
                      }}
                    >
                      <span className="arrow-tooltip">{current.name}</span>
                    </div>
                  ))}
                </div>
                <div className="map-legend">
                  <div className="legend-item">
                    <span className="warm">🌡️</span>
                    <span>暖流</span>
                  </div>
                  <div className="legend-item">
                    <span className="cold">❄️</span>
                    <span>寒流</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tide-simulation">
              <h4>🌊 潮汐与月相关系</h4>
              <div className="tide-container">
                <div className="moon-phase">
                  {tidalPhases.map((phase, index) => (
                    <div
                      key={index}
                      className={`phase-item ${showAnimation ? 'pulse' : ''}`}
                      style={{ animationDelay: `${index * 1.5}s` }}
                    >
                      <span className="moon-emoji">{phase.moon}</span>
                      <span className="phase-name">{phase.phase}</span>
                      <span className="tide-type">{phase.tide}</span>
                      <span className="tide-reason">{phase.reason}</span>
                    </div>
                  ))}
                </div>
                
                <div className={`tide-wave ${showAnimation ? 'wave-animation' : ''}`}>
                  <div className="wave wave-1" />
                  <div className="wave wave-2" />
                  <div className="wave wave-3" />
                  <div className="tide-level">
                    <span className="high-tide">高潮</span>
                    <span className="low-tide">低潮</span>
                  </div>
                </div>
              </div>
              <div className="tide-explanation">
                <p>
                  🌙 <strong>大潮</strong>：朔月和望月时，太阳、月亮、地球在同一直线上，引潮力叠加，潮差最大。
                </p>
                <p>
                  🌓 <strong>小潮</strong>：上弦月和下弦月时，太阳和月亮相互垂直，引潮力部分抵消，潮差最小。
                </p>
              </div>
            </div>

            <div className="ocean-effect">
              <h4>🌍 洋流对气候的影响</h4>
              <div className="effect-grid">
                <div className="effect-card warm">
                  <h5>🌡️ 暖流的影响</h5>
                  <ul>
                    <li>增温增湿</li>
                    <li>使沿岸气候变暖</li>
                    <li>例如：北大西洋暖流使西欧气候温和湿润</li>
                  </ul>
                </div>
                <div className="effect-card cold">
                  <h5>❄️ 寒流的影响</h5>
                  <ul>
                    <li>降温减湿</li>
                    <li>使沿岸气候变干</li>
                    <li>例如：秘鲁寒流形成阿塔卡马沙漠</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default RequiredNine
