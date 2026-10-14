import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { groundTexture, addVegetation, textureMaterial } from '../elective/GeologicalTwin.js'
import { riverCenter, riverLevel, terrainHeightAt } from '../elective/RiverMorphology.js'
import { Link } from 'react-router-dom'

const riverTerrainAsset = new GLTFLoader().loadAsync('/picture/experiments/river-valley-terrain.glb')

const presets = [
  { id: 'mountain', title: '山地暴雨', slope: 78, discharge: 82, sediment: 58, vegetation: 28, base: 52, caption: '陡坡与暴雨抬高水流能量；植被稀疏使坡面来沙增加。重点看沟谷下切和出山口扇形堆积。' },
  { id: 'greening', title: '植被恢复', slope: 62, discharge: 48, sediment: 26, vegetation: 86, base: 52, caption: '植被恢复降低坡面产沙、削弱径流峰值；河道输沙减少后，不能简单推断洪水风险归零。' },
  { id: 'basefall', title: '下游基准面下降', slope: 58, discharge: 52, sediment: 45, vegetation: 56, base: 18, caption: '基准面下降使下游河段先获得更大的相对落差，侵蚀波向上游传播，旧河漫滩可能被切割成阶地。' },
  { id: 'fan', title: '出山口堆积', slope: 32, discharge: 46, sediment: 82, vegetation: 44, base: 68, caption: '河流出山后坡降和搬运能力下降；若来沙充足，沉积集中在出山口形成冲积扇。' },
]

const modeLabels = { basin: '流域鸟瞰', profile: '纵剖面', meander: '曲流细节' }

function deformTerrain(sourceGeometry, slope, vegetation, base, stage) {
  const geometry = sourceGeometry.clone()
  const positions = geometry.attributes.position
  const colors = []; const uvs = []
  const forest = new THREE.Color('#4c713b')
  const exposedSoil = new THREE.Color('#a08a61')
  const alluvium = new THREE.Color('#aa8e5a')
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const z = positions.getZ(index)
    uvs.push((x+12.5)/25,(-z+12.5)/25)
    positions.setY(index, terrainHeightAt(x, z, slope, base, vegetation, stage))
    const distance = Math.abs(x - riverCenter(z, stage))
    const ridge = Math.min(1, Math.max(0, (distance - 2.7) / 5.2))
    const groundCover = Math.min(0.82, (1 - vegetation / 100) * (0.28 + ridge * 0.78))
    const texture = 0.9 + (Math.sin(x * 1.72 + z * 1.23) * Math.sin(z * 0.68) + Math.sin(x * 3.4 - z * 2.1) * 0.35) * 0.075
    const color = new THREE.Color().lerpColors(forest, exposedSoil, groundCover).multiplyScalar(texture)
    if (distance < 0.82) color.lerp(alluvium, 0.8)
    else if (distance < 1.25) color.lerp(alluvium, (1.25 - distance) * 0.45)
    if (ridge > 0.72 && z > 3) color.lerp(new THREE.Color('#777566'), (ridge - 0.72) * 0.52)
    color.lerp(new THREE.Color(0xffffff), .64)
    colors.push(color.r, color.g, color.b)
  }
  positions.needsUpdate = true
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.computeVertexNormals()
  return geometry
}

function RiverScene({ slope, discharge, sediment, vegetation, base, stage, mode, cutaway }) {
  const hostRef = useRef(null)
  const modeRef = useRef(mode)

  useEffect(() => { modeRef.current = mode }, [mode])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#e9f0f3')
    scene.fog = new THREE.Fog('#e9f0f3', 30, 60)
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100)
    camera.position.set(18, 17, 22)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.92
    host.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight('#e5f5ff', '#59664b', 1.35))
    const sun = new THREE.DirectionalLight('#fff1d5', 2.35)
    sun.position.set(-10, 19, 8)
    scene.add(sun)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.065
    controls.minDistance = 12
    controls.maxDistance = 42
    controls.maxPolarAngle = Math.PI * 0.48
    controls.target.set(0, 0, 0)

    let running = true
    let land = null
    riverTerrainAsset.then((gltf) => {
      if (!running) return
      let source = null
      gltf.scene.traverse((item) => {
        if (!source && item.isMesh && item.name.includes('RiverTerrain')) source = item
      })
      if (!source) throw new Error('Blender 河谷地形网格未找到')
      const map=groundTexture()
      const terrainMaterial=new THREE.MeshStandardMaterial({map,bumpMap:map,bumpScale:.018,vertexColors:true,roughness:.96,side:THREE.DoubleSide})
      terrainMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
        diffuseColor *= texture2D(map,vMapUv);
      #endif`)}
      land = new THREE.Mesh(deformTerrain(source.geometry,slope,vegetation,base,stage),terrainMaterial)
      const treeRoot=new THREE.Group();treeRoot.scale.set(2,1,2);scene.add(treeRoot)
      const trees=addVegetation(treeRoot,(x,z)=>Math.abs(x*2-riverCenter(z*2,stage))<1.3?null:terrainHeightAt(x*2,z*2,slope,base,vegetation,stage)+.025,Math.round(35+vegetation))
      trees.update()
      land.name = 'BlenderRiverTerrain'
      land.receiveShadow = true
      scene.add(land)
    }).catch((error) => console.error('河谷地形加载失败', error))

    const waterMat = new THREE.MeshStandardMaterial({ color: '#426f70', roughness: 0.26, metalness: 0.04, transparent: true, opacity: 0.93, side: THREE.DoubleSide })
    const steps = 200
    const waterPositions = []
    const waterIndices = []
    const bank = Math.max(0.22, 0.24 + discharge / 100 * 0.48)
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps
      const z = 12.1 - t * 24.2
      const x = riverCenter(z, stage)
      const y = riverLevel(z, base)
      waterPositions.push(x - bank, y, z, x + bank, y, z)
      if (i < steps) {
        const a = i * 2
        waterIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
    const waterGeo = new THREE.BufferGeometry()
    waterGeo.setAttribute('position', new THREE.Float32BufferAttribute(waterPositions, 3))
    waterGeo.setIndex(waterIndices)
    waterGeo.computeVertexNormals()
    scene.add(new THREE.Mesh(waterGeo, waterMat))

    // Deposits follow the convex bank, with a tapered irregular outline.
    const barMat = textureMaterial(0, {color:'#ddcba5', side:THREE.DoubleSide})
    const barScale = Math.max(.12, Math.min(.65, sediment / Math.max(20, discharge) * .35))
    for (const centreZ of [-6.2, -1.9, 2.4, 6.6]) {
      const h=.02
      const curvature=riverCenter(centreZ+h,stage)-2*riverCenter(centreZ,stage)+riverCenter(centreZ-h,stage)
      const inner=Math.sign(curvature)||1
      const points=[],indices=[]
      for(let i=0;i<=32;i++) {
        const f=i/32,z=centreZ+(f-.5)*2.8,taper=Math.sin(Math.PI*f)
        const edge=bank*.78, width=barScale*taper*(.8+.16*Math.sin(f*23))
        for(const offset of [edge,edge+width]) {
          const x=riverCenter(z,stage)+inner*offset
          const y=Math.max(riverLevel(z,base)+.018,terrainHeightAt(x,z,slope,base,vegetation,stage)+.02)
          points.push(x,y,z)
        }
        if(i<32){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}
      }
      const geometry=new THREE.BufferGeometry()
      geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));geometry.setIndex(indices)
      geometry.setAttribute('uv',new THREE.Float32BufferAttribute(points.flatMap((_,i)=>i%3===0?[((i/3)%2),Math.floor(i/6)/32]:[]),2))
      geometry.computeVertexNormals();scene.add(new THREE.Mesh(geometry,barMat))
    }

    if (cutaway) {
      const strata = ['#c7a77d', '#ab8f6d', '#ddc696', '#8f836b']
      strata.forEach((color, index) => {
        const layer = new THREE.Mesh(new THREE.BoxGeometry(25, 0.12, 25), new THREE.MeshStandardMaterial({ color, roughness: 1, transparent: true, opacity: 0.82 }))
        layer.position.set(0, -1.25 - index * 0.19, 0)
        scene.add(layer)
      })
    }

    const bedMat = new THREE.MeshStandardMaterial({ color: '#68705b', roughness: 1 })
    const bed = new THREE.Mesh(new THREE.BoxGeometry(25, 0.5, 25), bedMat)
    bed.position.set(0, -2.05, 0)
    scene.add(bed)

    const grid = new THREE.GridHelper(24, 12, '#687a7f', '#c4d0d0')
    grid.position.y = -2.29
    scene.add(grid)

    const updateCamera = () => {
      const currentMode = modeRef.current
      if (currentMode === 'profile') {
        camera.position.set(27, 8, 0)
        controls.target.set(0, 0, 0)
      } else if (currentMode === 'meander') {
        camera.position.set(12, 10, 9)
        controls.target.set(0, 0, 0)
      }
      if (currentMode === 'basin') controls.target.set(0, 0, 0)
    }
    updateCamera()

    const resize = () => {
      const width = host.clientWidth
      const height = host.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()
    let frame = 0
    const draw = () => {
      if (!running) return
      frame = requestAnimationFrame(draw)
      controls.update()
      renderer.render(scene, camera)
    }
    draw()
    return () => {
      running = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      scene.traverse((item) => {
        item.geometry?.dispose?.()
        if (Array.isArray(item.material)) item.material.forEach((material) => material.dispose())
        else item.material?.dispose?.()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [slope, discharge, sediment, vegetation, base, stage, cutaway, mode])

  return <div className={`river3d__viewport river3d__viewport--${mode}`} ref={hostRef} aria-label="可旋转的河流地貌三维模型" />
}

export default function ElectiveFive() {
  const [slope, setSlope] = useState(62)
  const [discharge, setDischarge] = useState(58)
  const [sediment, setSediment] = useState(48)
  const [vegetation, setVegetation] = useState(52)
  const [base, setBase] = useState(52)
  const [scenario, setScenario] = useState('mountain')
  const [stage, setStage] = useState('中游搬运')
  const [mode, setMode] = useState('basin')
  const [cutaway, setCutaway] = useState(true)
  const [reasoning, setReasoning] = useState('')

  const selected = presets.find((item) => item.id === scenario) ?? presets[0]
  const transportCapacity = Math.round((slope * 0.46 + discharge * 0.54) * (0.72 + (100 - base) / 360))
  const sedimentBalance = sediment - transportCapacity
  const balanceLabel = sedimentBalance > 20 ? '来沙大于输沙能力：易淤积' : sedimentBalance < -20 ? '输沙能力大于来沙：易冲刷' : '来沙与输沙能力大致相当'
  const vegetationEffect = vegetation >= 70 ? '坡面拦截较强，产沙倾向减弱' : vegetation <= 30 ? '坡面保护弱，暴雨时易增加产沙' : '坡面保护作用中等'

  const reasoningSteps = useMemo(() => [
    { title: '① 判读控制条件', text: `坡降 ${slope}、流量 ${discharge}、来沙 ${sediment}；${vegetationEffect}。` },
    { title: '② 比较输沙关系', text: `先比来沙量与输沙能力：${balanceLabel}。` },
    { title: '③ 定位地貌响应', text: sedimentBalance > 20 ? '重点找流速骤减处的堆积体；出山口常见扇状堆积，河口可形成三角洲。' : sedimentBalance < -20 ? '重点找河床下切或河岸后退；若基准面下降，侵蚀可向上游溯源。' : '河床变化较小，但弯道仍可能出现凹岸侵蚀、凸岸堆积。' },
    { title: '④ 排除干扰项', text: '不要只凭“上游/下游”定侵蚀或沉积；还要看坡降、流量、泥沙供给和局部阻力。' },
  ], [slope, discharge, sediment, vegetationEffect, balanceLabel, sedimentBalance])

  const applyPreset = (item) => {
    setScenario(item.id)
    setSlope(item.slope)
    setDischarge(item.discharge)
    setSediment(item.sediment)
    setVegetation(item.vegetation)
    setBase(item.base)
    setReasoning('')
  }

  return (
    <main className="container exp-wrap exp-full river-lab">
      <div className="exp-top">
        <div>
          <h1>流水地貌与侵蚀沉积</h1>
          <p className="muted">选择性必修 1 · 地质地貌｜交互式定性模型，图中高程与过程均非实测比例</p>
        </div>
        <Link className="btn" to="/">返回首页</Link>
      </div>

      <div className="river-lab__layout">
        <section className="panel river-lab__controls">
          <div className="panel-block task-highlight">
            <h2>先建立判断链</h2>
            <p>河流地貌题不靠背“上游侵蚀、下游沉积”。先比较河流的输沙能力与来沙量，再定位能力或供沙突变处，最后用地形证据验证。</p>
          </div>
          <div className="panel-block">
            <h2>情境切换</h2>
            <div className="river-lab__presets">
              {presets.map((item) => <button type="button" key={item.id} className={`river-preset ${item.id === scenario ? 'is-active' : ''}`} onClick={() => applyPreset(item)}>{item.title}</button>)}
            </div>
            <p className="river-lab__caption">{selected.caption}</p>
          </div>
          <div className="panel-block">
            <h2>改变条件，观察因果响应</h2>
            <RangeControl label="河床坡降" value={slope} setValue={setSlope} left="缓" right="陡" />
            <RangeControl label="流量条件" value={discharge} setValue={setDischarge} left="小" right="大" />
            <RangeControl label="上游泥沙供给" value={sediment} setValue={setSediment} left="少" right="多" />
            <RangeControl label="坡面植被覆盖" value={vegetation} setValue={setVegetation} left="稀疏" right="茂密" />
            <RangeControl label="下游基准面" value={base} setValue={setBase} left="降低" right="抬高" />
            <div className="river-lab__balance">
              <span>输沙对比（概念估算）</span>
              <strong>{balanceLabel}</strong>
              <small>坡降、流量增大通常提高水流输沙能力；供沙超过能力时更易淤积。此处只表达方向关系，不代表水动力计算。</small>
            </div>
          </div>
          <div className="panel-block">
            <h2>选一段河道推演</h2>
            <div className="river-lab__stages">
              {['上游侵蚀', '中游搬运', '下游沉积'].map((item) => <button type="button" key={item} className={item === stage ? 'is-active' : ''} onClick={() => setStage(item)}>{item}</button>)}
            </div>
            <label className="river-lab__check"><input type="checkbox" checked={cutaway} onChange={(event) => setCutaway(event.target.checked)} />显示河床沉积层</label>
            <p className="river-lab__hint">拖动场景可旋转，滚轮可缩放。沉积层仅用于示意河床堆积的空间位置。</p>
          </div>
          <div className="panel-block">
            <h2>高阶题：河口附近出现阶地，怎么推理？</h2>
            <p>区域资料显示：河流纵剖面出现明显陡坎，阶地面高度向下游降低；同期下游侵蚀基准面下降。最合理的过程解释是？</p>
            <div className="river-lab__answers">
              {[
                ['A', '流量减小，河流全程沉积，河床抬高形成阶地'],
                ['B', '基准面下降引发河流溯源侵蚀，河床下切并废弃旧河漫滩'],
                ['C', '植被增加使侧蚀增强，弯道迁移形成阶地'],
              ].map(([id, label]) => <button key={id} type="button" className={reasoning === id ? (id === 'B' ? 'is-correct' : 'is-wrong') : ''} onClick={() => setReasoning(id)}><b>{id}</b>{label}</button>)}
            </div>
            {reasoning && <div className={`river-lab__feedback ${reasoning === 'B' ? 'is-correct' : 'is-wrong'}`}><strong>{reasoning === 'B' ? '推理成立' : '再检查因果方向'}</strong><p>基准面下降增加下游相对落差，陡坎向上游传播，河流下切；原河漫滩脱离洪水淹没范围后成为阶地。阶地级数还可能受多期构造抬升、气候与河流调整共同影响。</p></div>}
          </div>
        </section>

        <section className="panel river-lab__visual">
          <header className="river-lab__visual-head">
            <div><span className="river-lab__eyebrow">水沙作用 · 过程模型</span><h2>河谷三维观察台</h2><p>{stage} · {vegetationEffect}</p></div>
            <div className="river-lab__modes">{Object.entries(modeLabels).map(([id, label]) => <button key={id} type="button" className={mode === id ? 'is-active' : ''} onClick={() => setMode(id)}>{label}</button>)}</div>
          </header>
      <div className={`river-lab__scene-wrap ${mode === 'profile' ? 'is-profile' : ''}`}>
        {mode === 'profile' ? <LongProfile slope={slope} base={base} /> : (
          <>
            <RiverScene slope={slope} discharge={discharge} sediment={sediment} vegetation={vegetation} base={base} stage={stage} mode={mode} cutaway={cutaway} />
            <div className="river-lab__scene-label river-lab__scene-label--up">上游 · 落差较大</div>
            <div className="river-lab__scene-label river-lab__scene-label--down">下游 · 基准面</div>
            <div className="river-lab__north">N ↑</div>
            <div className="river-lab__drag">拖动旋转 · 滚轮缩放</div>
          </>
        )}
      </div>
          <div className="river-lab__legend"><span><i className="water" />河道水流</span><span><i className="bar" />凸岸/河床堆积</span><span><i className="land" />流域地表</span></div>
          <div className="river-lab__causal">
            <div><span>输沙能力</span><b>{slope > 65 && discharge > 60 ? '增强' : slope < 40 && discharge < 45 ? '减弱' : '随条件变化'}</b></div>
            <div><span>供沙关系</span><b>{sedimentBalance > 20 ? '偏供沙' : sedimentBalance < -20 ? '偏供能' : '近似平衡'}</b></div>
            <div><span>植被影响</span><b>{vegetation >= 70 ? '产沙趋弱' : vegetation <= 30 ? '产沙趋强' : '中等调节'}</b></div>
          </div>
          <div className="river-lab__reasoning">
            <h3>解题推演顺序</h3>
            <div>{reasoningSteps.map((item) => <article key={item.title}><b>{item.title}</b><p>{item.text}</p></article>)}</div>
          </div>
          <footer className="river-lab__note">科学边界：真实河流的输沙能力还受粒径、河宽、水深、糙率、河岸物质和洪水历时等控制。本实验用趋势关系训练读图推理，不能替代实测水文数据或定量水动力模拟。</footer>
        </section>
      </div>
    </main>
  )
}

function RangeControl({ label, value, setValue, left, right }) {
  return <label className="river-lab__range"><span>{label}<b>{value}</b></span><input type="range" min="0" max="100" step="1" value={value} onChange={(event) => setValue(Number(event.target.value))} /><small><em>{left}</em><em>{right}</em></small></label>
}

function LongProfile({ slope, base }) {
  const knickpointY = 118 + (100 - slope) * 0.24
  const currentEndY = 252 + (base - 50) * 0.32
  return (
    <div className="river-profile">
      <svg viewBox="0 0 760 410" role="img" aria-labelledby="profile-title profile-desc">
        <title id="profile-title">河流纵剖面调整示意</title>
        <desc id="profile-desc">展示基准面下降后河流纵剖面陡坎溯源、河床下切并留下阶地的概念关系。</desc>
        <defs>
          <linearGradient id="profile-water" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#75c4d6" stopOpacity=".34"/><stop offset="1" stopColor="#75c4d6" stopOpacity=".04"/></linearGradient>
          <marker id="profile-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#bd8051"/></marker>
        </defs>
        <path d="M70 330V48M70 330H708" fill="none" stroke="#819296" strokeWidth="1.5"/>
        <text x="29" y="55" className="axis-label">高程</text><text x="694" y="355" className="axis-label">距河口距离</text>
        <path d={`M78 72 C205 103 294 132 390 166 S555 212 700 ${currentEndY - 36}`} fill="none" stroke="#98a7a5" strokeWidth="3" strokeDasharray="8 7"/>
        <text x="478" y="88" className="line-label muted">调整前纵剖面（概念线）</text>
        <path d={`M78 72 C190 94 256 ${knickpointY - 22} 322 ${knickpointY} C338 ${knickpointY + 12} 340 ${knickpointY + 42} 367 ${knickpointY + 53} C454 ${knickpointY + 90} 552 ${currentEndY - 12} 700 ${currentEndY}`} fill="none" stroke="#287da0" strokeWidth="5" strokeLinecap="round"/>
        <path d={`M78 74 C210 108 286 ${knickpointY + 4} 345 ${knickpointY + 54} C445 ${knickpointY + 88} 575 ${currentEndY - 4} 700 ${currentEndY} L700 328H78Z`} fill="url(#profile-water)"/>
        <path d={`M282 ${knickpointY - 12} l20 -12`} stroke="#bd8051" strokeWidth="2" markerEnd="url(#profile-arrow)"/>
        <text x="155" y={knickpointY - 22} className="callout">陡坎向上游溯源</text>
        <circle cx="338" cy={knickpointY + 21} r="5" fill="#bd8051"/>
        <text x="352" y={knickpointY + 19} className="line-label">局部陡坎</text>
        <path d={`M430 ${knickpointY + 76} h62 v-14 h54`} fill="none" stroke="#c39d66" strokeWidth="7" strokeLinecap="square"/>
        <path d={`M516 ${knickpointY + 51} h34 v-14 h50`} fill="none" stroke="#c39d66" strokeWidth="7" strokeLinecap="square"/>
        <text x="562" y={knickpointY + 31} className="line-label">河流阶地</text>
        <path d={`M668 ${currentEndY} h32 v36`} fill="none" stroke="#317a8d" strokeWidth="2"/>
        <text x="595" y="313" className="callout">下游基准面降低</text>
        <text x="84" y="383" className="axis-note">剖面只表达过程方向；纵横比例与地形高程均非实测数据</text>
      </svg>
    </div>
  )
}
