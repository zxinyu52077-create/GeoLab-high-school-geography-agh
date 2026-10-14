import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const seawaterProperties = {
  temperature: {
    title: '海水温度',
    unit: '°C',
    range: '-2°C ~ 30°C',
    surfaceAvg: '约 17°C',
    factors: ['太阳辐射', '洋流', '季节', '纬度'],
    distribution: '从赤道向两极递减',
  },
  salinity: {
    title: '海水盐度',
    unit: '‰',
    range: '33‰ ~ 37‰',
    surfaceAvg: '约 35‰',
    factors: ['蒸发', '降水', '河流注入', '洋流'],
    distribution: '副热带最高，赤道和极地较低',
  },
  density: {
    title: '海水密度',
    unit: 'g/cm³',
    range: '1.020 ~ 1.030 g/cm³',
    surfaceAvg: '约 1.025 g/cm³',
    factors: ['温度', '盐度', '压力'],
    distribution: '随深度增加而增大',
  },
}

const temperatureProfile = [
  { depth: 0, temp: 25, lat: 0 },
  { depth: 0, temp: 20, lat: 20 },
  { depth: 0, temp: 15, lat: 40 },
  { depth: 0, temp: 5, lat: 60 },
  { depth: 0, temp: -1, lat: 80 },
  { depth: 100, temp: 24, lat: 0 },
  { depth: 100, temp: 19, lat: 20 },
  { depth: 100, temp: 14, lat: 40 },
  { depth: 100, temp: 4, lat: 60 },
  { depth: 100, temp: -1, lat: 80 },
  { depth: 500, temp: 18, lat: 0 },
  { depth: 500, temp: 10, lat: 20 },
  { depth: 500, temp: 6, lat: 40 },
  { depth: 500, temp: 2, lat: 60 },
  { depth: 500, temp: -1, lat: 80 },
  { depth: 1000, temp: 8, lat: 0 },
  { depth: 1000, temp: 5, lat: 20 },
  { depth: 1000, temp: 3, lat: 40 },
  { depth: 1000, temp: 1.5, lat: 60 },
  { depth: 1000, temp: -1.5, lat: 80 },
  { depth: 2000, temp: 2, lat: 0 },
  { depth: 2000, temp: 2, lat: 20 },
  { depth: 2000, temp: 1.8, lat: 40 },
  { depth: 2000, temp: 1.5, lat: 60 },
  { depth: 2000, temp: -1.8, lat: 80 },
  { depth: 3000, temp: 1.5, lat: 0 },
  { depth: 3000, temp: 1.5, lat: 20 },
  { depth: 3000, temp: 1.3, lat: 40 },
  { depth: 3000, temp: 1.2, lat: 60 },
  { depth: 3000, temp: -2, lat: 80 },
]

const salinityProfile = [
  { lat: -80, salinity: 34 },
  { lat: -60, salinity: 34.5 },
  { lat: -40, salinity: 35 },
  { lat: -20, salinity: 36 },
  { lat: 0, salinity: 34.5 },
  { lat: 20, salinity: 36 },
  { lat: 40, salinity: 35 },
  { lat: 60, salinity: 34.5 },
  { lat: 80, salinity: 33.5 },
]

const densityProfile = [
  { depth: 0, density: 1.022 },
  { depth: 200, density: 1.024 },
  { depth: 500, density: 1.025 },
  { depth: 1000, density: 1.026 },
  { depth: 2000, density: 1.027 },
  { depth: 3000, density: 1.028 },
  { depth: 4000, density: 1.029 },
  { depth: 5000, density: 1.0295 },
]

const tasks = [
  {
    id: 'task-1',
    title: '任务1：分析海水温度分布',
    description: '观察温度随纬度和深度的变化，理解影响温度分布的因素。',
    hint: '注意温跃层的存在及其位置。',
  },
  {
    id: 'task-2',
    title: '任务2：探究盐度分布规律',
    description: '分析盐度随纬度的变化，解释副热带盐度最高的原因。',
    hint: '蒸发量与降水量的对比是关键。',
  },
  {
    id: 'task-3',
    title: '任务3：理解密度与温盐环流',
    description: '观察密度随深度的变化，理解密度差异如何驱动深层环流。',
    hint: '密度大的海水下沉形成深层水团。',
  },
]

const examQuestions = [
  {
    id: 'q1',
    stem: '影响海水温度分布的主要因素是（ ）',
    options: [
      'A. 盐度',
      'B. 太阳辐射',
      'C. 密度',
      'D. 压力',
    ],
    answer: 'B',
    explanation: '太阳辐射是影响海水温度分布的最主要因素，海水温度从赤道向两极递减。',
  },
  {
    id: 'q2',
    stem: '世界大洋表面盐度最高的区域位于（ ）',
    options: ['A. 赤道附近', 'B. 副热带海区', 'C. 极地海区', 'D. 温带海区'],
    answer: 'B',
    explanation: '副热带海区蒸发量大于降水量，盐度最高。赤道地区虽然温度高，但降水丰富，盐度较低。',
  },
  {
    id: 'q3',
    stem: '海水密度随深度的变化规律是（ ）',
    options: [
      'A. 随深度增加而减小',
      'B. 随深度增加而增大',
      'C. 随深度增加先增大后减小',
      'D. 不随深度变化',
    ],
    answer: 'B',
    explanation: '海水密度随深度增加而增大，这是由于压力增大和温度降低共同作用的结果。',
  },
]

function RequiredEight() {
  const [selectedProperty, setSelectedProperty] = useState('temperature')
  const [showAnswers, setShowAnswers] = useState(false)
  const [depth, setDepth] = useState(0)

  const selectedPropertyData = useMemo(() => {
    return seawaterProperties[selectedProperty]
  }, [selectedProperty])

  const currentTemp = useMemo(() => {
    const equatorData = temperatureProfile.filter(d => d.lat === 0)
    const found = equatorData.find(d => d.depth === depth)
    return found?.temp || 25
  }, [depth])

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：海水性质实验</h1>
            <p className="muted">对应教材：必修一 第三章《地球上的水》第2节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">返回首页</Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>海水性质的空间分布抽象，学生难以理解温度、盐度和密度之间的关系。本实验通过可视化剖面和数据展示，帮助学生理解海水性质的分布规律。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>了解海水温度、盐度、密度的分布规律</li>
                    <li>掌握影响海水性质的主要因素</li>
                    <li>理解温盐环流的形成机制</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析海水性质的时空变化</li>
                    <li>学会解读海洋剖面图</li>
                    <li>培养综合分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>认识海洋环境的复杂性</li>
                    <li>理解海洋对全球气候的影响</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>海水性质参数</h2>
              <div className="property-selector">
                {Object.entries(seawaterProperties).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    className={`prop-btn ${selectedProperty === key ? 'active' : ''}`}
                    onClick={() => setSelectedProperty(key)}
                  >
                    <span>{key === 'temperature' ? '🌡️' : key === 'salinity' ? '🧂' : '⚖️'}</span>
                    <span>{value.title}</span>
                  </button>
                ))}
              </div>
              {selectedPropertyData && (
                <div className="property-detail">
                  <h4>{selectedPropertyData.title}</h4>
                  <div className="detail-grid">
                    <div>
                      <span>单位</span>
                      <strong>{selectedPropertyData.unit}</strong>
                    </div>
                    <div>
                      <span>范围</span>
                      <strong>{selectedPropertyData.range}</strong>
                    </div>
                    <div>
                      <span>表层平均</span>
                      <strong>{selectedPropertyData.surfaceAvg}</strong>
                    </div>
                    <div className="full-width">
                      <span>影响因素</span>
                      <div className="factors">
                        {selectedPropertyData.factors.map((factor, index) => (
                          <span key={index} className="factor-tag">{factor}</span>
                        ))}
                      </div>
                    </div>
                    <div className="full-width">
                      <span>分布规律</span>
                      <strong>{selectedPropertyData.distribution}</strong>
                    </div>
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

          <section className="panel canvas seawater-canvas">
            <div className="seawater-header">
              <div>
                <h3>海水性质剖面仿真</h3>
                <p>拖动滑块查看不同深度的海水性质</p>
              </div>
              <div className="depth-control">
                <label>深度：{depth} m</label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="100"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="depth-slider"
                />
              </div>
            </div>

            <div className="ocean-profile">
              <div className="profile-container">
                <div className="surface-layer">
                  <span className="layer-label">表层</span>
                  <span className="temp-value">🌡️ {currentTemp}°C</span>
                </div>
                <div className="thermocline-layer">
                  <span className="layer-label">温跃层</span>
                  <span className="layer-desc">温度快速下降</span>
                </div>
                <div className="deep-layer">
                  <span className="layer-label">深层</span>
                  <span className="temp-value">🌡️ ~2°C</span>
                </div>
                
                <div className="depth-marker" style={{ bottom: `${(depth / 3000) * 100}%` }}>
                  <div className="marker-line" />
                  <span className="marker-label">{depth}m</span>
                </div>
              </div>
            </div>

            <div className="profiles-section">
              <div className="profile-card">
                <h4>🌡️ 温度随纬度分布</h4>
                <div className="lat-profile">
                  {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map((lat) => {
                    const data = temperatureProfile.find(d => d.lat === lat && d.depth === 0)
                    const temp = data?.temp || 0
                    const color = temp > 20 ? '#FF6B35' : temp > 10 ? '#FFD700' : temp > 0 ? '#4169E1' : '#00CED1'
                    return (
                      <div key={lat} className="lat-item">
                        <span className="lat-label">{lat}°</span>
                        <div className="temp-bar" style={{ height: `${Math.abs(temp) * 4}px`, backgroundColor: color }} />
                        <span className="temp-num">{temp}°C</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="profile-card">
                <h4>🧂 盐度随纬度分布</h4>
                <div className="salinity-profile">
                  <svg viewBox="0 0 400 100" className="salinity-svg">
                    <path
                      d={`M ${salinityProfile.map((p, i) => `${i * 44.4} ${100 - p.salinity * 2.5}`).join(' L ')}`}
                      fill="none"
                      stroke="#8B4513"
                      strokeWidth="3"
                    />
                    {salinityProfile.map((p, i) => (
                      <circle key={p.lat} cx={i * 44.4} cy={100 - p.salinity * 2.5} r="4" fill="#8B4513" />
                    ))}
                    <text x="200" y="90" textAnchor="middle" fill="#666" fontSize="12">纬度</text>
                  </svg>
                  <div className="salinity-labels">
                    <span>-80°</span>
                    <span>-40°</span>
                    <span>0°</span>
                    <span>40°</span>
                    <span>80°</span>
                  </div>
                </div>
              </div>

              <div className="profile-card">
                <h4>⚖️ 密度随深度分布</h4>
                <div className="density-profile">
                  <svg viewBox="0 0 200 300" className="density-svg">
                    <path
                      d={`M 100 ${densityProfile.map((p) => `${300 - (p.density - 1.02) * 3000}`).join(' L 100 ')}`}
                      fill="none"
                      stroke="#4169E1"
                      strokeWidth="3"
                    />
                    {densityProfile.map((p) => (
                      <circle
                        key={p.depth}
                        cx="100"
                        cy={300 - (p.density - 1.02) * 3000}
                        r="4"
                        fill="#4169E1"
                      />
                    ))}
                    <text x="180" y="20" textAnchor="middle" fill="#666" fontSize="10">1.030</text>
                    <text x="180" y="300" textAnchor="middle" fill="#666" fontSize="10">1.020</text>
                  </svg>
                  <div className="density-labels">
                    <span>0m</span>
                    <span>1000m</span>
                    <span>2000m</span>
                    <span>3000m</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default RequiredEight
