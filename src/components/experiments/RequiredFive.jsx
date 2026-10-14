import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const atmosphereLayers = [
  {
    id: 'troposphere',
    name: '对流层',
    englishName: 'Troposphere',
    height: '0-12 km',
    temperature: '-60°C ~ 15°C',
    pressure: '1000 ~ 200 hPa',
    composition: 'N₂ 78%, O₂ 21%, H₂O 0-4%, CO₂ 0.04%',
    color: '#87CEEB',
    icon: '☁️',
    features: [
      '最贴近地面的大气层',
      '天气现象主要发生层',
      '温度随高度升高而降低（平均递减率6.5°C/km）',
      '空气对流运动强烈',
      '人类活动主要影响层',
    ],
    special: '云、雾、降水、风暴',
  },
  {
    id: 'stratosphere',
    name: '平流层',
    englishName: 'Stratosphere',
    height: '12-50 km',
    temperature: '-60°C ~ 0°C',
    pressure: '200 ~ 1 hPa',
    composition: 'N₂ 78%, O₂ 21%, O₃ 0.00001-0.00004%',
    color: '#B0E0E6',
    icon: '🛫',
    features: [
      '空气以水平运动为主',
      '温度随高度升高而升高（臭氧层吸收紫外线）',
      '臭氧层位于20-35km',
      '适合高空飞行',
      '污染物扩散缓慢',
    ],
    special: '臭氧层',
  },
  {
    id: 'mesosphere',
    name: '中间层',
    englishName: 'Mesosphere',
    height: '50-85 km',
    temperature: '-100°C ~ 0°C',
    pressure: '1 ~ 0.01 hPa',
    composition: 'N₂ 78%, O₂ 21%, O 少量',
    color: '#E6E6FA',
    icon: '🌠',
    features: [
      '温度随高度升高而降低',
      '空气稀薄',
      '流星体在此层燃烧',
      '极光常出现于此层底部',
      '大气化学活跃',
    ],
    special: '流星、极光',
  },
  {
    id: 'thermosphere',
    name: '热层',
    englishName: 'Thermosphere',
    height: '85-600 km',
    temperature: '1000°C ~ 2000°C',
    pressure: '< 0.01 hPa',
    composition: 'O₂⁺, N₂⁺, O⁺, H⁺',
    color: '#DDA0DD',
    icon: '💫',
    features: [
      '温度随高度升高急剧升高',
      '空气极稀薄',
      '气体处于电离状态',
      '极光主要出现层',
      '人造卫星轨道区域',
    ],
    special: '极光、电离层',
  },
  {
    id: 'exosphere',
    name: '散逸层',
    englishName: 'Exosphere',
    height: '600 km ~',
    temperature: '1000°C ~ 2000°C',
    pressure: '接近真空',
    composition: 'H, He, H₂',
    color: '#F5F5F5',
    icon: '🚀',
    features: [
      '地球大气的最外层',
      '空气极其稀薄',
      '气体分子可逃逸到太空',
      '与星际空间过渡',
      '地球磁场影响显著',
    ],
    special: '大气逃逸、磁层',
  },
]

const gasComponents = [
  { id: 'n2', name: '氮气', symbol: 'N₂', percentage: 78.08, color: '#8B4513', role: '稀释氧气，提供氮源' },
  { id: 'o2', name: '氧气', symbol: 'O₂', percentage: 20.95, color: '#4169E1', role: '呼吸作用，燃烧' },
  { id: 'ar', name: '氩气', symbol: 'Ar', percentage: 0.93, color: '#9370DB', role: '惰性气体，工业用途' },
  { id: 'co2', name: '二氧化碳', symbol: 'CO₂', percentage: 0.04, color: '#228B22', role: '光合作用原料，温室气体' },
  { id: 'ne', name: '氖气', symbol: 'Ne', percentage: 0.0018, color: '#FFD700', role: '霓虹灯，激光' },
  { id: 'he', name: '氦气', symbol: 'He', percentage: 0.0005, color: '#E0FFFF', role: '气球，冷却剂' },
  { id: 'ch4', name: '甲烷', symbol: 'CH₄', percentage: 0.00017, color: '#D2691E', role: '温室气体，能源' },
  { id: 'h2o', name: '水汽', symbol: 'H₂O', percentage: '0-4', color: '#00CED1', role: '天气现象，温室效应' },
]

const ozoneLayer = {
  height: '20-35 km',
  maxConcentration: '约 25 km',
  thickness: '约 15 km',
  function: '吸收99%以上的太阳紫外线',
  importance: '保护地球上的生命免受紫外线伤害',
  threat: '氟氯烃等物质会破坏臭氧层',
}

const tasks = [
  {
    id: 'task-1',
    title: '任务1：观察大气分层特征',
    description: '点击各层查看详细信息，对比温度、压力和成分变化规律。',
    hint: '注意温度随高度变化的趋势，理解不同分层的成因。',
  },
  {
    id: 'task-2',
    title: '任务2：分析大气成分比例',
    description: '观察干洁空气成分饼图，理解各气体的作用和意义。',
    hint: '氮气和氧气占99%，但微量气体对气候和生命至关重要。',
  },
  {
    id: 'task-3',
    title: '任务3：探究臭氧层作用',
    description: '了解臭氧层的位置、作用和面临的威胁，思考保护措施。',
    hint: '臭氧层空洞主要出现在南极地区。',
  },
]

const examQuestions = [
  {
    id: 'q1',
    stem: '关于对流层的叙述，正确的是（ ）',
    options: [
      'A. 气温随高度升高而升高',
      'B. 空气以水平运动为主',
      'C. 天气现象主要发生在此层',
      'D. 臭氧层位于此层',
    ],
    answer: 'C',
    explanation: '对流层是最贴近地面的大气层，气温随高度升高而降低，空气对流运动强烈，天气现象主要发生在此层。',
  },
  {
    id: 'q2',
    stem: '平流层适合飞机飞行的主要原因是（ ）',
    options: [
      'A. 空气稀薄',
      'B. 气温适宜',
      'C. 天气晴朗，气流平稳',
      'D. 距离地面远',
    ],
    answer: 'C',
    explanation: '平流层空气以水平运动为主，气流平稳，天气晴朗，能见度好，适合飞机高空飞行。',
  },
  {
    id: 'q3',
    stem: '大气中含量最多的气体是（ ）',
    options: ['A. 氧气', 'B. 氮气', 'C. 二氧化碳', 'D. 水汽'],
    answer: 'B',
    explanation: '氮气约占大气体积的78%，是大气中含量最多的气体。',
  },
]

function RequiredFive() {
  const [selectedLayer, setSelectedLayer] = useState('troposphere')
  const [showOzoneInfo, setShowOzoneInfo] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)

  const selectedLayerData = useMemo(() => {
    return atmosphereLayers.find((layer) => layer.id === selectedLayer)
  }, [selectedLayer])

  const maxHeight = 600
  const layerPositions = useMemo(() => {
    return atmosphereLayers.map((layer) => {
      const heights = layer.height.split('-')
      const startHeight = parseInt(heights[0]) || 0
      let endHeight = maxHeight
      if (heights[1]) {
        const parsed = parseInt(heights[1])
        if (!isNaN(parsed)) {
          endHeight = parsed
        }
      }
      return {
        ...layer,
        startPercent: (startHeight / maxHeight) * 100,
        endPercent: Math.min((endHeight / maxHeight) * 100, 100),
      }
    })
  }, [])

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：大气圈层结构实验</h1>
            <p className="muted">对应教材：必修一 第三章《地球上的大气》第1节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">返回首页</Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>大气分层抽象，学生难以理解不同层次的温度变化和功能差异。本实验通过可视化分层模型和数据展示，帮助学生建立大气结构的立体概念。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>了解大气的垂直分层结构</li>
                    <li>掌握各层的温度、压力和成分特征</li>
                    <li>理解臭氧层的作用和保护意义</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析大气分层的温度变化规律</li>
                    <li>学会解读大气成分数据</li>
                    <li>培养图表分析和逻辑推理能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>认识大气环境的脆弱性</li>
                    <li>树立保护臭氧层的意识</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>大气成分组成</h2>
              <div className="gas-composition">
                <div className="composition-chart">
                  {gasComponents.map((gas) => (
                    <div
                      key={gas.id}
                      className="gas-bar"
                      style={{
                        width: `${typeof gas.percentage === 'number' ? gas.percentage : 2}%`,
                        backgroundColor: gas.color,
                      }}
                      title={`${gas.name} (${gas.symbol}): ${typeof gas.percentage === 'number' ? gas.percentage : '0-4'}%`}
                    />
                  ))}
                </div>
                <div className="gas-list">
                  {gasComponents.map((gas) => (
                    <div key={gas.id} className="gas-item">
                      <span className="gas-color" style={{ backgroundColor: gas.color }} />
                      <span className="gas-name">{gas.name}</span>
                      <span className="gas-symbol">{gas.symbol}</span>
                      <span className="gas-percent">
                        {typeof gas.percentage === 'number' ? gas.percentage + '%' : '0-4%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel-block">
              <button
                type="button"
                className={`btn small ${showOzoneInfo ? 'active' : ''}`}
                onClick={() => setShowOzoneInfo(!showOzoneInfo)}
              >
                {showOzoneInfo ? '隐藏臭氧层信息' : '显示臭氧层信息'}
              </button>
              {showOzoneInfo && (
                <div className="ozone-panel">
                  <h3>🧪 臭氧层</h3>
                  <div className="ozone-info">
                    <div>
                      <span>位置</span>
                      <strong>{ozoneLayer.height}</strong>
                    </div>
                    <div>
                      <span>最大浓度</span>
                      <strong>{ozoneLayer.maxConcentration}</strong>
                    </div>
                    <div>
                      <span>厚度</span>
                      <strong>{ozoneLayer.thickness}</strong>
                    </div>
                    <div>
                      <span>主要功能</span>
                      <strong>{ozoneLayer.function}</strong>
                    </div>
                    <div>
                      <span>重要性</span>
                      <strong>{ozoneLayer.importance}</strong>
                    </div>
                    <div>
                      <span>主要威胁</span>
                      <strong>{ozoneLayer.threat}</strong>
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

          <section className="panel canvas atmosphere-canvas">
            <div className="atmosphere-header">
              <div>
                <h3>大气垂直分层模型</h3>
                <p>点击各层查看详细信息</p>
              </div>
              <span className="badge">共 {atmosphereLayers.length} 层</span>
            </div>

            <div className="atmosphere-model">
              <div className="atmosphere-scale">
                <div className="scale-labels">
                  {[0, 100, 200, 300, 400, 500, 600].map((height) => (
                    <div key={height} className="scale-label">
                      <span>{height}</span>
                      <span className="scale-unit">km</span>
                    </div>
                  ))}
                </div>
                <div className="atmosphere-layers">
                  {layerPositions.map((layer) => {
                    const isSelected = selectedLayer === layer.id
                    return (
                      <div
                        key={layer.id}
                        className={`atmosphere-layer ${isSelected ? 'selected' : ''}`}
                        style={{
                          top: `${100 - layer.endPercent}%`,
                          height: `${layer.endPercent - layer.startPercent}%`,
                          background: `linear-gradient(to bottom, ${layer.color}88, ${layer.color}44)`,
                        }}
                        onClick={() => setSelectedLayer(layer.id)}
                      >
                        <div className="layer-marker">
                          <span>{layer.icon}</span>
                          <span className="layer-name">{layer.name}</span>
                        </div>
                        {isSelected && (
                          <div className="layer-popup">
                            <h4>{layer.name}</h4>
                            <p>高度：{layer.height}</p>
                            <p>温度：{layer.temperature}</p>
                            <p>压力：{layer.pressure}</p>
                            <p className="special">{layer.special}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="temperature-profile">
                <h4>🌡️ 温度垂直分布</h4>
                <div className="temp-chart">
                  <svg viewBox="0 0 80 400" className="temp-svg">
                    <defs>
                      <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF4500" />
                        <stop offset="50%" stopColor="#FFD700" />
                        <stop offset="100%" stopColor="#00BFFF" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 40 380 Q 35 300 40 250 Q 45 200 40 150 Q 35 100 40 50 Q 45 20 40 10"
                      fill="none"
                      stroke="url(#tempGradient)"
                      strokeWidth="3"
                    />
                    <circle cx="40" cy="380" r="4" fill="#00BFFF" />
                    <circle cx="40" cy="250" r="4" fill="#FFD700" />
                    <circle cx="40" cy="150" r="4" fill="#00BFFF" />
                    <circle cx="40" cy="10" r="4" fill="#FF4500" />
                  </svg>
                  <div className="temp-labels">
                    <span className="temp-label">-60°C</span>
                    <span className="temp-label">0°C</span>
                    <span className="temp-label">1000°C</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedLayerData && (
              <div className="layer-detail-panel">
                <h4>📋 {selectedLayerData.name}详情</h4>
                <div className="detail-grid">
                  <div>
                    <span>英文名称</span>
                    <strong>{selectedLayerData.englishName}</strong>
                  </div>
                  <div>
                    <span>高度范围</span>
                    <strong>{selectedLayerData.height}</strong>
                  </div>
                  <div>
                    <span>温度范围</span>
                    <strong>{selectedLayerData.temperature}</strong>
                  </div>
                  <div>
                    <span>压力范围</span>
                    <strong>{selectedLayerData.pressure}</strong>
                  </div>
                  <div className="full-width">
                    <span>主要成分</span>
                    <strong>{selectedLayerData.composition}</strong>
                  </div>
                </div>
                <div className="layer-features">
                  <h5>主要特征：</h5>
                  <ul>
                    {selectedLayerData.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default RequiredFive
