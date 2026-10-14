import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const geologicTimeScale = [
  { eon: '冥古宙', era: '', period: '', start: 4600, end: 4000, color: '#1a1a2e' },
  { eon: '太古宙', era: '', period: '', start: 4000, end: 2500, color: '#16213e' },
  { eon: '元古宙', era: '古元古代', period: '', start: 2500, end: 1800, color: '#0f3460' },
  { eon: '元古宙', era: '中元古代', period: '', start: 1800, end: 1000, color: '#533483' },
  { eon: '元古宙', era: '新元古代', period: '', start: 1000, end: 541, color: '#7209b7' },
  { eon: '显生宙', era: '古生代', period: '寒武纪', start: 541, end: 485, color: '#f72585' },
  { eon: '显生宙', era: '古生代', period: '奥陶纪', start: 485, end: 444, color: '#b5179e' },
  { eon: '显生宙', era: '古生代', period: '志留纪', start: 444, end: 419, color: '#7209b7' },
  { eon: '显生宙', era: '古生代', period: '泥盆纪', start: 419, end: 359, color: '#560bad' },
  { eon: '显生宙', era: '古生代', period: '石炭纪', start: 359, end: 299, color: '#4361ee' },
  { eon: '显生宙', era: '古生代', period: '二叠纪', start: 299, end: 252, color: '#4cc9f0' },
  { eon: '显生宙', era: '中生代', period: '三叠纪', start: 252, end: 201, color: '#43d9bd' },
  { eon: '显生宙', era: '中生代', period: '侏罗纪', start: 201, end: 145, color: '#a8e6cf' },
  { eon: '显生宙', era: '中生代', period: '白垩纪', start: 145, end: 66, color: '#ffd670' },
  { eon: '显生宙', era: '新生代', period: '古近纪', start: 66, end: 23, color: '#ff9a56' },
  { eon: '显生宙', era: '新生代', period: '新近纪', start: 23, end: 2.6, color: '#ff6b35' },
  { eon: '显生宙', era: '新生代', period: '第四纪', start: 2.6, end: 0, color: '#f72585' },
]

const fossilTypes = [
  { id: 'trilobite', name: '三叶虫', period: '寒武纪-二叠纪', era: '古生代', index: 0 },
  { id: 'ammonite', name: '菊石', period: '泥盆纪-白垩纪', era: '古生代-中生代', index: 1 },
  { id: 'dinosaur', name: '恐龙', period: '三叠纪-白垩纪', era: '中生代', index: 2 },
  { id: 'graptolite', name: '笔石', period: '寒武纪-石炭纪', era: '古生代', index: 3 },
  { id: 'coral', name: '珊瑚', period: '奥陶纪-现代', era: '古生代-新生代', index: 4 },
  { id: 'fish', name: '鱼类化石', period: '奥陶纪-现代', era: '古生代-新生代', index: 5 },
]

const strataLayers = [
  { id: 'layer-1', name: '第四纪沉积物', depth: 0, age: 1, color: '#d4a574', fossils: ['coral', 'fish'] },
  { id: 'layer-2', name: '新近纪砂岩', depth: 1, age: 15, color: '#c4956a', fossils: ['fish'] },
  { id: 'layer-3', name: '古近纪页岩', depth: 2, age: 50, color: '#8b7355', fossils: ['fish', 'coral'] },
  { id: 'layer-4', name: '白垩纪石灰岩', depth: 3, age: 100, color: '#f5e6d3', fossils: ['ammonite', 'coral'] },
  { id: 'layer-5', name: '侏罗纪泥岩', depth: 4, age: 150, color: '#6b5344', fossils: ['dinosaur', 'ammonite'] },
  { id: 'layer-6', name: '三叠纪砂岩', depth: 5, age: 220, color: '#c9b896', fossils: ['dinosaur'] },
  { id: 'layer-7', name: '二叠纪煤层', depth: 6, age: 280, color: '#3d2817', fossils: ['trilobite', 'coral'] },
  { id: 'layer-8', name: '石炭纪石灰岩', depth: 7, age: 320, color: '#e8dcc8', fossils: ['trilobite', 'coral', 'graptolite'] },
  { id: 'layer-9', name: '泥盆纪页岩', depth: 8, age: 380, color: '#5c4d3d', fossils: ['trilobite', 'graptolite', 'fish'] },
  { id: 'layer-10', name: '志留纪砂岩', depth: 9, age: 420, color: '#a69178', fossils: ['trilobite', 'graptolite'] },
  { id: 'layer-11', name: '奥陶纪石灰岩', depth: 10, age: 460, color: '#f0e6d2', fossils: ['trilobite', 'graptolite', 'coral'] },
  { id: 'layer-12', name: '寒武纪沉积岩', depth: 11, age: 520, color: '#8b7a6b', fossils: ['trilobite', 'graptolite'] },
]

const tasks = [
  {
    id: 'task-1',
    title: '任务1：识别地层年代',
    description: '逐层挖掘，根据化石组合推断各层的地质年代，验证地层叠置律。',
    hint: '先确定最底层岩石年龄，再根据化石组合向上推断。',
  },
  {
    id: 'task-2',
    title: '任务2：绘制地质剖面图',
    description: '记录每层的岩性、颜色、化石种类，绘制完整的地质柱状图。',
    hint: '注意观察化石组合的变化规律。',
  },
  {
    id: 'task-3',
    title: '任务3：分析地质演化历史',
    description: '根据地层序列，分析该地区从寒武纪到第四纪的地质演化过程。',
    hint: '注意地层缺失或间断代表的地质事件。',
  },
]

const examQuestions = [
  {
    id: 'q1',
    stem: '下列关于地层的说法，正确的是（ ）',
    options: [
      'A. 越古老的地层位于越上方',
      'B. 化石是确定地层年代的重要依据',
      'C. 同一时代的地层只能有一种化石',
      'D. 地层的形成顺序与时间无关',
    ],
    answer: 'B',
    explanation: '化石是古生物的遗体或遗迹，不同地质时代有不同的生物群，因此化石是确定地层相对年代的重要依据。',
  },
  {
    id: 'q2',
    stem: '某地层中发现恐龙化石和菊石化石，该地层最可能形成于（ ）',
    options: ['A. 寒武纪', 'B. 侏罗纪', 'C. 第三纪', 'D. 第四纪'],
    answer: 'B',
    explanation: '恐龙和菊石都繁盛于中生代，侏罗纪属于中生代。寒武纪还没有恐龙，第三纪和第四纪恐龙已经灭绝。',
  },
  {
    id: 'q3',
    stem: '地层叠置律的含义是（ ）',
    options: [
      'A. 同一地区，下层地层比上层地层古老',
      'B. 同一地区，上层地层比下层地层古老',
      'C. 不同地区的地层年龄相同',
      'D. 地层的年龄与深度无关',
    ],
    answer: 'A',
    explanation: '地层叠置律指出，在未受到剧烈构造运动扰动的情况下，下层地层形成时间更早，比上层地层古老。',
  },
]

function RequiredThree() {
  const [excavatedLayers, setExcavatedLayers] = useState([])
  const [selectedLayer, setSelectedLayer] = useState(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [completedTasks, setCompletedTasks] = useState([])

  const currentLayer = useMemo(() => {
    return strataLayers.find((l) => l.depth === excavatedLayers.length) || null
  }, [excavatedLayers])

  const handleExcavate = () => {
    if (currentLayer && !excavatedLayers.includes(currentLayer.id)) {
      setExcavatedLayers([...excavatedLayers, currentLayer.id])
    }
  }

  const handleSelectLayer = (layerId) => {
    setSelectedLayer(layerId)
  }

  const getLayerById = (id) => strataLayers.find((l) => l.id === id)
  const getFossilById = (id) => fossilTypes.find((f) => f.id === id)

  const selectedLayerData = selectedLayer ? getLayerById(selectedLayer) : null

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：地层学与地质年代学实验</h1>
            <p className="muted">对应教材：必修一 第三章《地球的圈层结构》第3节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">返回首页</Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>地质年代久远抽象，学生难以建立"时间-地层-化石"的关联。本实验通过逐层挖掘的互动方式，帮助学生理解地层叠置律和化石断代原理。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>理解地质年代划分体系（宙-代-纪）</li>
                    <li>掌握地层叠置律和化石断代原理</li>
                    <li>了解主要化石门类及其地质时代分布</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够根据化石组合推断地层年代</li>
                    <li>学会绘制简单的地质柱状图</li>
                    <li>培养逻辑推理和证据分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>感受地球历史的漫长与演化的复杂性</li>
                    <li>树立"证据至上"的科学思维</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className={completedTasks.includes(task.id) ? 'completed' : ''}>
                    <strong>{task.title}</strong>
                    <p>{task.description}</p>
                    <span className="task-hint">💡 {task.hint}</span>
                    {!completedTasks.includes(task.id) && (
                      <button
                        type="button"
                        className="btn small"
                        onClick={() => setCompletedTasks([...completedTasks, task.id])}
                      >
                        标记完成
                      </button>
                    )}
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

          <section className="panel canvas strata-canvas">
            <div className="strata-header">
              <div>
                <h3>地层挖掘现场</h3>
                <p>点击"挖掘"按钮逐层揭示地层与化石</p>
              </div>
              <span className="badge">已挖掘 {excavatedLayers.length} / {strataLayers.length} 层</span>
            </div>

            <div className="strata-display">
              <div className="strata-section">
                {strataLayers.map((layer) => {
                  const isExcavated = excavatedLayers.includes(layer.id)
                  const isSelected = selectedLayer === layer.id
                  return (
                    <div
                      key={layer.id}
                      className={`strata-layer ${isExcavated ? 'excavated' : 'unexcavated'} ${isSelected ? 'selected' : ''}`}
                      onClick={() => isExcavated && handleSelectLayer(layer.id)}
                      style={{ backgroundColor: isExcavated ? layer.color : '#333' }}
                    >
                      {isExcavated ? (
                        <div className="layer-content">
                          <span className="layer-name">{layer.name}</span>
                          <span className="layer-age">约 {layer.age} 百万年</span>
                          <div className="layer-fossils">
                            {layer.fossils.map((fossilId) => {
                              const fossil = getFossilById(fossilId)
                              return fossil ? (
                                <span key={fossilId} className="fossil-tag" title={fossil.period}>
                                  {fossil.name}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="unexcavated-text">???</span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="excavation-controls">
                <button
                  type="button"
                  className="btn primary"
                  onClick={handleExcavate}
                  disabled={excavatedLayers.length >= strataLayers.length}
                >
                  ⛏️ 挖掘下一层
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setExcavatedLayers([])}
                >
                  🔄 重新开始
                </button>
              </div>
            </div>

            {selectedLayerData && (
              <div className="layer-detail-panel">
                <h4>📋 地层详情</h4>
                <div className="detail-grid">
                  <div>
                    <span>地层名称</span>
                    <strong>{selectedLayerData.name}</strong>
                  </div>
                  <div>
                    <span>埋藏深度</span>
                    <strong>{selectedLayerData.depth} 层</strong>
                  </div>
                  <div>
                    <span>形成年代</span>
                    <strong>约 {selectedLayerData.age} 百万年</strong>
                  </div>
                  <div>
                    <span>发现化石</span>
                    <div className="fossil-list">
                      {selectedLayerData.fossils.map((fossilId) => {
                        const fossil = getFossilById(fossilId)
                        return fossil ? (
                          <div key={fossilId} className="fossil-detail">
                            <span>{fossil.name}</span>
                            <span className="fossil-period">{fossil.period}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="geologic-time-scale">
              <h4>⏰ 地质年代表</h4>
              <div className="time-scale">
                {geologicTimeScale.map((period, index) => (
                  <div
                    key={index}
                    className="time-block"
                    style={{ backgroundColor: period.color }}
                    title={`${period.eon} · ${period.era} · ${period.period}`}
                  >
                    <span className="time-label">{period.period || period.era}</span>
                    <span className="time-age">{period.start} Ma</span>
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

export default RequiredThree
