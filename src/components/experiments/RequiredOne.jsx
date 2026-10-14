import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './RequiredOne.css'

const planets = [
  { id: 'mercury', name: '水星', en: 'MERCURY', au: 0.39, diameter: '4,879 km', temp: '约 167°C', kind: '岩质行星', fact: '几乎没有大气保温，昼夜温差极大。', water: '表面无法稳定存在液态水', image: '/picture/planets/mercury.png' },
  { id: 'venus', name: '金星', en: 'VENUS', au: 0.72, diameter: '12,104 km', temp: '约 465°C', kind: '岩质行星', fact: '浓厚的二氧化碳大气造成强烈温室效应。', water: '高温高压环境不利于液态水存在', image: '/picture/planets/venus.png' },
  { id: 'earth', name: '地球', en: 'EARTH', au: 1, diameter: '12,742 km', temp: '全球平均约 15°C', kind: '岩质行星', fact: '有液态水、适宜的大气与持续的太阳能输入。', water: '地表存在广泛液态水', image: '/picture/planets/earth.png' },
  { id: 'mars', name: '火星', en: 'MARS', au: 1.52, diameter: '6,779 km', temp: '全球平均约 −63°C', kind: '岩质行星', fact: '大气稀薄，今天的地表寒冷干燥。', water: '有水冰，古环境曾可能有液态水', image: '/picture/planets/mars.png' },
]

const outerPlanets = [
  { id: 'jupiter', name: '木星', en: 'JUPITER', au: 5.2, diameter: '约 139,820 km', kind: '气态巨行星', fact: '太阳系中最大的行星，具有显著云带和大红斑。', water: '没有地球式固体表面', image: '/picture/planets/jupiter.png' },
  { id: 'saturn', name: '土星', en: 'SATURN', au: 9.57, diameter: '约 116,460 km', kind: '气态巨行星', fact: '醒目的环由冰、岩石碎块和尘埃组成。', water: '没有地球式固体表面', image: '/picture/planets/saturn.png' },
  { id: 'uranus', name: '天王星', en: 'URANUS', au: 19.17, diameter: '约 50,724 km', kind: '冰巨行星', fact: '甲烷使其呈蓝绿色，自转轴倾斜显著。', water: '大气极寒，不存在地表液态水环境', image: '/picture/planets/uranus.png' },
  { id: 'neptune', name: '海王星', en: 'NEPTUNE', au: 30.18, diameter: '约 49,244 km', kind: '冰巨行星', fact: '距太阳最远的行星，具有高速强风。', water: '大气极寒，不存在地表液态水环境', image: '/picture/planets/neptune.png' },
]

const allPlanets = [...planets, ...outerPlanets]

const planetOrbitLayout = [
  { id: 'mercury', orbit: 31, x: 331, y: 215, size: 20, duration: '8s' },
  { id: 'venus', orbit: 51, x: 300, y: 171, size: 23, duration: '12s' },
  { id: 'earth', orbit: 72, x: 228, y: 215, size: 24, duration: '16s' },
  { id: 'mars', orbit: 92, x: 300, y: 314, size: 19, duration: '22s' },
  { id: 'jupiter', orbit: 112, x: 379, y: 143, size: 38, duration: '35s' },
  { id: 'saturn', orbit: 132, x: 208, y: 315, size: 48, duration: '50s' },
  { id: 'uranus', orbit: 152, x: 193, y: 114, size: 30, duration: '70s' },
  { id: 'neptune', orbit: 172, x: 422, y: 101, size: 30, duration: '90s' },
]

const cosmicLevels = [
  { name: '可观测宇宙', scale: '直径约 930 亿光年', detail: '我们目前能够观测到的宇宙范围。' },
  { name: '本星系群', scale: '直径约 1,000 万光年', detail: '由银河系、仙女座星系等数十个星系组成。' },
  { name: '银河系', scale: '直径约 10 万光年', detail: '太阳系位于银河系猎户臂附近，距银心约 2.6 万光年。' },
  { name: '太阳系', scale: '日球层延伸约百余 AU', detail: '太阳及受太阳引力支配的天体构成太阳系。' },
  { name: '地月系统', scale: '地月平均距离约 38.4 万 km', detail: '地球有一颗天然卫星——月球。' },
]

const steps = [
  { label: '宇宙地址', short: '01' },
  { label: '行星邻居', short: '02' },
  { label: '宜居条件', short: '03' },
]

const sceneNotes = [
  '从这里开始，连续放大同一条宇宙地址。',
  '银河系和仙女座星系正以约 110 km/s 相互接近。',
  '太阳在银河系中心之外，绕银心运行一周约需 2.3 亿年。',
  '地球是距离太阳第三近的行星，平均距离为 1 AU。',
  '月球平均距地球约 38.4 万 km，约为地球直径的 30 倍。',
]

const featureNotes = {
  '本星系群': '银河系所在的星系群，直径约 1,000 万光年。',
  '室女座星系团': '本星系群附近的大型星系团，包含数千个星系。',
  '长蛇座星系团': '距离银河系数亿光年的大型星系团。',
  '后发座星系团': '由大量星系组成，位于更大尺度的宇宙结构中。',
  '银河系': '太阳和地球所在的棒旋星系。',
  '仙女座星系': '距银河系约 254 万光年，是本星系群内的大型星系。',
  '三角座星系': '本星系群中的一个螺旋星系。',
  '银河系所在的本星系群': '继续放大，可以看到银河系位于更大的星系集合中。',
  '太阳系': '太阳系位于银河系猎户臂附近，距银心约 2.6 万光年。',
  '太阳': '太阳系中心恒星；八大行星按由近及远排列。',
  '水星': '0.39 AU · 岩质行星 · 距太阳最近，几乎没有大气。',
  '金星': '0.72 AU · 岩质行星 · 浓厚大气造成强烈温室效应。',
  '地球': '1.00 AU · 岩质行星 · 已知唯一存在生命的行星。',
  '火星': '1.52 AU · 岩质行星 · 寒冷、稀薄大气，存在水冰。',
  '木星': '5.20 AU · 气态巨行星 · 太阳系中最大的行星。',
  '土星': '9.57 AU · 气态巨行星 · 具有醒目的冰尘环系。',
  '天王星': '19.17 AU · 冰巨行星 · 蓝绿色来自大气中的甲烷。',
  '海王星': '30.18 AU · 冰巨行星 · 距太阳最远的行星。',
  '月球': '地球唯一的天然卫星，平均直径约 3,474 km。',
}

const starPoints = [
  [58, 82, 1.2], [112, 151, 1], [165, 74, 1.4], [210, 119, 1], [263, 62, 1.2], [322, 97, 1], [379, 61, 1.3], [438, 129, 1], [497, 78, 1.1], [545, 158, 1.4],
  [66, 235, 1], [123, 286, 1.3], [190, 211, 1], [447, 238, 1.2], [523, 302, 1], [74, 370, 1.4], [145, 406, 1], [242, 378, 1.1], [394, 402, 1.3], [510, 383, 1],
]

function CosmicScene({ activeLevel, zoom, focusFeature, onFocus }) {
  const activate = (label) => ({
    role: 'button', tabIndex: 0, 'aria-label': `观察${label}`,
    onClick: () => onFocus(label),
    onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onFocus(label) } },
  })

  return (
    <svg className="cosmos-scene-svg" viewBox="0 0 600 430" role="group" aria-label={`${cosmicLevels[activeLevel].name}动态结构示意图`}>
      <defs>
        <radialGradient id="cosmos-nebula"><stop stopColor="#69a6df" stopOpacity=".3" /><stop offset="1" stopColor="#122338" stopOpacity="0" /></radialGradient>
        <filter id="cosmos-glow"><feGaussianBlur stdDeviation="7" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="cosmos-arm"><stop stopColor="#7ccaff" stopOpacity=".03" /><stop offset=".48" stopColor="#a9d9ff" stopOpacity=".75" /><stop offset="1" stopColor="#7ccaff" stopOpacity=".03" /></linearGradient>
      </defs>
      <g className="cosmos-scene__stars">
        {starPoints.map(([x, y, r], index) => <circle key={index} cx={x} cy={y} r={r} fill="#c6d9ef" opacity={index % 3 === 0 ? '.8' : '.42'} />)}
      </g>
      <g transform={`translate(300 215) scale(${zoom}) translate(-300 -215)`} className="cosmos-scene__focus">
        {activeLevel === 0 ? (
          <g className="cosmos-scene__enter">
            <circle cx="300" cy="215" r="179" fill="url(#cosmos-nebula)" />
            <circle cx="300" cy="215" r="172" fill="none" stroke="#7ba6d2" strokeOpacity=".38" strokeDasharray="2 7" />
            <ellipse cx="300" cy="215" rx="143" ry="166" fill="none" stroke="#4c759f" strokeOpacity=".25" />
            {[{ x: 188, y: 129, n: '本星系群' }, { x: 377, y: 122, n: '室女座星系团' }, { x: 362, y: 300, n: '长蛇座星系团' }, { x: 193, y: 298, n: '后发座星系团' }].map((cluster) => (
              <g key={cluster.n} className={`cosmos-object ${focusFeature === cluster.n ? 'is-focused' : ''}`} {...activate(cluster.n)}>
                <line x1="300" y1="215" x2={cluster.x} y2={cluster.y} stroke="#6e9bc4" strokeOpacity=".22" strokeDasharray="3 6" />
                <ellipse cx={cluster.x} cy={cluster.y} rx="22" ry="13" fill="#4b6d94" fillOpacity=".42" stroke="#9cc9ee" strokeOpacity=".65" />
                <ellipse cx={cluster.x} cy={cluster.y} rx="8" ry="5" fill="#c6e7ff" fillOpacity=".75" />
                <text x={cluster.x} y={cluster.y + 31} textAnchor="middle">{cluster.n}</text>
              </g>
            ))}
            <g className="cosmos-object cosmos-object--bright" {...activate('银河系所在的本星系群')}>
              <circle cx="300" cy="215" r="7" fill="#bde5ff" filter="url(#cosmos-glow)" />
              <circle cx="300" cy="215" r="2.5" fill="#fff" />
              <text x="300" y="239" textAnchor="middle">银河系所在处</text>
            </g>
            <text x="300" y="61" textAnchor="middle" className="cosmos-scene__headline">可观测宇宙</text>
            <text x="300" y="80" textAnchor="middle" className="cosmos-scene__subline">边界由光的传播时间决定</text>
          </g>
        ) : null}

        {activeLevel === 1 ? (
          <g className="cosmos-scene__enter">
            <ellipse cx="300" cy="222" rx="230" ry="152" fill="url(#cosmos-nebula)" />
            <path d="M154 219 C224 128 365 126 447 208" fill="none" stroke="#7399bc" strokeOpacity=".34" strokeDasharray="4 7" />
            <text x="300" y="113" textAnchor="middle" className="cosmos-scene__subline">引力束缚的邻近星系集合</text>
            <g className={`cosmos-object ${focusFeature === '银河系' ? 'is-focused' : ''}`} {...activate('银河系')}>
              <ellipse cx="207" cy="232" rx="61" ry="22" transform="rotate(-24 207 232)" fill="#5686b2" fillOpacity=".25" stroke="#a6d8ff" strokeOpacity=".85" />
              <ellipse cx="207" cy="232" rx="32" ry="10" transform="rotate(-24 207 232)" fill="#9bc9eb" fillOpacity=".45" />
              <circle cx="207" cy="232" r="5" fill="#fff0c5" />
              <text x="207" y="281" textAnchor="middle">银河系</text>
            </g>
            <g className={`cosmos-object ${focusFeature === '仙女座星系' ? 'is-focused' : ''}`} {...activate('仙女座星系')}>
              <ellipse cx="430" cy="203" rx="69" ry="26" transform="rotate(18 430 203)" fill="#628db5" fillOpacity=".3" stroke="#b1dcff" strokeOpacity=".9" />
              <ellipse cx="430" cy="203" rx="34" ry="11" transform="rotate(18 430 203)" fill="#a3d0f2" fillOpacity=".5" />
              <circle cx="430" cy="203" r="5" fill="#fff2cf" />
              <text x="430" y="258" textAnchor="middle">仙女座星系</text>
            </g>
            <g className={`cosmos-object ${focusFeature === '三角座星系' ? 'is-focused' : ''}`} {...activate('三角座星系')}>
              <ellipse cx="327" cy="322" rx="28" ry="11" transform="rotate(-20 327 322)" fill="#83add0" fillOpacity=".38" stroke="#9bd1fa" strokeOpacity=".65" />
              <text x="327" y="350" textAnchor="middle">三角座星系</text>
            </g>
            <path d="M230 223 Q317 171 395 199" fill="none" stroke="#e9c989" strokeOpacity=".68" strokeDasharray="3 5" />
            <rect x="264" y="176" width="102" height="25" rx="12" fill="#12243a" stroke="#617b96" strokeOpacity=".65" />
            <text x="315" y="193" textAnchor="middle" className="cosmos-scene__tag">约 254 万光年</text>
            <text x="300" y="390" textAnchor="middle" className="cosmos-scene__subline">点击星系，查看它们在本星系群中的位置</text>
          </g>
        ) : null}

        {activeLevel === 2 ? (
          <g className="cosmos-scene__enter">
            <ellipse cx="300" cy="218" rx="218" ry="162" fill="url(#cosmos-nebula)" />
            <g transform="rotate(-18 300 215)">
              <ellipse cx="300" cy="215" rx="206" ry="83" fill="#162b43" stroke="#7798b6" strokeOpacity=".45" />
              <path d="M115 228 C184 119 342 99 433 185 C476 226 405 300 322 273 C250 250 235 207 278 177 C320 149 384 164 402 206" fill="none" stroke="url(#cosmos-arm)" strokeWidth="17" strokeLinecap="round" />
              <path d="M127 218 C192 300 345 327 432 244 C474 203 396 132 316 159 C250 181 233 224 278 254 C319 281 381 267 403 225" fill="none" stroke="url(#cosmos-arm)" strokeWidth="14" strokeLinecap="round" />
              <path d="M170 192 C222 139 318 132 374 174 M171 239 C222 291 321 293 380 252" fill="none" stroke="#c1ddf5" strokeOpacity=".32" strokeWidth="3" />
            </g>
            <circle cx="300" cy="215" r="16" fill="#f8dda0" fillOpacity=".22" filter="url(#cosmos-glow)" />
            <circle cx="300" cy="215" r="6" fill="#ffe6a7" />
            <text x="300" y="205" textAnchor="middle" className="cosmos-scene__tag">银心</text>
            <g className={`cosmos-object ${focusFeature === '太阳系' ? 'is-focused' : ''}`} {...activate('太阳系')}>
              <circle cx="412" cy="239" r="12" fill="#ffc76a" fillOpacity=".25" filter="url(#cosmos-glow)" />
              <circle cx="412" cy="239" r="4.5" fill="#fff0bf" />
              <line x1="412" y1="239" x2="467" y2="289" stroke="#f0cb82" strokeOpacity=".7" />
              <text x="468" y="307" textAnchor="middle">太阳系</text>
            </g>
            <text x="300" y="54" textAnchor="middle" className="cosmos-scene__headline">银河系 · 棒旋星系</text>
            <text x="300" y="76" textAnchor="middle" className="cosmos-scene__subline">太阳系位于猎户臂，远离银心</text>
            <text x="300" y="388" textAnchor="middle" className="cosmos-scene__subline">拖动下方缩放，观察太阳系与银心的相对位置</text>
          </g>
        ) : null}

        {activeLevel === 3 ? (
          <g className="cosmos-scene__enter">
            <circle cx="300" cy="222" r="225" fill="url(#cosmos-nebula)" />
            {planetOrbitLayout.map((body) => {
              const planet = allPlanets.find((item) => item.id === body.id)
              return <circle key={`orbit-${body.id}`} cx="300" cy="222" r={body.orbit} fill="none" stroke={focusFeature === planet.name ? '#a9ddff' : '#7296b8'} strokeOpacity={focusFeature === planet.name ? '.58' : '.25'} strokeDasharray={body.id === 'neptune' ? '2 5' : undefined} />
            })}
            <g className={`cosmos-object cosmos-scene__solar-object--sun ${focusFeature === '太阳' ? 'is-focused' : ''}`} {...activate('太阳')}>
              <circle cx="300" cy="222" r="28" fill="transparent" />
              <image href="/picture/planets/sun.png" x="276" y="198" width="48" height="48" />
              <text x="300" y="260" textAnchor="middle">太阳</text>
            </g>
            {planetOrbitLayout.map((body) => {
              const planet = allPlanets.find((item) => item.id === body.id)
              return (
                <g key={body.id} className={`cosmos-object cosmos-scene__solar-planet ${focusFeature === planet.name ? 'is-focused' : ''}`} style={{ '--orbit-duration': body.duration }} {...activate(planet.name)}>
                  <circle cx={body.x} cy={body.y} r={Math.max(18, body.size / 2 + 7)} fill="transparent" />
                  <image href={planet.image} x={body.x - body.size / 2} y={body.y - body.size / 2} width={body.size} height={body.size} preserveAspectRatio="xMidYMid meet" />
                  <text x={body.x} y={body.y - body.size / 2 - 5} textAnchor="middle">{planet.name}</text>
                  {focusFeature === planet.name ? <text x={body.x} y={body.y + body.size / 2 + 14} textAnchor="middle" className="cosmos-scene__tag">{planet.au.toFixed(2)} AU</text> : null}
                </g>
              )
            })}
            <text x="300" y="35" textAnchor="middle" className="cosmos-scene__headline">太阳系 · 八大行星</text>
            <text x="300" y="416" textAnchor="middle" className="cosmos-scene__subline">轨道间距非比例 · 行星运行已加速 · 点选天体查看</text>
          </g>
        ) : null}

        {activeLevel === 4 ? (
          <g className="cosmos-scene__enter">
            <circle cx="300" cy="214" r="188" fill="url(#cosmos-nebula)" />
            <circle cx="300" cy="214" r="158" fill="none" stroke="#76a6ce" strokeOpacity=".55" strokeDasharray="3 5" className="cosmos-scene__moon-orbit" />
            <g className={`cosmos-object ${focusFeature === '地球' ? 'is-focused' : ''}`} {...activate('地球')}>
              <circle cx="300" cy="214" r="75" fill="transparent" />
              <image href="/picture/planets/earth.png" x="235" y="149" width="130" height="130" />
            </g>
            <text x="300" y="300" textAnchor="middle">地球 · 直径 12,742 km</text>
            <g className={`cosmos-object cosmos-scene__moon ${focusFeature === '月球' ? 'is-focused' : ''}`} {...activate('月球')}>
              <circle cx="458" cy="214" r="28" fill="transparent" />
              <image href="/picture/planets/moon.png" x="438" y="194" width="40" height="40" />
              <text x="458" y="252" textAnchor="middle">月球</text>
            </g>
            <path d="M300 115 Q380 75 458 153" fill="none" stroke="#f2d48d" strokeOpacity=".75" strokeDasharray="4 5" />
            <rect x="353" y="90" width="125" height="25" rx="12" fill="#12243a" stroke="#617b96" strokeOpacity=".65" />
            <text x="415" y="107" textAnchor="middle" className="cosmos-scene__tag">平均距离 38.4 万 km</text>
            <text x="300" y="46" textAnchor="middle" className="cosmos-scene__headline">地月系统</text>
            <text x="300" y="392" textAnchor="middle" className="cosmos-scene__subline">天体大小按比例示意 · 轨道距离非比例</text>
          </g>
        ) : null}
      </g>
    </svg>
  )
}

function RequiredOne() {
  const [step, setStep] = useState(0)
  const [activeLevel, setActiveLevel] = useState(0)
  const [planetId, setPlanetId] = useState('earth')
  const [distance, setDistance] = useState(1)
  const [atmosphere, setAtmosphere] = useState(true)
  const [liquidWater, setLiquidWater] = useState(true)
  const [shielding, setShielding] = useState(true)
  const [showConclusion, setShowConclusion] = useState(false)
  const [sceneZoom, setSceneZoom] = useState(1)
  const [sceneFeature, setSceneFeature] = useState('')
  const [scaleTour, setScaleTour] = useState(false)
  const selectedPlanet = planets.find((planet) => planet.id === planetId)
  const energy = useMemo(() => 100 / (distance * distance), [distance])
  const approximateTemperature = Math.round(255 / Math.sqrt(distance) - 273.15 + (atmosphere ? 33 : 0))
  const conditions = [distance >= 0.75 && distance <= 1.35, atmosphere, liquidWater, shielding]
  const checkedCount = conditions.filter(Boolean).length

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('geosim:experiment-state', {
      detail: {
        experimentId: 'required-01',
        values: {
          planet: selectedPlanet?.name || planetId,
          distance,
          atmosphere,
          liquidWater,
          shielding,
        },
        metrics: { relativeEnergy: energy, approximateTemperature, habitableConditions: checkedCount },
        summary: `${selectedPlanet?.name || planetId} 当前满足 ${checkedCount}/4 项教学宜居条件`,
      },
    }))
  }, [selectedPlanet, planetId, distance, atmosphere, liquidWater, shielding, energy, approximateTemperature, checkedCount])

  useEffect(() => {
    if (!scaleTour) return undefined
    const timer = window.setInterval(() => {
      setActiveLevel((current) => (current + 1) % cosmicLevels.length)
      setSceneZoom(1)
      setSceneFeature('')
    }, 2400)
    return () => window.clearInterval(timer)
  }, [scaleTour])

  const changeCosmicLevel = (nextLevel) => {
    setActiveLevel(Math.max(0, Math.min(cosmicLevels.length - 1, nextLevel)))
    setSceneZoom(1)
    setSceneFeature('')
    setScaleTour(false)
  }

  const changeStep = (nextStep) => {
    setStep(Math.max(0, Math.min(2, nextStep)))
    setShowConclusion(false)
  }

  return (
    <main className="required-one">
      <header className="required-one__topbar">
        <Link className="required-one__back" to="/" aria-label="返回实验列表">← <span>必修一实验</span></Link>
        <div className="required-one__identity"><span className="required-one__eyebrow">地球科学 · 观察与推理</span><h1>地球的宇宙环境</h1></div>
        <div className="required-one__top-meta"><span className="required-one__live-dot" /> 交互实验 <span className="required-one__duration">约 8 分钟</span></div>
      </header>

      <nav className="required-one__progress" aria-label="实验步骤">
        {steps.map((item, index) => (
          <button key={item.short} className={`required-one__step ${step === index ? 'is-active' : ''} ${step > index ? 'is-complete' : ''}`} onClick={() => changeStep(index)} type="button">
            <span className="required-one__step-number">{step > index ? '✓' : item.short}</span><span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="required-one__content">
        <section className="required-one__workbench">
          <div className="required-one__workbench-head">
            <div><span className="required-one__kicker">观察任务 {steps[step].short}</span><h2>{step === 0 ? '逐层放大，找到地球的宇宙地址' : step === 1 ? '比较太阳系中的岩质行星' : '哪些条件让地球适合生命生存？'}</h2></div>
            <span className="required-one__schematic">{step === 1 ? '行星图像为示意图 · 非比例尺' : step === 0 ? '点选天体 · 缩放观察' : '交互模拟'}</span>
          </div>

          {step === 0 ? (
            <div className="cosmos-view">
              <div className={`cosmos-view__visual cosmos-view__visual--level-${activeLevel}`}>
                <div className="cosmos-scene__toolbar"><span><i />{cosmicLevels[activeLevel].name}</span><div><button type="button" aria-label="缩小视野" disabled={sceneZoom <= 0.85} onClick={() => { setScaleTour(false); setSceneZoom((value) => Math.max(.85, +(value - .15).toFixed(2))) }}>−</button><strong>{Math.round(sceneZoom * 100)}%</strong><button type="button" aria-label="放大视野" disabled={sceneZoom >= 1.75} onClick={() => { setScaleTour(false); setSceneZoom((value) => Math.min(1.75, +(value + .15).toFixed(2))) }}>+</button></div></div>
                <div key={activeLevel} className="cosmos-view__scene-shell"><CosmicScene activeLevel={activeLevel} zoom={sceneZoom} focusFeature={sceneFeature} onFocus={(feature) => { setScaleTour(false); setSceneFeature(feature) }} /></div>
                <div className="cosmos-scene__foot"><div className="cosmos-scene__selection"><span>当前观察</span><strong>{sceneFeature || cosmicLevels[activeLevel].name}</strong><small>{sceneFeature ? featureNotes[sceneFeature] || sceneNotes[activeLevel] : sceneNotes[activeLevel]}</small></div><div className="cosmos-scene__actions"><button type="button" aria-label="返回上一层级" disabled={activeLevel === 0} onClick={() => changeCosmicLevel(activeLevel - 1)}>‹</button><button type="button" className="cosmos-scene__tour" onClick={() => setScaleTour((playing) => !playing)}>{scaleTour ? 'Ⅱ 暂停' : '▶ 尺度旅行'}</button><button type="button" aria-label="进入下一层级" disabled={activeLevel === cosmicLevels.length - 1} onClick={() => changeCosmicLevel(activeLevel + 1)}>›</button></div></div>
              </div>
              <div className="cosmos-view__levels">
                <div className="cosmos-view__level-list" role="list" aria-label="宇宙层级">
                  {cosmicLevels.map((item, index) => <button key={item.name} type="button" className={`cosmos-view__level ${activeLevel === index ? 'is-active' : ''}`} onClick={() => changeCosmicLevel(index)}><span className="cosmos-view__level-index">0{index + 1}</span><span>{item.name}</span><span className="cosmos-view__chevron">↗</span></button>)}
                </div>
                <article className="cosmos-view__fact"><span className="required-one__kicker">当前层级 · {String(activeLevel + 1).padStart(2, '0')}</span><h3>{cosmicLevels[activeLevel].name}</h3><strong>{cosmicLevels[activeLevel].scale}</strong><p>{cosmicLevels[activeLevel].detail}</p></article>
                <div className="cosmos-view__prompt"><span>操作提示</span><p>点选画面中的星系或天体查看线索；用 + / − 缩放，或播放“尺度旅行”。</p></div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="planet-view">
              <div className="planet-view__sunline"><span>☼</span><div /><small>距太阳越来越远</small><span>→</span></div>
              <div className="planet-view__art" aria-label="水星、金星、地球和火星的生成式行星示意图"><img src="/picture/experiments/inner-planets-final.png" alt="水星、金星、地球、火星，从左至右排列" /></div>
              <div className="planet-view__selector" role="tablist" aria-label="选择行星观察">
                {planets.map((planet, index) => <button key={planet.id} type="button" role="tab" aria-selected={planetId === planet.id} className={`planet-view__planet ${planetId === planet.id ? 'is-selected' : ''}`} onClick={() => { setPlanetId(planet.id); setDistance(planet.au) }}><span className="planet-view__planet-order">0{index + 1}</span><strong>{planet.name}</strong><small>{planet.au.toFixed(2)} AU</small></button>)}
              </div>
              <div className="planet-view__detail"><div><span className="required-one__kicker">{selectedPlanet.en} · {selectedPlanet.kind}</span><h3>{selectedPlanet.name}</h3><p>{selectedPlanet.fact}</p></div><div className="planet-view__stat"><span>直径</span><strong>{selectedPlanet.diameter}</strong></div><div className="planet-view__stat"><span>表面温度</span><strong>{selectedPlanet.temp}</strong></div><div className="planet-view__stat"><span>水的状态</span><strong>{selectedPlanet.water}</strong></div></div>
              <div className="planet-view__insight"><span>观察线索</span><p>距离太阳近，不一定温度就适合生命；还要观察大气层、液态水和地表环境。</p></div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="habitability-view">
              <div className="habitability-view__model">
                <div className="habitability-view__orbit-scene"><div className="habitability-view__sun">☼</div><div className="habitability-view__orbit" style={{ width: `${56 + distance * 14}%`, height: `${56 + distance * 14}%` }}><div className="habitability-view__world"><span>地球模型</span></div></div><span className="habitability-view__orbit-label">{distance.toFixed(2)} AU</span><div className="habitability-view__flux"><span>接收太阳辐射</span><strong>{energy.toFixed(0)}%</strong><small>地球轨道处 = 100%</small></div></div>
                <div className="habitability-view__distance"><label htmlFor="orbit-distance">模拟轨道距离 <strong>{distance.toFixed(2)} AU</strong></label><input id="orbit-distance" type="range" min="0.39" max="1.8" step="0.01" value={distance} onChange={(event) => setDistance(Number(event.target.value))} /><div><span>近太阳</span><span>远太阳</span></div><small>课堂简化能量参考范围：0.75–1.35 AU；不等同于真实的宜居带边界。</small></div>
              </div>
              <div className="habitability-view__controls"><span className="required-one__kicker">逐项改变条件</span><h3>宜居不是单一因素决定</h3>
                <div className={`habitability-view__energy-check ${conditions[0] ? 'is-ok' : ''}`}><span>轨道能量条件</span><strong>{conditions[0] ? '落在课堂参考范围' : distance < 0.75 ? '太阳能量偏强' : '太阳能量偏弱'}</strong></div>
                <label className="condition-toggle"><span><strong>有适度温室效应的大气</strong><small>地球大气使平均地表温度提高约 33°C（概念估值）</small></span><input type="checkbox" checked={atmosphere} onChange={(event) => setAtmosphere(event.target.checked)} /><i /></label>
                <label className="condition-toggle"><span><strong>有可利用的液态水</strong><small>水参与生命活动与地表循环</small></span><input type="checkbox" checked={liquidWater} onChange={(event) => setLiquidWater(event.target.checked)} /><i /></label>
                <label className="condition-toggle"><span><strong>有一定的辐射防护</strong><small>大气层与磁场共同减弱部分有害影响</small></span><input type="checkbox" checked={shielding} onChange={(event) => setShielding(event.target.checked)} /><i /></label>
                <div className="habitability-view__temperature"><div><span>简化温度估算</span><strong>{approximateTemperature}°C</strong></div><small>按黑体平衡温度并叠加地球温室效应估算；未模拟反照率、云层和大气组成。</small></div>
              </div>
              <div className={`habitability-view__result ${showConclusion ? 'is-visible' : ''}`}><div className="habitability-view__score"><strong>{checkedCount}</strong><span>/ 4</span></div><div><strong>{showConclusion ? (checkedCount === 4 ? '当前模型条件较有利' : '还有关键条件未满足') : '完成观察后形成你的判断'}</strong><p>{showConclusion ? '能量参考范围、温室效应、液态水和辐射防护会共同影响宜居性；条件齐备也不能证明存在生命。' : '4 项观察指标：能量范围、大气、液态水与辐射防护。调整条件后提交结论。'}</p></div><button type="button" className="required-one__button" onClick={() => setShowConclusion(true)}>提交判断 <span>→</span></button></div>
            </div>
          ) : null}
        </section>

        <aside className="required-one__side">
          <section className="mission-card"><div className="mission-card__header"><span className="mission-card__icon">✳</span><span>本次探究</span></div><h2>{step === 0 ? '建立尺度感' : step === 1 ? '寻找地球特征' : '检验宜居条件'}</h2><p>{step === 0 ? '理解地球在宇宙中的层级位置，发现尺度之间的巨大差异。' : step === 1 ? '比较内侧四颗岩质行星，解释地球环境的独特性。' : '探索太阳能量、大气、水与防护条件如何共同影响宜居性。'}</p><div className="mission-card__checklist"><div className={step > 0 ? 'is-done' : ''}><span>✓</span> 定位地球所在层级</div><div className={step > 1 ? 'is-done' : ''}><span>✓</span> 比较内侧岩质行星</div><div className={showConclusion ? 'is-done' : ''}><span>✓</span> 提出有证据的判断</div></div></section>
          <section className="evidence-card"><span className="required-one__kicker">关键概念</span><h3>{step === 0 ? '宇宙层级' : step === 1 ? '太阳系中的地球' : '宜居带 ≠ 生命带'}</h3><p>{step === 0 ? '地球属于地月系统，地月系统属于太阳系，太阳系位于银河系之中。' : step === 1 ? '地球处于太阳系中距离太阳第三近的轨道。' : '宜居带通常描述液态水可能存在的轨道范围，实际宜居性还受大气、行星演化等多种因素影响。'}</p><div className="evidence-card__source">地理必修一 · 宇宙中的地球</div></section>
          <section className="thinking-card"><span>思考问题</span><p>{step === 0 ? '用“属于”把地球的宇宙地址完整说出来。' : step === 1 ? '为什么金星比水星更热？' : '如果轨道合适，但没有液态水，能直接判断它适合生命吗？'}</p></section>
        </aside>
      </div>

      <footer className="required-one__footer"><div className="required-one__footer-note"><span>实验路径</span><strong>定位宇宙 → 比较行星 → 解释宜居性</strong></div><div className="required-one__footer-actions"><button type="button" className="required-one__button required-one__button--ghost" disabled={step === 0} onClick={() => changeStep(step - 1)}>上一步</button><button type="button" className="required-one__button" onClick={() => step < 2 ? changeStep(step + 1) : setShowConclusion(true)}>{step < 2 ? '继续探索' : '完成实验'} <span>→</span></button></div></footer>
    </main>
  )
}

export default RequiredOne
