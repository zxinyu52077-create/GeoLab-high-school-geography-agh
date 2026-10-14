import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './RequiredLab.css'

const base = '/picture/experiments/required'

function solarRadiationModel(latitude, declination, cloud = 0) {
  const phi = Number(latitude) * Math.PI / 180
  const delta = Number(declination) * Math.PI / 180
  const noonAltitude = 90 - Math.abs(Number(latitude) - Number(declination))
  const cosHourAngle = Math.max(-1, Math.min(1, -Math.tan(phi) * Math.tan(delta)))
  const sunsetHourAngle = cosHourAngle <= -1 ? Math.PI : cosHourAngle >= 1 ? 0 : Math.acos(cosHourAngle)
  const daylightHours = 24 * sunsetHourAngle / Math.PI
  // Integrate the solar-angle curve across daylight instead of multiplying
  // noon altitude by day length. This follows the daily extraterrestrial
  // radiation relation used in solar-geometry teaching.
  const dailyExtraterrestrial = Math.max(0, sunsetHourAngle * Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.sin(sunsetHourAngle))
  const dailyIndex = Math.round(100 * dailyExtraterrestrial * (1 - Number(cloud) * 0.006))
  return { noonAltitude, daylightHours, dailyIndex, sunsetHourAngle }
}

const labs = {
  2: {
    title: '太阳对地球的影响', chapter: '第一章 · 宇宙中的地球', question: '纬度和季节，怎样改变一地获得的太阳辐射？',
    objective: '分别改变观测纬度、太阳直射纬度和云量，比较正午太阳高度、昼长与日辐射相对值。',
    controls: [
      { id: 'latitude', label: '观测纬度 φ', min: -90, max: 90, step: 1, value: 30, unit: '°', help: '也可以直接点击地球上的位置改变纬度' },
      { id: 'season', label: '太阳直射纬度 δ', min: -23.5, max: 23.5, step: 0.5, value: 0, unit: '°', help: '北半球夏至约 +23.5°，冬至约 −23.5°' },
      { id: 'cloud', label: '云量', min: 0, max: 100, step: 1, value: 20, unit: '%', help: '单独观察云层对到达地面的削弱作用' },
      { id: 'activity', label: '空间天气强度', min: 0, max: 100, step: 1, value: 32, unit: ' 指数', help: '教学模拟值：调高后观察粒子、磁层和极光变化' },
    ],
    metrics: ['正午太阳高度', '昼长', '日辐射相对值'], insight: '解题顺序：先由纬度和日期确定太阳直射纬度，再比较正午太阳高度与昼长；日总辐射还受天气等因素影响。',
  },
  3: {
    title: '地层挖掘与地质年代复原', chapter: '第四章 · 地貌', question: '不同地点的岩层被侵蚀、错断后，怎样判断先后关系？',
    objective: '把地层叠置、标准化石和切割关系分开取证，避免把相对年代误当成绝对年代。',
    controls: [
      { id: 'depth', label: '揭露层数', min: 0, max: 6, step: 1, value: 2, unit: ' 层', help: '逐层观察；层序规律只在未倒转等条件下直接使用' },
      { id: 'erosion', label: '剥蚀缺失程度', min: 0, max: 100, step: 1, value: 18, unit: '%', help: '侵蚀面代表地层记录可能缺失，不代表沉积持续' },
      { id: 'structure', label: '地层关系', options: ['正常层序（未倒转）', '侵蚀不整合', '断层切割', '地层倒转'], value: '正常层序（未倒转）', help: '结构证据决定能否直接套用地层叠置规律' },
    ],
    metrics: ['已揭露地层', '最老化石'], insight: '先辨认地层是否连续、倒转或被切割，再用叠置关系定先后，最后用短生存期且广布的化石做异地对比。',
  },
  4: {
    title: '地球的圈层结构', chapter: '第一章 · 地球的圈层结构', question: '看不见的地球深处，我们如何知道它是什么？',
    objective: '结合 S 波缺失与 P 波路径改变，判断地球内部物态；区分“直接观测”和“由地震波推断”。',
    controls: [
      { id: 'depth', label: '钻探深度', min: 0, max: 6371, step: 10, value: 2900, unit: ' km', help: '地震学把我们的视线带到远超钻探的深处；地幔—外核边界约 2,900 km' },
      { id: 'wave', label: '地震波类型', options: ['P 波', 'S 波'], value: 'P 波', help: 'S 波不能通过液态外核，P 波能穿过但会折射' },
    ],
    metrics: ['所在圈层', '估计温度'], insight: '地震波速度、传播路径和阴影区的变化，为地球内部圈层划分提供了关键证据。',
  },
  5: {
    title: '大气成分与垂直分层', chapter: '第二章 · 地球上的大气', question: '越往高处走，大气的温度会怎样变化？',
    objective: '结合探测高度、纬度和温度趋势判读大气层结；不要把温度趋势归因于“离太阳远近”。',
    controls: [
      { id: 'altitude', label: '探测高度', min: 0, max: 120, step: 1, value: 8, unit: ' km', help: '拖动探测点，从地面一路升至平流层' },
      { id: 'latitude', label: '纬度位置', min: 0, max: 75, step: 1, value: 30, unit: '°', help: '不同纬度的对流层顶高度并不相同' },
    ],
    metrics: ['当前温度', '空气密度'], insight: '大气温度并非随高度单调变化：对流层递减，平流层因臭氧吸收紫外线而递增。',
  },
  6: {
    title: '大气能量收支与热力环流', chapter: '第二章 · 地球上的大气', question: '海风和陆风，为什么会在昼夜间反向？',
    objective: '先看下垫面升降温快慢，再判断气压差、近地风向和高空补偿气流；云量改变温差而非直接指定风向。',
    controls: [
      { id: 'time', label: '观测时段', options: ['白天', '夜晚'], value: '白天', help: '白天陆地升温较快，夜晚降温也较快' },
      { id: 'cloud', label: '云量', min: 0, max: 80, step: 1, value: 15, unit: '%', help: '云层通过反射和逆辐射改变地表能量收支' },
      { id: 'surface', label: '地表类型', options: ['海陆交界', '山谷地带'], value: '海陆交界', help: '切换不同下垫面，比较局地热力环流' },
    ],
    metrics: ['地表温差', '近地面风向'], insight: '局地热力环流从受热不均开始：温度差形成气压差，近地面空气由高压流向低压。',
  },
  7: {
    title: '水循环过程与水量平衡', chapter: '第三章 · 地球上的水', question: '一场暴雨落下后，水会走向哪里？',
    objective: '用降水强度与下渗能力比较降雨超渗产流，并追踪不透水面如何改变洪峰大小和到达时间。',
    controls: [
      { id: 'rain', label: '降水强度', min: 10, max: 120, step: 1, value: 55, unit: ' mm/h', help: '调节降水，观察产流与入渗的此消彼长' },
      { id: 'vegetation', label: '植被覆盖', min: 0, max: 100, step: 1, value: 68, unit: '%', help: '植被截留雨水并增加土壤入渗机会' },
      { id: 'urban', label: '不透水面', min: 0, max: 100, step: 1, value: 22, unit: '%', help: '城市硬化地面会加快径流形成' },
      { id: 'soilMoisture', label: '前期土壤湿度', min: 0, max: 100, step: 1, value: 40, unit: '%', help: '土壤越接近饱和，可继续入渗的空间越小' },
    ],
    metrics: ['地表径流', '下渗比例'], insight: '流域降水会分配为蒸发、下渗、地表径流和地下径流；各环节共同决定出口水量。',
  },
  8: {
    title: '海水性质分布仿真', chapter: '第三章 · 地球上的水', question: '温度、盐度和压力，谁在控制海水密度？',
    objective: '改变观测纬度、深度与海水性质，读取剖面上的对应值。',
    controls: [
      { id: 'property', label: '观测性质', options: ['温度', '盐度', '密度'], value: '温度', help: '在同一水柱上切换变量，比较垂直变化' },
      { id: 'latitude', label: '观测纬度', min: -80, max: 80, step: 1, value: 25, unit: '°', help: '南北半球纬度均可比较；局地海流和季节会造成偏差' },
      { id: 'depth', label: '观测深度', min: 0, max: 5000, step: 50, value: 500, unit: ' m', help: '温度、盐度和密度的垂向结构各有差异' },
    ],
    metrics: ['观测值', '变化特征'], insight: '海水温度主要受太阳辐射影响；盐度与蒸发、降水等水量收支有关；密度综合受温度、盐度和压力影响。',
  },
  9: {
    title: '洋流分布与海浪潮汐', chapter: '第三章 · 地球上的水', question: '风、地转偏向力和月球引力，怎样塑造海洋？',
    objective: '把风应力、地转偏向与海陆分布用于判断环流，把日月相位用于判断潮差；两套机制不要混为一谈。',
    controls: [
      { id: 'basin', label: '观察海盆', options: ['太平洋', '大西洋', '印度洋'], value: '太平洋', help: '比较不同海盆的洋流环流结构' },
      { id: 'hemisphere', label: '环流所在半球', options: ['北半球', '南半球'], value: '北半球', help: '地转偏向使大洋环流在两半球旋转方向相反' },
      { id: 'wind', label: '代表性风速', min: 0, max: 20, step: 0.5, value: 8, unit: ' m/s', help: '风应力推动表层流；此处流速为教学估算，不是海洋实测值' },
      { id: 'moon', label: '月相位置', options: ['朔月 · 大潮', '上弦 · 小潮', '望月 · 大潮', '下弦 · 小潮'], value: '朔月 · 大潮', help: '日、月、地相对位置改变潮差' },
    ],
    metrics: ['表层流速', '潮差状态'], insight: '盛行风、地转偏向力与海陆轮廓共同塑造洋流；日月引潮力叠加时形成大潮，方向近垂直时形成小潮。',
  },
}

const strata = [
  { name: '第四纪沉积层', age: '距今约 258 万年内', fossil: '哺乳动物化石、现代贝类', color: '#d6ad78' },
  { name: '白垩纪灰岩', age: '约 1.45 亿—6600 万年前', fossil: '菊石、被子植物', color: '#b78a62' },
  { name: '侏罗纪页岩', age: '约 2.01 亿—1.45 亿年前', fossil: '恐龙、裸子植物', color: '#815d4b' },
  { name: '二叠纪砂岩', age: '约 2.99 亿—2.52 亿年前', fossil: '䗴类、舌羊齿植物', color: '#6d5044' },
  { name: '寒武纪灰岩', age: '约 5.39 亿—4.85 亿年前', fossil: '三叶虫、早期海生无脊椎动物', color: '#9a866e' },
  { name: '基底岩层', age: '更古老的结晶基底', fossil: '未见化石', color: '#524b49' },
]

function useLabValues(lab) {
  const [values, setValues] = useState(() => Object.fromEntries(lab.controls.map((control) => [control.id, control.value])))
  const setValue = (id, value) => setValues((current) => ({ ...current, [id]: value }))
  const resetValues = () => setValues(Object.fromEntries(lab.controls.map((control) => [control.id, control.value])))
  return [values, setValue, resetValues]
}

function LabScene({ id, values, layerIndex, onLayer, mode, onLatitude }) {
  if (id === 2) {
    const cloud = Number(values.cloud), latitude = Number(values.latitude), declination = Number(values.season), activity = Number(values.activity)
    const result = solarRadiationModel(latitude, declination, cloud)
    const selectedY = 225 - 122 * Math.sin(latitude * Math.PI / 180)
    const directY = 225 - 122 * Math.sin(declination * Math.PI / 180)
    const selectedX = 528 + 24 * Math.cos(latitude * Math.PI / 180)
    const chooseLatitude = (event) => {
      const bounds = event.currentTarget.ownerSVGElement.getBoundingClientRect()
      const svgY = (event.clientY - bounds.top) / bounds.height * 460
      const sineLatitude = Math.max(-1, Math.min(1, (225 - svgY) / 122))
      onLatitude(Math.round(Math.asin(sineLatitude) * 180 / Math.PI))
    }
    if (mode === 'activity') return <svg viewBox="0 0 760 460" className="required-lab__svg required-lab__solar-weather" role="img" aria-label="太阳活动影响地球空间环境示意图">
      <defs><radialGradient id="space-sun-glow"><stop stopColor="#ffd67e" stopOpacity=".62"/><stop offset="1" stopColor="#ffd67e" stopOpacity="0"/></radialGradient><filter id="aurora-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <path d="M184 230 C305 73 456 71 585 148 C658 193 654 266 585 313 C453 387 301 384 184 230" fill="none" stroke="#77b9ed" strokeOpacity=".28" strokeWidth="2"/>
      <path d="M184 230 C306 107 459 112 575 166 M184 230 C306 353 459 348 575 294" fill="none" stroke="#77b9ed" strokeOpacity=".22" strokeDasharray="5 8"/>
      <circle cx="124" cy="230" r="91" fill="url(#space-sun-glow)"/><image href="/picture/planets/sun.png" x="81" y="187" width="86" height="86"/>
      <path d="M184 230 C267 170 354 174 425 230" fill="none" stroke="#a8e6ff" strokeOpacity={.12+activity/190} strokeDasharray="3 11"/>
      {Array.from({length:15},(_,i)=><circle key={i} cx={190+i*15} cy={230+Math.sin(i*.22)*(18+activity*.1)} r={i%3===0?3:2} fill="#a8e6ff" opacity={i < Math.max(2, Math.round(activity / 7)) ? .42 + activity / 220 : .06} className="required-lab__particle"/>)}
      <image href={`${base}/earth-even-light.png`} x="424" y="105" width="230" height="230"/>
      <path d="M476 147 Q535 173 595 145 M475 294 Q535 268 595 296" fill="none" stroke="#6ce8d0" strokeWidth={2+activity/45} strokeOpacity={.15+activity/100} filter="url(#aurora-glow)"/>
      <text x="125" y="341" textAnchor="middle">太阳活动强度 · {activity}</text><text x="298" y="158" textAnchor="middle" className="required-lab__scene-note">高速带电粒子</text><text x="532" y="365" textAnchor="middle">磁层偏转粒子 · 极区电离层受扰</text>
      <text x="380" y="62" textAnchor="middle" className="required-lab__scene-note">活动增强时，极光与空间天气效应更明显；地表日照规律仍由太阳高度和昼长解释</text>
    </svg>
    return <svg viewBox="0 0 760 460" className="required-lab__svg required-lab__solar-radiation" role="group" aria-label="太阳辐射纬度分布交互示意图">
      <defs>
        <radialGradient id="radiation-sun-glow"><stop stopColor="#ffd67e" stopOpacity=".52"/><stop offset="1" stopColor="#ffd67e" stopOpacity="0"/></radialGradient>
        <clipPath id="earth-radiation-clip"><circle cx="528" cy="225" r="122"/></clipPath>
      </defs>
      <circle cx="125" cy="225" r="90" fill="url(#radiation-sun-glow)"/><image href="/picture/planets/sun.png" x="84" y="184" width="82" height="82"/>
      {Array.from({length:7},(_,i)=><line key={i} x1="194" y1={151+i*24} x2="406" y2={151+i*24} stroke="#f2cf89" strokeOpacity={Math.max(.22,1-cloud*.006)} strokeWidth={i===3?2:1} strokeDasharray="5 8" className="required-lab__ray"/>)}
      <text x="294" y="129" textAnchor="middle" className="required-lab__scene-note">近似平行的太阳光线</text>
      <g className="required-lab__earth-select" role="button" tabIndex="0" aria-label="点击地球选择观测纬度" onClick={chooseLatitude} onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onLatitude(Math.max(-90,Math.min(90,Number(values.latitude)+10)))}}}>
        <image href={`${base}/earth-even-light.png`} x="406" y="103" width="244" height="244"/>
        <g clipPath="url(#earth-radiation-clip)" pointerEvents="none"><line x1="406" y1={directY} x2="650" y2={directY} stroke="#f3d58a" strokeDasharray="5 6" opacity=".86"/><line x1="406" y1={selectedY} x2="650" y2={selectedY} stroke="#84e1c9" strokeWidth="2" opacity=".8"/><circle cx={selectedX} cy={selectedY} r="7" fill="#fff" stroke="#66e0c2" strokeWidth="4"/></g>
      </g>
      <text x="528" y="390" textAnchor="middle">点选观测点 · φ {latitude}°</text><text x="528" y="414" textAnchor="middle" className="required-lab__scene-note">δ {declination}° · 正午太阳高度 {Math.round(result.noonAltitude)}°</text>
      <text x="126" y="335" textAnchor="middle" className="required-lab__scene-note">太阳</text><text x="300" y="367" textAnchor="middle" className="required-lab__scene-note">云量 {cloud}% · 到达地面的能量相应减弱</text>
      <text x="528" y="80" textAnchor="middle" className="required-lab__scene-note">青线：观测纬度 φ · 金线：太阳直射纬度 δ</text>
    </svg>
  }
  if (id === 3) return <div className="required-lab__strata" style={{ '--exposed': `${Math.max(0, Math.min(6, Number(values.depth))) * 12}%` }}>
    <img src={`${base}/strata-fossils.png`} alt="带有化石的多层沉积岩剖面" />
    <div className="required-lab__strata-labels">{strata.map((layer, i) => <button key={layer.name} type="button" onClick={() => onLayer(i)} className={i === layerIndex ? 'is-selected' : ''} style={{ '--layer-color': layer.color, top: `${13 + i * 13}%` }}><i/>{layer.name}</button>)}</div>
    {values.structure!=='正常层序（未倒转）'&&<svg className="required-lab__structure-overlay" viewBox="0 0 760 460" aria-label={`${values.structure}示意`}>
      {values.structure==='断层切割'&&<><path d="M235 70 L470 390" stroke="#ff8f78" strokeWidth="5" strokeDasharray="12 7" opacity=".9"/><text x="420" y="93">断层切割</text></>}
      {values.structure==='侵蚀不整合'&&<><path d={`M55 218 Q90 ${208-Number(values.erosion)*.08} 126 218 T198 218 T270 218 T342 218 T414 218 T486 218 T558 218 T630 218 T705 218`} fill="none" stroke="#e9d58d" strokeWidth="5" strokeDasharray={`${5+Number(values.erosion)/10} 5`} opacity={.45+Number(values.erosion)/180}/><text x="610" y="203">侵蚀面 · 时间缺失</text></>}
      {values.structure==='地层倒转'&&<><path d="M690 360 L690 105" fill="none" stroke="#ffbd72" strokeWidth="4"/><path d="M681 118 L690 102 L699 118" fill="none" stroke="#ffbd72" strokeWidth="4"/><text x="570" y="92">年轻方向需由层理/化石证据判定</text></>}
    </svg>}
    <div className="required-lab__dig-line" style={{ top: `${Math.min(90, 14 + Number(values.depth) * 12)}%` }}><span>挖掘面</span></div>
    <div className="required-lab__visual-caption">{values.structure} · {values.structure==='正常层序（未倒转）'?'可检验下老上新的相对先后；不据层厚推算年代':'先识别结构，再判断层序能否直接使用'}</div>
  </div>
  if (id === 4) {
    const depth = Number(values.depth)
    const layer = depth < 70 ? '地壳' : depth < 660 ? '上地幔' : depth < 2900 ? '下地幔' : depth < 5150 ? '外核' : '内核'
    const wave = values.wave
    const y = 52 + (depth / 6371) * 330
    const crossedOuterCore = depth >= 2900
    const wavePath = wave === 'S 波'
      ? (crossedOuterCore ? 'M124 231 C191 83 291 88 352 192' : 'M124 231 C196 78 302 79 380 135 C474 197 544 101 650 228')
      : (crossedOuterCore ? 'M124 231 C191 83 291 88 352 192 C398 244 431 295 488 293 C548 290 594 233 650 228' : 'M124 231 C201 75 314 82 380 139 C478 222 548 103 650 228')
    return <div className="required-lab__earth-core"><img src={`${base}/earth-cutaway.png`} alt="地球内部圈层生成式剖面图"/>
      <svg viewBox="0 0 760 460" className="required-lab__svg required-lab__overlay" aria-label="地震波传播深度示意图">
        <circle cx="380" cy="231" r="88" fill="none" stroke="#ffcb82" strokeOpacity=".55" strokeDasharray="4 7"/><circle cx="380" cy="231" r="30" fill="none" stroke="#f2e4c3" strokeOpacity=".5" strokeDasharray="4 7"/>
        <path d={wavePath} fill="none" stroke={wave === 'P 波' ? '#f5d37c' : '#78d9ff'} strokeWidth="3" strokeDasharray="5 8" className="required-lab__wave-line"/>
        {wave==='S 波'&&crossedOuterCore?<path d="M343 182 L361 200 M361 182 L343 200" stroke="#ff8175" strokeWidth="5"/>:<circle cx="638" cy={Math.max(54, Math.min(402, y))} r="8" fill={wave === 'P 波' ? '#f5d37c' : '#78d9ff'}/>}
        <line x1="520" y1={y} x2="715" y2={y} stroke="#e8edf3" strokeOpacity=".5" strokeDasharray="4 5"/>
        <text x="642" y={Math.max(44, y - 15)} textAnchor="middle">{depth.toLocaleString()} km · {layer}</text>
        <text x="525" y="410" textAnchor="middle" className="required-lab__scene-note">{wave==='S 波'&&crossedOuterCore?'S 波不能穿过液态外核':wave==='P 波'&&crossedOuterCore?'P 波可穿过外核，但发生折射、速度改变':'虚线圈：外核边界与内核边界'}</text>
      </svg>
      <div className="required-lab__visual-caption">地震波证据将观察深入地球内部 · 圈层厚度非比例</div>
    </div>
  }
  if (id === 5) {
    const state = atmosphereState(values)
    const h = state.altitude
    const y = 389 - Math.min(h, 120) * 2.82
    const boundaries = [state.tropopause, 50, 85]
    return <svg viewBox="0 0 760 460" className="required-lab__svg" role="img" aria-label="大气垂直分层与探测高度">
      <defs><linearGradient id="atmo"><stop stopColor="#274b65"/><stop offset=".32" stopColor="#254c7a"/><stop offset=".58" stopColor="#34416f"/><stop offset=".82" stopColor="#372d62"/><stop offset="1" stopColor="#161a31"/></linearGradient></defs>
      <rect x="148" y="46" width="520" height="354" rx="30" fill="url(#atmo)" opacity=".9"/>
      {boundaries.map((km, i) => <g key={km}><line x1="148" y1={389-km*2.82} x2="668" y2={389-km*2.82} stroke="#d3e5ff" opacity=".42" strokeDasharray="5 8"/><text x="180" y={382-km*2.82} className="required-lab__scene-note">{['本地对流层顶','平流层顶','中间层顶'][i]} · {km.toFixed(i===0?1:0)} km</text></g>)}
      <image href="/picture/planets/earth.png" x="336" y="316" width="144" height="144"/>
      <line x1="148" y1={y} x2="668" y2={y} stroke="#f5d07a" strokeWidth="2"/><circle cx="524" cy={y} r="10" fill="#fff" stroke="#f5d07a" strokeWidth="4"/>
      <text x="540" y={y-15}>{h} km · {state.layer}</text><text x="390" y="432" textAnchor="middle" className="required-lab__scene-note">探测温度约 {Math.round(state.temperature)}°C · 空气密度约为海平面 {state.densityRatio.toPrecision(2)} 倍</text>
      <text x="95" y="61" className="required-lab__scene-note">高度</text><text x="100" y="395" className="required-lab__scene-note">地面</text>
    </svg>
  }
  if (id === 6) {
    const thermal = thermalState(values)
    const night = thermal.night
    const mountain = thermal.mountain
    const windFrom = thermal.nearSurface
    return <div className={`required-lab__landsea ${night ? 'is-night' : ''}`}>
      <img src={mountain ? `${base}/river-basin.png` : `${base}/land-sea.png`} alt={mountain ? '山地流域与山谷生成图' : '海陆交界地形生成图'}/>
      <svg viewBox="0 0 760 460" className="required-lab__svg required-lab__overlay" aria-label="热力环流方向">
        <defs><marker id="wind-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0 0 L0 6 L9 3z" fill="#f6d48d"/></marker><marker id="energy-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3z" fill="#f8d58b"/></marker><marker id="heat-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3z" fill="#ff986d"/></marker><marker id="back-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0 0 L0 6 L8 3z" fill="#83ddf4"/></marker></defs>
        <image href="/picture/planets/sun.png" x="86" y="74" width="50" height="50" opacity={night ? 0.14 : 1}/>
        <path d="M130 132 L235 236" fill="none" stroke="#f8d58b" strokeWidth="3" strokeOpacity={night ? 0.16 : 1-Number(values.cloud)/125} markerEnd="url(#energy-arrow)"/>
        <path d="M252 236 Q245 176 292 135" fill="none" stroke="#83c9ef" strokeWidth="2" strokeOpacity={Number(values.cloud)/115} markerEnd="url(#back-arrow)"/>
        <path d="M432 240 Q447 190 484 159" fill="none" stroke="#ff986d" strokeWidth="3" markerEnd="url(#heat-arrow)"/>
        <path d="M505 160 Q529 202 534 239" fill="none" stroke="#83ddf4" strokeWidth="2" strokeOpacity={.32+Number(values.cloud)/130} markerEnd="url(#back-arrow)"/>
        <text x="161" y="176" className="required-lab__scene-note">太阳短波</text><text x="267" y="158" className="required-lab__scene-note">反射</text><text x="446" y="181" className="required-lab__scene-note">地面长波</text><text x="539" y="202" className="required-lab__scene-note">大气逆辐射</text>
        {night ? <><path d="M570 248 C465 195 320 201 205 248" fill="none" stroke="#f6d48d" strokeWidth="4" markerEnd="url(#wind-arrow)"/><path d="M210 128 Q380 20 570 128" fill="none" stroke="#8cd5ff" strokeWidth="3" markerEnd="url(#wind-arrow)"/></> : <><path d="M205 248 C320 195 465 201 570 248" fill="none" stroke="#f6d48d" strokeWidth="4" markerEnd="url(#wind-arrow)"/><path d="M570 128 Q380 20 205 128" fill="none" stroke="#8cd5ff" strokeWidth="3" markerEnd="url(#wind-arrow)"/></>}
        <text x="380" y="50" textAnchor="middle">{mountain ? (night ? '山风环流 · 坡地 → 谷地' : '谷风环流 · 谷地 → 坡地') : windFrom}</text>
        <text x="196" y="300" textAnchor="middle" className="required-lab__scene-note">{mountain ? '山谷' : '海洋'}</text><text x="582" y="300" textAnchor="middle" className="required-lab__scene-note">{mountain ? '山坡' : '陆地'}</text>
        <text x="196" y="324" textAnchor="middle" className="required-lab__scene-note">{night ? (mountain?'相对低压':'相对低压') : (mountain?'相对高压':'相对高压')}</text><text x="582" y="324" textAnchor="middle" className="required-lab__scene-note">{night ? (mountain?'相对高压':'相对高压') : (mountain?'相对低压':'相对低压')}</text>
        <text x="380" y="394" textAnchor="middle" className="required-lab__scene-note">热力温差估值 {thermal.contrast.toFixed(1)}°C · 云量增加会削弱昼夜热力差异</text>
        <image href={`${base}/clouds.png`} x={290-Number(values.cloud)*.42} y="105" width={125+Number(values.cloud)*.85} height="66" opacity={.42+Number(values.cloud)/150}/>
      </svg>
      <div className="required-lab__visual-caption">{night ? '夜间陆地降温快，近地面形成陆风' : '白天陆地升温快，近地面形成海风'}</div>
    </div>
  }
  if (id === 7) {
    const water = runoffState(values)
    return <div className="required-lab__basin"><img src={`${base}/river-basin.png`} alt="从高山到河口的流域与地下含水层生成图"/>
      <svg viewBox="0 0 760 460" className="required-lab__svg required-lab__overlay" aria-label="流域水循环过程">
        <defs><marker id="water-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0 0 L0 6 L9 3z" fill="#80ddff"/></marker></defs>
        <path d="M160 270 Q320 310 465 286 T650 322" fill="none" stroke="#89e0ff" strokeWidth={2+water.runoff/24} strokeOpacity={.4+water.runoffShare*.6} markerEnd="url(#water-arrow)" strokeDasharray="8 9" className="required-lab__water-flow"/>
        <path d="M335 245 Q340 310 362 354" fill="none" stroke="#83caf4" strokeWidth={1.5+water.infiltration/24} strokeOpacity={.4+water.infiltration/60} markerEnd="url(#water-arrow)" strokeDasharray="4 8"/>
        <path d="M456 92 Q432 142 418 190" fill="none" stroke="#b2ecff" strokeWidth="2" strokeDasharray="3 8" markerEnd="url(#water-arrow)"/>
        {Array.from({length:Math.max(3,Math.round(water.rain/6))},(_,i)=><circle key={i} cx={440+(i%7)*23} cy={112+Math.floor(i/7)*17} r={2+(water.rain/120)*2} fill="#c8f3ff" opacity=".35+water.rain/180"/>)}
        <text x="203" y="247">地表径流 · {water.runoff.toFixed(1)} mm/h</text><text x="375" y="375" className="required-lab__scene-note">下渗 · {water.infiltration.toFixed(1)} mm/h</text><text x="462" y="104" className="required-lab__scene-note">降水 {water.rain} mm/h</text>
      </svg><div className="required-lab__visual-caption">雨强 {water.rain} · 入渗能力 {water.infiltrationCapacity.toFixed(0)} mm/h · 不透水面 {values.urban}%</div>
    </div>
  }
  if (id === 8) {
    const depth = Number(values.depth), lat = Number(values.latitude), prop = values.property
    const state = oceanState(values)
    const current = prop === '温度' ? `${state.temperature.toFixed(1)} °C` : prop === '盐度' ? `${state.salinity.toFixed(2)} ‰` : `${state.density.toFixed(4)} g/cm³`
    const markerY = 118 + (depth/5000)*245
    const range = prop === '温度' ? [-2, 30] : prop === '盐度' ? [32, 37] : [1.020, 1.040]
    const valueAtDepth = (d) => { const sample=oceanState(values,d);return prop==='温度'?sample.temperature:prop==='盐度'?sample.salinity:sample.density }
    const profilePath = Array.from({length:21},(_,i)=>{const d=i*250;const value=valueAtDepth(d);const x=125+(value-range[0])/(range[1]-range[0])*500;const y=118+(d/5000)*245;return `${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`}).join(' ')
    const probeX = 125+(valueAtDepth(depth)-range[0])/(range[1]-range[0])*500
    return <div className="required-lab__ocean"><img src={`${base}/ocean-column.png`} alt="海水垂直剖面生成图"/>
      <svg viewBox="0 0 760 460" className="required-lab__svg required-lab__overlay" aria-label="海水性质与深度观测点">
        {[0,1000,2000,3000,4000,5000].map((d)=><g key={d}><line x1="98" y1={118+(d/5000)*245} x2="668" y2={118+(d/5000)*245} stroke="#d2efff" opacity=".15" strokeDasharray="4 8"/><text x="58" y={122+(d/5000)*245} className="required-lab__scene-note">{d} m</text></g>)}
        <line x1="98" y1={markerY} x2="668" y2={markerY} stroke="#fff" strokeWidth="1.5" strokeOpacity=".48" strokeDasharray="5 6"/><path d={profilePath} fill="none" stroke={prop==='温度'?'#ffb66f':prop==='盐度'?'#72e0df':'#d2f1ff'} strokeWidth="4" strokeLinejoin="round"/>
        <circle cx={probeX} cy={markerY} r="8" fill="#fff" stroke="#74dfff" strokeWidth="4"/>
        <rect x="510" y={markerY-20} width="138" height="32" rx="16" fill="#071d2a" opacity=".92"/><text x="579" y={markerY+1} textAnchor="middle">{current}</text>
        <text x="360" y="76" textAnchor="middle">{prop}—深度剖面 · {lat}° · 教学近似</text><text x="392" y="402" textAnchor="middle" className="required-lab__scene-note">{prop==='温度'?'表层受热、深层趋冷而稳定':prop==='盐度'?'副热带蒸发偏强，高纬受降水融冰影响':'密度综合温度、盐度与压力'}</text>
      </svg><div className="required-lab__visual-caption">拖动探针沿剖面读值；{Math.abs(lat)>72?'高纬表层冷却强，深层温度趋近约 2°C':'表层受热，温度向深层递减并趋稳'}；曲线为教学近似</div>
    </div>
  }
  const basin = values.basin
  const moon = String(values.moon)
  const tide = moon.includes('大潮') ? '大潮 · 潮差较大' : '小潮 · 潮差较小'
  const gyre = basin === '大西洋' ? 'M344 170 C366 112 429 117 463 160 C495 202 466 265 421 282 C375 299 339 251 344 170' : basin === '印度洋' ? 'M474 231 C482 174 546 155 588 196 C625 233 598 287 552 305 C505 324 466 284 474 231' : 'M112 157 C145 105 258 101 318 153 C371 199 353 270 294 294 C225 322 142 280 123 214 C119 194 116 174 112 157'
  const gyreDirection = values.hemisphere === '南半球' ? '逆时针' : '顺时针'
  const flowDuration = `${Math.max(2, 13-Number(values.wind)*.45)}s`
  return <svg viewBox="0 0 760 460" className="required-lab__svg required-lab__currents" role="img" aria-label={`${basin}洋表层洋流和潮汐模拟`}>
    <defs><linearGradient id="map-ocean"><stop stopColor="#082a42"/><stop offset="1" stopColor="#0b1d30"/></linearGradient><marker id="warm-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0 0 L0 6 L9 3z" fill="#ffb45c"/></marker><marker id="cold-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0 0 L0 6 L9 3z" fill="#75d6ed"/></marker></defs>
    <rect x="40" y="42" width="680" height="356" rx="26" fill="url(#map-ocean)" stroke="#35556f"/>
    <image href={`${base}/world-map.jpg`} x="41" y="43" width="678" height="354" preserveAspectRatio="none"/>
    <rect x="41" y="43" width="678" height="354" rx="24" fill="#061727" opacity=".22"/>
    <path d={gyre} fill="none" stroke="#ffb45c" strokeWidth={2+Number(values.wind)*.22} strokeOpacity=".9" strokeDasharray="9 12" className="required-lab__current-flow" style={{animationDuration:flowDuration,animationDirection:values.hemisphere==='南半球'?'reverse':'normal'}}/>
    <path d={gyre} transform="translate(0 12) scale(.86 .88)" fill="none" stroke="#75d6ed" strokeWidth={1.5+Number(values.wind)*.12} strokeOpacity=".82" strokeDasharray="7 15" className="required-lab__current-flow" style={{animationDuration:`${parseFloat(flowDuration)+2}s`,animationDelay:'-2s',animationDirection:values.hemisphere==='南半球'?'reverse':'normal'}}/>
    <text x="380" y="77" textAnchor="middle">{basin} · {gyreDirection}风生环流 · {Number(values.wind).toFixed(1)} m/s</text>
    <g><rect x="496" y="296" width="202" height="92" rx="12" fill="#07121d" fillOpacity=".94" stroke="#9cb8ca" strokeOpacity=".4"/><text x="511" y="318" className="required-lab__scene-note">月球引潮力 · {tide}</text><line x1="511" y1="355" x2="682" y2="355" stroke="#7ca0b7" strokeOpacity=".4"/><path d={(() => {const a=moon.includes('大潮')?18:7;return `M511 355 C526 ${355-a} 540 ${355-a} 554 355 S582 ${355+a} 597 355 S625 ${355-a} 640 355 S668 ${355+a} 682 355`})()} fill="none" stroke="#85d8ff" strokeWidth="3" className="required-lab__tide-wave"/><text x="511" y="379" className="required-lab__scene-note">{moon.includes('大潮')?'日月引潮力叠加':'日月引潮力部分抵消'}</text></g>
    <text x="380" y="426" textAnchor="middle" className="required-lab__scene-note">暖流与寒流是环流中的典型支流；示意路径不代表实时洋流观测</text>
  </svg>
}

function atmosphereState(v) {
  const altitude = Number(v.altitude)
  const tropopause = 17 - Number(v.latitude) * .12
  const layer = altitude < tropopause ? '对流层' : altitude < 50 ? '平流层' : altitude < 85 ? '中间层' : '热层'
  const tropopauseTemperature = -50 - 3 * (tropopause - 8)
  const troposphericLapseRate = (15 - tropopauseTemperature) / tropopause
  const temperature = altitude < tropopause
    ? 15 - troposphericLapseRate * altitude
    : altitude < 50
      ? tropopauseTemperature + (-15 - tropopauseTemperature) * ((altitude - tropopause) / (50 - tropopause))
      : altitude < 85
        ? -15 - 75 * ((altitude - 50) / 35)
        : -90 + 12 * (altitude - 85)
  return { altitude, tropopause, layer, temperature, densityRatio: Math.exp(-altitude / 8.5) }
}

function runoffState(v) {
  const rain = Number(v.rain)
  const vegetation = Number(v.vegetation) / 100
  const impervious = Number(v.urban) / 100
  const antecedentMoisture = Number(v.soilMoisture || 0) / 100
  const infiltrationCapacity = Math.max(5, 15 + vegetation * 45 - antecedentMoisture * 25)
  const perviousShare = 1 - impervious
  const infiltration = Math.min(rain, infiltrationCapacity) * perviousShare
  const runoff = rain * impervious + Math.max(0, rain - infiltrationCapacity) * perviousShare
  return { rain, infiltrationCapacity, infiltration, runoff, runoffShare: rain ? runoff / rain : 0, impervious }
}

function oceanState(v, depth = Number(v.depth)) {
  const latitude = Math.abs(Number(v.latitude))
  const surfaceTemperature = 28 - .36 * latitude
  const temperature = 2 + (surfaceTemperature - 2) * Math.exp(-depth / 650)
  const subtropicalSalinityMaximum = 1.25 * Math.exp(-(((latitude - 25) / 18) ** 2))
  const equatorialMinimum = 0.55 * Math.exp(-((latitude / 13) ** 2))
  const polarFreshening = 1.65 * Math.exp(-(((latitude - 76) / 15) ** 2))
  const salinity = 34.7 + subtropicalSalinityMaximum - equatorialMinimum - polarFreshening - .00008 * depth
  const density = 1.028 - .00021 * (temperature - 10) + .00075 * (salinity - 35) + .0000008 * depth
  return { temperature, salinity, density }
}

function thermalState(v) {
  const night = v.time === '夜晚'
  const mountain = v.surface === '山谷地带'
  const cloud = Number(v.cloud) / 100
  const baseContrast = mountain ? (night ? 6 : 9) : (night ? 8 : 12)
  const cloudDamping = night ? .55 : .65
  const contrast = baseContrast * (1 - cloud * cloudDamping)
  const nearSurface = mountain ? (night ? '山风：坡地 → 谷地' : '谷风：谷地 → 坡地') : (night ? '陆风：陆地 → 海洋' : '海风：海洋 → 陆地')
  return { night, mountain, contrast, nearSurface }
}

function deriveMetrics(id, v, layerIndex, mode) {
  if (id === 2) {
    if (mode === 'activity') return [{label:'太阳活动强度',value:`${v.activity}/100`},{label:'地球空间响应',value:Number(v.activity)>65?'极区扰动较强':'扰动相对较弱'}]
    const result = solarRadiationModel(v.latitude, v.season, v.cloud)
    return [{label:'正午太阳高度',value:`${Math.round(result.noonAltitude)}°`},{label:'昼长',value:`${result.daylightHours.toFixed(1)} 小时`},{label:'日辐射相对值',value:`${result.dailyIndex} 指数`}]
  }
  if (id === 3) return [{ label:'已揭露地层', value:`${Math.min(6, Number(v.depth))} / 6 层` }, { label:'地层关系', value:v.structure }, { label:'当前化石线索', value:strata[layerIndex]?.fossil || '—' }]
  if (id === 4) { const d=Number(v.depth);return [{label:'所在圈层',value:d<70?'地壳':d<660?'上地幔':d<2900?'下地幔':d<5150?'外核':'内核'},{label:'波的证据',value:v.wave==='S 波'?(d>=2900?'液态外核阻断':'固体介质中传播'):(d>=2900?'进入外核后折射、减速':'在固体地幔中传播')},{label:'探测深度',value:`${d.toLocaleString()} km`}] }
  if (id === 5) { const state=atmosphereState(v);return [{label:'当前温度',value:`${Math.round(state.temperature)}°C · ${state.layer}`},{label:'空气密度',value:`海平面约 ${state.densityRatio.toPrecision(2)} 倍`},{label:'本地对流层顶',value:`约 ${state.tropopause.toFixed(1)} km`}] }
  if (id === 6) { const state=thermalState(v);return [{label:'热力温差估值',value:`约 ${state.contrast.toFixed(1)}°C`},{label:'近地面风向',value:state.nearSurface},{label:'云量效应',value:`温差削弱约 ${Math.round(Number(v.cloud) * (state.night ? .55 : .65))}%`}] }
  if (id === 7) { const state=runoffState(v);return [{label:'地表径流',value:`${state.runoff.toFixed(1)} mm/h`},{label:'下渗入土',value:`${state.infiltration.toFixed(1)} mm/h`},{label:'流域径流率',value:`${Math.round(state.runoffShare*100)}%`}] }
  if (id === 8) { const state=oceanState(v);const current=v.property==='温度'?`${state.temperature.toFixed(1)}°C`:v.property==='盐度'?`${state.salinity.toFixed(2)}‰`:`${state.density.toFixed(4)} g/cm³`;const relation=v.property==='温度'?'温跃层内快速下降，深海趋稳':v.property==='盐度'?'表层受蒸发、降水和水团影响':'低温、高盐及压力增大均可提高密度';return [{label:`${v.property} · ${v.latitude}°`,value:current},{label:'剖面解释',value:relation},{label:'观测深度',value:`${Number(v.depth).toLocaleString()} m`}] }
  const tide=String(v.moon).includes('大潮')?'大潮':'小潮';const hemisphere=v.hemisphere||'北半球';const currentSpeed=Number(v.wind)*.02
  return [{label:'环流方向',value:hemisphere==='北半球'?'顺时针':'逆时针'},{label:'表层流速估值',value:`约 ${currentSpeed.toFixed(2)} m/s`},{label:'当前潮差',value:tide}]
}

function createExamChallenge(id, v, layerIndex) {
  if (id === 3) {
    const layer = strata[layerIndex]
    const structure = v.structure || '正常层序（未倒转）'
    if (structure === '侵蚀不整合') return {
      title: '不整合面 · 识别缺失时间',
      stem: `剖面显示${structure}，剥蚀缺失程度设为 ${v.erosion}%；当前层位为「${layer.name}」。不整合面上、下地层之间，哪项判断最稳妥？`,
      options: ['上覆地层必与下伏地层连续沉积，中间没有时间间断', '下伏地层早于上覆地层，但侵蚀面代表记录可能缺失，缺失时长不能由剥蚀百分比直接换算', '剥蚀越强，就能按固定比例算出两层的精确年龄差', '只要有不整合面，整个岩层年代顺序就无法判断'],
      answer: 1,
      distractors: {0:'不整合恰恰表示侵蚀或停积造成间断，不能把它当连续沉积。',2:'模拟中的百分比只表示剥蚀程度，不是地质年代换算比例。',3:'间断会造成时间缺失，但上下地层仍可分别用叠置、化石和切割关系排序。'},
      chain: ['侵蚀先移除已形成的岩层，之后再沉积的上覆层更年轻。', '侵蚀、停积会造成时间间断，因此不能把地层厚度当成连续时间尺。', '本实验的剥蚀程度只是结构示意参数，不对应真实地质年代差。'],
      trap: '不整合面说明“记录有缺口”，并不意味着上下地层完全无法排序。',
    }
    if (structure === '断层切割') return {
      title: '断层关系 · 用切割定先后',
      stem: `剖面选择了${structure}，断层切过已揭露岩层；当前观察层为「${layer.name}」。依据切割关系，最稳妥结论是：`,
      options: ['断层一定早于所有被切到的岩层', '断层晚于它切过的岩层；若还切到某一层，该层也早于断层', '被错开的地层因位置改变而变成年轻地层', '断层只改变地形，不提供相对年代信息'],
      answer: 1,
      distractors: {0:'切割事件发生在被切岩层形成之后，因此断层应更年轻。',2:'断层改变空间位置，不会改变岩层形成的地质年代。',3:'断层与被切岩层的交切关系正是相对年代证据。'},
      chain: ['先确认断层面切过哪些岩层。', '切割事件必须发生在被切岩层形成之后，所以断层比被切层年轻。', '如果断层被一层未受错动的新岩层覆盖，断层又早于该覆盖层；当前图没有给出覆盖证据，不能额外推断。'],
      trap: '切割关系只能比较“切割者”和“被切者”；没有证据的覆盖关系不要自行补充。',
    }
    if (structure === '地层倒转') return {
      title: '地层倒转 · 先找地层新老方向',
      stem: `剖面显示${structure}。当前层位是「${layer.name}」。若层理发生倒转，单凭现今的上下位置，能否直接把“下老上新”用于判年？`,
      options: ['可以，重力沉积规律在任何变形后都不改变现今空间上下关系', '不可以；需先用粒序层理、波痕或化石组合等判定地层顶底，再恢复原始新老方向', '倒转会把岩层的绝对年龄也改变', '只要岩层含化石，化石就能直接给出精确年份'],
      answer: 1,
      distractors: {0:'叠置关系描述沉积时的上下顺序，倒转会改变今天看到的空间上下。',2:'构造变形改变位置和产状，不会改变岩石形成时间。',3:'化石用于相对年代和时代范围判断，不能单独提供精确年份。'},
      chain: ['叠置规律描述沉积形成时的层序，不是变形后任意空间位置的规律。', '倒转后需先恢复地层顶底方向，再按原始层序判断相对年代。', '化石可辅助对比地层时代，但仍不能单独代替绝对年代测定。'],
      trap: '先辨“地层顶底”，再判“上下新老”；空间上的下方不总是地质年代上的更老。',
    }
    return {
      title: '地层对比 · 证据边界',
      stem: `当前剖面为「${structure}」，选中「${layer.name}」，线索为「${layer.fossil}」。在异地未倒转的沉积层中也发现同一类化石；题干补充该生物生存时间短、地理分布广。最稳妥的推断是：`,
      options: ['两层岩石一定有完全相同的岩性，因此形成环境相同', '两层可用该标准化石作相对年代对比，但化石本身不能给出精确绝对年龄', '含化石层的沉积年龄一定等于生物死亡的具体年份', '任何情况下下层都比上层新，因为沉积物先落在上面'],
      answer: 1,
      distractors: {0:'生物化石相同可支持年代对比，但沉积环境和岩性可以不同。',2:'化石只能限定地质时代范围，不能把一次生物死亡等同于沉积的精确年份。',3:'正常沉积层序通常下老上新；原选项把叠置关系颠倒了。'},
      chain: ['先确认题干给出的化石具备“生存时间短、分布广”两个标准化石条件。', '同种标准化石帮助对比异地地层的相对年代；岩性相同不是必需条件。', '地层化石通常限定形成时代范围，不能单独推出某个精确年份；还要警惕再沉积等特殊情况。'],
      trap: '“同一化石”支持年代对比，不等于岩层岩性相同，也不等于已经测得绝对年龄。',
    }
  }
  if (id === 4) {
    return {
      title: '地震波 · 由现象反推物态',
      stem: `当前模拟器选择 ${v.wave} 并把探针放在 ${Number(v.depth).toLocaleString()} km。全球地震台还记录到：S 波在穿过约 2,900 km 深度后不再直接传播，P 波跨过该界面后明显折射、速度改变。哪项解释最符合两种证据？`,
      options: ['外核为液态：不能传播横波的 S 波被阻断，P 波仍可传播但路径和速度改变', '整个地幔为液态，所以 P、S 波都无法传播', 'S 波缺失只说明地震太弱，与内部物态无关', 'P 波仍能通过，说明从地幔到地心的物质全为固体'],
      answer: 0,
      distractors: {1:'地幔能传播 S 波；题干证据指向约 2,900 km 以下的外核边界。',2:'题干同时给出跨多个台站的系统性阴影区，不能用单次地震强弱解释。',3:'P 波能在液体中传播，所以它穿过外核并不能证明外核固态。'},
      chain: ['S 波需要介质具有抗剪切能力，因此液态外核会形成 S 波阴影区。', 'P 波能在固体、液体中传播，但在介质性质和速度改变处会折射、变速。', '由两类波的不同表现推断外核物态，比把“地震波看见了地核”说成直接观测更严谨。'],
      trap: 'P 波能穿过液态外核；“能传播”不等于“介质是固态”。',
    }
  }
  if (id === 5) {
    const state = atmosphereState(v)
    const layerOptions = [
      ['对流层', '气块上升膨胀冷却，整体温度通常随高度递减'],
      ['平流层', '臭氧吸收紫外线，使温度总体随高度递增'],
      ['中间层', '臭氧加热作用减弱，温度总体随高度递减'],
      ['热层', '稀薄气体吸收高能紫外线和 X 射线，温度可随高度显著升高'],
    ]
    const selected = layerOptions.findIndex(([layer]) => layer === state.layer)
    return {
      title: '垂直分层 · 读趋势判机制',
      stem: `探测点位于 ${state.altitude} km、${v.latitude}° 纬度，模型判定在${state.layer}，当前温度约 ${Math.round(state.temperature)}°C。若探测点继续上升一段距离，哪项机制最能解释该层的温度变化趋势？`,
      options: layerOptions.map(([layer, explanation]) => `${layer}：${explanation}`),
      answer: selected,
      distractors: layerOptions.map(([layer]) => `这是${layer}的典型趋势，但与当前探测点所在的${state.layer}不对应；先定位层界再选机制。`),
      chain: [`先用纬度修正对流层顶高度（本模拟约 ${state.tropopause.toFixed(1)} km），再确定探测点所在层。`, '再看该层温度垂直趋势：对流层递减、平流层递增、中间层递减、热层递增。', '趋势由各层主要能量过程决定，不是简单由“离太阳远近”决定。'],
      trap: '高空温度高不代表空气含有很多热量；热层分子稀少，温度是分子平均动能指标。',
    }
  }
  if (id === 6) {
    const state = thermalState(v)
    const cases = [
      '海风：白天陆地升温快，陆上近地气压较低，风由海洋吹向陆地。',
      '陆风：夜晚陆地降温快，陆上近地气压较高，风由陆地吹向海洋。',
      '谷风：白天坡面受热，坡面空气上升，近地空气沿谷地上坡。',
      '山风：夜晚坡面冷却，冷空气沿坡下沉，近地空气由坡地流向谷地。',
    ]
    const answer = (state.mountain ? 2 : 0) + (state.night ? 1 : 0)
    return {
      title: '热力环流 · 从温差推风向',
      stem: `情境：${v.surface}、${v.time}，云量 ${v.cloud}%。哪一条“受热差异 → 气压差 → 近地面风向”链条与当前模拟一致？`,
      options: cases,
      answer,
      distractors: cases.map((_,index)=>index===answer?'':`该选项描述另一种昼夜—下垫面组合；当前条件是${v.time}的${v.surface}，应先按本地升降温快慢判断高低压。`),
      chain: [state.mountain ? (state.night ? '夜间坡面辐射冷却快，冷空气沿坡下沉。' : '白天山坡受热，坡面空气增温上升，谷地近地空气补入并沿坡上升。') : (state.night ? '夜间陆地比海洋降温快，陆上冷空气密度较大、近地气压较高。' : '白天陆地比海洋升温快，陆上空气受热上升、近地气压较低。'), '近地风由相对高压流向相对低压；高空出现反向补偿气流，构成闭合环流。', `云量使本次温差估值降至约 ${state.contrast.toFixed(1)}°C，会削弱热力驱动力，但不能单独决定风向。`],
      trap: '先判断“哪一侧更热、哪一侧气压更低”，再判风向；不要只背海风/陆风名称。',
    }
  }
  if (id === 7) {
    const current = runoffState(v)
    const comparison = runoffState({ ...v, urban: Math.min(100, Number(v.urban) + 35) })
    return {
      title: '流域洪峰 · 排除“降水总量决定一切”',
      stem: `同一场雨（${current.rain} mm/h）、植被覆盖不变（${v.vegetation}%），把流域不透水面从 ${v.urban}% 增加到 ${Math.min(100, Number(v.urban) + 35)}%。模型估算地表径流由 ${current.runoff.toFixed(1)} 增至 ${comparison.runoff.toFixed(1)} mm/h。对洪水过程最稳妥的判断是：`,
      options: ['降水没变，洪峰流量与到达时间必然不变', '更多降水直接转为快速地表径流，洪峰往往增大且提前；但具体洪峰仍受流域形态和排水系统影响', '不透水面增加会提高下渗，洪峰减小并推迟', '只要植被覆盖不变，城市化对产流没有影响'],
      answer: 1,
      distractors: {0:'总降水量相同，但不透水率改变了入渗—径流分配和汇流速度。',2:'不透水面减少可入渗面积，通常降低入渗而非提高入渗。',3:'城市硬化本身改变下垫面，即使植被比例不变也会改变产流。'},
      chain: ['把降水量作为输入，先区分不透水面与可入渗地表的水量去向。', '不透水面扩大使入渗机会减少，更多水迅速进入河道；本模拟径流估值增加。', '再由汇流变快推断洪峰通常提前、变尖；不能忽略流域面积、坡度、土壤和管网等条件。'],
      trap: '“降水总量相同”不代表洪水过程相同：选择题常考水量分配和汇流时间。',
    }
  }
  if (id === 8) {
    const state = oceanState(v)
    return {
      title: '海水密度 · 综合控制因子',
      stem: `当前探针：${v.latitude}°、${Number(v.depth).toLocaleString()} m，估算温度 ${state.temperature.toFixed(1)}°C、盐度 ${state.salinity.toFixed(2)}‰。同深度比较水团 A（当前读数）和水团 B（比 A 暖 2°C、淡 0.6‰），哪项判断正确？`,
      options: ['A 密度更大：低温和高盐都使海水密度增大', 'B 密度更大：升温和降盐都会使密度增大', '两者密度必相等，因为深度相同', '只凭温度就能判断，盐度对海水密度没有影响'],
      answer: 0,
      distractors: {1:'升温、降盐都使密度减小，选项把两个因果方向都说反了。',2:'相同深度只让压力近似相同，温度和盐度仍会造成密度差。',3:'盐度是密度的重要控制因素，不能从判断中删除。'},
      chain: ['比较时先固定深度，排除压力差异。', 'A 比 B 冷且咸：降温、增盐都会提高海水密度，两个作用同向。', '若温度和盐度作用相反，需比较变化幅度；不能只看一个因子。本模型对密度采用教学近似。'],
      trap: '深度相同只能说明压力近似相同，不代表温度、盐度造成的密度差消失。',
    }
  }
  const hemisphere = v.hemisphere || '北半球'
  const rotation = hemisphere === '北半球' ? '顺时针' : '逆时针'
  const tide = String(v.moon).includes('大潮') ? '大潮' : '小潮'
  return {
    title: '洋流与潮汐 · 拆分驱动机制',
    stem: `当前选择：${v.basin}、${hemisphere}、代表性风速 ${v.wind} m/s、${v.moon}。以下哪项同时正确解释大洋环流方向和潮差变化？`,
    options: [
      `风应力驱动表层水、地转偏向与海陆轮廓共同塑造${rotation}环流；${tide}由日月引潮力相对位置决定。`,
      '月相直接决定洋流顺逆，风只改变潮差大小。',
      '地转偏向力是大潮、小潮的成因，月球只决定洋流速度。',
      '风应力单独决定所有海流方向，半球和海陆轮廓都不影响。',
    ],
    answer: 0,
    distractors: {1:'月相决定潮差，不决定洋流的顺逆；风场与地转偏向参与环流。',2:'地转偏向改变流动方向，但大潮、小潮由日月引潮力叠加关系形成。',3:'风应力驱动表层环流，但地转偏向和海陆轮廓也会改变环流结构。'},
    chain: [`风应力驱动表层水，地转偏向使北半球环流总体顺时针、南半球总体逆时针；海陆轮廓会调整路径。`, '朔、望时日月近似成线，引潮力叠加形成大潮；上、下弦时方向近直角，形成小潮。', '洋流和潮汐驱动机制不同，不能把月相当作洋流方向的原因。'],
    trap: '洋流看风带、地转偏向和海陆轮廓；潮汐看日—地—月相对位置。',
  }
}

function getReasoningSummary(id, v, layerIndex) {
  if (id === 3) return `当前证据：${v.structure}；${strata[layerIndex].name}，${strata[layerIndex].fossil}；剥蚀缺失程度 ${v.erosion}%。${v.structure==='正常层序（未倒转）'?'可用叠置关系比较已保存岩层的先后，再用标准化石跨地点对比；不按层厚估算年代。':v.structure==='断层切割'?'切割关系说明断层晚于被切地层。':v.structure==='地层倒转'?'先用层理或化石判定地层顶底，再恢复新老方向。':'侵蚀面说明地质记录可能中断，不能由缺失厚度直接换算缺失时间。'}`
  if (id === 4) return `${v.wave}在 ${Number(v.depth).toLocaleString()} km 处的模拟状态：${Number(v.depth) >= 2900 ? (v.wave === 'S 波' ? '外核阻断横波' : '外核使纵波路径折射、速度改变') : '仍位于地核边界以上的固态圈层'}。证据链：波的类型与传播特征 → 介质性质变化 → 圈层推断；这里模拟的是教学化路径，不是精确地震射线图。`
  if (id === 5) { const a=atmosphereState(v);const trend=a.layer==='平流层'||a.layer==='热层'?'总体递增':'总体递减';return `${a.altitude} km、${v.latitude}°：${a.layer}，温度约 ${Math.round(a.temperature)}°C，温度随高度${trend}。判题先用纬度修正对流层顶（约 ${a.tropopause.toFixed(1)} km），再按该层能量过程解释趋势；空气密度仍随高度快速下降。` }
  if (id === 6) { const t=thermalState(v);return `${v.surface}、${v.time}、云量 ${v.cloud}%：温差估值约 ${t.contrast.toFixed(1)}°C，近地风为${t.nearSurface}。推理顺序：比热/冷却速度差 → 空气垂直运动与气压差 → 近地面风向 → 高空反向补偿。` }
  if (id === 7) { const r=runoffState(v);return `输入降水 ${r.rain} mm/h；模型给出下渗 ${r.infiltration.toFixed(1)}、地表径流 ${r.runoff.toFixed(1)} mm/h，二者合计守恒为降水输入。雨强超过入渗能力 ${r.infiltrationCapacity.toFixed(1)} mm/h 后，可入渗地表也开始产生超渗径流；前期土壤湿度 ${v.soilMoisture}% 和不透水面共同改变分配。实际洪峰还取决于汇流时间和流域形态。` }
  if (id === 8) { const o=oceanState(v);return `${v.latitude}°、${Number(v.depth).toLocaleString()} m：T≈${o.temperature.toFixed(1)}°C、S≈${o.salinity.toFixed(2)}‰、ρ≈${o.density.toFixed(4)} g/cm³（教学近似）。读题要拆分温度、盐度、压力：冷/咸/压力增大都倾向于提高密度，反向因素需比较强弱。` }
  const rotation=(v.hemisphere||'北半球')==='北半球'?'顺时针':'逆时针';const tide=String(v.moon).includes('大潮')?'大潮':'小潮';return `${v.basin}、${v.hemisphere||'北半球'}、风速 ${v.wind} m/s：模型中的大洋环流方向为${rotation}；当前${v.moon}对应${tide}。解题时分两条因果链：风应力＋地转偏向＋海陆轮廓解释洋流，日月相位解释潮差。${v.basin==='印度洋'?'北印度洋洋流受季风季节性影响，本示意不表示其季节性反转。':''}`
}

function ExamChallenge({ challenge, onComplete }) {
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const correct = selected === challenge.answer
  const distractorFeedback = challenge.distractors?.[selected] || '对照题干的条件与证据，检查是否把相关因素误当成充分条件，或推出了题干没有提供的信息。'
  return <section className="required-lab__exam">
    <div className="required-lab__exam-head"><div><span>应试推理训练 · 情境选择题</span><h2>{challenge.title}</h2></div><span className="required-lab__exam-tag">先证据，后结论</span></div>
    <p className="required-lab__exam-stem">{challenge.stem}</p>
    <div className="required-lab__exam-options">{challenge.options.map((option,index)=><button type="button" key={option} onClick={()=>{setSelected(index);setSubmitted(false)}} className={`${selected===index?'is-selected':''} ${submitted&&index===challenge.answer?'is-correct':''} ${submitted&&selected===index&&!correct?'is-wrong':''}`}><b>{String.fromCharCode(65+index)}</b><span>{option}</span></button>)}</div>
    <div className="required-lab__exam-actions"><span>{submitted?(correct?'判断正确，看看证据链。':'再对照题干证据，看看哪一步推断越界了。'):'先选出最稳妥的结论，再展开推理链。'}</span><button type="button" disabled={selected===null} onClick={()=>{setSubmitted(true);if(correct)onComplete()}}>核对推理</button></div>
    {submitted&&<div className={`required-lab__exam-feedback ${correct?'is-correct':'is-wrong'}`}><div><strong>{correct?'推理成立':'这项推断站不住'}</strong><p>{correct?challenge.trap:distractorFeedback}</p></div><ol>{challenge.chain.map((step,index)=><li key={step}><b>0{index+1}</b><span>{step}</span></li>)}</ol></div>}
  </section>
}

export default function RequiredLab({ id }) {
  const lab = labs[id]
  const [values, setValue, resetValues] = useLabValues(lab)
  const [layerIndex, setLayerIndex] = useState(2)
  const [labMode, setLabMode] = useState('radiation')
  const [running, setRunning] = useState(true)
  const [completed, setCompleted] = useState(false)
  const metrics = useMemo(() => deriveMetrics(id, values, layerIndex, labMode), [id, values, layerIndex, labMode])
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('geosim:experiment-state', { detail: { experimentId: `required-${String(id).padStart(2, '0')}`, values, metrics, summary: lab.insight } }))
  }, [id, values, metrics, lab.insight, labMode])
  const activeControls = id === 2
    ? lab.controls.filter((control) => labMode === 'radiation' ? control.id !== 'activity' : control.id === 'activity')
    : id === 3
      ? lab.controls.filter((control) => control.id !== 'erosion' || values.structure === '侵蚀不整合')
      : lab.controls
  const selectedStratum = strata[layerIndex]
  const solarResult = id === 2 ? solarRadiationModel(values.latitude, values.season, values.cloud) : null
  const insightText = id === 2
    ? labMode === 'radiation'
      ? `φ=${values.latitude}°，δ=${values.season}°；正午太阳高度 h=90°−|φ−δ|=${Math.round(solarResult.noonAltitude)}°，昼长约 ${solarResult.daylightHours.toFixed(1)} 小时。日辐射指数按白昼内太阳入射角积分估算；云量 ${values.cloud}% 再作为简化的大气削弱项。`
      : `太阳活动指数为 ${values.activity}/100。耀斑和日冕物质抛射增强时，高能粒子与地球磁层、电离层相互作用，可影响极光和无线电通信；它不是季节性地表日照变化的解释。`
    : getReasoningSummary(id, values, layerIndex)
  const controlInsight = id === 2
    ? labMode === 'radiation'
      ? `此地正午太阳高度 ${Math.round(solarResult.noonAltitude)}°，昼长 ${solarResult.daylightHours.toFixed(1)} 小时，日辐射相对值 ${solarResult.dailyIndex}。`
      : Number(values.activity) > 65 ? '活动增强：磁层和极区电离层响应更明显。' : '活动较弱：极光与通信扰动信号较弱。'
    : id === 3 ? `当前结构：${values.structure}。${values.structure==='断层切割'?'切割关系可判定断层晚于被切岩层。':values.structure==='侵蚀不整合'?'侵蚀面提示地层记录中断。':values.structure==='地层倒转'?'先判地层顶底，再判断新老。':'可在未变形条件下检验叠置规律。'}`
      : id === 4 ? `${values.wave} · ${Number(values.depth)>=2900?'到达外核边界后需考虑液态外核证据':'当前深度仍在地幔范围内'}。`
        : id === 5 ? `${atmosphereState(values).layer}温度趋势应结合该层的主要能量来源判断。`
          : id === 6 ? `云量会削弱温差估值；先判断受热差异，再沿“气压差→近地风”推理。`
            : id === 7 ? `雨强 ${values.rain} mm/h；前期土壤越湿、硬化面越多，入渗空间越小。`
              : id === 8 ? `当前密度约 ${oceanState(values).density.toFixed(4)} g/cm³；冷、咸、压力增大都倾向于增密。`
                : `${values.hemisphere}环流${values.hemisphere==='北半球'?'顺':'逆'}时针；潮汐大小由日月相位决定。`
  const updateValue = (control, rawValue) => {
    const value = control.options ? rawValue : Number(rawValue)
    setValue(control.id, value)
    if (id === 3 && control.id === 'depth') setLayerIndex(Math.min(strata.length - 1, Math.max(0, Number(value) - 1)))
  }
  const selectLayer = (index) => {
    setLayerIndex(index)
    setValue('depth', Math.max(Number(values.depth), index + 1))
  }

  return <main className="required-lab">
    <header className="required-lab__topbar"><Link to="/" className="required-lab__back">← <span>必修一实验</span></Link><div className="required-lab__top-title"><span>必修一 · 实验 {String(id).padStart(2,'0')}</span><strong>{lab.title}</strong></div><span className="required-lab__status"><i/>{running?'模拟运行中':'模拟已暂停'}</span></header>
    <div className="required-lab__layout">
      <aside className="required-lab__rail"><div className="required-lab__chapter">{lab.chapter}</div><div className="required-lab__question"><span>本次探究</span><h1>{lab.question}</h1><p>{lab.objective}</p></div><div className="required-lab__steps"><span>探究路径</span><ol><li className="is-active"><b>01</b><span>提出问题</span></li><li className="is-active"><b>02</b><span>调整变量</span></li><li className={completed?'is-active':''}><b>03</b><span>解释结果</span></li></ol></div><div className="required-lab__rail-tip"><span>实验提示</span><p>每次只改变一个条件，观察画面和数据如何响应，再解释其中的地理过程。</p></div></aside>
      <section className="required-lab__workspace">
        <div className="required-lab__scene-head"><div><span>交互模拟 · 实验台</span><h2>{lab.title}</h2></div>{id===2&&<div className="required-lab__mode-switch" role="tablist" aria-label="太阳影响类型"><button type="button" role="tab" aria-selected={labMode==='radiation'} className={labMode==='radiation'?'is-active':''} onClick={()=>setLabMode('radiation')}>辐射分布</button><button type="button" role="tab" aria-selected={labMode==='activity'} className={labMode==='activity'?'is-active':''} onClick={()=>setLabMode('activity')}>太阳活动</button></div>}<div className="required-lab__scene-actions"><button type="button" onClick={()=>setRunning(!running)} aria-label={running?'暂停模拟':'播放模拟'}>{running?'Ⅱ':'▶'}</button><button type="button" onClick={()=>{resetValues();setLayerIndex(2);setCompleted(false);setRunning(true);setLabMode('radiation')}} aria-label="重置实验">↻</button></div></div>
        <div className={`required-lab__scene required-lab__scene--${id} ${running?'':'is-paused'}`}><LabScene id={id} values={values} layerIndex={layerIndex} onLayer={selectLayer} mode={labMode} onLatitude={(latitude)=>setValue('latitude',latitude)}/></div>
        {id===2&&labMode==='radiation'&&<div className="required-lab__latitude-compare"><span>快速比较观测纬度</span>{[0,30,60,-30].map((latitude)=>{const result=solarRadiationModel(latitude,values.season,values.cloud);return <button type="button" key={latitude} className={Number(values.latitude)===latitude?'is-active':''} onClick={()=>setValue('latitude',latitude)}><b>{latitude===0?'赤道':`${Math.abs(latitude)}°${latitude>0?'N':'S'}`}</b><small>h {Math.round(result.noonAltitude)}° · {result.daylightHours.toFixed(1)}h</small></button>})}</div>}
        {id===2&&labMode==='radiation'&&<div className="required-lab__season-compare"><span>快速比较季节</span>{[{label:'春分 / 秋分',value:0},{label:'北半球夏至',value:23.5},{label:'北半球冬至',value:-23.5}].map((season)=><button type="button" key={season.value} className={Number(values.season)===season.value?'is-active':''} onClick={()=>setValue('season',season.value)}>{season.label}<small>δ {season.value>0?'+':''}{season.value}°</small></button>)}</div>}
        {id===3&&<div className="required-lab__stratum-detail"><span style={{'--layer-color':selectedStratum.color}}/><div><b>{selectedStratum.name}</b><small>{selectedStratum.age} · 化石线索：{selectedStratum.fossil}</small></div><button type="button" onClick={()=>selectLayer((layerIndex+1)%strata.length)}>向下继续挖掘 →</button></div>}
        <div className="required-lab__metrics">{metrics.map((metric)=><article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}<article className="required-lab__metric-note"><span>实验状态</span><strong>{completed?'已形成解释':'等待你的观察'}</strong></article></div>
        <div className="required-lab__bottom"><div><span>{id===2?'解题推理':'关键关系'}</span><p>{insightText}</p></div><button type="button" onClick={()=>setCompleted(true)}>{completed?'已记录结论':'形成我的结论'} <span>→</span></button></div>
      </section>
      <aside className="required-lab__controls">
        <div className="required-lab__control-title"><span>模拟控制</span><h2>{id===2?(labMode==='radiation'?'辐射分布':'太阳活动'):'改变条件'}</h2><p>{id===2&&labMode==='activity'?'观察空间天气效应，不把它和地表日照混为一谈。':'改变一个条件，再比较画面与读数。'}</p></div>
        {activeControls.map((control)=><div key={control.id} className="required-lab__control">
          <div className="required-lab__control-label"><label htmlFor={`lab-${id}-${control.id}`}>{control.label}</label>{control.options?<select id={`lab-${id}-${control.id}`} value={values[control.id]} onChange={(event)=>updateValue(control,event.target.value)}>{control.options.map((option)=><option key={option}>{option}</option>)}</select>:<strong>{values[control.id]}{control.unit}</strong>}</div>
          {!control.options&&<input id={`lab-${id}-${control.id}`} type="range" min={control.min} max={control.max} step={control.step} value={values[control.id]} onChange={(event)=>updateValue(control,event.target.value)}/>}
          <small>{control.help}</small>{!control.options&&<div className="required-lab__range-labels"><span>{control.min}{control.unit}</span><span>{control.max}{control.unit}</span></div>}
        </div>)}
        {id===2&&labMode==='radiation'&&<div className="required-lab__formula"><span>读题抓这三项</span><strong>日总辐射 ∝ 白昼内入射角积分</strong><p>先由纬度和日期判断太阳高度、昼长，再比较日总辐射；云量是简化的大气削弱项。指数用于相对比较，不代表实测值。</p></div>}
        <div className="required-lab__control-insight"><span>{id===2?'当前判断':'解题观察点'}</span><p>{controlInsight}</p></div>
        <button type="button" className="required-lab__reset" onClick={()=>{resetValues();setLayerIndex(2);setCompleted(false);setRunning(true);setLabMode('radiation')}}>恢复本组初始条件</button>
      </aside>
    </div>
    {id>=3&&<ExamChallenge key={`${id}-${JSON.stringify(values)}-${layerIndex}`} challenge={createExamChallenge(id, values, layerIndex)} onComplete={()=>setCompleted(true)}/>}
  </main>
}
