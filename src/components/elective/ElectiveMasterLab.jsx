import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildGeologicalTwin, geologyObservation, surfaceAt } from './GeologicalTwin.js'
import { buildOceanBasin, buildCirculationLandscape, buildWeatherLandscape, buildWatershedProcess, buildVolcanicProcess, buildSeismicProcess, frontObservation, QUAKE_STATIONS, quakeStationDistance } from './LandscapeProcesses.js'
import './ElectiveMasterLab.css'

const LABS = {
  1: {
    title: '时空穿梭者', subtitle: '用一个观测点追踪昼夜、太阳视运动与季节变化', chapter: '第一章 · 地球的运动', scene: 'earth',
    modes: [['day', '昼夜与太阳视运动'], ['orbit', '公转与太阳直射点']],
    controls: [{ key: 'latitude', label: '观测纬度', min: -66, max: 66, unit: '°', initial: 40 }, { key: 'day', label: '太阳直射纬度', min: -23.5, max: 23.5, unit: '°', initial: 23.5 }, { key: 'hour', label: '地方时', min: 0, max: 24, unit: '时', initial: 12 }],
    questions: [
      { prompt: '北京（40°N）用 1.5 m 直杆测正午影长，记录为 3.0 m。若观测接近当地正午，太阳直射纬度最接近哪一项？', options: ['23.5°S', '0°', '23.5°N', '66.5°N'], answer: 0, explain: '先由 tan(h)=杆高/影长，得太阳高度约 26.6°；再用正午太阳高度 h=90°−|φ−δ|，解得直射纬度约 23.4°S。先算太阳高度、再结合地点纬度反推直射点，比凭影长猜季节更稳。' },
      { prompt: '同一观测点连续一周发现：正午影长逐日变长，白昼也逐日缩短。只考虑太阳直射点的季节移动，哪条推理成立？', options: ['直射点向南移，该地正午太阳高度与昼长均减小', '直射点向北移，正午太阳高度与昼长均减小', '地球公转速度减慢，所以昼长缩短', '太阳高度降低必然使日出方位转向正北'], answer: 0, explain: '影长变长意味着正午太阳高度降低；昼长缩短说明昼弧变短。两条独立观测都指向北半球当地获得的太阳照射减少，可据此判断直射点南移。公转速度不能直接解释昼弧变化。' },
    ],
    readouts: (v) => { const phi=THREE.MathUtils.degToRad(v.latitude),dec=THREE.MathUtils.degToRad(v.day),h=THREE.MathUtils.degToRad((v.hour-12)*15); const altitude=THREE.MathUtils.radToDeg(Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(h)));return [{label:'当时太阳高度',value:`${altitude.toFixed(1)}°`},{label:'1.5 m 杆的当时影长',value:altitude>1?`${(1.5/Math.tan(THREE.MathUtils.degToRad(altitude))).toFixed(2)} m`:altitude>0?'接近地平线，影长很大':'太阳在地平线下'},{label:'昼长估算',value:`${dayLength(v.latitude,v.day).toFixed(1)} 小时`}] },
    evidence: (v) => [`观测点 ${v.latitude.toFixed(0)}°`, `直射点 ${v.day.toFixed(1)}°`, `地方时 ${v.hour.toFixed(1)} 时`],
    prompt: '拖动直射纬度，比较同一地点的正午太阳高度与昼长；再改变地方时，观察日影方向如何转动。',
  },
  2: {
    title: '气压带与风带', subtitle: '从受热差异追到三圈环流、风带季移和东亚季风', chapter: '第三章 · 大气的运动', scene: 'circulation',
    modes: [['global', '全球三圈环流'], ['monsoon', '海陆热力与季风']],
    controls: [{ key: 'day', label: '太阳直射纬度', min: -23.5, max: 23.5, unit: '°', initial: 23.5 }, { key: 'rotation', label: '地球自转效应', min: 0, max: 100, unit: '%', initial: 75 }, { key: 'contrast', label: '海陆温差', min: 0, max: 100, unit: '%', initial: 65 }],
    questions: [
      { prompt: '实验把太阳直射点从 5°N 调到 20°N，模型中赤道低压带与副热带高压带都向北偏移。哪项解释与观测最一致？', options: ['热力环流带随太阳直射点季节移动，整体向北偏移', '地转偏向力变弱，把两条气压带推向北方', '海陆温差增大，使全球气压带同步北移', '地球公转速度改变，导致气压带位置北移'], answer: 0, explain: '先比较两条气压带的共同位移，再找共同驱动：太阳直射点北移使热量带随季节向北移动。自转影响风向偏转，海陆差异会改造区域气压场，二者都不能单独解释全球气压带同向移动。' },
      { prompt: '保持海陆温差不变，把模型的自转偏向效应降到接近 0。近地面风最合理的变化是？', options: ['仍由高压吹向低压，但风向偏转减弱', '气压梯度消失，风完全停止', '风向反转，低压吹向高压', '只改变气温，不改变风向'], answer: 0, explain: '控制变量后，气压梯度力仍驱动空气从高压流向低压；地转偏向力减弱只会使风向更接近直接跨越等压线，不会抹去气压差或反转压强梯度。' },
    ],
    readouts: (v) => [{ label: '环流带偏移', value: `${(v.day * 0.3).toFixed(1)}°` }, { label: '赤道辐合带', value: `${(v.day * 0.3).toFixed(1)}°` }, { label: '季风压差指数', value: `${Math.round(v.contrast * 0.72)} / 100` }],
    evidence: (v) => [`直射点 ${v.day.toFixed(1)}°`, `自转效应 ${Math.round(v.rotation)}%`, `海陆温差 ${Math.round(v.contrast)}%`],
    prompt: '切换全球环流与季风剖面，先看受热中心和气压差，再追踪近地面风向；不要把季风仅归因于气压带移动。',
  },
  3: {
    title: '锋面系统与气旋模拟', subtitle: '让锋线移动，读取气象站的风向、气温、气压和降水', chapter: '第三章 · 天气系统', scene: 'front',
    modes: [['cold', '冷锋过境'], ['warm', '暖锋过境'], ['cyclone', '温带气旋']],
    controls: [{ key: 'stage', label: '过程时刻', min: 0, max: 100, unit: '%', initial: 45 }, { key: 'contrast', label: '冷暖气团温差', min: 4, max: 24, unit: '℃', initial: 14 }, { key: 'moisture', label: '水汽供给', min: 10, max: 100, unit: '%', initial: 72 }],
    questions: [
      { prompt: '某站记录到气温骤降、气压回升、风向由偏南转偏北，并出现短时强降水。最符合哪种过程？', options: ['冷锋过境', '暖锋过境', '副热带高压控制', '海陆风日变化'], answer: 0, explain: '冷锋到达时锋前暖湿空气被抬升，锋线附近可能出现较强降水；过境后冷气团控制，气温下降、气压回升，风向常转为偏北。要把一组要素的先后变化组合判读。' },
      { prompt: '北半球温带气旋的锋面位置应优先到哪里寻找？', options: ['低压中心周围的低压槽', '高压脊线上', '任意闭合等压线内', '暖区中心'], answer: 0, explain: '锋面气旋的锋线通常与低压槽对应。先读气压场找低压和槽线，再判断冷暖气团分布、锋面类型及雨区，不能只靠“左冷右暖”的图面口诀。' },
    ],
    readouts: (v) => { const r = frontObservation(v); return [{ label: '中央站气温', value: `${r.temperature.toFixed(1)} ℃` }, { label: '中央站气压 / 风向', value: `${r.pressure.toFixed(1)} hPa · ${r.wind}` }, { label: '中央站降水强度', value: `${r.rain.toFixed(1)} mm/h` }] },
    evidence: (v) => [`过程 ${Math.round(v.stage)}%`, `气团温差 ${Math.round(v.contrast)}℃`, `水汽 ${Math.round(v.moisture)}%`],
    prompt: '将站点放在锋面路径上，拖动时间轴读取连续观测。先找气压转折和风向变化，再结合气温、降水判断锋面类型。',
  },
  4: {
    title: '构造运动与地貌演化', subtitle: '从受力变形到地层新老、侵蚀地貌和工程选址', chapter: '第二章 · 地表形态的塑造', scene: 'tectonic',
    modes: [['compress', '水平挤压 · 褶皱'], ['fault', '张力断裂 · 正断层'], ['erosion', '差异侵蚀 · 地貌倒置']],
    controls: [{ key: 'stress', label: '构造作用强度', min: 0, max: 100, unit: '%', initial: 68 }, { key: 'erosion', label: '侵蚀历时', min: 0, max: 100, unit: '%', initial: 34 }, { key: 'fault', label: '断层错距', min: 0, max: 100, unit: 'm', initial: 28 }],
    questions: [
      { prompt: '剖面显示背斜核部岩层较老，地表却形成谷地。最合理的形成链条是什么？', options: ['背斜先成山，核部岩层较易受侵蚀，长期差异侵蚀使其转为谷地', '向斜核部先抬升，后被流水填平', '断层两侧水平错动，形成背斜谷', '沉积物由新到老堆积成谷'], answer: 0, explain: '先据岩层新老判定背斜，再区分构造形态和现今地貌。背斜顶部受张力、裂隙较发育，若岩性和外力条件适合，侵蚀后可出现“背斜成谷”；地形高低不能替代构造判据。' },
      { prompt: '拟建穿山隧道，勘探显示一侧背斜核部岩层较完整、地下水少；邻近向斜核部含水层发育。哪项选线判断最有依据？', options: ['优先比较背斜核部，但仍需核查岩性和断层', '直接沿向斜核部，因岩层向下弯曲最稳定', '只选海拔最低处，不必考虑构造', '背斜一定没有地下水，可跳过勘探'], answer: 0, explain: '褶皱形态提供初筛依据：背斜核部常较利于排水，向斜核部可能汇集地下水；但断层、岩性和局部裂隙会改变工程条件，题目要求综合证据而非套用“背斜必安全”。' },
    ],
    readouts: (v) => { const r = geologyObservation(v); return [{ label: '核部地表出露', value: `地层 ${r.exposed}（1 最新 → 6 最老）` }, { label: '现今核部地形', value: r.valley ? '谷地 · 与构造形态分开判读' : '相对高地' }, { label: '断层垂直错距', value: v.mode === 'fault' ? `${v.fault} m（示意缩放）` : '当前未启动断裂' }] },
    evidence: (v) => [`构造作用 ${Math.round(v.stress)}%`, `侵蚀历时 ${Math.round(v.erosion)}%`, `错距 ${Math.round(v.fault)} m`],
    prompt: '逐步增加挤压、错距和侵蚀。先观察岩层弯曲与位移，再打开剖面按“地层新老—构造形态—外力改造”顺序判读。',
  },
  6: {
    title: '地震与火山灾害', subtitle: '用波到时定位震中，再把岩浆性质连到喷发方式与灾害范围', chapter: '第二章 · 地表形态的塑造（地质作用与灾害）', scene: 'hazard',
    modes: [['quake', '地震波与震中定位'], ['volcano', '岩浆性质与喷发']],
    controls: [{ key: 'energy', label: '地震震级', min: 3, max: 9, unit: '级', initial: 6.4 }, { key: 'viscosity', label: '岩浆黏度', min: 5, max: 100, unit: '%', initial: 74 }, { key: 'gas', label: '挥发分含量', min: 5, max: 100, unit: '%', initial: 62 }],
    questions: [
      { prompt: '三台台站测得 P 波与 S 波到时差约为 28.9 s、27.3 s、26.3 s，震源深度约 20 km。定位震中应如何操作？', options: ['用 S−P 时差求震源距，结合深度换算震中距，再作三圆交会', '把 P 波最早到达的台站直接当作震中', '用震级大小估算震中方向', '只用一台台站的振幅定位'], answer: 0, explain: 'P 波快于 S 波。先用震源距 d = Δt / (1/vS − 1/vP)，再以震源与台站的高差 h 求水平震中距 r = √(d² − h²)；以各台站为圆心、r 为半径作圆，交会区域定位震中。打开过程标记，等 S 波到达后查看各站的定位圆。振幅主要与震级、距离和介质有关，不能单独给出方位。' },
      { prompt: '若岩浆黏度高且挥发分多，喷发方式和主要危险通常如何变化？', options: ['气体不易逸出，压力积聚，爆炸性增强', '气体更易逸出，喷发变温和', '黏度只影响颜色，不影响喷发', '喷发必然转为海底火山'], answer: 0, explain: '高黏度阻碍气体逸出，挥发分在岩浆中积聚并增加压力，喷发更可能猛烈，火山碎屑流、火山灰等风险上升。它是趋势关系，真实喷发还受岩浆成分、供给速率和通道结构控制。' },
    ],
    readouts: (v) => v.mode === 'volcano'
      ? [{ label: '喷发趋势', value: v.gas + v.viscosity > 125 ? '爆炸性增强' : '熔岩溢流倾向' }, { label: '可能突出风险', value: v.gas + v.viscosity > 125 ? '火山灰与碎屑流' : '熔岩流与近场热害' }, { label: '气体逸出', value: v.viscosity > 60 ? '受高黏度阻滞' : '相对容易' }]
      : [{ label: '地壳 P / S 波速', value: '约 6.0 / 3.5 km·s⁻¹' }, { label: 'S 波已达台站', value: `${QUAKE_STATIONS.map(([x, z]) => quakeStationDistance(x, z)).filter((distance) => (v.stage / 100) * 3.5 >= distance).length} / 3 个` }, { label: '相对 M6 波幅', value: `${(10 ** (v.energy - 6)).toPrecision(2)} ×` }],
    evidence: (v) => [`震级 ${v.energy.toFixed(1)}`, `黏度 ${Math.round(v.viscosity)}%`, `挥发分 ${Math.round(v.gas)}%`],
    prompt: '先切换地震模式看 P、S 波到时差与台站几何，再切换火山模式改变黏度、挥发分，比较喷发柱、熔岩流与危险区。',
  },
  7: {
    title: '洋流与水循环过程', subtitle: '改变信风，观察太平洋温跃层、上升流、降水带与水循环', chapter: '第四章 · 水的运动', scene: 'ocean',
    modes: [['neutral', '中性年份'], ['elnino', '厄尔尼诺'], ['lanina', '拉尼娜'], ['water', '流域水循环']],
    controls: [{ key: 'wind', label: '赤道信风强度', min: 0, max: 100, unit: '%', initial: 68 }, { key: 'solar', label: '太阳能量输入', min: 0, max: 100, unit: '%', initial: 62 }, { key: 'land', label: '下垫面入渗能力', min: 0, max: 100, unit: '%', initial: 48 }],
    questions: [
      { prompt: '厄尔尼诺发展时，东太平洋海温升高，最可能同时出现哪组变化？', options: ['信风减弱、暖水东移、东部上升流减弱', '信风增强、暖水西聚、东部上升流增强', '温跃层坡度变陡，东部海面下降', '东太平洋降水必然减少'], answer: 0, explain: '厄尔尼诺阶段赤道信风减弱，西太平洋暖水向东扩展，东部温跃层加深、冷水上涌减弱；对流降水区也随暖水区向东移动。要从风应力一路追到温跃层、海温和降水，而不是将海温异常孤立记忆。' },
      { prompt: '改造前后某流域年降水量接近；改造后植被覆盖提高，洪峰变低且出现时间延后。模型中“入渗能力”增大时，最能解释这组观测的是？', options: ['更多降水暂存于土壤，地表汇流变慢；不能据此断言年径流必然减少', '植被令年降水量自动增加，所以洪峰降低', '入渗增强会让所有降水立刻转成河道径流', '洪峰变化只能由河道长度决定，与下垫面无关'], answer: 0, explain: '把相近的降水量作为控制条件，植被与土壤结构改变了水的分配和汇流时间，因而能支持“洪峰削弱、滞后”的判断。蒸散、地下水补给和前期土壤含水量还会影响年径流，不能只凭洪峰推断总水量。' },
    ],
    readouts: (v) => v.mode === 'water' ? [{ label: '蒸发 / 蒸腾', value: `${Math.round(20 + v.solar * 0.58)} / 100` }, { label: '入渗倾向', value: `${Math.round(v.land)} / 100` }, { label: '地表径流倾向', value: `${Math.round((100 - v.land) * 0.58 + 20)} / 100` }] : [{ label: '西 / 东赤道海温（示意）', value: `${(27+2*v.wind/100).toFixed(1)} / ${(28-5*v.wind/100).toFixed(1)} ℃` }, { label: '东部上升流', value: v.wind > 60 ? '较强' : v.wind < 38 ? '显著减弱' : '中等' }, { label: '暖水中心', value: v.wind < 38 ? '向东扩展' : '偏西太平洋' }],
    evidence: (v) => [`信风 ${Math.round(v.wind)}%`, `辐射 ${Math.round(v.solar)}%`, `入渗 ${Math.round(v.land)}%`],
    prompt: '先比较中性、厄尔尼诺、拉尼娜三种海气状态；再切到流域水循环，追踪能量输入、入渗和径流，不把相对指数当实测水量。',
  },
}

const DEFAULTS = { latitude: 40, day: 23.5, hour: 12, rotation: 75, contrast: 65, stage: 45, moisture: 72, stress: 68, erosion: 34, fault: 28, energy: 6.4, viscosity: 74, gas: 62, wind: 68, solar: 62, land: 48 }

function dayLength(latitude, declination) {
  const phi = THREE.MathUtils.degToRad(latitude)
  const dec = THREE.MathUtils.degToRad(declination)
  const cosine = -Math.tan(phi) * Math.tan(dec)
  if (cosine >= 1) return 0
  if (cosine <= -1) return 24
  return (2 * Math.acos(cosine) * 180) / Math.PI / 15
}

function material(color, options = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.02, ...options }) }
function tube(points, color, radius = 0.045, opacity = 1) {
  const path = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)))
  return new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(36, points.length * 4), radius, 8, false), material(color, { transparent: opacity < 1, opacity }))
}
function makeTexturedEarth(scene, radius = 2.55) {
  const globe = new THREE.Group(); scene.add(globe)
  const surface = new THREE.Mesh(new THREE.SphereGeometry(radius, 96, 64), material('#b8d5e3', { roughness: 0.9 }))
  globe.add(surface)
  new THREE.TextureLoader().load('/picture/experiments/required/world-map.jpg', (texture) => { texture.colorSpace = THREE.SRGBColorSpace; surface.material.map = texture; surface.material.color.set('#ffffff'); surface.material.needsUpdate = true })
  const grid = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.005, 48, 32), new THREE.MeshBasicMaterial({ color: '#a9d6ea', wireframe: true, transparent: true, opacity: 0.14 })); grid.userData.grid=true; globe.add(grid)
  const glow = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.035, 64, 48), new THREE.MeshBasicMaterial({ color: '#45b8e8', side: THREE.BackSide, transparent: true, opacity: 0.10 })); globe.add(glow)
  return globe
}
function meshGrid(width, depth, nx, nz, fn, color, opacity = 1) {
  const positions = []; const indices = []
  for (let iz = 0; iz <= nz; iz += 1) for (let ix = 0; ix <= nx; ix += 1) { const x = -width / 2 + width * ix / nx; const z = -depth / 2 + depth * iz / nz; const p = fn(x, z); positions.push(p[0], p[1], p[2]) }
  for (let iz = 0; iz < nz; iz += 1) for (let ix = 0; ix < nx; ix += 1) { const a = iz * (nx + 1) + ix; const b = a + 1; const c = a + nx + 1; const d = c + 1; indices.push(a, c, b, b, c, d) }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals()
  return new THREE.Mesh(geometry, material(color, { side: THREE.DoubleSide, transparent: opacity < 1, opacity, roughness: 0.52 }))
}

function buildEarth(scene) {
  const globe = makeTexturedEarth(scene)
  const axis = tube([[0, -3.5, 0], [0, 3.5, 0]], '#b7d7eb', 0.028, 0.8); globe.add(axis)
  const sunMap=new THREE.TextureLoader().load('/picture/planets/sun.png');sunMap.colorSpace=THREE.SRGBColorSpace
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({map:sunMap,transparent:true,depthWrite:false,toneMapped:false}));sun.scale.set(2.7,2.7,1);sun.position.set(9,0,0);scene.add(sun)
  const sunGlow = new THREE.DirectionalLight('#fff8ed', 3.0); sunGlow.position.copy(sun.position); scene.add(sunGlow)
  const rayGroup = new THREE.Group(); scene.add(rayGroup)
  for (let i = -4; i <= 4; i += 1) { const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 5.2, 8), new THREE.MeshBasicMaterial({ color: '#ffd27d', transparent: true, opacity: 0.34 })); beam.rotation.z = Math.PI / 2; beam.position.set(4.7, 0.25 + i * 0.45, -0.8); rayGroup.add(beam) }
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.012, 6, 160), material('#617f9c', { transparent: true, opacity: 0.52 })); orbit.rotation.x = Math.PI / 2; orbit.position.y = -0.15; scene.add(orbit)
  const poleMarker = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 12), material('#f8c768', { emissive: '#c07021', emissiveIntensity: 0.4 })); globe.add(poleMarker); poleMarker.position.set(0, 2.6, 0)
  const observer = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 12), material('#62e7d1', { emissive: '#16acb3', emissiveIntensity: 0.65 })); globe.add(observer)
  const horizon = new THREE.Mesh(new THREE.TorusGeometry(2.61, 0.018, 6, 96), material('#9ee9d8', { transparent: true, opacity: 0.8 })); horizon.position.z = 0.02; globe.add(horizon)
  const localModel = new THREE.Group(); globe.add(localModel)
  const shadowStick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 12), material('#f7f3e9')); shadowStick.position.y = 0.4; localModel.add(shadowStick)
  const shadow = tube([[0, 0.025, 0], [0.8, 0.025, 0]], '#061321', 0.035, 0.95); localModel.add(shadow)
  const hourArc = tube(Array.from({ length: 61 }, (_, i) => { const a = Math.PI * 2 * i / 60; return [2.83 * Math.cos(a), 0, 2.83 * Math.sin(a)] }), '#78a6bb', 0.013, 0.62); globe.add(hourArc)
  return { update(v, _t) {
    const lat = THREE.MathUtils.degToRad(v.latitude); const lon = THREE.MathUtils.degToRad(v.longitude ?? 116)
    const seasonalTilt = THREE.MathUtils.degToRad(v.day)
    const longitude = THREE.MathUtils.degToRad(v.longitude ?? 116)
    globe.rotation.y = longitude + (v.hour - 12) * Math.PI / 12
    globe.rotation.z = -seasonalTilt
    observer.position.set(2.57 * Math.cos(lat) * Math.cos(lon), 2.57 * Math.sin(lat), 2.57 * Math.cos(lat) * Math.sin(lon))
    poleMarker.position.set(0, 2.6, 0)
    const radial = observer.position.clone().normalize()
    localModel.position.copy(observer.position).multiplyScalar(1.006)
    globe.updateMatrixWorld(true)
    const sunDirection = new THREE.Vector3(1,0,0).applyQuaternion(globe.getWorldQuaternion(new THREE.Quaternion()).invert()).normalize()
    axis.visible = v.overlays; rayGroup.visible=v.overlays; horizon.visible=v.overlays; hourArc.visible=v.overlays; orbit.visible=v.mode==='orbit'&&v.overlays
    globe.children.forEach(o=>{if(o.userData.grid) o.visible=v.overlays})
    const sunAltitude = Math.asin(THREE.MathUtils.clamp(radial.dot(sunDirection), -1, 1))
    let shadowDirection = sunDirection.clone().projectOnPlane(radial).negate()
    if (shadowDirection.lengthSq() < 1e-6) shadowDirection.set(1, 0, 0)
    shadowDirection.normalize()
    const normal = shadowDirection.clone().cross(radial).normalize()
    const basis = new THREE.Matrix4().makeBasis(shadowDirection, radial, normal)
    localModel.quaternion.setFromRotationMatrix(basis)
    const length = sunAltitude > 0.025 ? Math.min(3.1, 0.8 / Math.tan(sunAltitude)) : 0
    shadow.scale.set(length, 1, 1); shadow.visible = sunAltitude > 0.025
    shadowStick.visible = sunAltitude > 0.025
  } }
}

function buildHazard(scene, onStatus) {
  const states={volcano:'loading',quake:'loading'}
  const status=(key,next)=>{states[key]=next;onStatus(Object.values(states).includes('error')?'error':Object.values(states).every(s=>s==='ready')?'ready':'loading')}
  const volcano=buildVolcanicProcess(scene,next=>status('volcano',next))
  const quake=buildSeismicProcess(scene,next=>status('quake',next))
  return { update(v, t) { volcano.update(v, t); quake.update(v, t) }, dispose() { volcano.dispose(); quake.dispose() } }
}

function buildOcean(scene, onStatus) {
  const loadStates={watershed:'loading',ocean:'loading'}
  const status=(key,next)=>{loadStates[key]=next;onStatus(Object.values(loadStates).includes('error')?'error':Object.values(loadStates).every(s=>s==='ready')?'ready':'loading')}
  const watershed = buildWatershedProcess(scene,next=>status('watershed',next))
  const oceanRoot = new THREE.Group(); scene.add(oceanRoot)
  const oceanScene = { add: (...objects) => oceanRoot.add(...objects) }
  scene = oceanScene
  const disposeBasin=buildOceanBasin(oceanRoot,next=>status('ocean',next))
  const water = new THREE.Mesh(new THREE.BoxGeometry(12.1, 3.8, 5.9), material('#17638d', { transparent: true, opacity: 0.18, side: THREE.DoubleSide })); water.position.set(0, -0.55, 0); scene.add(water)
  const surface = new THREE.Mesh(new THREE.PlaneGeometry(11.55, 5.9, 100, 50), new THREE.MeshPhysicalMaterial({ color: '#246a80', roughness: .22, metalness: .08, clearcoat: 1, transparent: true, opacity: .88 })); surface.rotation.x = -Math.PI / 2; surface.position.y = 1.44; scene.add(surface)
  const thermocline = meshGrid(10.7, 5.5, 64, 30, (x, z) => [x, -0.7 + x * 0.10, z], '#ffb657', 0.76); scene.add(thermocline)
  const warmGroup = new THREE.Group(); scene.add(warmGroup)
  for (let i = 0; i < 70; i += 1) { const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055 + (i % 3) * 0.018, 10, 8), material(i % 5 ? '#ff8557' : '#ffe57b', { emissive: '#bd4b19', emissiveIntensity: 0.25, transparent: true, opacity: 0.84 })); dot.userData.seed = i; warmGroup.add(dot) }
  const currentLines = new THREE.Group(); scene.add(currentLines)
  for (let i = 0; i < 6; i += 1) currentLines.add(tube([[-5.5, 1.62, -2.25 + i * 0.9], [-2.4, 1.66, -2.25 + i * 0.9], [1.3, 1.65, -2.25 + i * 0.9], [5.4, 1.62, -2.25 + i * 0.9]], '#a9dedc', 0.015, 0.4))
  const upwelling = new THREE.Group(); scene.add(upwelling)
  for (let i = 0; i < 8; i += 1) { const a = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(4.3 + (i % 2) * 0.45, -2.3, -2.3 + i * 0.65), 1.6, '#65d8ed', 0.22, 0.14); upwelling.add(a) }
  const clouds = new THREE.Group(); scene.add(clouds)
  for (let i = 0; i < 16; i += 1) { const cloud = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.TextureLoader().load('/picture/experiments/twin/cumulus-cloud.png'), transparent: true, opacity: .6, depthWrite: false })); cloud.scale.set(2.6, 1.4, 1); cloud.userData.seed = i; clouds.add(cloud) }
  const windArrows = new THREE.Group(); scene.add(windArrows)
  for (let i = 0; i < 6; i += 1) windArrows.add(new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(4.5, 2.3, -2.2 + i * 0.86), 2.7, '#d4ebff', 0.32, 0.2))
  return { dispose: () => {watershed.dispose();disposeBasin()}, update(v, t) {
    const isWater = v.mode === 'water'
    const wind = isWater ? 0.68 : v.wind / 100
    const slope = .36 * wind
    water.visible = !isWater&&v.section; surface.visible = !isWater; thermocline.visible = !isWater; warmGroup.visible = !isWater; currentLines.visible = !isWater; upwelling.visible = !isWater; windArrows.visible = !isWater
    const oceanPos = surface.geometry.attributes.position
    for (let i=0;i<oceanPos.count;i++) oceanPos.setZ(i, .035*Math.sin(oceanPos.getX(i)*4+t*1.5)+.025*Math.cos(oceanPos.getY(i)*6+t))
    oceanPos.needsUpdate=true; surface.geometry.computeVertexNormals()
    thermocline.visible = !isWater && (v.section || v.overlays); warmGroup.visible = !isWater && v.overlays; currentLines.visible = !isWater && v.overlays && wind>.1; upwelling.visible = !isWater && v.overlays; windArrows.visible = !isWater && v.overlays
    surface.material.opacity = v.section ? .25 : .88
    const pos = thermocline.geometry.attributes.position
    for (let i = 0; i < pos.count; i += 1) { const x = thermocline.geometry.userData.x?.[i] ?? pos.getX(i); const z = pos.getZ(i); pos.setY(i, -0.74 + x * slope + Math.sin(z * 0.7 + t * 0.2) * 0.035) }
    pos.needsUpdate = true; thermocline.geometry.computeVertexNormals()
    warmGroup.children.forEach((dot) => { const i = dot.userData.seed; const phase = (1 - (t * (0.08 + wind * 0.18) + i / 70) % 1); const westBias=2.4*wind; dot.position.set(-4.9 + phase * (9.8-westBias), 0.8 + Math.sin(i * 12) * 0.54, Math.sin(i * 4.8) * 2.1) })
    upwelling.children.forEach((a) => { a.visible = !isWater && wind > .3; a.setLength(0.8 + wind * 1.4) })
    clouds.children.forEach((c) => { const i = c.userData.seed; c.visible = !isWater; c.position.set(isWater ? -1.8 + (i % 8) * 0.46 : -4 + (1-wind)*7 + (i%8-3.5)*.30, (isWater ? 2.2 : 2.45) + Math.sin(t * 0.5 + i) * 0.09, isWater ? (i % 4 - 1.5) * 0.42 : (i % 4 - 1.5) * 0.9) })
    oceanRoot.visible = !isWater; watershed.root.visible = isWater; if (isWater) watershed.update(v, t)

  } }
}

function buildScene(scene, id, onStatus) {
  scene.background = new THREE.Color(id === 1 ? '#050e20' : '#c6d6df'); scene.fog = new THREE.Fog(id === 1 ? '#050e20' : '#c6d6df', 32, 80)
  scene.add(new THREE.HemisphereLight('#edf7ff','#8b8271',id===1?.08:1.6))
  const key = new THREE.DirectionalLight('#fff0d1',id===1?0:2.8); key.position.set(-5, 11, 9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -10; key.shadow.camera.right = 10; key.shadow.camera.top = 9; key.shadow.camera.bottom = -9; key.shadow.normalBias = .035; scene.add(key)
  const fill = new THREE.DirectionalLight('#6eaae0',id===1?0:1.1); fill.position.set(7, 4, -8); scene.add(fill)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), material('#c1c7c5', { roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -3.2; ground.name = 'lab-ground'; ground.visible=id!==1; ground.receiveShadow = true; scene.add(ground)
  if (id === 1) return buildEarth(scene)
  if (id === 2) return buildCirculationLandscape(scene,onStatus)
  if (id === 3) return buildWeatherLandscape(scene, onStatus)
  if (id === 4) return buildGeologicalTwin(scene, onStatus)
  if (id === 6) return buildHazard(scene, onStatus)
  return buildOcean(scene, onStatus)
}

function sceneGuide(id,v) {
  if(id===1)return '青色为观测点 · 太阳与地球的大小、距离为示意比例'
  if(id===2)return v.mode==='global'?(v.rotation<=5?'自转效应接近零：青色气流显示单圈环流近似':'青：哈德莱环流 · 橙：费雷尔环流 · 紫：极地环流 · 箭头指示方向'):'左海洋 · 右陆地 · '+(v.day>=0?'夏季近地面海→陆':'冬季近地面陆→海')
  if(id===3)return '台站 1→3 从左至右 · 点击台站读取过境天气'
  if(id===4)return '地层 1 最新 → 6 最老 · 点击地层取样'
  if(id===6)return v.mode==='volcano'?'剖面展示岩浆房和通道 · 灰云表示火山灰':'橙色 P 波 · 蓝色 S 波 · 定位圆在各站 S 波到达后显示'
  return v.mode==='water'?'降雨 → 坡面汇流 / 入渗 → 河道 · 剖面查看地下过程':'左西太平洋 · 右东太平洋 · 金色面为温跃层判读标记'
}

function SceneViewport({ labId, values, cameraView }) {
  const hostRef = useRef(null); const modelRef = useRef(null); const valuesRef = useRef(values); const cameraRef = useRef(null)
  const [status, setStatus] = useState('loading'); const [probe, setProbe] = useState(null); const [revision, setRevision] = useState(0)
  useEffect(() => { valuesRef.current = values }, [values])
  useEffect(() => {
    const host = hostRef.current; if (!host) return undefined
    let live = true; setProbe(null); setStatus('loading')
    const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(10.5, 8, 13.5)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9
    renderer.localClippingEnabled=true; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; host.appendChild(renderer.domElement)
    const pmrem = new THREE.PMREMGenerator(renderer); const room = new RoomEnvironment(); const environment = pmrem.fromScene(room, .04)
    scene.environment = labId===1?null:environment.texture; room.dispose(); pmrem.dispose()
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = .065
    controls.minDistance = 5; controls.maxDistance = 29; controls.maxPolarAngle = Math.PI * .49; controls.target.set(0, .1, 0)
    cameraRef.current = { camera, controls }
    const model = buildScene(scene, labId, (next) => { if (live) setStatus(next) }); modelRef.current = model
    if (labId === 1) setStatus('ready')
    const resize = () => { const width = host.clientWidth; const height = host.clientHeight; if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height) }
    const observer = new ResizeObserver(resize); observer.observe(host); resize()
    const raycaster = new THREE.Raycaster(); let down = null
    const pointerDown = (e) => { down = [e.clientX,e.clientY] }
    const pointerUp = (e) => {
      if (!down || Math.hypot(e.clientX-down[0],e.clientY-down[1]) > 5) return
      const r = renderer.domElement.getBoundingClientRect()
      raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera)
      const hit = raycaster.intersectObjects((model.pickTargets || []).filter(o => { for(let p=o;p;p=p.parent) if(!p.visible) return false; return true }), false)[0]
      if (hit && model.inspect) setProbe(model.inspect(hit.object,hit.point)); else setProbe(null)
    }
    renderer.domElement.addEventListener('pointerdown',pointerDown); renderer.domElement.addEventListener('pointerup',pointerUp)
    const clock = new THREE.Clock(); let frame = 0; let simulationTime = 0
    const draw = () => { if (!live) return; frame = requestAnimationFrame(draw); const delta = Math.min(clock.getDelta(),.1); if(valuesRef.current.playing) simulationTime += delta; model.update(valuesRef.current, simulationTime); controls.update(); renderer.render(scene,camera) }; draw()
    return () => {
      live = false; cancelAnimationFrame(frame); observer.disconnect(); model.dispose?.(); controls.dispose(); environment.dispose()
      renderer.domElement.removeEventListener('pointerdown',pointerDown); renderer.domElement.removeEventListener('pointerup',pointerUp)
      const geometries = new Set(), materials = new Set(), textures = new Set()
      scene.traverse(o=>{if(o.geometry) geometries.add(o.geometry); for(const m of [].concat(o.material||[])){ materials.add(m); for(const value of Object.values(m)) if(value?.isTexture) textures.add(value) }})
      geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose()); renderer.dispose(); renderer.domElement.remove(); modelRef.current = null; cameraRef.current = null
    }
  }, [labId, revision])
  useEffect(() => {
    const ref = cameraRef.current; if (!ref) return
    const compact=labId===2&&values.mode==='global'
    const earth=labId===1
    const position = cameraView === 'top' ? [0,compact?12:19,.01] : cameraView === 'section' ? [.01,compact?2:3.2,compact?11:17] : earth?[3.5,2.7,18]:compact?[6.5,4.5,9]:[10.5,8,13.5]
    ref.camera.position.set(...position); ref.controls.target.set(earth?3.5:0,.1,0); ref.controls.update()
  }, [cameraView, labId, revision, values.mode])
  return <div className="master-lab__viewport-wrap">
    <div className="master-lab__viewport" ref={hostRef} aria-label="可旋转、缩放和点击取样的三维地理场景" />
    <div className="master-lab__guide">{sceneGuide(labId,values)}</div>
    {status === 'loading' && <div className="master-lab__loading">正在载入三维地形与材质…</div>}
    {status === 'error' && <div className="master-lab__loading">模型未能载入 <button onClick={()=>setRevision(r=>r+1)}>重新载入</button></div>}
    {probe && <div className="master-lab__probe"><button aria-label="关闭采样读数" onClick={()=>setProbe(null)}>×</button><strong>{probe.title}</strong><p>{probe.detail}</p></div>}
  </div>
}

function GeologicalSection({ values }) {
  const paths = Array.from({length:7},(_,level)=>Array.from({length:161},(_,i)=>{
    const x=-6+i/160*12, y=Math.min(1.5-level*.6+1.45*values.stress/100*Math.cos(x*.72)*Math.exp(-x*x/48)+(values.mode==='fault'&&x>.35?-values.fault/100*1.5:0),surfaceAt(x,0,values))
    return `${i?'L':'M'} ${(x+6)*48+22} ${160-y*32}`
  }).join(' '))
  return <div className="master-lab__section-data"><div><strong>同一模型的中轴剖面</strong><span>地层 1 最新 → 地层 6 最老 · 曲线随场景更新</span></div><svg viewBox="0 0 620 255" role="img" aria-label="同步地层剖面"><line x1="22" x2="598" y1="224" y2="224" stroke="#597184"/>{paths.map((d,i)=><path key={i} d={d} fill="none" stroke={['#dec397','#b99570','#e0d4b2','#999c9b','#c7ad83','#89959b','#687a80'][i]} strokeWidth="3"/>)}<text x="305" y="246" textAnchor="middle" fill="#9cb4c5" fontSize="12">左翼 ← 核部 → 右翼</text></svg></div>
}

function WeatherRecords({ values }) {
  const series=[['temperature','气温 / ℃','#e4ae79',6,30],['pressure','气压 / hPa','#86b6cd',1004,1020],['rain','降水 / mm·h⁻¹','#88c9b4',0,20]]
  return <div className="master-lab__weather-data"><div><strong>固定中央站的全程推演</strong><span>竖线为当前时刻 · 三条记录来自同一锋面</span></div><section>{series.map(([key,label,color,min,max])=>{
    const path=Array.from({length:101},(_,stage)=>{const y=frontObservation({...values,stage})[key];return `${stage?'L':'M'} ${20+stage*2.6} ${124-(y-min)/(max-min)*95}`}).join(' ')
    return <svg key={key} viewBox="0 0 300 162" role="img" aria-label={`${label}全程变化`}><text x="20" y="16" fill="#bbd1dd" fontSize="11">{label}</text><line x1="20" x2="280" y1="124" y2="124" stroke="#506b7b"/><path d={path} fill="none" stroke={color} strokeWidth="2"/><line x1={20+values.stage*2.6} x2={20+values.stage*2.6} y1="26" y2="124" stroke="#d1e4eb" strokeDasharray="3 3"/><text x="20" y="145" fill="#88a4b5" fontSize="10">过境前</text><text x="255" y="145" fill="#88a4b5" fontSize="10">过境后</text></svg>
  })}</section></div>
}

function SeismicRecords({ values }) {
  return <div className="master-lab__section-data"><div><strong>三台观测站 · 同一震源与传播时刻</strong><span>当前 {values.stage.toFixed(1)} s · 震源深度 20 km</span></div><div className="master-lab__station-table"><table><thead><tr><th>台站</th><th>距震源 / km</th><th>P 波 / s</th><th>S 波 / s</th><th>S−P / s</th><th>此刻记录</th></tr></thead><tbody>{QUAKE_STATIONS.map(([x,z],i)=>{const distance=quakeStationDistance(x,z)*100,p=distance/6,s=distance/3.5;return <tr key={i}><td>{i+1}</td><td>{distance.toFixed(1)}</td><td>{p.toFixed(1)}</td><td>{s.toFixed(1)}</td><td>{(s-p).toFixed(1)}</td><td>{values.stage>=s?'P、S 均已到达':values.stage>=p?'仅记录 P 波':'波尚未到达'}</td></tr>})}</tbody></table></div></div>
}

function useEnvironmentAudio(enabled, playing, id, mode, moisture) {
  const audioRef=useRef(null)
  useEffect(()=>{
    if(!enabled||id===1) return undefined
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return undefined
    const context=new Audio(),buffer=context.createBuffer(1,context.sampleRate*3,context.sampleRate)
    const data=buffer.getChannelData(0);let low=0
    for(let i=0;i<data.length;i++){const white=Math.random()*2-1;low=(low+.02*white)/1.02;data[i]=id===6?low*4:white}
    const source=context.createBufferSource();source.buffer=buffer;source.loop=true
    const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=id===6?mode==='volcano'?250:120:id===3?4200:id===7?1100:800
    const gain=context.createGain();gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start();context.resume().catch(()=>{})
    audioRef.current={context,gain}
    return ()=>{audioRef.current=null;source.stop();context.close().catch(()=>{})}
  },[enabled,id,mode])
  useEffect(()=>{const audio=audioRef.current;if(audio)audio.gain.gain.setTargetAtTime(playing?(id===3?.006+moisture/100*.025:.014):0,audio.context.currentTime,.2)},[enabled,playing,id,mode,moisture])
}

export default function ElectiveMasterLab({ id }) {
  const lab = LABS[id] || LABS[1]
  const [mode, setMode] = useState(lab.modes[0][0]); const [values, setValues] = useState({ ...DEFAULTS }); const [phase, setPhase] = useState(id === 4 ? 100 : 45); const [playing, setPlaying] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0); const [answer, setAnswer] = useState(null); const [sound, setSound] = useState(false); const [lesson, setLesson] = useState(false)
  const [cameraView,setCameraView] = useState('perspective'); const [section,setSection] = useState([4,6].includes(id)); const [overlays,setOverlays] = useState([2,3,7].includes(id))
  const playRef = useRef(playing); const modeRef = useRef(mode)
  useEffect(() => { setMode(lab.modes[0][0]); setQuestionIndex(0); setAnswer(null); setPhase(id === 4 ? 100 : 45); setPlaying(false); setSection([4,6].includes(id)); setOverlays([2,3,7].includes(id)); setCameraView('perspective'); setValues({ ...DEFAULTS, ...Object.fromEntries(lab.controls.map(c=>[c.key,c.initial])) }) }, [id, lab])
  useEffect(() => { playRef.current = playing }, [playing]); useEffect(() => { modeRef.current = mode }, [mode])
  useEffect(() => { const timer = window.setInterval(() => { if (playRef.current) setPhase(p=>Math.min(100,p+.4)) }, 70); return () => window.clearInterval(timer) }, [])
  useEffect(() => { if (phase >= 100) setPlaying(false) }, [phase])
  const activeQuestion = lab.questions[questionIndex]
  const sceneValues = useMemo(() => ({ ...values, mode, stage: phase, orbit: mode === 'orbit' ? phase : 0, playing, section, overlays,
    ...(id===1 ? { hour:mode==='day'?phase/100*24:values.hour, day:mode==='orbit'?23.5*Math.sin(phase/100*Math.PI*2):values.day } : {}),
    ...(id===4 ? { stress:values.stress*Math.min(1,phase/45), erosion:values.erosion*Math.max(0,(phase-45)/55), fault:values.fault*phase/100 } : {}) }), [values,mode,phase,id,playing,section,overlays])
  const readouts = useMemo(() => lab.readouts(sceneValues), [lab,sceneValues])
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('geosim:experiment-state', { detail: { experimentId: `elective-${String(id).padStart(2, '0')}`, values: sceneValues, readouts, summary: lab.prompt } }))
  }, [id, sceneValues, readouts, lab.prompt])
  const updateValue = (key, value) => { setValues((old) => ({ ...old, [key]: value })); if(id===4) setPhase(100); if(id===1&&key==='hour'&&mode==='day'){setPhase(value/24*100);setPlaying(false)} if(id===1&&key==='day'&&mode==='orbit'){setPhase(((Math.asin(Math.max(-1,Math.min(1,value/23.5)))/(2*Math.PI)+1)%1)*100);setPlaying(false)} if (key==='stage') { setPhase(value); setPlaying(false) }  }
  const switchMode = (next) => { setMode(next); setAnswer(null); setPhase(id===4?100:45); setPlaying(false); if(id===7) setValues(old=>({...old,wind:next==='elnino'?28:next==='lanina'?88:68})) }
  useEnvironmentAudio(sound,playing,id,mode,values.moisture)
  const chooseAnswer = (index) => setAnswer(index)
  const loadQuestionScenario = () => {
    const second=questionIndex===1
    const cases={
      1: {mode:second?'orbit':'day',phase:second?38:50,values:{latitude:40,day:-23.5,hour:12}},
      2: {mode:'global',phase:45,values:{day:20,rotation:second?0:75,contrast:65}},
      3: {mode:second?'cyclone':'cold',phase:second?50:75,values:{contrast:14,moisture:72}},
      4: {mode:second?'compress':'erosion',phase:100,values:{stress:68,erosion:second?10:88,fault:0}},
      6: {mode:second?'volcano':'quake',phase:second?75:0,values:{energy:6.4,viscosity:88,gas:88}},
      7: {mode:second?'water':'elnino',phase:50,values:{wind:28,solar:62,land:86}},
    }
    const c=cases[id];setMode(c.mode);setPhase(c.phase);setValues(old=>({...old,...c.values}));setPlaying(false);setAnswer(null);setSection([4,6].includes(id));setOverlays(true)
  }


  return (
    <main className="master-lab">
      <header className="master-lab__header">
        <div className="master-lab__heading"><span>{lab.chapter} / 实验母版</span><h1>实验 {id} · {lab.title}</h1><p>{lab.subtitle}</p></div>
        <Link className="master-lab__back" to="/">回到实验目录</Link>
      </header>

      <section className="master-lab__workspace">
        <div className="master-lab__model-card">
          <div className="master-lab__scene-head"><div><span className="master-lab__live-dot" />{playing ? '过程正在演化' : '过程已暂停 · 可调整条件'}</div><span>拖动旋转 · 滚轮缩放 · 参数改变会同步进入模型</span></div>
          <div className="master-lab__view-tools" role="group" aria-label="观察视角">
            {[['perspective','空间全景'],['top','俯视地表'],['section','正面判读']].map(([key,label])=><button key={key} className={cameraView===key?'active':''} onClick={()=>setCameraView(key)}>{label}</button>)}
            {[4,6,7].includes(id)&&<button className={section?'active':''} onClick={()=>setSection(v=>!v)}>{section?'剖面已打开':'打开剖面'}</button>}
            <button className={overlays?'active':''} onClick={()=>setOverlays(v=>!v)}>{overlays?'过程标记开':'过程标记关'}</button>
          </div>
          <SceneViewport labId={id} values={sceneValues} cameraView={cameraView} />
          <div className="master-lab__timeline">
            <button type="button" className="master-lab__play" onClick={() => { if(!playing&&phase>=100) setPhase(0); setPlaying(state=>!state) }} aria-label={playing ? '暂停过程' : '播放过程'}>{playing ? 'Ⅱ 暂停' : '▶ 播放'}</button>
            <input aria-label="过程时间轴" type="range" min="0" max="100" value={phase} onChange={(e) => { setPhase(Number(e.target.value)); setPlaying(false) }} />
            <span>{id===6&&mode==='quake'?`${phase.toFixed(1)} s`:`${Math.round(phase)}%`}</span>
            <button type="button" className={sound ? 'is-on' : ''} disabled={id===1} onClick={() => setSound(on=>!on)}>♪ {sound ? '环境声开' : '环境声关'}</button>
            <button type="button" onClick={() => { setPhase(0); setPlaying(false) }}>重置</button>
          </div>
        </div>

        <aside className="master-lab__controls">
          <div className="master-lab__panel-title"><span>实验变量</span><strong>改变条件，观察结果</strong></div>
          <div className="master-lab__modes" role="group" aria-label="实验情境">
            {lab.modes.map(([value, label]) => <button type="button" key={value} className={mode === value ? 'active' : ''} onClick={() => switchMode(value)}>{label}</button>)}
          </div>
          <div className="master-lab__sliders">
            {lab.controls.filter(c=>c.key!=='stage'&&(id!==4||c.key!=='fault'||mode==='fault')&&(id!==6||(mode==='quake'?c.key==='energy':c.key!=='energy'))&&(id!==7||(mode==='water'?c.key!=='wind':c.key==='wind'))).map((control) => <label className="master-lab__slider" key={control.key}><span>{control.label}<b>{Number(id===1?sceneValues[control.key]:values[control.key]).toFixed(control.key === 'energy' || control.key === 'day' || control.key === 'hour' ? 1 : 0)}{control.unit}</b></span><input type="range" min={control.min} max={control.max} step={control.key === 'energy' ? .1 : control.key === 'day' || control.key === 'hour' ? 'any' : 1} value={id===1?sceneValues[control.key]:values[control.key]} onChange={(e) => updateValue(control.key, Number(e.target.value))} /><small><i>{control.min}{control.unit}</i><i>{control.max}{control.unit}</i></small></label>)}
          </div>
          <div className="master-lab__readouts"><div className="master-lab__panel-title"><span>此刻读数</span><strong>模型随变量更新</strong></div>{readouts.map((item) => <div key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}</div>
          <div className="master-lab__evidence"><span>当前实验条件</span><div>{lab.evidence(sceneValues).map((item) => <i key={item}>{item}</i>)}</div></div>
        </aside>
      </section>

      {id===4&&<GeologicalSection values={sceneValues} />}
      {id===3&&<WeatherRecords values={sceneValues} />}
      {id===6&&mode==='quake'&&<SeismicRecords values={sceneValues} />}
      <section className="master-lab__learning">
        <article className="master-lab__investigation">
          <div className="master-lab__section-kicker">探究流程</div><h2>先做实验，再解释变化</h2><p>{lab.prompt}</p>
          <div className="master-lab__method"><div><b>01</b><strong>控制变量</strong><span>一次只改变一个条件</span></div><div><b>02</b><strong>读取证据</strong><span>{lab.evidence(sceneValues).join(' · ')}</span></div><div><b>03</b><strong>建立因果</strong><span>用观测结果解释过程，不背结论标签</span></div></div>
          <button type="button" className="master-lab__lesson-toggle" onClick={() => setLesson((open) => !open)}>{lesson ? '收起本节判读顺序' : '展开本节判读顺序'} {lesson ? '−' : '+'}</button>
          {lesson && <div className="master-lab__lesson-note"><strong>迁移时按证据链作答</strong><p>{id === 1 ? '先定日期与直射点 → 再判当地昼夜弧、正午太阳方位 → 最后判断影长和日出日落。' : id === 2 ? '先看冷热源与气压梯度 → 再判断水平风向并考虑地转偏向 → 最后联系垂直环流和降水带。' : id === 3 ? '先定位低压槽或锋线 → 追踪站点风向、气温、气压先后变化 → 再判雨区和天气系统。' : id === 4 ? '先辨岩层弯曲与断裂 → 用地层新老定褶皱 → 最后叠加侵蚀、岩性与工程条件解释地貌。' : id === 6 ? '用波速与到时差求震中距并做多站交会；火山题则从黏度、气体、喷发物推危险范围。' : '从驱动因素追踪环流或水循环路径 → 看海温、温跃层、降水或径流响应 → 留意区域条件。'}</p></div>}
        </article>

        <article className="master-lab__question">
          <div className="master-lab__section-kicker">选择题 / 推理题母题</div><div className="master-lab__question-head"><h2>用模型里的证据解题</h2><span>{questionIndex + 1} / {lab.questions.length}</span></div>
          <p className="master-lab__question-prompt">{activeQuestion.prompt}</p>
          <div className="master-lab__options">{activeQuestion.options.map((option, index) => <button key={option} type="button" onClick={() => chooseAnswer(index)} className={answer === index ? (index === activeQuestion.answer ? 'correct' : 'incorrect') : ''}><i>{String.fromCharCode(65 + index)}</i>{option}</button>)}</div>
          {answer !== null && <div className={`master-lab__explanation ${answer === activeQuestion.answer ? 'correct' : 'incorrect'}`}><strong>{answer === activeQuestion.answer ? '判断正确 · 把因果链说完整' : '再回到模型找证据'}</strong><p>{activeQuestion.explain}</p></div>}
          <div className="master-lab__question-actions"><button type="button" onClick={() => { setQuestionIndex((questionIndex + 1) % lab.questions.length); setAnswer(null) }}>换一道变式题 ↗</button><button type="button" onClick={loadQuestionScenario}>按题干重设变量</button></div>
        </article>
      </section>
      <p className="master-lab__boundary">科学边界：{id === 6 ? '地震场景水平 1 单位约为 100 km，震源深度取 20 km；时间轴 100% 对应 100 s，P/S 取 6.0/3.5 km·s⁻¹。地面振动放大显示。地形、岩性和波速仍是教学近似。' : '此处使用可控的教学模型来显示因果方向和空间关系。演示指数与速度不代表现场实测或天气预报；真实自然过程还会受更多区域条件影响。'}</p>
    </main>
  )
}
