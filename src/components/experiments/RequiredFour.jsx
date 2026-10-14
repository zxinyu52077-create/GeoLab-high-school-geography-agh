import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const earthLayers = [
  {
    id: 'crust',
    name: '地壳',
    englishName: 'Crust',
    depth: '0-30 km',
    thickness: 30,
    density: '2.7-3.0 g/cm³',
    composition: '花岗岩（大陆）、玄武岩（海洋）',
    temperature: '0-800°C',
    color: '#8B7355',
    icon: '🌍',
    features: ['最外层', '厚度不均', '大陆地壳平均33km', '海洋地壳平均7km'],
  },
  {
    id: 'upper-mantle',
    name: '上地幔',
    englishName: 'Upper Mantle',
    depth: '30-410 km',
    thickness: 380,
    density: '3.3-4.4 g/cm³',
    composition: '橄榄岩、辉石岩',
    temperature: '800-1500°C',
    color: '#A0522D',
    icon: '🔥',
    features: ['固态岩石', '塑性流动', '软流层位于上部'],
  },
  {
    id: 'transition-zone',
    name: '过渡带',
    englishName: 'Transition Zone',
    depth: '410-660 km',
    thickness: 250,
    density: '4.4-5.6 g/cm³',
    composition: '橄榄石相变',
    temperature: '1500-1900°C',
    color: '#CD853F',
    icon: '⚡',
    features: ['矿物相变区域', '密度急剧增加', '410km和660km不连续面'],
  },
  {
    id: 'lower-mantle',
    name: '下地幔',
    englishName: 'Lower Mantle',
    depth: '660-2900 km',
    thickness: 2240,
    density: '5.6-5.9 g/cm³',
    composition: '镁铁质硅酸盐',
    temperature: '1900-3700°C',
    color: '#8B4513',
    icon: '🌡️',
    features: ['固态但可缓慢流动', '压力极高', '占地球体积50%'],
  },
  {
    id: 'outer-core',
    name: '外核',
    englishName: 'Outer Core',
    depth: '2900-5150 km',
    thickness: 2250,
    density: '9.9-12.2 g/cm³',
    composition: '液态铁镍合金',
    temperature: '3700-5000°C',
    color: '#FFD700',
    icon: '💧',
    features: ['液态', '地球磁场发源地', '对流运动'],
  },
  {
    id: 'inner-core',
    name: '内核',
    englishName: 'Inner Core',
    depth: '5150-6371 km',
    thickness: 1221,
    density: '12.8-13.1 g/cm³',
    composition: '固态铁镍合金',
    temperature: '5000-6000°C',
    color: '#FFA500',
    icon: '⚙️',
    features: ['固态', '温度高于太阳表面', '自转速度略快于地壳'],
  },
]

const discontinuities = [
  { id: 'moho', name: '莫霍洛维奇不连续面', depth: 30, description: '地壳与地幔的分界面，地震波速度突然增加' },
  { id: 'gutenberg', name: '古登堡不连续面', depth: 2900, description: '地幔与地核的分界面，横波在此消失' },
  { id: 'lehmann', name: '莱曼不连续面', depth: 5150, description: '外核与内核的分界面，纵波速度突然增加' },
]

const seismicWaveTypes = [
  { id: 'p-wave', name: '纵波（P波）', type: '压缩波', speed: '较快', medium: '固体、液体、气体', icon: '➡️' },
  { id: 's-wave', name: '横波（S波）', type: '剪切波', speed: '较慢', medium: '仅固体', icon: '⬆️' },
]

const tasks = [
  {
    id: 'task-1',
    title: '任务1：认识地球内部圈层结构',
    description: '点击各圈层查看详细信息，理解圈层的划分依据和主要特征。',
    hint: '注意观察各圈层的厚度、密度和温度变化规律。',
  },
  {
    id: 'task-2',
    title: '任务2：分析地震波传播路径',
    description: '观察横波和纵波在不同圈层中的传播情况，解释古登堡面横波消失的原因。',
    hint: '横波只能在固体中传播，外核是液态。',
  },
  {
    id: 'task-3',
    title: '任务3：计算圈层体积占比',
    description: '根据各圈层厚度，估算地核、地幔、地壳分别占地球总体积的百分比。',
    hint: '地球半径约6371km，球体体积公式V=(4/3)πr³',
  },
]

const examQuestions = [
  {
    id: 'q1',
    stem: '地球内部圈层划分的主要依据是（ ）',
    options: [
      'A. 物质组成',
      'B. 温度变化',
      'C. 地震波传播速度',
      'D. 密度分布',
    ],
    answer: 'C',
    explanation: '地球内部圈层是根据地震波在地球内部传播速度的变化来划分的，莫霍面和古登堡面是两个主要分界面。',
  },
  {
    id: 'q2',
    stem: '下列关于地球内核的说法，正确的是（ ）',
    options: [
      'A. 内核是液态的',
      'B. 内核主要由铁镍组成',
      'C. 内核温度低于地幔',
      'D. 内核密度小于地幔',
    ],
    answer: 'B',
    explanation: '地球内核是固态的铁镍合金，温度高达5000-6000°C，密度是地球各圈层中最大的。',
  },
  {
    id: 'q3',
    stem: '横波不能通过外核，说明外核是（ ）',
    options: ['A. 固态', 'B. 液态', 'C. 气态', 'D. 等离子态'],
    answer: 'B',
    explanation: '横波只能在固体介质中传播，不能通过液体。横波在外核消失，说明外核是液态的。',
  },
]

function RequiredFour() {
  const [selectedLayer, setSelectedLayer] = useState('crust')
  const [showWaveAnimation, setShowWaveAnimation] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)

  const selectedLayerData = useMemo(() => {
    return earthLayers.find((layer) => layer.id === selectedLayer)
  }, [selectedLayer])

  const totalRadius = 6371
  const layerRadii = useMemo(() => {
    let cumulative = 0
    return [...earthLayers].reverse().map((layer) => {
      const thickness = parseInt(layer.thickness)
      cumulative += thickness
      return { ...layer, innerRadius: cumulative - thickness, outerRadius: cumulative }
    })
  }, [])

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：地球内部结构探索实验</h1>
            <p className="muted">对应教材：必修一 第三章《地球的圈层结构》第2节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">返回首页</Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>地球内部结构无法直接观察，学生难以建立立体空间概念。本实验通过交互式球体切割和数据可视化，帮助学生理解地球圈层的物质组成和物理状态。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>了解地球内部圈层的划分（地壳、地幔、地核）</li>
                    <li>掌握各圈层的物质组成和物理性质</li>
                    <li>理解地震波在地球内部的传播规律</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够根据地震波特征判断地球内部结构</li>
                    <li>学会分析圈层之间的物质交换过程</li>
                    <li>培养空间想象和逻辑推理能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>感受地球内部结构的复杂性和有序性</li>
                    <li>理解科学探索地球内部的方法和意义</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>圈层选择</h2>
              <div className="layer-selector">
                {earthLayers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    className={`layer-btn ${selectedLayer === layer.id ? 'active' : ''}`}
                    onClick={() => setSelectedLayer(layer.id)}
                    style={{ '--layer-color': layer.color }}
                  >
                    <span>{layer.icon}</span>
                    <span>{layer.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedLayerData && (
              <div className="panel-block">
                <h2>圈层详情：{selectedLayerData.name}</h2>
                <div className="layer-detail-grid">
                  <div className="detail-item">
                    <span>英文名称</span>
                    <strong>{selectedLayerData.englishName}</strong>
                  </div>
                  <div className="detail-item">
                    <span>深度范围</span>
                    <strong>{selectedLayerData.depth}</strong>
                  </div>
                  <div className="detail-item">
                    <span>厚度</span>
                    <strong>{selectedLayerData.thickness} km</strong>
                  </div>
                  <div className="detail-item">
                    <span>密度</span>
                    <strong>{selectedLayerData.density}</strong>
                  </div>
                  <div className="detail-item">
                    <span>温度</span>
                    <strong>{selectedLayerData.temperature}</strong>
                  </div>
                  <div className="detail-item">
                    <span>物质组成</span>
                    <strong>{selectedLayerData.composition}</strong>
                  </div>
                </div>
                <div className="layer-features">
                  <h4>主要特征：</h4>
                  <ul>
                    {selectedLayerData.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="panel-block">
              <h2>不连续面</h2>
              <div className="discontinuity-list">
                {discontinuities.map((disc) => (
                  <div key={disc.id} className="discontinuity-card">
                    <strong>{disc.name}</strong>
                    <span className="disc-depth">{disc.depth} km</span>
                    <p>{disc.description}</p>
                  </div>
                ))}
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

          <section className="panel canvas earth-canvas">
            <div className="earth-header">
              <div>
                <h3>地球内部结构模型</h3>
                <p>点击圈层查看详细信息 · 拖动旋转观察</p>
              </div>
              <button
                type="button"
                className={`btn small ${showWaveAnimation ? 'active' : ''}`}
                onClick={() => setShowWaveAnimation(!showWaveAnimation)}
              >
                {showWaveAnimation ? '⏸️ 暂停' : '▶️ 地震波演示'}
              </button>
            </div>

            <div className="earth-model">
              <div className="earth-globe">
                {layerRadii.map((layer) => {
                  const outerPercent = (layer.outerRadius / totalRadius) * 100
                  const isSelected = selectedLayer === layer.id
                  return (
                    <div
                      key={layer.id}
                      className={`earth-shell ${isSelected ? 'selected' : ''}`}
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${layer.color}88, ${layer.color})`,
                        width: `${outerPercent}%`,
                        height: `${outerPercent}%`,
                        marginLeft: `${(100 - outerPercent) / 2}%`,
                        marginTop: `${(100 - outerPercent) / 2}%`,
                        clipPath: outerPercent === 100 ? 'none' : `circle(${outerPercent / 2}%)`,
                      }}
                      onClick={() => setSelectedLayer(layer.id)}
                      title={`${layer.name} (${layer.depth})`}
                    >
                      {isSelected && (
                        <div className="shell-label">
                          <span>{layer.name}</span>
                          <span className="shell-depth">{layer.depth}</span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {showWaveAnimation && (
                  <div className="wave-animation">
                    <div className="wave wave-1" />
                    <div className="wave wave-2" />
                    <div className="wave wave-3" />
                  </div>
                )}
              </div>
            </div>

            <div className="seismic-info">
              <h4>🌊 地震波类型</h4>
              <div className="seismic-grid">
                {seismicWaveTypes.map((wave) => (
                  <div key={wave.id} className="seismic-card">
                    <span className="wave-icon">{wave.icon}</span>
                    <div>
                      <strong>{wave.name}</strong>
                      <span className="wave-type">{wave.type}</span>
                    </div>
                    <div className="wave-props">
                      <span>速度：{wave.speed}</span>
                      <span>介质：{wave.medium}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="layer-legend">
              <h4>圈层图例</h4>
              <div className="legend-grid">
                {earthLayers.map((layer) => (
                  <div key={layer.id} className={`legend-item ${selectedLayer === layer.id ? 'active' : ''}`}>
                    <span className="legend-color" style={{ backgroundColor: layer.color }} />
                    <span>{layer.name}</span>
                    <span className="legend-depth">{layer.depth}</span>
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

export default RequiredFour
