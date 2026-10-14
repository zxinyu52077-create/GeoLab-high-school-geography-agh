import { useState } from 'react'

function WelcomePage({ onStart }) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleStart = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onStart()
    }, 420)
  }

  const guidePrompts = [
    '太阳辐射为什么会改变地表温度？',
    '洋流怎样影响沿岸城市的气候？',
    '地震波如何揭示地球内部结构？',
  ]

  const explorationRoutes = [
    {
      label: '从真实现象出发',
      title: '看见问题',
      description: '用情境和数据把抽象概念变成眼前的地理现象。',
      marker: '01',
    },
    {
      label: '在仿真里操作',
      title: '动手推演',
      description: '拖动变量、观察变化，在反馈中形成自己的判断。',
      marker: '02',
    },
    {
      label: '用 AI 追问',
      title: '讲清原理',
      description: '把困惑交给伴学助手，获得思路、例题和进一步探究方向。',
      marker: '03',
    },
  ]

  const learningFields = [
    { name: '宇宙环境', detail: '尺度、运动、宜居条件', tone: 'sky' },
    { name: '大气过程', detail: '热力环流、风带、天气系统', tone: 'sun' },
    { name: '水循环与海洋', detail: '径流、洋流、海水性质', tone: 'water' },
    { name: '地貌与构造', detail: '地层、地震、地表演化', tone: 'earth' },
  ]

  const stats = [
    { value: '16+', label: '交互实验' },
    { value: '2', label: '教材模块' },
    { value: 'AI', label: '随时伴学' },
  ]

  return (
    <div className={`welcome-page ${isAnimating ? 'fade-out' : ''}`}>
      <div className="welcome-atmosphere" aria-hidden="true">
        <span className="terrain-line terrain-line-1" />
        <span className="terrain-line terrain-line-2" />
        <span className="terrain-line terrain-line-3" />
        <span className="weather-stream weather-stream-1" />
        <span className="weather-stream weather-stream-2" />
      </div>

      <div className="welcome-shell">
    <nav className="welcome-nav" aria-label="GeoLab 首页导航">
          <div className="welcome-brand">
        <img src="/picture/GEOSIMlogo.png" alt="GeoLab Logo" className="brand-logo" />
            <div>
          <strong>GeoLab</strong>
              <span>高中地理可验证仿真实验平台</span>
            </div>
          </div>
          <button className="nav-start-btn" type="button" onClick={handleStart}>
            进入探索
          </button>
        </nav>

        <main>
          <section className="hero-guide">
            <div className="hero-copy">
              <p className="eyebrow">把地理课变成一次可操作的探索</p>
              <h1>从一个真实问题开始，走进地球系统的运行现场</h1>
              <p className="hero-description">
          GeoLab 用原有交互仿真、科学数据和 AGH 智能体，把高中地理核心知识点组织成一条可设计、可运行、可核验的探索路径。
                你不只是阅读结论，而是在观察、操作、追问中理解地理规律。
              </p>
              <div className="hero-actions">
                <button className="cta-button" type="button" onClick={handleStart}>
                  <span className="btn-text">开始我的探索</span>
                  <span className="btn-arrow">→</span>
                </button>
                <a className="secondary-link" href="#learning-map">
                  先看看能学什么
                </a>
              </div>
              <div className="prompt-strip" aria-label="学习引导问题">
                {guidePrompts.map((prompt) => (
                  <span key={prompt}>{prompt}</span>
                ))}
              </div>
            </div>

            <div className="earth-lab" aria-label="动态地理探索场景">
              <div className="orbit-ring orbit-ring-1" />
              <div className="orbit-ring orbit-ring-2" />
              <div className="planet-core" aria-hidden="true">
                <img src="/picture/geosim-home-earth.png" alt="" />
              </div>
              <div className="lab-note lab-note-1">
                <span>变量</span>
                太阳高度
              </div>
              <div className="lab-note lab-note-2">
                <span>反馈</span>
                温度场变化
              </div>
              <div className="lab-note lab-note-3">
                <span>追问</span>
                为什么？
              </div>
            </div>
          </section>

          <section className="guided-section">
            <div className="section-heading">
              <p className="eyebrow">学习不是被动浏览</p>
              <h2>每一次进入，都沿着“发现 - 操作 - 理解”推进</h2>
            </div>
            <div className="route-grid">
              {explorationRoutes.map((route) => (
                <article key={route.title} className="route-card">
                  <span className="route-marker">{route.marker}</span>
                  <p>{route.label}</p>
                  <h3>{route.title}</h3>
                  <span>{route.description}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="learning-map" id="learning-map">
            <div className="map-copy">
              <p className="eyebrow">探索地图</p>
              <h2>选择一个地理现象，顺着线索往深处走</h2>
              <p>
                平台覆盖必修一与选修一的核心实验。每个主题都尽量从可观察的现象切入，
                再引导你调整参数、对照数据、完成诊断练习。
              </p>
              <div className="stat-row">
                {stats.map((item) => (
                  <div className="stat-item" key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="field-list">
              {learningFields.map((field) => (
                <button className={`field-card field-card-${field.tone}`} type="button" onClick={handleStart} key={field.name}>
                  <span className="field-dot" />
                  <strong>{field.name}</strong>
                  <small>{field.detail}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="mentor-panel">
          <img src="/picture/GEOSIMAIlogo.png" alt="GeoLab AI" className="mentor-icon" />
            <div className="mentor-copy">
          <p className="eyebrow">AGH 可验证实验台在旁边</p>
              <h2>卡住的时候，不用停在“我不会”</h2>
              <p>
          在实验界面唤起 GeoLab AI，它会围绕高中地理知识点解释概念、拆解题目、补充方法，
                帮你把一次操作变成真正理解。
              </p>
            </div>
            <button className="mentor-cta" type="button" onClick={handleStart}>
              去试一次
            </button>
          </section>
        </main>

        <footer className="welcome-footer">
        <p>© 2026 GeoLab高中地理可验证仿真实验平台 | 让每个知识点都能被看见、被操作、被验证</p>
        </footer>
      </div>
    </div>
  )
}

export default WelcomePage
