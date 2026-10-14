import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './App.css'
import './components/journey/Journey.css'
import ExperimentCatalog from './components/journey/ExperimentCatalog'
import TeacherDashboard from './components/TeacherDashboard'
import RequiredOne from './components/experiments/RequiredOne'
import RequiredLab from './components/experiments/RequiredLab'
import ElectiveFive from './components/experiments/ElectiveFive'
import VolcanoModel from './components/experiments/VolcanoModel'
import ElectiveMasterLab from './components/elective/ElectiveMasterLab'

const DocModalContext = createContext(null)

function DocModalProvider({ children }) {
  const location = useLocation()
  const [docs, setDocs] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [quizState, setQuizState] = useState({})

  useEffect(() => {
    if (!location.pathname.startsWith('/experiments/')) {
      setDocs([])
      setActiveDoc(null)
      return
    }

    const readDocs = () => {
      const titles = ['课程痛点', '教学目标', '交互探究任务', '真题诊断', '🧪 真实地震波数据对比探究', '🧪 真实大气数据对比探究', '🧪 真实热力环流数据对比探究', '🧪 真实水量平衡数据对比探究', '🧪 真实海水性质数据对比探究', '🧪 真实洋流潮汐数据对比探究']
      const nextDocs = []
      document.querySelectorAll('.panel-block').forEach((block) => {
        const heading = block.querySelector('h2')
        if (!heading) return
        const title = heading.textContent?.trim()
        if (!title || !titles.includes(title)) return
        nextDocs.push({ title, html: block.innerHTML })
        block.style.display = 'none'
      })
      setDocs(nextDocs)
      setActiveDoc(null)
      setQuizState({})
    }

    const timer = window.setTimeout(readDocs, 0)
    return () => window.clearTimeout(timer)
  }, [location.pathname])

  const contextValue = useMemo(() => ({
    docs,
    activeDoc,
    setActiveDoc,
    quizState,
    setQuizState,
  }), [docs, activeDoc, quizState])

  const currentExperimentId = location.pathname.replace('/experiments/', '')

  return (
    <DocModalContext.Provider value={contextValue}>
      {children}
      {activeDoc ? (
        <div className="doc-modal" role="dialog" aria-modal="true" aria-label={activeDoc.title}>
          <button type="button" className="doc-modal__backdrop" aria-label="关闭弹窗" onClick={() => setActiveDoc(null)} />
          <div className="doc-modal__panel">
            <div className="doc-modal__head">
              <h2>{activeDoc.title}</h2>
              <button type="button" className="btn" onClick={() => setActiveDoc(null)}>关闭</button>
            </div>
            <div className="doc-modal__body">
              {activeDoc.title === '真题诊断' ? (
                <DiagnosticQuizPanel experimentId={currentExperimentId} quizState={quizState} setQuizState={setQuizState} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: activeDoc.html }} />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </DocModalContext.Provider>
  )
}

function ExperimentDocsBar() {
  const { docs, setActiveDoc } = useContext(DocModalContext)

  if (!docs || docs.length === 0) {
    return null
  }

  return (
    <div className="exp-docs-bar">
      <span className="exp-docs-bar__title">实验说明</span>
      <div className="exp-docs-bar__actions">
        {docs.map((doc) => (
          <button key={doc.title} type="button" className="doc-chip" onClick={() => setActiveDoc(doc)}>
            {doc.title}
          </button>
        ))}
      </div>
    </div>
  )
}

function ExperimentDocsShell() {
  return null
}

const InfoModalContext = createContext(null)

function InfoModalProvider({ children }) {
  const [infoModal, setInfoModal] = useState(null)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && infoModal) {
        setInfoModal(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [infoModal])

  const openInfo = (title, content) => {
    setInfoModal({ title, content })
  }

  const closeInfo = () => {
    setInfoModal(null)
  }

  return (
    <InfoModalContext.Provider value={{ infoModal, openInfo, closeInfo }}>
      {children}
      {infoModal && (
        <div className="info-modal" role="dialog" aria-modal="true" aria-label={infoModal.title}>
          <div className="info-modal__backdrop" onClick={closeInfo} />
          <div className="info-modal__panel">
            <div className="info-modal__head">
              <h2>{infoModal.title}</h2>
              <button type="button" className="btn" onClick={closeInfo}>关闭</button>
            </div>
            <div className="info-modal__body">
              {infoModal.content}
            </div>
          </div>
        </div>
      )}
    </InfoModalContext.Provider>
  )
}

const requiredExperiments = [
  {
    id: 1,
    title: '必修一 实验 1：地球的宇宙环境',
    subtitle: '宇宙层级尺度与行星宜居性探究',
    path: '/experiments/required-01',
  },
  {
    id: 2,
    title: '必修一 实验 2：太阳对地球的影响',
    subtitle: '太阳辐射分布与太阳活动效应',
    path: '/experiments/required-02',
  },
  {
    id: 3,
    title: '必修一 实验 3：地层挖掘与地质年代复原',
    subtitle: '地质年代表与化石证据推断',
    path: '/experiments/required-03',
  },
  {
    id: 4,
    title: '必修一 实验 4：地球的圈层结构',
    subtitle: '地壳—地幔—地核构造与物质交换',
    path: '/experiments/required-04',
  },
  {
    id: 5,
    title: '必修一 实验 5：大气成分与垂直分层',
    subtitle: '大气层结构、成分与能量交换',
    path: '/experiments/required-05',
  },
  {
    id: 6,
    title: '必修一 实验 6：大气能量收支与热力环流',
    subtitle: '热力环流、风向偏转与能量平衡',
    path: '/experiments/required-06',
  },
  {
    id: 7,
    title: '必修一 实验 7：水循环过程与水量平衡',
    subtitle: '水循环路径、人类活动与水量平衡',
    path: '/experiments/required-07',
  },
  {
    id: 8,
    title: '必修一 实验 8：海水性质分布仿真',
    subtitle: '温度、盐度、密度与垂直分层',
    path: '/experiments/required-08',
  },
  {
    id: 9,
    title: '必修一 实验 9：洋流分布与海浪潮汐',
    subtitle: '洋流环流、海浪潮汐与 ENSO 对比',
    path: '/experiments/required-09',
  },
]

const electiveExperiments = [
  {
    id: 1,
    title: '选修一 实验 1：时空穿梭者',
    subtitle: '地球运动与方位角仿真',
    path: '/experiments/elective-01',
  },
  {
    id: 2,
    title: '选修一 实验 2：气压带与风带',
    subtitle: '三圈环流与季风动态仿真',
    path: '/experiments/elective-02',
  },
  {
    id: 3,
    title: '选修一 实验 3：锋面系统与气旋模拟',
    subtitle: '冷锋/暖锋/气旋形成与降水机制',
    path: '/experiments/elective-03',
  },
  {
    id: 4,
    title: '选修一 实验 4：构造运动与地貌演化',
    subtitle: '褶皱断层 · 抬升沉降 · 地貌演变',
    path: '/experiments/elective-04',
  },
  {
    id: 5,
    title: '选修一 实验 5：流水地貌与侵蚀沉积',
    subtitle: 'V 形谷 · 曲流 · 冲积扇演化',
    path: '/experiments/elective-05',
  },
  {
    id: 6,
    title: '选修一 实验 6：地震与火山灾害',
    subtitle: '地震波传播 · 火山喷发机制',
    path: '/experiments/elective-06',
  },
  {
    id: 7,
    title: '选修一 实验 7：洋流与水循环过程',
    subtitle: '洋流环流 · ENSO · 区域水量平衡',
    path: '/experiments/elective-07',
  },
]

const waterCycleStages = [
  {
    id: 'evaporation',
    name: '蒸发/蒸腾',
    summary: '海洋与陆地水分蒸发，植被蒸腾补给水汽。',
    detail: '海洋蒸发占比最高，植被覆盖越高，蒸腾越显著。',
  },
  {
    id: 'transport',
    name: '水汽输送',
    summary: '大气环流输送水汽至内陆。',
    detail: '风带和季风决定水汽输送路径，内陆距离越远，水汽越难到达。',
  },
  {
    id: 'precip',
    name: '降水',
    summary: '水汽凝结成雨雪补给地表与地下水。',
    detail: '地形抬升与对流强度影响降水强度与空间分布。',
  },
  {
    id: 'runoff',
    name: '地表径流',
    summary: '雨水汇流入河入海，形成地表径流。',
    detail: '地表硬化或植被减少会增大地表径流与洪峰流量。',
  },
  {
    id: 'infiltration',
    name: '下渗',
    summary: '部分降水渗入土壤，补给地下水。',
    detail: '植被覆盖越高，下渗比例越大，地下水补给更稳定。',
  },
  {
    id: 'groundwater',
    name: '地下径流',
    summary: '地下水缓慢流向河流与海洋。',
    detail: '地下径流补给河流枯水期，保障基流。',
  },
]

const basinOptions = [
  {
    id: 'yangtze',
    name: '长江流域',
    base: { precip: 1150, inflow: 420, evap: 980 },
    note: '季风湿润区，外流河，来水充沛。',
  },
  {
    id: 'tarim',
    name: '塔里木河流域',
    base: { precip: 120, inflow: 180, evap: 310 },
    note: '内陆干旱区，内流河，蒸发强烈。',
  },
]

const humanActions = [
  {
    id: 'deforest',
    name: '砍伐森林',
    effect: '植被减少 → 蒸腾下降、下渗下降、地表径流上升。',
  },
  {
    id: 'reservoir',
    name: '修建水库',
    effect: '库区蒸发增强、下游径流延迟、洪峰削弱。',
  },
  {
    id: 'transfer',
    name: '跨流域调水',
    effect: '调入区水量上升，调出区水量紧张。',
  },
]

const waterCycleTasks = [
  {
    id: 'task-vegetation',
    title: '任务 1：植被覆盖率从 80% 降至 20%',
    detail: '观察地表径流与洪峰流量的变化，并总结水循环环节响应。',
  },
  {
    id: 'task-basin',
    title: '任务 2：对比长江与塔里木河水量平衡',
    detail: '读取水量盈亏信息，分析两地水资源差异的根本原因。',
  },
]

const waterCycleExamItems = [
  {
    id: 'exam-2023-shandong',
    source: '2023·山东卷·1-2题',
    stem:
      '植被覆盖率对水循环环节有重要影响。图示为某流域植被破坏前后水循环变化示意图。',
    questions: [
      {
        id: 'q1',
        stem: '植被覆盖率降低后，下列水循环环节变化正确的是（ ）',
        options: ['A. 蒸发量增加', 'B. 下渗量增加', 'C. 地表径流增加', 'D. 地下径流增加'],
        answer: 'C',
        explanation: '植被减少削弱下渗，增大地表径流。',
      },
      {
        id: 'q2',
        stem: '植被破坏后，该流域易发生的自然灾害是（ ）',
        options: ['A. 干旱', 'B. 洪涝', 'C. 台风', 'D. 寒潮'],
        answer: 'B',
        explanation: '地表径流与洪峰增大，洪涝风险上升。',
      },
    ],
  },
  {
    id: 'exam-2021-guojia',
    source: '2021·全国甲卷·1-2题',
    stem: '塔里木河是我国最大的内流河，流域气候干旱，水资源短缺。',
    questions: [
      {
        id: 'q3',
        stem: '塔里木河流域水循环的主要类型是（ ）',
        options: ['A. 海陆间循环', 'B. 陆地内循环', 'C. 海上内循环', 'D. 大循环'],
        answer: 'B',
        explanation: '内陆干旱区以内陆水循环为主。',
      },
      {
        id: 'q4',
        stem: '塔里木河水量减少的主要人为原因是（ ）',
        options: ['A. 气候变暖，蒸发增强', 'B. 上游过度引水灌溉', 'C. 降水减少，补给不足', 'D. 河道淤积，排水不畅'],
        answer: 'B',
        explanation: '上游引水灌溉导致下游来水减少。',
      },
    ],
  },
]

const oceanBasins = [
  {
    id: 'pacific',
    name: '太平洋',
    baseTemp: 24,
    baseSalinity: 34.2,
    note: '面积最大，赤道暖水与副热带蒸发带并存。',
  },
  {
    id: 'atlantic',
    name: '大西洋',
    baseTemp: 23,
    baseSalinity: 35.4,
    note: '副热带盐度偏高，受径流与北大西洋暖流影响明显。',
  },
  {
    id: 'indian',
    name: '印度洋',
    baseTemp: 25,
    baseSalinity: 34.8,
    note: '季风显著，蒸发强，北部盐度季节变化大。',
  },
]

const currentOptions = [
  { id: 'warm', label: '暖流' },
  { id: 'cold', label: '寒流' },
  { id: 'neutral', label: '中性' },
]

const marineLayers = [
  { id: 'mixed', label: '表层混合层', depth: '0~100 m', note: '温度盐度受大气影响强烈。' },
  { id: 'thermo', label: '温跃层', depth: '100~1000 m', note: '温度快速下降，形成明显梯度。' },
  { id: 'deep', label: '深层水', depth: '>1000 m', note: '性质稳定、变化缓慢。' },
]

const marineTasks = [
  {
    id: 'task-salinity',
    title: '对比赤道海区与副热带海区的盐度差异',
    detail: '将纬度切换至 0° 与 25°，记录盐度变化并解释蒸发量与降水量关系。',
  },
  {
    id: 'task-baltic-red',
    title: '观察波罗的海与红海的盐度差异',
    detail: '模拟“高径流/低蒸发”与“低径流/高蒸发”情景，解释盐度极端差异成因。',
  },
]

const marineExamItems = [
  {
    id: 'exam-2022-zhejiang',
    source: '2022·浙江卷·1-2题',
    stem: '海水盐度受纬度、降水、蒸发、径流等因素影响。图示为全球海洋表层盐度分布示意图。',
    questions: [
      {
        id: 'q1',
        stem: '副热带海区盐度最高的主要原因是（ ）',
        options: ['A. 纬度低，气温高', 'B. 蒸发量大于降水量', 'C. 径流注入少', 'D. 海域封闭'],
        answer: 'B',
        explanation: '副热带高压控制，蒸发强于降水，盐度升高。',
      },
      {
        id: 'q2',
        stem: '波罗的海盐度低的主要原因是（ ）',
        options: ['A. 纬度高，蒸发弱', 'B. 降水丰富', 'C. 径流注入多', 'D. 以上都是'],
        answer: 'D',
        explanation: '高纬蒸发弱、降水和径流补给多，盐度显著偏低。',
      },
    ],
  },
  {
    id: 'exam-2020-guo1',
    source: '2020·全国Ⅰ卷·1-2题',
    stem: '海水温度随深度增加而降低，但在一定深度后变化不大。',
    questions: [
      {
        id: 'q3',
        stem: '海水温度垂直变化最显著的水层是（ ）',
        options: ['A. 表层', 'B. 温跃层', 'C. 深层', 'D. 底层'],
        answer: 'B',
        explanation: '温跃层温度随深度快速下降，梯度最显著。',
      },
      {
        id: 'q4',
        stem: '影响海水温度水平分布的主要因素是（ ）',
        options: ['A. 太阳辐射', 'B. 洋流', 'C. 海陆分布', 'D. 海水运动'],
        answer: 'A',
        explanation: '纬度导致太阳辐射差异，是表层温度水平分布主因。',
      },
    ],
  },
]

const marineBioSamples = [
  { id: 'coral', name: '珊瑚礁', tempRange: [22, 30], salRange: [33, 36] },
  { id: 'plankton', name: '浮游生物', tempRange: [4, 26], salRange: [32, 36] },
  { id: 'fish', name: '鱼群', tempRange: [8, 28], salRange: [32, 35.5] },
]

const oceanCurrents = [
  {
    id: 'kuroshio',
    name: '北赤道暖流 → 黑潮',
    basin: '太平洋',
    type: 'warm',
    strength: 5,
    latBand: '中低纬环流',
    note: '西岸暖流，携带高温高盐水，增温增湿。',
  },
  {
    id: 'california',
    name: '加利福尼亚寒流',
    basin: '太平洋',
    type: 'cold',
    strength: 3,
    latBand: '中低纬环流',
    note: '东岸寒流，上升补偿流显著，易形成渔场。',
  },
  {
    id: 'gulf',
    name: '墨西哥湾流',
    basin: '大西洋',
    type: 'warm',
    strength: 6,
    latBand: '中高纬环流',
    note: '北大西洋暖流核心，影响欧洲西部气候。',
  },
  {
    id: 'labrador',
    name: '拉布拉多寒流',
    basin: '大西洋',
    type: 'cold',
    strength: 4,
    latBand: '中高纬环流',
    note: '北大西洋寒流，常与暖流交汇形成渔场。',
  },
  {
    id: 'benguela',
    name: '本格拉寒流',
    basin: '大西洋',
    type: 'cold',
    strength: 3,
    latBand: '中低纬环流',
    note: '南大西洋东岸寒流，沿岸干旱与上升流显著。',
  },
]

const windBelts = [
  { id: 'trades', name: '信风带', direction: '东 → 西', note: '驱动赤道暖流与赤道逆流。' },
  { id: 'westerlies', name: '西风带', direction: '西 → 东', note: '驱动中高纬暖流向东流动。' },
]

const tideModes = [
  {
    id: 'spring',
    name: '大潮',
    description: '月球、太阳、地球几乎成一直线，引潮力叠加。',
    tideRange: 6.5,
  },
  {
    id: 'neap',
    name: '小潮',
    description: '日月引潮力相互抵消，潮差减小。',
    tideRange: 3.2,
  },
]

const ensoModes = [
  {
    id: 'normal',
    name: '正常年',
    eastTemp: 24,
    westTemp: 29,
    current: '信风增强，暖水堆积西太',
    rain: '西太平洋对流旺盛，东太偏干',
  },
  {
    id: 'el-nino',
    name: '厄尔尼诺年',
    eastTemp: 28,
    westTemp: 27,
    current: '信风减弱，暖水东移',
    rain: '东太平洋降水异常偏多',
  },
  {
    id: 'la-nina',
    name: '拉尼娜年',
    eastTemp: 22,
    westTemp: 30,
    current: '信风增强，上升流加强',
    rain: '西太平洋降水偏多，东太偏干',
  },
]

const waveExamples = [
  { id: 'low', label: '微风浪', windSpeed: 4, duration: 3, fetch: 100, height: 0.6 },
  { id: 'moderate', label: '中等浪', windSpeed: 10, duration: 8, fetch: 300, height: 2.2 },
  { id: 'storm', label: '风暴浪', windSpeed: 18, duration: 16, fetch: 600, height: 5.1 },
]


const requiredNineExamItems = [
  {
    id: 'exam-2023-guangdong',
    source: '2023·广东卷·1-2题',
    stem: '洋流对沿岸气候、渔场形成有重要影响。图示为世界某海域洋流分布示意图。',
    questions: [
      {
        id: 'q1',
        stem: '图中甲洋流按性质属于（ ）',
        options: ['A. 暖流', 'B. 寒流', 'C. 季风洋流', 'D. 补偿流'],
        answer: 'B',
        explanation: '冷色箭头对应寒流，沿岸海温偏低。',
      },
      {
        id: 'q2',
        stem: '该洋流对沿岸气候的影响是（ ）',
        options: ['A. 增温增湿', 'B. 降温减湿', 'C. 增温减湿', 'D. 降温增湿'],
        answer: 'B',
        explanation: '寒流沿岸气温下降、蒸发弱，空气较干燥。',
      },
    ],
  },
  {
    id: 'exam-2021-shandong',
    source: '2021·山东卷·1-2题',
    stem: '厄尔尼诺现象是太平洋赤道地区海水温度异常升高的现象。',
    questions: [
      {
        id: 'q1',
        stem: '厄尔尼诺年份，太平洋赤道东岸（ ）',
        options: ['A. 海水温度降低', 'B. 降水减少', 'C. 海水温度升高', 'D. 干旱加剧'],
        answer: 'C',
        explanation: '暖水东移，东太平洋海温异常升高。',
      },
      {
        id: 'q2',
        stem: '厄尔尼诺现象对我国气候的影响可能是（ ）',
        options: ['A. 南方降水增多', 'B. 北方降水增多', 'C. 全国普遍干旱', 'D. 全国普遍多雨'],
        answer: 'A',
        explanation: '厄尔尼诺年西太平洋对流减弱，夏季风减弱，南方降水偏多。',
      },
    ],
  },
]

const frontStageLabels = ['锋前暖湿', '锋面抬升', '锋面过境', '锋后转晴']

const frontStageDetails = [
  {
    title: '锋前暖湿',
    detail: '暖湿气流在锋前堆积，气温偏高、气压偏低，云量开始增多。',
  },
  {
    title: '锋面抬升',
    detail: '暖空气沿锋面爬升冷空气，形成层状云系和持续降水。',
  },
  {
    title: '锋面过境',
    detail: '冷空气推进，气温骤降、气压上升，风向突变，降水最强。',
  },
  {
    title: '锋后转晴',
    detail: '冷干气团控制，云量减少，气压较高，能见度提升。',
  },
]

const frontScenarios = [
  {
    id: 'cold',
    name: '冷锋过境',
    summary: '冷气团推进抬升暖湿空气，锋前增温增湿，过境后降温转晴。',
    warmTemp: 28,
    coldTemp: 10,
    tempCurve: [26, 24, 16, 12],
    pressureCurve: [1002, 1005, 1012, 1018],
    windCurve: ['偏南风', '偏南风', '转西北风', '西北风'],
    rainCurve: ['无降水', '小雨', '强阵雨', '转晴'],
  },
  {
    id: 'warm',
    name: '暖锋过境',
    summary: '暖气团爬升入侵冷空气，锋前阴雨，过境后升温转暖。',
    warmTemp: 26,
    coldTemp: 8,
    tempCurve: [10, 12, 18, 22],
    pressureCurve: [1018, 1014, 1008, 1006],
    windCurve: ['偏东风', '偏东风', '转南风', '南风'],
    rainCurve: ['持续阴雨', '小雨', '雨带减弱', '转多云'],
  },
  {
    id: 'cyclone',
    name: '温带气旋',
    summary: '低压中心生成并发展，冷暖锋绕低压旋转，形成逗点云系与降水带。',
    warmTemp: 24,
    coldTemp: 6,
    tempCurve: [20, 18, 14, 10],
    pressureCurve: [1008, 1002, 998, 1004],
    windCurve: ['偏南风', '东南风', '西南风', '西北风'],
    rainCurve: ['降水增多', '强降水', '持续降水', '逐渐减弱'],
  },
]


const frontExamItems = [
  {
    id: 'exam-nanchang',
    source: '2024·江西南昌期末·1-3题',
    stem: '某天气系统由西北向东南移动，先后控制武汉和南昌。',
    table: [
      { city: '武汉', day5: '雨，6～9℃', day6: '晴，3～10℃', day7: '晴，3～11℃' },
      { city: '南昌', day5: '晴，10～18℃', day6: '晴，10～18℃', day7: '雨，7～10℃' },
    ],
    questions: [
      {
        id: 'q1',
        stem: '该天气系统是（ ）',
        options: ['A. 冷锋', 'B. 暖锋', 'C. 气旋', 'D. 反气旋'],
        answer: 'A',
      },
      {
        id: 'q2',
        stem: '该天气系统前沿位于南昌与武汉之间的日期是（ ）',
        options: ['A. 仅 5 日', 'B. 仅 6 日', 'C. 5～6 日', 'D. 5～7 日'],
        answer: 'B',
      },
      {
        id: 'q3',
        stem: '7 日南昌日温差较小的原因是（ ）',
        options: ['A. 风力大', 'B. 气压低', 'C. 云量多', 'D. 湿度小'],
        answer: 'C',
      },
    ],
  },
  {
    id: 'exam-system',
    source: '概念诊断题',
    stem: '气温降低、气压升高可能受哪种天气系统影响？',
    questions: [
      {
        id: 'q4',
        stem: '气温降低、气压升高的天气变化更可能对应（ ）',
        options: ['A. 冷锋过境', 'B. 暖锋过境', 'C. 气旋中心', 'D. 赤道低压'],
        answer: 'A',
      },
    ],
  },
]

const tectonicScenarios = [
  {
    id: 'compress',
    name: '水平挤压（褶皱造山）',
    force: '挤压增强',
    relief: '地壳加厚，形成褶皱山脉',
    note: '印度板块北移与欧亚板块碰撞形成喜马拉雅。',
    uplift: 85,
    upliftLabel: '强烈抬升',
  },
  {
    id: 'stretch',
    name: '水平拉张（裂谷扩张）',
    force: '张裂增强',
    relief: '地壳变薄，出现裂谷与海盆',
    note: '红海与东非裂谷属于张裂型构造地貌。',
    uplift: 35,
    upliftLabel: '轻微抬升',
  },
  {
    id: 'subside',
    name: '沉降盆地（海侵沉积）',
    force: '沉降增强',
    relief: '盆地下降，沉积加厚',
    note: '海侵 → 沉积 → 抬升记录地貌演化序列。',
    uplift: 10,
    upliftLabel: '沉降主导',
  },
]

const faultTypes = [
  {
    id: 'normal',
    name: '正断层',
    stress: '张裂作用',
    motion: '上盘下降，地堑/裂谷形成',
  },
  {
    id: 'reverse',
    name: '逆断层',
    stress: '挤压作用',
    motion: '上盘上升，山地抬升',
  },
  {
    id: 'strike',
    name: '走滑断层',
    stress: '剪切作用',
    motion: '两盘水平错动',
  },
]

const tectonicStages = [
  { id: 'ocean', name: '海洋沉积', note: '浅海沉积物持续累积。', elevation: 10 },
  { id: 'fold', name: '褶皱挤压', note: '地层受挤压起伏褶皱。', elevation: 45 },
  { id: 'uplift', name: '快速抬升', note: '山脉隆起，形成高原。', elevation: 80 },
  { id: 'erosion', name: '侵蚀切割', note: '河流下切形成峡谷。', elevation: 65 },
]


const tectonicExamItems = [
  {
    id: 'tectonic-quiz',
    source: '板块构造诊断题',
    questions: [
      {
        id: 'q1',
        stem: '红海在不断（ ），原因是板块（ ）',
        options: ['A. 扩张，挤压', 'B. 扩张，张裂', 'C. 缩小，挤压', 'D. 缩小，张裂'],
        answer: 'B',
      },
      {
        id: 'q2',
        stem: '地中海在不断（ ），原因是板块（ ）',
        options: ['A. 扩张，张裂', 'B. 扩张，挤压', 'C. 缩小，挤压', 'D. 缩小，张裂'],
        answer: 'C',
      },
      {
        id: 'q3',
        stem: '板块构造学说的基础是（ ）',
        options: ['A. 板块静止说', 'B. 海底扩张说', 'C. 大陆漂移说', 'D. 深海钻探说'],
        answer: 'C',
      },
      {
        id: 'q4',
        stem: '世界主要的火山地震带是（ ）',
        options: ['A. 环太平洋地带、地中海—喜马拉雅带', 'B. 东非裂谷、北极圈', 'C. 赤道低压带、信风带', 'D. 阿尔卑斯—喀尔巴阡带、北大西洋带'],
        answer: 'A',
      },
      {
        id: 'q5',
        stem: '喜马拉雅山脉的形成是（ ）',
        options: ['A. 太平洋板块俯冲欧亚板块', 'B. 印度板块与欧亚板块碰撞挤压', 'C. 非洲板块张裂形成裂谷', 'D. 南极板块俯冲南美板块'],
        answer: 'B',
      },
    ],
  },
]

const riverExamItems = [
  {
    id: 'river-quiz',
    source: '流水地貌诊断题',
    questions: [
      {
        id: 'river-q1',
        stem: '某山前冲积扇扇顶沉积物粒径较粗、扇缘较细，且扇顶河道多次改道。最能解释这一组合的是（ ）',
        options: ['A. 出山后坡降减小、流速降低，粗颗粒先沉积；河道摆动使沉积扇不断展宽', 'B. 扇顶坡降最大、流速最快，因此细颗粒先沉积并固定河道', 'C. 扇缘流量最大、搬运能力最强，因此砾石集中在扇缘', 'D. 扇形主要由山体崩塌形成，与河流搬运和沉积无关'],
        answer: 'A',
      },
      {
        id: 'river-q2',
        stem: '某河段纵剖面突然变陡，陡坎上游河床高程逐渐降低；两侧保留多级河流阶地。若下游侵蚀基准面下降，最合理的过程顺序是（ ）',
        options: ['A. 下游先淤积抬高 → 陡坎向下游移动 → 旧河漫滩被掩埋', 'B. 下游落差增大 → 陡坎溯源传播 → 河床下切并使旧河漫滩脱离洪水位', 'C. 河流流量减小 → 侧蚀突然增强 → 阶地在河道中部堆积', 'D. 植被增加 → 坡面侵蚀增强 → 河流阶地同步形成'],
        answer: 'B',
      },
      {
        id: 'river-q3',
        stem: '某河段流量基本稳定，工程使上游来沙显著减少；河道随后出现河床下切和岸坡坍塌。该现象说明（ ）',
        options: ['A. 输沙能力大于来沙量时，河流可能通过侵蚀河床和河岸补充泥沙', 'B. 流量稳定时河道不会发生变化', 'C. 来沙减少必然使河床淤积', 'D. 河岸坍塌只由植被变化造成，与河床冲刷无关'],
        answer: 'A',
      },
      {
        id: 'river-q4',
        stem: '平原河流弯道处，凹岸河槽较深、凸岸出现边滩。下列解释最符合弯道水流差异的是（ ）',
        options: ['A. 凹岸流速相对较大、侵蚀较强；凸岸流速相对较小、泥沙易沉积', 'B. 凹岸与凸岸流速完全相同，边滩由风力堆积形成', 'C. 凸岸河槽最深，主要发生下切侵蚀；凹岸水浅并持续淤积', 'D. 弯道地貌仅由河流纵向坡度决定，与横向水流无关'],
        answer: 'A',
      },
    ],
  },
]

const quakeWaves = [
  { id: 'p', name: '纵波（P 波）', speed: '快', motion: '质点前后振动', color: '#60a5fa' },
  { id: 's', name: '横波（S 波）', speed: '慢', motion: '质点上下振动', color: '#f97316' },
  { id: 'l', name: '面波', speed: '最慢', motion: '地表摇晃明显', color: '#a855f7' },
]

const volcanoTypes = [
  { id: 'central', name: '中心式喷发', detail: '岩浆集中通道，上喷柱明显', vis: '高柱状喷发' },
  { id: 'fissure', name: '裂隙式喷发', detail: '沿裂隙溢流，形成玄武岩台地', vis: '宽广熔岩流' },
]


const hazardExamItems = [
  {
    id: 'hazard-quiz',
    source: '地震火山诊断题',
    questions: [
      {
        id: 'q1',
        stem: '横波与纵波在地下波速的变化规律是（ ）',
        options: ['A. 横波始终快于纵波', 'B. 纵波始终快于横波', 'C. 二者速度相同', 'D. 横波只在液体中传播'],
        answer: 'B',
      },
      {
        id: 'q2',
        stem: '缅甸 7.9 级地震的主要成因是（ ）',
        options: ['A. 太平洋板块与亚欧板块生长边界', 'B. 印度洋板块与亚欧板块消亡边界', 'C. 美洲板块与非洲板块消亡边界', 'D. 南极洲板块与印度洋板块生长边界'],
        answer: 'B',
      },
      {
        id: 'q3',
        stem: '地震发生时当地居民的感觉是（ ）',
        options: ['A. 先左右摇晃后上下颠簸', 'B. 先上下颠簸后左右摇晃', 'C. 只有上下颠簸', 'D. 只有左右摇晃'],
        answer: 'B',
      },
    ],
  },
]

const universeQuestions = [
  {
    id: 'universe-q1',
    stem: '下列天体系统中，级别最高的是（ ）',
    options: ['A. 银河系', 'B. 太阳系', 'C. 地月系', 'D. 总星系'],
    answer: 'D',
    explanation: '总星系是目前人类观测到的最高级天体系统。',
  },
  {
    id: 'universe-q2',
    stem: '地球成为太阳系中唯一有生命存在的行星，主要原因是（ ）',
    options: ['A. 地球的体积和质量适中', 'B. 地球与太阳的距离适中', 'C. 地球有大气层', 'D. 以上都是'],
    answer: 'D',
    explanation: '适中的体积质量、与太阳距离和大气层共同创造了生命存在的条件。',
  },
  {
    id: 'universe-q3',
    stem: '太阳系中，小行星带位于（ ）',
    options: ['A. 水星和金星之间', 'B. 火星和木星之间', 'C. 木星和土星之间', 'D. 天王星和海王星之间'],
    answer: 'B',
    explanation: '小行星带位于火星和木星轨道之间。',
  },
  {
    id: 'universe-q4',
    stem: '下列关于宇宙的说法，正确的是（ ）',
    options: ['A. 宇宙是静止的', 'B. 宇宙是无限的', 'C. 宇宙是均匀的', 'D. 宇宙正在收缩'],
    answer: 'B',
    explanation: '目前观测表明宇宙是无限的且在不断膨胀。',
  },
]

const sunQuestions = [
  {
    id: 'sun-q1',
    stem: '太阳辐射的能量主要来源于（ ）',
    options: ['A. 太阳内部的核聚变', 'B. 太阳内部的核裂变', 'C. 太阳表面的燃烧', 'D. 太阳大气的活动'],
    answer: 'A',
    explanation: '太阳能量来源于核心的氢核聚变。',
  },
  {
    id: 'sun-q2',
    stem: '太阳活动的主要标志是（ ）',
    options: ['A. 黑子和耀斑', 'B. 日珥和日冕', 'C. 太阳风', 'D. 磁暴'],
    answer: 'A',
    explanation: '黑子和耀斑是太阳活动最主要的标志。',
  },
  {
    id: 'sun-q3',
    stem: '太阳活动对地球的影响不包括（ ）',
    options: ['A. 影响无线电短波通信', 'B. 产生极光', 'C. 引发地震', 'D. 影响气候'],
    answer: 'C',
    explanation: '太阳活动不会直接引发地震。',
  },
  {
    id: 'sun-q4',
    stem: '下列关于太阳黑子的说法，正确的是（ ）',
    options: ['A. 黑子是黑色的', 'B. 黑子温度比周围低', 'C. 黑子出现在日冕层', 'D. 黑子不会变化'],
    answer: 'B',
    explanation: '黑子是太阳表面温度较低的区域，看起来较暗。',
  },
]

const layerQuestions = [
  {
    id: 'layer-q1',
    stem: '地球内部圈层中，厚度最大的是（ ）',
    options: ['A. 地壳', 'B. 地幔', 'C. 外核', 'D. 内核'],
    answer: 'B',
    explanation: '地幔厚度约2900千米，是地球内部最厚的圈层。',
  },
  {
    id: 'layer-q2',
    stem: '莫霍界面是（ ）的分界面',
    options: ['A. 地壳和地幔', 'B. 地幔和地核', 'C. 外核和内核', 'D. 岩石圈和软流层'],
    answer: 'A',
    explanation: '莫霍界面是地壳与地幔的分界面。',
  },
  {
    id: 'layer-q3',
    stem: '岩石圈包括（ ）',
    options: ['A. 地壳', 'B. 地壳和上地幔顶部', 'C. 地壳和地幔', 'D. 整个地球'],
    answer: 'B',
    explanation: '岩石圈包括地壳和上地幔顶部的固体部分。',
  },
  {
    id: 'layer-q4',
    stem: '地球外部圈层包括（ ）',
    options: ['A. 大气圈、水圈、生物圈', 'B. 岩石圈、水圈、生物圈', 'C. 大气圈、岩石圈、生物圈', 'D. 大气圈、水圈、岩石圈'],
    answer: 'A',
    explanation: '地球外部圈层包括大气圈、水圈和生物圈。',
  },
]

const atmosphereQuestions = [
  {
    id: 'atm-q1',
    stem: '大气中含量最多的气体是（ ）',
    options: ['A. 氧气', 'B. 氮气', 'C. 二氧化碳', 'D. 水汽'],
    answer: 'B',
    explanation: '氮气约占大气总量的78%。',
  },
  {
    id: 'atm-q2',
    stem: '臭氧层主要位于大气层的（ ）',
    options: ['A. 对流层', 'B. 平流层', 'C. 中间层', 'D. 热层'],
    answer: 'B',
    explanation: '臭氧层主要分布在平流层中。',
  },
  {
    id: 'atm-q3',
    stem: '对流层的主要特点是（ ）',
    options: ['A. 气温随高度升高而升高', 'B. 空气以水平运动为主', 'C. 天气现象复杂多变', 'D. 空气稀薄'],
    answer: 'C',
    explanation: '对流层集中了几乎全部水汽和杂质，天气现象复杂多变。',
  },
  {
    id: 'atm-q4',
    stem: '关于大气垂直分层的说法，正确的是（ ）',
    options: ['A. 平流层适合飞机飞行', 'B. 中间层气温随高度升高而升高', 'C. 热层位于最底层', 'D. 对流层厚度均匀'],
    answer: 'A',
    explanation: '平流层气流平稳，适合飞机飞行。',
  },
]

const ensoQuestions = [
  {
    id: 'enso-q1',
    stem: '导致西太平洋暖池形成的大气环流是（ ）',
    options: ['A. 极地东风带', 'B. 东南信风带', 'C. 盛行西风带', 'D. 副热带高压带'],
    answer: 'B',
  },
  {
    id: 'enso-q2',
    stem: '正常年份下，赤道太平洋东部常出现上升流，主要原因是（ ）',
    options: ['A. 暖流堆积表层海水', 'B. 信风把表层暖水吹向西部', 'C. 海底火山喷发', 'D. 海岸线曲折阻挡海水'],
    answer: 'B',
  },
  {
    id: 'enso-q3',
    stem: '拉尼娜现象发生时，图示海域发生的变化是（ ）',
    options: ['A. 东太平洋海温升高', 'B. 赤道逆流增强', 'C. 西太暖池海水减弱并东移', 'D. 东太平洋上升流增强'],
    answer: 'D',
  },
  {
    id: 'enso-q4',
    stem: '厄尔尼诺现象发生时最可能出现的是（ ）',
    options: ['A. 秘鲁沿岸渔场受损', 'B. 澳大利亚东部降水增多', 'C. 西太平洋暖池加强', 'D. 东太平洋海温明显降低'],
    answer: 'A',
  },
  {
    id: 'enso-q5',
    stem: '东南信风减弱时，最直接的海洋响应是（ ）',
    options: ['A. 西太平洋海水继续向西堆积', 'B. 东太平洋暖水东移并覆盖冷水区', 'C. 北半球洋流全部停止', 'D. 极地海冰显著增加'],
    answer: 'B',
  },
  {
    id: 'enso-q6',
    stem: '澳大利亚东部湿润气候形成的主要洋流是（ ）',
    options: ['A. 东澳大利亚暖流', 'B. 西澳大利亚寒流', 'C. 秘鲁寒流', 'D. 本格拉寒流'],
    answer: 'A',
  },
]

import WelcomePage from './components/WelcomePage'
import AuthPage from './components/AuthPage'
import TextbookSelection from './components/TextbookSelection'
import AGHExperimentAgent from './agh/AGHExperimentAgent'
import GeoLabWorkbench from './agh/GeoLabWorkbench'

function ExperimentLayout({ experimentId, children }) {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.querySelectorAll('.exp-wrap .panel').forEach((panel) => {
      panel.scrollTop = 0
    })
  }, [experimentId])

  return (
    <div className="experiment-layout">
      <ExperimentDocsBar />
      {children}
      <AGHExperimentAgent experimentId={experimentId} />
    </div>
  )
}

function App() {
  const [userInfo, setUserInfo] = useState(null)
  const [selectedTextbook, setSelectedTextbook] = useState(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false)

  const handleStart = () => {
    setShowWelcome(false)
  }

  const handleBackToWelcome = () => {
    setShowWelcome(true)
  }

  const handleAuthSubmit = (info) => {
    const localUser = {
      identity: info.identity,
      user_id: info.account,
      studentId: info.identity === 'student' ? info.account : undefined,
      teacherId: info.identity === 'teacher' ? info.account : undefined,
      name: info.account,
      className: '演示班级',
      class_name: '演示班级',
    }

    setUserInfo(localUser)
  }

  const handleTextbookConfirm = (textbook) => {
    window.history.replaceState({}, '', '/')
    setSelectedTextbook(textbook)
  }

  const handleTeacherDashboard = () => {
    setShowTeacherDashboard(true)
  }

  const handleExitTeacherDashboard = () => {
    setShowTeacherDashboard(false)
  }

  const handleBackToAuth = () => {
    setUserInfo(null)
  }

  const handleBackToTextbook = () => {
    setSelectedTextbook(null)
  }

  // 如果还没有完成前置流程，显示前置模块
  if (showWelcome) {
    return <WelcomePage onStart={handleStart} />
  }

  if (!userInfo) {
    return <AuthPage onSubmit={handleAuthSubmit} onBack={handleBackToWelcome} />
  }

  if (showTeacherDashboard) {
    return <TeacherDashboard currentUser={userInfo} onNavigate={handleExitTeacherDashboard} />
  }

  if (!selectedTextbook) {
    return (
      <TextbookSelection 
        userInfo={userInfo} 
        onConfirm={handleTextbookConfirm} 
        onBack={handleBackToAuth}
        onTeacherDashboard={userInfo.identity === 'teacher' ? handleTeacherDashboard : undefined}
      />
    )
  }

  return (
    <BrowserRouter>
      <InfoModalProvider>
        <DocModalProvider>
          <ExperimentDocsShell />
          <Routes>
            <Route path="/" element={<><Home userInfo={userInfo} textbook={selectedTextbook} onBack={handleBackToTextbook} onTeacherDashboard={userInfo.identity === 'teacher' ? handleTeacherDashboard : undefined} /><GeoLabWorkbench /></>} />
            <Route path="/experiments" element={<Navigate to={selectedTextbook === 'required-01' ? '/experiments/required-01' : '/experiments/elective-01'} replace />} />
            <Route path="/experiments/elective-01" element={<ExperimentLayout experimentId="elective-01"><ElectiveMasterLab id={1} /></ExperimentLayout>} />
            <Route path="/experiments/elective-02" element={<ExperimentLayout experimentId="elective-02"><ElectiveMasterLab id={2} /></ExperimentLayout>} />
            <Route path="/experiments/elective-03" element={<ExperimentLayout experimentId="elective-03"><ElectiveMasterLab id={3} /></ExperimentLayout>} />
            <Route path="/experiments/elective-04" element={<ExperimentLayout experimentId="elective-04"><ElectiveMasterLab id={4} /></ExperimentLayout>} />
            <Route path="/experiments/elective-05" element={<ExperimentLayout experimentId="elective-05"><ElectiveFive /></ExperimentLayout>} />
            <Route path="/experiments/elective-06" element={<ExperimentLayout experimentId="elective-06"><ElectiveMasterLab id={6} /></ExperimentLayout>} />
            <Route path="/experiments/elective-07" element={<ExperimentLayout experimentId="elective-07"><ElectiveMasterLab id={7} /></ExperimentLayout>} />
            <Route path="/experiments/elective-07-legacy" element={<ExperimentLayout experimentId="elective-07"><ElectiveMasterLab id={7} /></ExperimentLayout>} />
            <Route path="/experiments/required-01" element={<ExperimentLayout experimentId="required-01"><RequiredOne /></ExperimentLayout>} />
            <Route path="/experiments/required-02" element={<ExperimentLayout experimentId="required-02"><RequiredLab id={2} /></ExperimentLayout>} />
            <Route path="/experiments/required-03" element={<ExperimentLayout experimentId="required-03"><RequiredLab id={3} /></ExperimentLayout>} />
            <Route path="/experiments/required-04" element={<ExperimentLayout experimentId="required-04"><RequiredLab id={4} /></ExperimentLayout>} />
            <Route path="/experiments/required-05" element={<ExperimentLayout experimentId="required-05"><RequiredLab id={5} /></ExperimentLayout>} />
            <Route path="/experiments/required-06" element={<ExperimentLayout experimentId="required-06"><RequiredLab id={6} /></ExperimentLayout>} />
            <Route path="/experiments/required-07" element={<ExperimentLayout experimentId="required-07"><RequiredLab id={7} /></ExperimentLayout>} />
            <Route path="/experiments/required-08" element={<ExperimentLayout experimentId="required-08"><RequiredLab id={8} /></ExperimentLayout>} />
            <Route path="/experiments/required-09" element={<ExperimentLayout experimentId="required-09"><RequiredLab id={9} /></ExperimentLayout>} />
            <Route path="/experiments/:slug" element={<ExperimentLayout experimentId="unknown"><ExperimentPlaceholder /></ExperimentLayout>} />
          </Routes>
        </DocModalProvider>
      </InfoModalProvider>
    </BrowserRouter>
  )
}

const experimentExamMap = {
  'required-01': { questions: universeQuestions, source: '地球宇宙环境诊断题' },
  'required-02': { questions: sunQuestions, source: '太阳对地球影响诊断题' },
  'required-03': { questions: tectonicExamItems.flatMap(e => e.questions), source: '地质年代诊断题' },
  'required-04': { questions: layerQuestions, source: '地球圈层结构诊断题' },
  'required-05': { questions: atmosphereQuestions, source: '大气成分诊断题' },
  'required-06': { questions: frontExamItems.flatMap(e => e.questions), source: '热力环流诊断题' },
  'required-07': { questions: waterCycleExamItems.flatMap(e => e.questions), source: '水循环诊断题' },
  'required-08': { questions: marineExamItems.flatMap(e => e.questions), source: '海水性质诊断题' },
  'required-09': { questions: requiredNineExamItems.flatMap(e => e.questions), source: '洋流与潮汐诊断题' },
  'elective-01': { questions: sunQuestions, source: '地球运动诊断题' },
  'elective-02': { questions: atmosphereQuestions, source: '气压带风带诊断题' },
  'elective-03': { questions: frontExamItems.flatMap(e => e.questions), source: '锋面系统诊断题' },
  'elective-04': { questions: tectonicExamItems.flatMap(e => e.questions), source: '构造运动诊断题' },
  'elective-05': { questions: riverExamItems.flatMap(e => e.questions), source: '流水地貌诊断题' },
  'elective-06': { questions: hazardExamItems.flatMap(e => e.questions), source: '地震火山诊断题' },
  'elective-07': { questions: requiredNineExamItems.flatMap(e => e.questions), source: '洋流水循环诊断题' },
}

function DiagnosticQuizPanel({ experimentId, quizState, setQuizState }) {
  const examData = experimentExamMap[experimentId] || { questions: ensoQuestions, source: '综合诊断题' }
  const questions = examData.questions
  const source = examData.source

  return (
    <div className="diagnostic-quiz">
      <div className="exam-card">
        <h3>{source}</h3>
        <div className="exam-questions">
          {questions.map((question) => {
            const key = question.id
            const picked = quizState[key]?.choice ?? ''
            const submitted = quizState[key]?.submitted ?? false
            const isCorrect = submitted ? picked === question.answer : null
            return (
              <div key={key} className="exam-question">
                <p className="quiz-stem">{question.stem}</p>
                <div className="quiz-options">
                  {question.options.map((option, index) => {
                    const value = option.charAt(0)
                    const checked = picked === value
                    return (
                      <button
                        key={`${key}-${index}`}
                        type="button"
                        className={`quiz-option ${checked ? 'active' : ''} ${submitted ? (value === question.answer ? 'correct' : checked ? 'wrong' : '') : ''}`}
                        onClick={() => setQuizState((prev) => ({ ...prev, [key]: { choice: value, submitted: false } }))}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                <div className="quiz-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setQuizState((prev) => ({ ...prev, [key]: { choice: picked, submitted: true } }))}
                    disabled={!picked}
                  >
                    提交判定
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setQuizState((prev) => ({ ...prev, [key]: { choice: '', submitted: false } }))}
                  >
                    重做
                  </button>
                </div>
                {submitted ? <p className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>{isCorrect ? '回答正确' : `回答错误，正确答案是 ${question.answer}`}</p> : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


function Home(props) {
  return <ExperimentCatalog {...props} experiments={props.textbook === 'required-01' ? requiredExperiments : electiveExperiments} />
}

function ExperimentPlaceholder() {
  const { slug } = useParams()
  const { openInfo } = useContext(InfoModalContext)
  const title = useMemo(() => {
    if (!slug) return '实验'
    if (slug.startsWith('required-')) return `必修一 实验 ${parseInt(slug.slice(-2), 10)}`
    if (slug.startsWith('elective-')) return `选修一 实验 ${parseInt(slug.slice(-2), 10)}`
    return '实验页面'
  }, [slug])

  return (
    <div className="page">
      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>{title}：内容待完善</h1>
            <p className="muted">请继续提供实验内容，我可以批量填充。</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('太阳辐射与耀斑演示', '<p>本实验展示太阳辐射在全球的分布规律以及太阳活动对地球的影响。</p><p><strong>操作说明：</strong></p><ul><li>拖拽旋转地球：观察不同地区的太阳辐射情况</li><li>点击地球表面：查看该点的辐射指数</li><li>使用左侧控制台调整季节、云量、地形等参数</li></ul><p><strong>太阳耀斑说明：</strong></p><ul><li>太阳耀斑是太阳表面局部突然增亮的现象</li><li>耀斑爆发时释放的大量高能粒子会影响地球电离层</li><li>严重时可能导致无线电通信中断</li></ul>')
              }}
            >
              操作指南
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>
        <div className="panel">
          <p>该实验页面尚未配置 Three.js 或交互内容。</p>
        </div>
      </main>
    </div>
  )
}

function ElectiveFour() {
  const [scenarioId, setScenarioId] = useState(tectonicScenarios[0].id)
  const [stageIndex, setStageIndex] = useState(1)
  const [faultId, setFaultId] = useState(faultTypes[0].id)
  const [visualMode, setVisualMode] = useState('render')
  const [riverCut, setRiverCut] = useState(40)
  const [showVolcano, setShowVolcano] = useState(false)
  const [showEarthquake, setShowEarthquake] = useState(false)
  const [showSediment, setShowSediment] = useState(true)
  const [showTerrace, setShowTerrace] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const { openInfo } = useContext(InfoModalContext)

  const scenario = tectonicScenarios.find((item) => item.id === scenarioId) ?? tectonicScenarios[0]
  const fault = faultTypes.find((item) => item.id === faultId) ?? faultTypes[0]
  const stage = tectonicStages[stageIndex]

  const upliftValue = Math.round((scenario.uplift + stage.elevation) / 2)
  const canyonDepth = Math.round((riverCut / 100) * 60 + stageIndex * 8)
  const sedimentThickness = Math.max(5, 40 - stageIndex * 8)
  const terraceLevel = Math.min(3, Math.floor(stageIndex / 1.5))

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：内力作用与地貌演化实验</h1>
            <p className="muted">对应教材：选择性必修 1 第三章《地质地貌》第 2 节</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('构造运动与地貌演化实验指南', '<p>本实验通过交互式仿真，展示褶皱、断层与地貌演化的动态过程。</p><p><strong>操作说明：</strong></p><ul><li>选择构造场景（挤压/张裂/沉降），观察岩层变形和地貌响应</li><li>拖动演化时间轴，观察海洋沉积→褶皱→抬升→侵蚀的完整过程</li><li>切换断层类型（正断层/逆断层/走滑断层），观察断层面两侧位移</li><li>调整河流下切强度，观察峡谷深度变化</li><li>开启火山和地震显示，观察构造活动</li></ul><p><strong>构造运动类型：</strong></p><ul><li>水平挤压：形成褶皱山脉（如喜马拉雅）</li><li>水平拉张：形成裂谷和盆地（如东非大裂谷）</li><li>垂直沉降：形成沉积盆地（如华北平原）</li></ul><p><strong>断层类型：</strong></p><ul><li>正断层：上盘下降，形成地堑/裂谷</li><li>逆断层：上盘上升，形成褶皱山脉</li><li>走滑断层：两盘水平错动（如圣安德烈亚斯断层）</li></ul><p><strong>地貌演化过程：</strong></p><ul><li>海洋沉积 → 褶皱挤压 → 快速抬升 → 侵蚀切割</li><li>内力塑造地形骨架，外力雕刻地表形态</li></ul>')
              }}
            >
              操作指南
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>褶皱、断层与地壳抬升/沉降是慢过程，学生难以直观感受。本实验用剖面+时间轴把“挤压—抬升—侵蚀”串联展示，帮助学生理解内力作用与地貌演化的关系。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>理解褶皱和断层的形成机制</li>
                    <li>掌握三种断层类型（正断层、逆断层、平移断层）的特征</li>
                    <li>理解地壳抬升与沉降对地貌的影响</li>
                    <li>了解构造运动与河流侵蚀的相互作用</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够根据断层特征判断断层类型</li>
                    <li>学会分析构造运动对地貌演化的影响</li>
                    <li>培养空间想象和综合分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>感受地质作用的漫长性和复杂性</li>
                    <li>理解内力与外力共同塑造地表形态</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block sim-controls">
              <h2>构造场景</h2>
              <div className="control-group">
                <label>
                  运动类型：<span>{scenario.name}</span>
                </label>
                <div className="pill-row">
                  {tectonicScenarios.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${item.id === scenarioId ? 'active' : ''}`}
                      onClick={() => setScenarioId(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
              <p className="data-note">{scenario.note}</p>
              <p className="data-note">剖面中的抬升、切割和沉积值是相对指数，仅用于比较情景，不代表真实高程、厚度或地质年代。</p>
              <div className="data-grid">
                <div className="data-item">
                  <span>构造应力</span>
                  <strong>{scenario.force}</strong>
                </div>
                <div className="data-item">
                  <span>地貌响应</span>
                  <strong>{scenario.relief}</strong>
                </div>
                <div className="data-item">
                  <span>抬升强度</span>
                  <strong>{scenario.upliftLabel}</strong>
                </div>
                <div className="data-item">
                  <span>相对抬升指数</span>
                  <strong>{upliftValue}/100</strong>
                </div>
                <div className="data-item">
                  <span>沉积层示意厚薄</span>
                  <strong>{sedimentThickness}/40</strong>
                </div>
                <div className="data-item">
                  <span>阶地级数</span>
                  <strong>{terraceLevel} 级</strong>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>地貌演化时间轴</h2>
              <div className="control-group">
                <label>
                  演化阶段：<span>{stage.name}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={tectonicStages.length - 1}
                  step={1}
                  value={stageIndex}
                  onChange={(event) => setStageIndex(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="stage-detail">
                <strong>{stage.name}</strong>
                <p>{stage.note}</p>
              </div>
              <div className="control-group">
                <label>
                  河流下切强度：<span>{riverCut}%</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={riverCut}
                  onChange={(event) => setRiverCut(parseInt(event.target.value, 10))}
                />
              </div>
              <p className="data-note">下切强度越大，示意峡谷切割越深（当前相对切割指数 {canyonDepth}/100；剖面不按真实比例绘制）。</p>
            </div>

            <div className="panel-block">
              <h2>断层滑动演示</h2>
              <div className="control-group">
                <label>
                  断层类型：<span>{fault.name}</span>
                </label>
                <div className="pill-row">
                  {faultTypes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${item.id === faultId ? 'active' : ''}`}
                      onClick={() => setFaultId(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flow-card">
                <strong>{fault.stress}</strong>
                <p>{fault.motion}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>可视化选项</h2>
              <div className="control-group">
                <div className="checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showVolcano} onChange={(e) => setShowVolcano(e.target.checked)} />
                    火山活动
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showEarthquake} onChange={(e) => setShowEarthquake(e.target.checked)} />
                    地震活动
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showSediment} onChange={(e) => setShowSediment(e.target.checked)} />
                    沉积层
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showTerrace} onChange={(e) => setShowTerrace(e.target.checked)} />
                    阶地
                  </label>
                </div>
              </div>
              <div className="control-group">
                <label>
                  动画速度：<span>{animationSpeed}x</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.25}
                  value={animationSpeed}
                  onChange={(event) => setAnimationSpeed(parseFloat(event.target.value))}
                />
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                <li>
                  <strong>任务1：观察褶皱形成</strong>
                  <p>选择不同构造场景（挤压、张裂、剪切），观察岩层的变形过程，记录不同应力作用下岩层的形态变化。</p>
                  <span className="task-hint">💡 提示：挤压形成褶皱，张裂形成断裂。</span>
                </li>
                <li>
                  <strong>任务2：分析断层类型</strong>
                  <p>切换正断层、逆断层、平移断层，观察断层面两侧岩块的位移方向，总结三种断层的受力特点和地貌表现。</p>
                  <span className="task-hint">💡 提示：正断层形成地堑/地垒，逆断层形成褶皱山脉。</span>
                </li>
                <li>
                  <strong>任务3：模拟地貌演化</strong>
                  <p>拖动演化时间轴，观察地壳抬升与河流下切的相互作用，理解“构造抬升—侵蚀切割”的地貌演化过程。</p>
                  <span className="task-hint">💡 提示：抬升越快，峡谷越深。</span>
                </li>
                <li>
                  <strong>任务4：探究河流下切强度</strong>
                  <p>调整河流下切强度滑块，观察峡谷深度的变化，分析河流侵蚀与构造抬升的平衡关系。</p>
                </li>
              </ul>
            </div>

            <div className="panel-block">
              <h2>高考题型训练</h2>
              <div className="exam-list">
                <div className="exam-card">
                  <h3>高考题型训练·地质剖面判读（情境改编）</h3>
                  <p className="quiz-stem">阅读图文材料，完成下列要求。
<br/>
下图示意某区域地质构造。该区域经历了多次构造运动，形成了复杂的地质地貌。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">（1）指出图中①②③三处的地质构造类型，并说明判断依据。</p>
                      <p className="quiz-answer">参考答案：①背斜，岩层向上拱起；②向斜，岩层向下弯曲；③断层，岩层发生明显位移。</p>
                    </div>
                    <div>
                      <p className="quiz-stem">（2）分析该区域地貌形成与构造运动的关系。</p>
                      <p className="quiz-answer">参考答案：褶皱形成初期背斜成山、向斜成谷；后期受外力侵蚀，背斜顶部因张力易被侵蚀成谷，向斜槽部因挤压不易被侵蚀成山；断层形成地堑和地垒，进一步塑造地貌。</p>
                    </div>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·断层与地貌（情境改编）</h3>
                  <p className="quiz-stem">读某地质剖面图，完成下列问题。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">1. 图中断层的类型是（ ）</p>
                      <ul>
                        <li>A. 正断层 B. 逆断层 C. 平移断层 D. 地堑</li>
                      </ul>
                      <p className="quiz-answer">参考答案：B</p>
                      <p className="quiz-explain">解析：断层上盘相对上升，下盘相对下降，属于逆断层。</p>
                    </div>
                    <div>
                      <p className="quiz-stem">2. 该断层形成的主要原因是（ ）</p>
                      <ul>
                        <li>A. 水平挤压 B. 水平张裂 C. 垂直升降 D. 岩浆活动</li>
                      </ul>
                      <p className="quiz-answer">参考答案：A</p>
                    </div>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·构造地貌综合判断（情境改编）</h3>
                  <p className="quiz-stem">阅读图文资料，完成下列要求。
<br/>
雅鲁藏布江大峡谷是世界上最深的峡谷之一，其形成与板块运动密切相关。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">（1）分析雅鲁藏布江大峡谷的形成原因。</p>
                      <p className="quiz-answer">参考答案：板块碰撞挤压导致地壳抬升，形成高大山脉；雅鲁藏布江沿断裂带发育，长期下切侵蚀形成大峡谷。</p>
                    </div>
                    <div>
                      <p className="quiz-stem">（2）说明构造运动对该区域地貌演化的影响。</p>
                      <p className="quiz-answer">参考答案：构造抬升形成高原和山脉；断裂构造控制河流走向；地震活动频繁，进一步改造地表形态。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel canvas tectonic-canvas">
            <div className="tectonic-header">
              <div>
                <h3>构造剖面示意</h3>
                <p>{scenario.relief}</p>
              </div>
              <span className="badge">阶段 {stageIndex + 1}: {stage.name}</span>
            </div>

            <div className="tectonic-view-switch" aria-label="剖面显示方式">
              <button type="button" className={visualMode === 'render' ? 'active' : ''} onClick={() => setVisualMode('render')}>真实地貌场景</button>
              <button type="button" className={visualMode === 'diagram' ? 'active' : ''} onClick={() => setVisualMode('diagram')}>构造过程图</button>
            </div>

            {visualMode === 'render' && (
              <div className="tectonic-stage-photo">
                <img src="/picture/experiments/tectonic-folds-v1.jpg" alt="河流切穿褶皱山地的地质剖面实景渲染" />
                <div className="tectonic-photo-kicker">构造作用 × 外力侵蚀</div>
                <div className="tectonic-photo-stage">阶段 {stageIndex + 1}<strong>{stage.name}</strong></div>
                <div className="tectonic-photo-readouts">
                  <span><small>构造情景</small><b>{scenario.name}</b></span>
                  <span><small>断层运动</small><b>{fault.name}</b></span>
                  <span><small>相对抬升</small><b>{upliftValue}/100</b></span>
                  <span><small>河流下切</small><b>{canyonDepth}/100</b></span>
                </div>
              </div>
            )}

            <div className={`tectonic-section ${scenarioId} ${faultId}`} hidden={visualMode !== 'diagram'}>
              <div className="layer base-layer">
                <span>基底岩层</span>
              </div>
              
              {showSediment && (
                <div className="sediment-layers">
                  {[...Array(Math.min(5, Math.floor(sedimentThickness / 8)))].map((_, i) => (
                    <div key={i} className={`sediment-layer layer-${i % 3}`} />
                  ))}
                </div>
              )}

              <div className="plate left" />
              <div className="plate right" />
              
              <div className="fold-belt" style={{ height: `${30 + upliftValue * 0.4}%` }}>
                <span className="fold-label">褶皱带</span>
                <div className="fold-axis" />
              </div>

              <div className={`fault-line ${faultId}`}>
                <div className="fault-plane" />
                <div className="fault-label">{fault.name}</div>
                {faultId === 'normal' && <div className="fault-marker down" />}
                {faultId === 'reverse' && <div className="fault-marker up" />}
                {faultId === 'strike' && <div className="fault-marker strike" />}
              </div>

              {showVolcano && (
                <div className="volcano">
                  <div className="volcano-cone" />
                  <div className="volcano-crater" />
                  <div className="volcano-smoke">
                    <div className="smoke-particle" />
                    <div className="smoke-particle delay-1" />
                    <div className="smoke-particle delay-2" />
                  </div>
                  <span className="volcano-label">火山</span>
                </div>
              )}

              {showEarthquake && (
                <div className="earthquake">
                  <div className="earthquake-wave wave-1" />
                  <div className="earthquake-wave wave-2" />
                  <div className="earthquake-wave wave-3" />
                  <span className="earthquake-label">地震</span>
                </div>
              )}

              <div className="uplift-meter">
                <span>相对抬升指数 {upliftValue}</span>
                <div className="meter-track">
                  <div className="meter-fill" style={{ height: `${upliftValue}%` }} />
                  <div className="meter-marks">
                    {[0, 25, 50, 75, 100].map((mark) => (
                      <div key={mark} className="meter-mark" style={{ bottom: `${mark}%` }}>
                        {mark}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="river-cut" style={{ height: `${canyonDepth}%` }}>
                <div className="river-channel" />
                <div className="river-flow">
                  <div className="flow-particle" />
                  <div className="flow-particle delay-1" />
                  <div className="flow-particle delay-2" />
                </div>
                <span className="river-label">峡谷</span>
                {showTerrace && (
                  <div className="terraces">
                    {[...Array(terraceLevel)].map((_, i) => (
                      <div key={i} className="terrace" style={{ bottom: `${20 + i * 15}%` }} />
                    ))}
                  </div>
                )}
              </div>

              <div className="erosion-indicator">
                <div className="erosion-bar" style={{ height: `${stageIndex * 25}%` }} />
                <span>侵蚀程度</span>
              </div>
            </div>

            <div className="tectonic-legend">
              <div>
                <span className="legend-box uplift" />抬升区
              </div>
              <div>
                <span className="legend-box fault" />断层面
              </div>
              <div>
                <span className="legend-box river" />河流下切
              </div>
              <div>
                <span className="legend-box sediment" />沉积层
              </div>
              <div>
                <span className="legend-box volcano" />火山
              </div>
              <div>
                <span className="legend-box earthquake" />地震
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function ElectiveSix() {
  const [waveIndex, setWaveIndex] = useState(0)
  const [quakeActive, setQuakeActive] = useState(false)
  const [viscosity, setViscosity] = useState(60)
  const [volatileGas, setVolatileGas] = useState(60)
  const [earthquakeMagnitude, setEarthquakeMagnitude] = useState(6.5)
  const [epicentralDistance, setEpicentralDistance] = useState(80)
  const [focalDepth, setFocalDepth] = useState(15)
  const [showPlateBoundary, setShowPlateBoundary] = useState(true)
  const { openInfo } = useContext(InfoModalContext)

  useEffect(() => {
    if (!quakeActive) return undefined
    const timer = setInterval(() => {
      setWaveIndex((prev) => (prev + 1) % quakeWaves.length)
    }, 800)
    return () => clearInterval(timer)
  }, [quakeActive])

  const activeWave = quakeWaves[waveIndex]
  const eruptionIndex = Math.round(viscosity * 0.55 + volatileGas * 0.45)
  const eruptionType = eruptionIndex > 68 ? '爆发式' : eruptionIndex > 40 ? '中间式' : '溢流式'
  const eruptionIntensity = eruptionIndex > 68 ? '高' : eruptionIndex > 40 ? '中' : '低'
  const waveSpeedDisplay = activeWave.id === 'p' ? '5-7 km/s' : activeWave.id === 's' ? '3-4 km/s' : '2-3 km/s'
  // 用于教学比较的烈度衰减示意式，不能替代地震烈度现场调查或地震动预测。
  const estimateIntensity = (distance) => Math.max(1, Math.min(12, Math.round(1.5 * earthquakeMagnitude - 3.2 * Math.log10(Math.hypot(distance, focalDepth) + 1) + 1.5)))
  const intensityBands = [
    { id: 'core', label: '震中附近', distance: Math.max(10, Math.round(epicentralDistance * 0.25)), note: '近场影响较强' },
    { id: 'near', label: '观测点', distance: epicentralDistance, note: '估算烈度随参数变化' },
    { id: 'far', label: '更远地区', distance: Math.round(epicentralDistance * 2.5), note: '波能量随传播衰减' },
  ].map((band) => ({ ...band, value: estimateIntensity(band.distance) }))

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：地震与火山仿真实验</h1>
            <p className="muted">对应教材：选择性必修 1 第四章《自然灾害》第 1-2 节</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('地震与火山灾害实验指南', '<p>本实验通过交互式仿真，展示地震波传播和火山喷发机制。</p><p><strong>操作说明：</strong></p><ul><li>点击"开始地震"按钮，观察P波和S波的传播顺序</li><li>联动调整震级、震中距与震源深度，比较烈度估算变化</li><li>联动调整岩浆黏度和挥发分指数，观察喷发类型和火山灰柱变化</li><li>切换板块边界显示，理解地震火山分布规律</li></ul><p><strong>地震波知识：</strong></p><ul><li>P波（纵波）：传播速度快，能通过固体、液体和气体</li><li>S波（横波）：传播速度较慢，只能通过固体</li><li>面波：沿地表传播，破坏性最强</li></ul><p><strong>火山喷发：</strong></p><ul><li>低黏度熔岩较易流动；黏度高且挥发分多时，气体较难逸出，爆发性通常增强</li><li>页面指数只表示趋势，不是特定火山的实测参数或喷发预报</li></ul>')
              }}
            >
              操作指南
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>地震波传播与火山喷发机制抽象，学生难以理解地震波的传播特点和火山喷发类型的差异。本实验用波速对比与火山剖面示意，帮助学生建立灾害过程模型。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>理解地震波的类型（P波、S波）及其传播特点</li>
                    <li>掌握震级与烈度的区别</li>
                    <li>理解火山喷发的类型及形成条件</li>
                    <li>了解地震和火山灾害的分布规律</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够区分P波和S波的传播特征</li>
                    <li>学会分析火山喷发类型与岩浆性质的关系</li>
                    <li>培养灾害风险评估能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>增强灾害防范意识</li>
                    <li>理解自然灾害的关联性</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block sim-controls">
              <h2>地震波传播</h2>
              <div className="control-group">
                <button type="button" className="btn" onClick={() => setQuakeActive(true)}>
                  ▶️ 开始地震
                </button>
                <button type="button" className="btn ghost" onClick={() => setQuakeActive(false)}>
                  ⏸️ 暂停
                </button>
              </div>
              <div className="control-group">
                <label>
                  震级：<span>{earthquakeMagnitude.toFixed(1)} 级</span>
                </label>
                <input
                  type="range"
                  min={4}
                  max={9}
                  step={0.1}
                  value={earthquakeMagnitude}
                  onChange={(event) => setEarthquakeMagnitude(parseFloat(event.target.value))}
                />
              </div>
              <div className="control-group">
                <label>震中距：<span>{epicentralDistance} km</span></label>
                <input type="range" min={10} max={500} step={10} value={epicentralDistance} onChange={(event) => setEpicentralDistance(Number(event.target.value))} />
                <label>震源深度：<span>{focalDepth} km</span></label>
                <input type="range" min={5} max={100} step={5} value={focalDepth} onChange={(event) => setFocalDepth(Number(event.target.value))} />
              </div>
              <div className="data-grid">
                {quakeWaves.map((wave) => (
                  <div key={wave.id} className={`data-item ${wave.id === activeWave.id ? 'active' : ''}`}>
                    <span>{wave.name}</span>
                    <strong>{wave.speed}</strong>
                  </div>
                ))}
              </div>
              <div className="flow-card">
                <strong>当前波型：{activeWave.name}</strong>
                <p>运动方式：{activeWave.motion} | 速度：{waveSpeedDisplay}</p>
              </div>
              <div className="hazard-bands">
                {intensityBands.map((band) => (
                  <div key={band.id} className="hazard-band">
                    <span>{band.label} · {band.distance} km</span>
                    <strong>估算烈度 {band.value}</strong>
                    <em>{band.note}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block sim-controls-secondary">
              <h2>火山喷发机制</h2>
              <div className="control-group">
                <label>
                  岩浆黏度相对指数：<span>{viscosity}/100</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={viscosity}
                  onChange={(event) => setViscosity(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>挥发分相对指数：<span>{volatileGas}/100</span></label>
                <input type="range" min={0} max={100} step={5} value={volatileGas} onChange={(event) => setVolatileGas(Number(event.target.value))} />
                <p className="data-note">黏度高、挥发分多时，气体不易逸出，爆发性通常更强；该指数只表达趋势。</p>
              </div>
              <div className="data-grid">
                {volcanoTypes.map((item) => (
                  <div key={item.id} className="data-item">
                    <span>{item.name}</span>
                    <strong>{item.vis}</strong>
                  </div>
                ))}
              </div>
              <div className="flow-card">
                <strong>当前喷发类型：{eruptionType}</strong>
                <p>喷发强度：{eruptionIntensity} | 黏度指数：{viscosity} | 挥发分指数：{volatileGas}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>显示控制</h2>
              <div className="control-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showPlateBoundary}
                    onChange={(e) => setShowPlateBoundary(e.target.checked)}
                  />
                  <span>显示板块边界</span>
                </label>
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                <li>
                  <strong>任务1：观察地震波传播</strong>
                  <p>点击"开始地震"按钮，观察P波和S波的传播顺序，记录两种波的速度差异和传播特点。</p>
                  <span className="task-hint">💡 提示：P波速度快，能通过固体和液体；S波速度慢，只能通过固体。</span>
                </li>
                <li>
                  <strong>任务2：分离震级、震源条件与烈度</strong>
                  <p>固定震级后分别改变震中距和震源深度，再增大震级作对照；观察烈度估算的空间差异。震级表示一次地震的规模，烈度还受距离、深度、场地和建筑条件影响。</p>
                  <span className="task-hint">💡 提示：震级越大，烈度不一定越大，还受震源深度、距离等因素影响。</span>
                </li>
                <li>
                  <strong>任务3：比较黏度与挥发分的共同作用</strong>
                  <p>先固定挥发分改变黏度，再固定黏度改变挥发分；解释为什么高黏度且挥发分多时更容易出现爆发式喷发。</p>
                  <span className="task-hint">💡 提示：黏度越大，气体不易释放，喷发越猛烈。</span>
                </li>
                <li>
                  <strong>任务4：评估灾害风险</strong>
                  <p>结合地震波传播和火山喷发演示，观察板块边界附近的灾害分布，评估不同区域的灾害风险等级。</p>
                </li>
              </ul>
            </div>

            <div className="panel-block">
              <h2>高考题型训练</h2>
              <div className="exam-list">
                <div className="exam-card">
                  <h3>高考题型训练·震害证据链（情境改编）</h3>
                  <p className="quiz-stem">阅读图文材料，完成下列要求。
<br/>
2022年9月5日，四川泸定发生6.8级地震，造成重大人员伤亡和财产损失。图示意震中位置及周边地形。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">（1）说明此次地震震级高但烈度分布不均的原因。</p>
                      <p className="quiz-answer">参考答案：震级是衡量地震释放能量大小的指标，此次地震能量大；烈度受震源深度、震中距、地质条件、建筑物抗震能力等因素影响，导致烈度分布不均。</p>
                    </div>
                    <div>
                      <p className="quiz-stem">（2）分析地震引发的次生灾害类型及应对措施。</p>
                      <p className="quiz-answer">参考答案：次生灾害包括滑坡、泥石流、崩塌等。应对措施：加强监测预警、加固山体、避让危险区域、提高建筑物抗震标准。</p>
                    </div>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·火山喷发判读（情境改编）</h3>
                  <p className="quiz-stem">读火山喷发示意图，完成下列问题。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">1. 图中火山喷发类型属于（ ）</p>
                      <ul>
                        <li>A. 溢流式喷发 B. 爆发式喷发 C. 宁静式喷发 D. 间歇式喷发</li>
                      </ul>
                      <p className="quiz-answer">参考答案：B</p>
                      <p className="quiz-explain">解析：图中显示火山喷发猛烈，产生大量火山灰和火山碎屑，属于爆发式喷发。</p>
                    </div>
                    <div>
                      <p className="quiz-stem">2. 影响火山喷发强度的主要因素是（ ）</p>
                      <ul>
                        <li>A. 岩浆黏度和气体含量 B. 火山高度和坡度 C. 板块运动速度 D. 大气温度和湿度</li>
                      </ul>
                      <p className="quiz-answer">参考答案：A</p>
                    </div>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·灾害成因分析（情境改编）</h3>
                  <p className="quiz-stem">阅读图文资料，完成下列要求。
<br/>
汤加洪阿哈阿帕伊火山于2022年1月发生大规模喷发，伴随大气压力波传播，并在周边海域造成海啸。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">（1）结合火山岛弧位置，说明此次喷发可能造成海啸的原因。</p>
                      <p className="quiz-answer">参考答案：海底火山活动可能伴随火山体或火山口塌陷、海底滑坡等过程，造成海水垂向位移并形成海啸；具体机制需结合海底地形和观测资料判定，不能仅由喷发规模推出。</p>
                    </div>
                    <div>
                      <p className="quiz-stem">（2）说明火山喷发对全球气候的可能影响。</p>
                      <p className="quiz-answer">参考答案：火山灰和气溶胶进入平流层，阻挡太阳辐射，导致全球气温下降；火山气体（如SO₂）形成酸雨，影响生态环境。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel canvas hazard-canvas">
            <div className="hazard-header">
              <div>
                <h3>🌋 地震与火山交互仿真</h3>
                <p>波速差异 · 喷发类型 · 板块边界</p>
              </div>
              <div className="hazard-badge-group">
                <span className="badge wave-badge" style={{ borderColor: activeWave.color, backgroundColor: activeWave.color + '20' }}>
                  {activeWave.name}
                </span>
                <span className="badge magnitude-badge">
                  M {earthquakeMagnitude.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="hazard-stage">
              {showPlateBoundary && (
                <div className="plate-boundary">
                  <div className="plate plate-north" />
                  <div className="plate plate-south" />
                  <div className="boundary-line" />
                  <div className="boundary-label">板块边界</div>
                </div>
              )}
              
              <div className="earthquake-section">
                <div className="quake-info">
                  <span className="quake-label">地震震源</span>
                  <span className="quake-magnitude">{earthquakeMagnitude.toFixed(1)} 级</span>
                </div>
                <div className="quake-core">
                  <div className="core-inner" />
                  <div className="core-outer" />
                  <span className="core-label">震源</span>
                  {quakeActive && (
                    <>
                      <div className={`wave-ring wave-p ${activeWave.id === 'p' ? 'active-wave' : ''}`} />
                      <div className={`wave-ring wave-s ${activeWave.id === 's' ? 'active-wave' : ''}`} />
                      <div className={`wave-ring wave-l ${activeWave.id === 'l' ? 'active-wave' : ''}`} />
                    </>
                  )}
                </div>
                <div className="wave-legend">
                  <div className="wave-item">
                    <span className="wave-dot p-wave" />
                    <span>P波（纵波）</span>
                  </div>
                  <div className="wave-item">
                    <span className="wave-dot s-wave" />
                    <span>S波（横波）</span>
                  </div>
                  <div className="wave-item">
                    <span className="wave-dot l-wave" />
                    <span>面波</span>
                  </div>
                </div>
              </div>

              <div className="volcano-section">
                <div className="volcano-info">
                  <span className="volcano-label">火山喷发</span>
                  <span className="eruption-type">{eruptionType}</span>
                </div>
                <VolcanoModel eruptionIndex={eruptionIndex} viscosity={viscosity} />
              </div>

              <div className="intensity-zones">
                {intensityBands.map((zone, index) => (
                  <div 
                    key={zone.id} 
                    className="intensity-zone"
                    style={{ 
                      width: `${30 + index * 15}%`,
                      animationDelay: `${index * 0.3}s`
                    }}
                  >
                    <span className="zone-label">{zone.label}</span>
                    <span className="zone-value">烈度约 {zone.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="live-data-panel">
              <div className="data-section">
                <h4>📊 实时数据</h4>
                <div className="live-data-grid">
                  <div className="live-data-item">
                    <span>震级</span>
                    <strong>{earthquakeMagnitude.toFixed(1)} 级</strong>
                  </div>
                  <div className="live-data-item">
                    <span>当前波型</span>
                    <strong>{activeWave.name}</strong>
                  </div>
                  <div className="live-data-item">
                    <span>波速</span>
                    <strong>{waveSpeedDisplay}</strong>
                  </div>
                  <div className="live-data-item">
                    <span>黏度相对指数</span>
                    <strong>{viscosity}/100</strong>
                  </div>
                  <div className="live-data-item">
                    <span>挥发分相对指数</span>
                    <strong>{volatileGas}/100</strong>
                  </div>
                  <div className="live-data-item">
                    <span>喷发类型</span>
                    <strong>{eruptionType}</strong>
                  </div>
                  <div className="live-data-item">
                    <span>喷发强度</span>
                    <strong>{eruptionIntensity}</strong>
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

function ElectiveSeven() { return <ElectiveSevenHtmlPage /> }

function ElectiveSevenHtmlPage() {
  return (
    <section className="elective7-shell">
      <header className="elective7-shell__bar">
        <strong>实验七：洋流与水循环过程</strong>
        <Link className="btn" to="/">返回实验目录</Link>
      </header>
      <iframe title="选修一 实验 7：洋流与水循环过程" src="/选修一实验7/index.html" className="elective7-html-frame" />
    </section>
  )
}

const dayPresets = [
  { label: '春分', value: '春分', declination: 0 },
  { label: '夏至', value: '夏至', declination: 23.5 },
  { label: '秋分', value: '秋分', declination: 0 },
  { label: '冬至', value: '冬至', declination: -23.5 },
]

const pressureBands = [
  { id: 'equatorial-low', name: '赤道低压带（ITCZ）', baseLat: 0, color: '#c2410c' },
  { id: 'subtropical-high-n', name: '副热带高压带', baseLat: 30, color: '#1d4ed8' },
  { id: 'subtropical-high-s', name: '副热带高压带', baseLat: -30, color: '#1d4ed8' },
  { id: 'subpolar-low-n', name: '副极地低压带', baseLat: 60, color: '#b45309' },
  { id: 'subpolar-low-s', name: '副极地低压带', baseLat: -60, color: '#b45309' },
  { id: 'polar-high-n', name: '极地高压带', baseLat: 90, color: '#1e3a8a' },
  { id: 'polar-high-s', name: '极地高压带', baseLat: -90, color: '#1e3a8a' },
]

const windBands = [
  { id: 'trade-winds-n', name: '东北信风', startLat: 0, endLat: 30, direction: -1, color: '#0ea5e9' },
  { id: 'trade-winds-s', name: '东南信风', startLat: -30, endLat: 0, direction: 1, color: '#0ea5e9' },
  { id: 'westerlies-n', name: '盛行西风带', startLat: 30, endLat: 60, direction: 1, color: '#4f46e5' },
  { id: 'westerlies-s', name: '盛行西风带', startLat: -60, endLat: -30, direction: -1, color: '#4f46e5' },
  { id: 'polar-easterlies-n', name: '极地东风带', startLat: 60, endLat: 90, direction: -1, color: '#4338ca' },
  { id: 'polar-easterlies-s', name: '极地东风带', startLat: -90, endLat: -60, direction: 1, color: '#4338ca' },
]

const seasonPresets = [
  { id: 'jan', label: '1 月（北半球冬季）', subsolarLat: -23.5, note: '太阳直射点位于南回归线附近' },
  { id: 'jul', label: '7 月（北半球夏季）', subsolarLat: 23.5, note: '太阳直射点位于北回归线附近' },
]



const radiationSeasons = [
  { id: 'mar', label: '春分', subsolarLat: 0, note: '直射点位于赤道附近，低纬辐射最强。' },
  { id: 'jun', label: '夏至', subsolarLat: 23.5, note: '北半球中高纬获得更多太阳辐射。' },
  { id: 'dec', label: '冬至', subsolarLat: -23.5, note: '南半球辐射增强，北半球显著减弱。' },
]

const cloudPresets = [
  { id: 'clear', label: '晴空', factor: 0.15, note: '大气透过率高，辐射损失小。' },
  { id: 'partly', label: '多云', factor: 0.45, note: '散射增强，直达辐射降低。' },
  { id: 'overcast', label: '浓云', factor: 0.7, note: '云层反射强，地表受热明显减弱。' },
]

const terrainCases = [
  {
    id: 'tibet',
    name: '青藏高原',
    lat: 31.5,
    elevation: 4.2,
    cloud: 0.28,
    note: '高海拔、空气稀薄、晴天比例高。',
  },
  {
    id: 'sichuan',
    name: '四川盆地',
    lat: 30.5,
    elevation: 0.6,
    cloud: 0.68,
    note: '盆地地形、湿润多雾，云量大。',
  },
]

const flareLevels = [
  { id: 'c', label: 'C 级', intensity: 1 },
  { id: 'm', label: 'M 级', intensity: 2 },
  { id: 'x', label: 'X 级', intensity: 3 },
]

const radiationTasks = [
  {
    id: 'task-plateau',
    title: '对比青藏高原与四川盆地年太阳辐射总量',
    detail: '切换“案例对比”按钮，记录辐射指数并解释“高辐射低气温”现象。',
  },
  {
    id: 'task-flare',
    title: '触发一次 X 级耀斑爆发',
    detail: '将耀斑强度切换为 X 级，记录 10 分钟后高纬度短波通信状态。',
  },
]

const radiationExamItems = [
  {
    id: 'exam-2023',
    source: '2023·全国甲卷·1-2 题',
    stem:
      '太阳辐射强度受纬度、海拔、天气状况等因素影响。青藏高原是我国太阳辐射最强的地区，而四川盆地是我国太阳辐射最弱的地区之一。',
    questions: [
      {
        id: 'q1',
        stem: '青藏高原太阳辐射强的主要原因是（ ）',
        options: ['A. 纬度低，太阳高度角大', 'B. 海拔高，空气稀薄', 'C. 晴天多，日照时间长', 'D. 地势高，距太阳近'],
        answer: 'B',
        explanation: '高海拔空气稀薄，削弱作用小，太阳辐射更强。',
      },
      {
        id: 'q2',
        stem: '四川盆地太阳辐射弱的主要原因是（ ）',
        options: ['A. 纬度较高', 'B. 海拔较低', 'C. 多云雾天气', 'D. 植被覆盖率高'],
        answer: 'C',
        explanation: '云雾多导致短波辐射衰减明显。',
      },
    ],
  },
  {
    id: 'exam-2020',
    source: '2020·天津卷·1-2 题',
    stem:
      '2017 年 9 月太阳发生多次强烈耀斑爆发，导致地球部分地区短波通信中断。',
    questions: [
      {
        id: 'q3',
        stem: '耀斑爆发主要发生在太阳大气的（ ）',
        options: ['A. 光球层', 'B. 色球层', 'C. 日冕层', 'D. 对流层'],
        answer: 'B',
        explanation: '耀斑发生在色球层与日冕底部。',
      },
      {
        id: 'q4',
        stem: '耀斑爆发导致短波通信中断的原因是（ ）',
        options: ['A. 释放大量能量，使地球温度升高', 'B. 发射强烈电磁波，干扰地球电离层', 'C. 抛出大量带电粒子，直接破坏通信设备', 'D. 引发强烈磁暴，使指南针不能正确指示方向'],
        answer: 'B',
        explanation: '强电磁辐射扰动电离层，使短波反射通信受阻。',
      },
    ],
  },
]

const fossilLayers = [
  {
    id: 'archean',
    label: '太古宙',
    color: 0x2d5a3d,
    icon: '化石',
    lithology: '硅质叠层石，微生物席形成的层状沉积结构。',
    environment: '浅海潮坪，原始生命摇篮。',
    era: '太古宙',
    eraDetail: '太古宙晚期',
    event: '生命起源与光合作用出现',
    fossils: ['蓝细菌', '叠层石'],
    realEraDetail: '太古宙（35亿年前）',
    realLithology: '燧石层与碳酸盐叠层石',
    realFossils: ['蓝细菌化石', '叠层石'],
    realEnvironment: '温暖浅海，最早的生态系统',
  },
  {
    id: 'proterozoic',
    label: '元古宙',
    color: 0x1e4d2e,
    icon: '化石',
    lithology: '黑色页岩与铁矿层，富含有机质。',
    environment: '海洋，氧气开始积累。',
    era: '元古宙',
    eraDetail: '中元古代',
    event: '大氧化事件',
    fossils: ['蓝细菌', '铁细菌'],
    realEraDetail: '中元古代（18亿年前）',
    realLithology: '条带状含铁建造（BIF）',
    realFossils: ['蓝细菌', '丝状微生物'],
    realEnvironment: '缺氧海洋开始氧化，形成巨型铁矿床',
  },
  {
    id: 'cambrian',
    label: '寒武纪',
    color: 0x4a6f7a,
    icon: '化石',
    lithology: '灰色页岩夹石灰岩，海相沉积明显，含丰富海洋无脊椎动物化石。',
    environment: '浅海大陆架，海洋无脊椎动物繁盛。',
    era: '古生代',
    eraDetail: '寒武纪',
    event: '寒武纪生命大爆发',
    fossils: ['三叶虫', '腕足动物', '笔石'],
    realEraDetail: '寒武纪（5.41-4.85亿年前）',
    realLithology: '碳质页岩与硅质岩，富含外骨骼动物化石群',
    realFossils: ['三叶虫', '奇虾', '海口鱼', '腕足动物'],
    realEnvironment: '浅海陆棚，寒冷富氧，生物多样性爆发',
  },
  {
    id: 'ordovician',
    label: '奥陶纪',
    color: 0x5a6b7c,
    icon: '化石',
    lithology: '黑色页岩，笔石化石密集分布。',
    environment: '远洋深海，漂浮生物繁盛。',
    era: '古生代',
    eraDetail: '奥陶纪',
    event: '海洋生物辐射演化',
    fossils: ['笔石', '牙形石'],
    realEraDetail: '奥陶纪（4.85-4.43亿年前）',
    realLithology: '黑色碳质页岩',
    realFossils: ['笔石', '牙形石', '三叶虫'],
    realEnvironment: '广阔的古海洋，气候温暖',
  },
  {
    id: 'devonian',
    label: '泥盆纪',
    color: 0x3d6b7c,
    icon: '化石',
    lithology: '生物碎屑石灰岩，珊瑚化石保存完好。',
    environment: '温暖浅海，珊瑚礁发育。',
    era: '古生代',
    eraDetail: '泥盆纪',
    event: '鱼类时代与陆生植物出现',
    fossils: ['珊瑚', '菊石', '盾皮鱼'],
    realEraDetail: '泥盆纪（4.19-3.59亿年前）',
    realLithology: '珊瑚礁石灰岩',
    realFossils: ['四射珊瑚', '菊石', '邓氏鱼'],
    realEnvironment: '温暖浅海，第一个森林出现',
  },
  {
    id: 'carboniferous',
    label: '石炭纪',
    color: 0x4a7c5d,
    icon: '化石',
    lithology: '煤层与页岩互层，植物化石丰富。',
    environment: '沼泽森林，巨型昆虫时代。',
    era: '古生代',
    eraDetail: '石炭纪',
    event: '巨型昆虫与煤炭形成',
    fossils: ['蕨类', '鳞木', '蜻蜓'],
    realEraDetail: '石炭纪（3.59-2.99亿年前）',
    realLithology: '煤层与三角洲沉积',
    realFossils: ['鳞木', '封印木', '巨型蜻蜓'],
    realEnvironment: '广阔沼泽，气候温暖湿润',
  },
  {
    id: 'permian',
    label: '二叠纪',
    color: 0x6b7c5a,
    icon: '化石',
    lithology: '红色砂岩，含两栖动物骨骼化石。',
    environment: '河湖平原，四足动物登陆。',
    era: '古生代',
    eraDetail: '二叠纪',
    event: '爬行动物崛起与生物大灭绝',
    fossils: ['两栖类', '早期爬行类'],
    realEraDetail: '二叠纪（2.99-2.52亿年前）',
    realLithology: '内陆盆地红色砂岩',
    realFossils: ['迷齿类', '盘龙类', '兽孔类'],
    realEnvironment: '超级盘古大陆，末期发生最大灭绝事件',
  },
  {
    id: 'triassic',
    label: '三叠纪',
    color: 0x7b6b4a,
    icon: '化石',
    lithology: '紫红色泥岩，早期爬行动物化石。',
    environment: '干旱盆地，生命复苏。',
    era: '中生代',
    eraDetail: '三叠纪',
    event: '恐龙出现，生命从大灭绝中复苏',
    fossils: ['早期恐龙', '菊石', '鱼龙'],
    realEraDetail: '三叠纪（2.52-2.01亿年前）',
    realLithology: '红层沉积与蒸发岩',
    realFossils: ['板龙', '菊石', '鱼龙'],
    realEnvironment: '干旱气候，盘古大陆开始分裂',
  },
  {
    id: 'jurassic',
    label: '侏罗纪',
    color: 0x8b7355,
    icon: '化石',
    lithology: '灰黑色泥岩，含菊石与海生爬行动物碎屑。',
    environment: '温暖海洋，板块运动活跃。',
    era: '中生代',
    eraDetail: '侏罗纪',
    event: '恐龙繁盛，爬行动物主宰海陆空',
    fossils: ['菊石', '鱼龙', '梁龙'],
    realEraDetail: '侏罗纪（2.01-1.45亿年前）',
    realLithology: '菊石石灰岩与泥灰岩互层，海相沉积',
    realFossils: ['菊石', '蛇颈龙', '梁龙', '腕龙'],
    realEnvironment: '温暖浅海与陆相盆地，恐龙统治陆地',
  },
  {
    id: 'cretaceous',
    label: '白垩纪',
    color: 0x9a6c4a,
    icon: '化石',
    lithology: '红色砂岩夹砾岩，陆相沉积明显，发现恐龙蛋与足迹。',
    environment: '河湖平原，恐龙栖息地。',
    era: '中生代',
    eraDetail: '白垩纪',
    event: '恐龙繁盛接近末期',
    fossils: ['恐龙蛋', '霸王龙头骨', '三角恐龙'],
    realEraDetail: '白垩纪晚期（0.72-0.66亿年前）',
    realLithology: '河湖相砂砾岩与火山碎屑岩',
    realFossils: ['霸王龙', '三角龙', '肿头龙', '恐龙蛋'],
    realEnvironment: '河流湖泊密集区，恐龙多样性达到顶峰',
  },
  {
    id: 'cenozoic',
    label: '古近纪',
    color: 0x7a8b9c,
    icon: '化石',
    lithology: '湖相泥岩，鸟类化石保存精美。',
    environment: '湖泊与森林，鸟类辐射演化。',
    era: '新生代',
    eraDetail: '古近纪',
    event: '恐龙灭绝后哺乳动物快速演化',
    fossils: ['早期鸟类', '古新世哺乳动物'],
    realEraDetail: '古近纪（66-2300万年前）',
    realLithology: '湖相沉积与煤层',
    realFossils: ['始祖鸟', '猛禽', '早期灵长类'],
    realEnvironment: '气候温暖，哺乳动物开始多样化',
  },
  {
    id: 'quaternary',
    label: '第四纪',
    color: 0x6b7280,
    icon: '化石',
    lithology: '褐色砂质粘土，含哺乳动物与草原花粉。',
    environment: '草原与林地镶嵌，哺乳动物扩张。',
    era: '新生代',
    eraDetail: '第四纪',
    event: '哺乳动物与人类祖先崛起',
    fossils: ['猛犸象', '披毛犀', '大角鹿'],
    realEraDetail: '更新世（180-1.1万年前）',
    realLithology: '黄土与河湖相砂砾互层',
    realFossils: ['猛犸象', '披毛犀', '大角鹿', '原始牛'],
    realEnvironment: '冰期草原与针叶林，巨型哺乳动物繁盛',
  },
]

const timelineStages = [
  {
    id: 'hadean',
    label: '冥古宙',
    time: '46-40 亿年前',
    scene: '炽热熔岩海与陨石轰击',
    color: '#7c2d12',
  },
  {
    id: 'archean',
    label: '太古宙',
    time: '40-25 亿年前',
    scene: '原始海洋与微生物垫',
    color: '#0f766e',
  },
  {
    id: 'proterozoic',
    label: '元古宙',
    time: '25-5.41 亿年前',
    scene: '大氧化事件，海洋含氧上升',
    color: '#0284c7',
  },
  {
    id: 'paleozoic',
    label: '古生代',
    time: '5.41-2.52 亿年前',
    scene: '海洋无脊椎动物爆发、蕨类森林形成',
    color: '#0ea5e9',
  },
  {
    id: 'mesozoic',
    label: '中生代',
    time: '2.52-0.66 亿年前',
    scene: '恐龙世界与裸子植物繁盛',
    color: '#f59e0b',
  },
  {
    id: 'cenozoic',
    label: '新生代',
    time: '0.66 亿年前-至今',
    scene: '哺乳动物草原与人类出现',
    color: '#22c55e',
  },
]

const timelineEvents = [
  {
    id: 'oxygen',
    label: '大氧化事件',
    time: '约 24 亿年前',
    detail: '蓝藻释放氧气，地球大气成分发生质变。',
  },
  {
    id: 'permian',
    label: '二叠纪末大灭绝',
    time: '约 2.52 亿年前',
    detail: '地质史最大规模生物灭绝事件，海陆生态崩溃。',
  },
  {
    id: 'cretaceous',
    label: '白垩纪末大灭绝',
    time: '约 0.66 亿年前',
    detail: '恐龙等大型爬行动物消失，哺乳动物迎来扩张。',
  },
  {
    id: 'human',
    label: '人类出现',
    time: '约 30 万年前',
    detail: '现代智人出现，进入人类纪元。',
  },
]

const investigationTasks = [
  {
    id: 'task-trilobite',
    title: '任务 1：定位三叶虫地层',
    detail: '挖掘到三叶虫化石，判断其地质年代并选择对应的海陆格局。',
  },
  {
    id: 'task-extinction',
    title: '任务 2：锁定两次生物大灭绝',
    detail: '拖动时间轴找到二叠纪末和白垩纪末大灭绝，并分析可能的环境诱因。',
  },
]

const geologyExamItems = [
  {
    id: 'geo-2022',
    source: '2022·山东卷·1-2 题',
    stem:
      '地质学家在某地发现了一套地层剖面，从下到上依次发现了三叶虫化石、恐龙化石、哺乳动物化石。据此完成 1-2 题。',
    questions: [
      {
        id: 'g1',
        stem: '该地层剖面反映的地质年代顺序是（ ）',
        options: ['A. 新生代→中生代→古生代', 'B. 古生代→中生代→新生代', 'C. 中生代→古生代→新生代', 'D. 新生代→古生代→中生代'],
        answer: 'B',
        explanation: '地层由下至上时间由老到新，三叶虫→恐龙→哺乳动物对应古生代→中生代→新生代。',
      },
      {
        id: 'g2',
        stem: '含三叶虫化石的地层形成的地质时期（ ）',
        options: ['A. 是重要的成煤期', 'B. 出现了人类', 'C. 海洋无脊椎动物繁盛', 'D. 被子植物繁盛'],
        answer: 'C',
        explanation: '三叶虫属于海洋无脊椎动物，古生代早期最为繁盛。',
      },
    ],
  },
  {
    id: 'geo-2021',
    source: '2021·河北卷·1-2 题',
    stem:
      '地球演化经历了漫长的地质历史时期。下列关于地质年代与生物演化的对应关系，正确的是（ ）',
    questions: [
      {
        id: 'g3',
        stem: '古生代早期（ ）',
        options: ['A. 蕨类植物繁盛', 'B. 海洋无脊椎动物繁盛', 'C. 恐龙繁盛', 'D. 哺乳动物繁盛'],
        answer: 'B',
        explanation: '古生代早期海洋无脊椎动物最为繁盛。',
      },
      {
        id: 'g4',
        stem: '中生代末期发生的重大事件是（ ）',
        options: ['A. 大氧化事件', 'B. 第一次生物大灭绝', 'C. 恐龙灭绝', 'D. 人类出现'],
        answer: 'C',
        explanation: '中生代末白垩纪大灭绝导致恐龙灭绝。',
      },
    ],
  },
]

const oceanLayoutOptions = [
  {
    id: 'paleozoic',
    label: '古生代浅海大陆架',
    description: '大陆面积较小，浅海覆盖广，海洋无脊椎动物繁盛。',
  },
  {
    id: 'mesozoic',
    label: '中生代恐龙大陆',
    description: '泛大陆逐渐破裂，内陆盆地与浅海并存。',
  },
  {
    id: 'cenozoic',
    label: '新生代草原大陆',
    description: '大陆面积扩大，草原、森林与冰期交替。',
  },
]

const earthLayerCards = [
  {
    id: 'atmosphere',
    name: '大气圈',
    depth: '0-100 km',
    material: '氮氧为主',
    state: '气态',
    highlight: '天气与气候变化发生的空间',
    color: 0x4a8dc5,
    radius: 2.3,
  },
  {
    id: 'hydrosphere',
    name: '水圈',
    depth: '0-11 km',
    material: '液态水',
    state: '液态',
    highlight: '海洋、江河与地下水',
    color: 0x2d5a87,
    radius: 2.12,
  },
  {
    id: 'biosphere',
    name: '生物圈',
    depth: '0-10 km',
    material: '生命活动区',
    state: '生命活动',
    highlight: '与大气圈、水圈紧密互动',
    color: 0x4a6f5a,
    radius: 1.95,
  },
  {
    id: 'crust',
    name: '地壳',
    depth: '0-35 km',
    material: '硅铝质岩石',
    state: '固态',
    highlight: '板块活动的直接承载层',
    color: 0x9a7b4f,
    radius: 1.72,
  },
  {
    id: 'mantle',
    name: '地幔',
    depth: '35-2900 km',
    material: '硅镁质岩石',
    state: '固态/塑性流动',
    highlight: '软流层所在，驱动板块运动',
    color: 0x8b5a2b,
    radius: 1.25,
  },
  {
    id: 'outer-core',
    name: '外核',
    depth: '2900-5150 km',
    material: '铁镍熔融',
    state: '液态',
    highlight: '产生地磁场的重要区域',
    color: 0xa04000,
    radius: 0.82,
  },
  {
    id: 'inner-core',
    name: '内核',
    depth: '5150-6371 km',
    material: '铁镍合金',
    state: '固态',
    highlight: '高压下的固态金属核心',
    color: 0x6b4423,
    radius: 0.48,
  },
]

const seismicWaveProfile = [
  { depth: '0 km', p: 6, s: 3.5 },
  { depth: '35 km', p: 8, s: 4.5, mark: '莫霍面' },
  { depth: '1000 km', p: 12, s: 6.5 },
  { depth: '2900 km', p: 13.5, s: 0, mark: '古登堡面' },
  { depth: '5150 km', p: 10, s: 0 },
]

const shadowZones = [
  { id: 'p', label: 'P 波阴影区', range: '103°-142°', note: '折射后无法直达地表' },
  { id: 's', label: 'S 波阴影区', range: '103°-180°', note: '液态外核阻断传播' },
]

const interactionFlows = [
  {
    id: 'volcano',
    title: '火山喷发',
    detail: '地幔物质上涌 → 地壳裂隙 → 大气/水体输入气体与灰尘。',
  },
  {
    id: 'water',
    title: '水循环',
    detail: '蒸发进入大气圈 → 降水补给水圈 → 渗透进入岩石圈。',
  },
  {
    id: 'life',
    title: '植物生长',
    detail: '光合作用吸收 CO₂ → 土壤养分回到岩石圈 → 水圈供水。',
  },
]

const requiredFourTasks = [
  {
    id: 'task-wave',
    title: '任务 1：发射一次地震波',
    detail: '观察 2900 km 深度处 S 波消失，推断外核物质状态。',
  },
  {
    id: 'task-asthenosphere',
    title: '任务 2：剥离至地幔层',
    detail: '定位软流层位置，并说明其与岩石圈的关系。',
  },
]

const requiredFourExamItems = [
  {
    id: 'exam-2023-zj',
    source: '2023·浙江卷·1-2 题',
    stem: '地震波波速随深度变化曲线见示意图。',
    questions: [
      {
        id: 'q1',
        stem: '波速突然增加的界面 A 是（ ）',
        options: ['A. 莫霍面', 'B. 古登堡面', 'C. 地幔与地核分界面', 'D. 地壳内部分界面'],
        answer: 'A',
        explanation: '地壳进入地幔，介质性质突变，波速显著增加。',
      },
      {
        id: 'q2',
        stem: '在 2900 km 深度处 S 波消失的原因是（ ）',
        options: ['A. 温度过高', 'B. 压力过大', 'C. 物质呈液态', 'D. 物质呈固态'],
        answer: 'C',
        explanation: 'S 波不能在液体中传播，说明外核为液态。',
      },
    ],
  },
  {
    id: 'exam-2020-js',
    source: '2020·江苏卷·1-2 题',
    stem: '地球内部圈层结构中，岩石圈与软流层的关系如下。',
    questions: [
      {
        id: 'q3',
        stem: '岩石圈包括（ ）',
        options: ['A. 地壳和上地幔顶部', 'B. 地壳和软流层', 'C. 地幔和地核', 'D. 地壳和整个地幔'],
        answer: 'A',
        explanation: '岩石圈由地壳和上地幔最上部组成，整体较刚性。',
      },
      {
        id: 'q4',
        stem: '软流层位于（ ）',
        options: ['A. 地壳中', 'B. 上地幔上部', 'C. 下地幔', 'D. 外核'],
        answer: 'B',
        explanation: '软流层位于上地幔上部，可发生塑性流动。',
      },
    ],
  },
]

function calculateRadiationScore({ lat, subsolarLat, cloud, elevation }) {
  const latFactor = Math.cos(((lat - subsolarLat) * Math.PI) / 180)
  const latitudeScore = Math.max(0, latFactor)
  const altitudeBoost = 1 + elevation * 0.08
  const cloudLoss = 1 - cloud * 0.7
  return Math.max(12, Math.min(100, latitudeScore * 80 * altitudeBoost * cloudLoss + 10))
}

function RequiredTwo() {
  const [seasonIndex, setSeasonIndex] = useState(1)
  const [cloudIndex, setCloudIndex] = useState(1)
  const [elevation, setElevation] = useState(2.6)
  const [activeCaseId, setActiveCaseId] = useState('tibet')
  const [flareLevel, setFlareLevel] = useState('x')
  const [flareActive, setFlareActive] = useState(false)
  const [flareMinute, setFlareMinute] = useState(0)
  const [clickData, setClickData] = useState(null)

  const { openInfo } = useContext(InfoModalContext)

  const season = radiationSeasons[seasonIndex]
  const cloudPreset = cloudPresets[cloudIndex]
  const activeCase = terrainCases.find((item) => item.id === activeCaseId) ?? terrainCases[0]
  const flare = flareLevels.find((item) => item.id === flareLevel) ?? flareLevels[2]

  useEffect(() => {
    if (!flareActive) return
    const timer = setInterval(() => {
      setFlareMinute((prev) => {
        if (prev >= 10) {
          return 10
        }
        return Math.min(10, parseFloat((prev + 0.5).toFixed(1)))
      })
    }, 800)
    return () => clearInterval(timer)
  }, [flareActive])

  const handleTriggerFlare = () => {
    setFlareActive(true)
    setFlareMinute(0)
  }

  const handleResetFlare = () => {
    setFlareActive(false)
    setFlareMinute(0)
  }

  const terrainComparisons = useMemo(() => {
    return terrainCases.map((item) => {
      const annualTotal = radiationSeasons.reduce((sum, entry) => {
        return sum + calculateRadiationScore({
          lat: item.lat,
          subsolarLat: entry.subsolarLat,
          cloud: item.cloud,
          elevation: item.elevation,
        })
      }, 0)
      return {
        ...item,
        annualScore: Math.round(annualTotal / radiationSeasons.length),
      }
    })
  }, [])

  const activeRadiationScore = useMemo(() => {
    return Math.round(
      calculateRadiationScore({
        lat: activeCase.lat,
        subsolarLat: season.subsolarLat,
        cloud: cloudPreset.factor,
        elevation,
      })
    )
  }, [activeCase.lat, cloudPreset.factor, elevation, season.subsolarLat])

  const baseRadiationScore = useMemo(() => {
    return Math.round(
      calculateRadiationScore({
        lat: activeCase.lat,
        subsolarLat: season.subsolarLat,
        cloud: activeCase.cloud,
        elevation: activeCase.elevation,
      })
    )
  }, [activeCase, season.subsolarLat])

  const systemStatuses = useMemo(() => {
    const minute = flareMinute
    const intensity = flare.intensity
    const isActive = flareActive
    const shortwave = !isActive
      ? '正常'
      : minute < 2
        ? '正常'
        : minute <= 6
          ? '故障'
          : minute <= 10
            ? '恢复'
            : '正常'
    const navigation = !isActive
      ? '正常'
      : minute < 3
        ? '正常'
        : minute <= 8
          ? '故障'
          : minute <= 10
            ? '恢复'
            : '正常'
    const grid = !isActive
      ? '正常'
      : intensity < 3
        ? minute < 4
          ? '正常'
          : minute <= 7
            ? '波动'
            : minute <= 10
              ? '恢复'
              : '正常'
        : minute < 4
          ? '正常'
          : minute <= 7
            ? '故障'
            : minute <= 10
              ? '恢复'
              : '正常'

    return [
      { id: 'shortwave', label: '短波通信', status: shortwave },
      { id: 'navigation', label: '卫星导航', status: navigation },
      { id: 'grid', label: '电网运行', status: grid },
    ]
  }, [flare, flareActive, flareMinute])

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块二：太阳辐射分布与太阳活动效应（必修一 实验 2）</h1>
            <p className="muted">对应教材：必修 1 第一章《宇宙中的地球》第 2 节</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('大气能量收支与热力环流', '<p>本实验展示大气能量收支平衡和热力环流的形成机制。</p><p><strong>操作说明：</strong></p><ul><li>点击热源/冷源位置，观察能量流动</li><li>使用控制台调整云量、CO₂等参数</li><li>观察气团移动和风向变化</li></ul><p><strong>热力环流原理：</strong></p><ul><li>热胀冷缩：受热膨胀上升，冷却收缩下沉</li><li>垂直气压差：热区低压，冷区高压</li><li>水平气流：从高压流向低压</li></ul>')
              }}
            >
              操作指南
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>
                太阳辐射随纬度、地形、天气变化的空间差异难以直观量化；太阳活动周期性对电离层与磁层的影响较抽象。
                本实验通过热力图 + 案例对比 + 太阳爆发演示，帮助学生建立“辐射—地表—人类活动”的因果链条。
              </p>
            </div>

            <div className="panel-block">
              <h2>辐射分布热力图控制台</h2>
              <div className="control-group">
                <label>
                  季节：<span>{season?.label}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={radiationSeasons.length - 1}
                  step={1}
                  value={seasonIndex}
                  onChange={(event) => setSeasonIndex(parseInt(event.target.value, 10))}
                />
                <div className="pill-row">
                  {radiationSeasons.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${index === seasonIndex ? 'active' : ''}`}
                      onClick={() => setSeasonIndex(index)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="muted">{season?.note}</p>
              </div>

              <div className="control-group">
                <label>
                  云层厚度：<span>{cloudPreset?.label}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={cloudPresets.length - 1}
                  step={1}
                  value={cloudIndex}
                  onChange={(event) => setCloudIndex(parseInt(event.target.value, 10))}
                />
                <div className="pill-row">
                  {cloudPresets.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${index === cloudIndex ? 'active' : ''}`}
                      onClick={() => setCloudIndex(index)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="muted">{cloudPreset?.note}</p>
              </div>

              <div className="control-group">
                <label>
                  海拔高度：<span>{elevation.toFixed(1)} km</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.2}
                  value={elevation}
                  onChange={(event) => setElevation(parseFloat(event.target.value))}
                />
              </div>
              <div className="kpi">
                <div className="k">
                  <strong>当前辐射指数</strong>
                  <span>{activeRadiationScore}</span>
                </div>
                <div className="k">
                  <strong>案例情境指数</strong>
                  <span>{baseRadiationScore}</span>
                </div>
                <div className="k">
                  <strong>地形提示</strong>
                  <span>{activeCase.note}</span>
                </div>
              </div>
              
              <div className="info-panel">
                <h3>💡 科学原理</h3>
                <p>太阳辐射强度主要受以下因素影响：</p>
                <ul>
                  <li><strong>纬度效应</strong>：太阳高度角随纬度增加而减小，导致单位面积接收到的辐射减少</li>
                  <li><strong>昼夜变化</strong>：同一地点不同时刻太阳高度角不同，正午辐射最强</li>
                  <li><strong>海拔高度</strong>：海拔越高，大气稀薄，对太阳辐射的削弱作用越小</li>
                  <li><strong>云层覆盖</strong>：云层反射和吸收太阳辐射，减少到达地面的能量</li>
                </ul>
              </div>
              
              <div className="info-panel">
                <h3>📊 实时数据</h3>
                <div className="data-grid">
                  <div className="data-item">
                    <span className="data-label">当前太阳直射纬度</span>
                    <span className="data-value">{season.subsolarLat > 0 ? 'N' : 'S'} {Math.abs(season.subsolarLat)}°</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">案例地点纬度</span>
                    <span className="data-value">{activeCase.lat > 0 ? 'N' : 'S'} {Math.abs(activeCase.lat)}°</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">云层衰减系数</span>
                    <span className="data-value">{cloudPreset.factor.toFixed(2)}</span>
                  </div>
                  <div className="data-item">
                    <span className="data-label">海拔增益</span>
                    <span className="data-value">+{(elevation * 8).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>案例对比切换</h2>
              <p className="muted">一键切换典型地形，观察辐射强度与云量的差异。</p>
              <div className="pill-row">
                {terrainCases.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pill ${item.id === activeCaseId ? 'active' : ''}`}
                    onClick={() => {
                      setActiveCaseId(item.id)
                      setElevation(item.elevation)
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="compare-grid">
                {terrainComparisons.map((item) => (
                  <div key={item.id} className="compare-card">
                    <h3>{item.name}</h3>
                    <p>海拔：{item.elevation} km</p>
                    <p>云量系数：{item.cloud.toFixed(2)}</p>
                    <p>年辐射指数：{item.annualScore}</p>
                    <p className="muted">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>太阳活动爆发模拟</h2>
              <div className="info-panel">
                <h3>🔭 太阳活动科普</h3>
                <p><strong>耀斑（Solar Flare）</strong>：太阳表面突然爆发的剧烈能量释放现象，持续时间从几分钟到几小时不等。</p>
                <p><strong>日冕物质抛射（CME）</strong>：太阳日冕层物质被抛射到行星际空间的现象，速度可达每秒数百公里。</p>
                <p><strong>影响过程</strong>：耀斑 → X射线暴 → 电离层扰动 → 短波通信中断；CME → 磁暴 → 卫星导航异常、电网故障。</p>
              </div>
              <div className="control-group">
                <label>
                  耀斑强度：<span>{flare.label}</span>
                </label>
                <div className="pill-row">
                  {flareLevels.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${item.id === flareLevel ? 'active' : ''}`}
                      onClick={() => setFlareLevel(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-group">
                <label>
                  爆发进程：<span>{flareMinute.toFixed(1)} 分钟</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={flareMinute}
                  onChange={(event) => setFlareMinute(parseFloat(event.target.value))}
                />
              </div>
              <div className="exp-actions">
                <button type="button" className="btn" onClick={handleTriggerFlare}>
                  触发耀斑爆发
                </button>
                <button type="button" className="btn ghost" onClick={handleResetFlare}>
                  重置模拟
                </button>
              </div>
            </div>

            <div className="panel-block">
              <h2>影响连锁反应</h2>
              <p className="muted">
                关注“电离层—磁层—人类系统”的耦合：高纬度通信最敏感，导航与电网随后受到影响。
              </p>
              <div className="status-grid">
                {systemStatuses.map((item) => (
                  <div key={item.id} className={`status-card status-${item.status}`}>
                    <div className="status-header">
                      <span className="status-dot" />
                      <strong>{item.label}</strong>
                    </div>
                    <p>{item.status}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {radiationTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {radiationExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-section">
                <h3>📚 知识与技能目标</h3>
                <div className="objectives-grid">
                  <div className="objective-item">
                    <h4>记忆层次</h4>
                    <ul>
                      <li>太阳辐射的概念与组成</li>
                      <li>太阳活动的类型（黑子、耀斑、日珥）</li>
                      <li>太阳常数的基本数值</li>
                    </ul>
                  </div>
                  <div className="objective-item">
                    <h4>理解层次</h4>
                    <ul>
                      <li>太阳辐射的纬度分布规律</li>
                      <li>太阳活动对地球磁场的影响机制</li>
                      <li>太阳活动周期的形成原理</li>
                    </ul>
                  </div>
                  <div className="objective-item">
                    <h4>应用层次</h4>
                    <ul>
                      <li>解释太阳辐射对农业生产的影响</li>
                      <li>分析太阳活动对无线电通信的干扰</li>
                      <li>说明太阳活动与极光现象的关系</li>
                    </ul>
                  </div>
                  <div className="objective-item">
                    <h4>分析层次</h4>
                    <ul>
                      <li>对比不同纬度地区太阳辐射强度差异</li>
                      <li>探究太阳活动对气候变化的影响</li>
                      <li>分析太阳活动预报的实际意义</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="competencies-section">
                <h3>🌍 学科核心素养</h3>
                <div className="competencies-list">
                  <div className="competency-item">
                    <strong>区域认知</strong>
                    <p>理解不同纬度区域太阳辐射的分布差异，分析区域特征对辐射接收的影响</p>
                  </div>
                  <div className="competency-item">
                    <strong>综合思维</strong>
                    <p>综合分析太阳活动对地球多圈层（大气圈、磁层、人类活动）的影响</p>
                  </div>
                  <div className="competency-item">
                    <strong>地理实践力</strong>
                    <p>通过模拟实验探究太阳辐射和太阳活动的变化规律及其影响</p>
                  </div>
                </div>
              </div>
              <div className="keypoints-section">
                <h3>⭐ 重点内容</h3>
                <ul className="keypoints-list">
                  <li>太阳辐射的时空分布规律</li>
                  <li>太阳活动的周期性变化</li>
                  <li>太阳活动对人类活动的影响</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="panel canvas">
            <RequiredTwoScene
              subsolarLat={season.subsolarLat}
              cloudFactor={cloudPreset.factor}
              elevation={elevation}
              flareActive={flareActive}
              flareIntensity={flare.intensity}
              flareMinute={flareMinute}
              onDataUpdate={setClickData}
            />
            <div className="canvas-overlay">
              {clickData && (
                <div className="click-info">
                  <h4>点击位置数据</h4>
                  <p>纬度: {clickData.lat > 0 ? 'N' : 'S'} {Math.abs(clickData.lat).toFixed(1)}°</p>
                  <p>经度: {clickData.lon > 0 ? 'E' : 'W'} {Math.abs(clickData.lon).toFixed(1)}°</p>
                  <p>辐射指数: {clickData.radiation.toFixed(2)}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function RequiredTwoScene({ subsolarLat, cloudFactor, elevation, flareActive, flareIntensity, flareMinute, onDataUpdate }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f7f9ff')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 1.4, 4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2.5
    controls.maxDistance = 7

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.1)
    sunLight.position.set(4, 2, 3)
    scene.add(sunLight)

    const earthTexture = createEarthTexture() ?? new THREE.CanvasTexture(document.createElement('canvas'))
    earthTexture.needsUpdate = true

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({ map: earthTexture, roughness: 0.75, metalness: 0.05 })
    )
    scene.add(earth)

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.04, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.18 })
    )
    scene.add(atmosphere)

    const atmosphereGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.08, side: THREE.BackSide })
    )
    scene.add(atmosphereGlow)

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0xfbbf24, 
        emissive: 0xf59e0b, 
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.1
      })
    )
    sun.position.set(-2.2, 0.8, -0.2)
    scene.add(sun)

    const sunGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 32),
      new THREE.MeshBasicMaterial({ 
        color: 0xfde047, 
        transparent: true, 
        opacity: 0.35,
        side: THREE.BackSide
      })
    )
    sunGlow.position.set(-2.2, 0.8, -0.2)
    scene.add(sunGlow)

    const sunCorona = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 32, 32),
      new THREE.MeshBasicMaterial({ 
        color: 0xfcd34d, 
        transparent: true, 
        opacity: 0.15,
        side: THREE.BackSide
      })
    )
    sunCorona.position.set(-2.2, 0.8, -0.2)
    scene.add(sunCorona)

    const sunSpots = new THREE.Group()
    for (let i = 0; i < 6; i += 1) {
      const spot = new THREE.Mesh(
        new THREE.SphereGeometry(0.05 + i * 0.004, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12 })
      )
      spot.position.set(-2.2 + (Math.random() - 0.5) * 0.2, 0.8 + (Math.random() - 0.5) * 0.2, -0.2)
      sunSpots.add(spot)
    }
    scene.add(sunSpots)

    const magnetosphere = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.04, 12, 80),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 })
    )
    magnetosphere.rotation.x = Math.PI / 2
    scene.add(magnetosphere)

    const magnetosphereLines = new THREE.Group()
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const points = []
      for (let j = 0; j <= 20; j++) {
        const t = j / 20
        const radius = 1.15 + t * 0.3
        const x = Math.cos(angle) * radius * Math.cos(t * Math.PI * 0.3)
        const y = Math.sin(angle) * radius
        const z = radius * Math.sin(t * Math.PI * 0.3) * 1.5
        points.push(new THREE.Vector3(x, y, z))
      }
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.4 })
      )
      magnetosphereLines.add(line)
    }
    scene.add(magnetosphereLines)

    const flareLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0 })
    )
    scene.add(flareLine)

    const particles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ color: 0xfcd34d, size: 0.05, transparent: true, opacity: 0 })
    )
    scene.add(particles)

    const cmeParticles = new THREE.Points(
      new THREE.BufferGeometry(),
      new THREE.PointsMaterial({ 
        color: 0xfa5252, 
        size: 0.08, 
        transparent: true, 
        opacity: 0,
        sizeAttenuation: true
      })
    )
    scene.add(cmeParticles)

    const cmeWave = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0 })
    )
    scene.add(cmeWave)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      earth,
      atmosphere,
      atmosphereGlow,
      earthTexture,
      sun,
      sunGlow,
      sunCorona,
      sunSpots,
      magnetosphere,
      magnetosphereLines,
      flareLine,
      particles,
      cmeParticles,
      cmeWave,
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resize()
    window.addEventListener('resize', resize)
    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)

    const handleClick = (event) => {
      const rect = container.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(earth)
      
      if (intersects.length > 0) {
        const point = intersects[0].point
        const vector = point.clone().normalize()
        
        const lat = Math.asin(vector.y) * (180 / Math.PI)
        const lon = Math.atan2(vector.z, vector.x) * (180 / Math.PI)
        
        const latFactor = Math.cos(((lat - subsolarLat) * Math.PI) / 180)
        const elevationBoost = 1 + elevation * 0.08
        const hourAngle = lon * 15
        const timeFactor = Math.max(0, Math.cos((hourAngle * Math.PI) / 180))
        const seasonFactor = 0.7 + 0.3 * Math.cos((subsolarLat * Math.PI) / 90)
        const radiation = Math.max(0, latFactor) * timeFactor * elevationBoost * (1 - cloudFactor * 0.8) * seasonFactor
        
        if (onDataUpdate) {
          onDataUpdate({
            lat: Math.round(lat * 10) / 10,
            lon: Math.round(lon * 10) / 10,
            radiation: Math.round(radiation * 100) / 100,
          })
        }
      }
    }
    
    container.addEventListener('click', handleClick)

    let frameId
    let time = 0
    const animate = () => {
      time += 0.016
      
      earth.rotation.y += 0.0012
      atmosphere.rotation.y += 0.001
      atmosphereGlow.rotation.y += 0.0008
      
      sunSpots.rotation.y += 0.0005
      
      const coronaPulse = 1 + Math.sin(time * 2) * 0.05
      sunCorona.scale.set(coronaPulse, coronaPulse, coronaPulse)
      
      const glowPulse = 1 + Math.sin(time * 3) * 0.03
      sunGlow.scale.set(glowPulse, glowPulse, glowPulse)
      
      const magPulse = 1 + Math.sin(time * 1.5) * 0.02
      magnetosphere.scale.set(magPulse, magPulse, magPulse)
      
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
      container.removeEventListener('click', handleClick)
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [subsolarLat, cloudFactor, elevation, onDataUpdate])

  useEffect(() => {
    if (!sceneRef.current) return
    const { earthTexture } = sceneRef.current
    updateRadiationTexture(earthTexture, { subsolarLat, cloudFactor, elevation })
  }, [subsolarLat, cloudFactor, elevation])

  useEffect(() => {
    if (!sceneRef.current) return
    const { flareLine, particles, cmeParticles, cmeWave, sun } = sceneRef.current

    const opacity = flareActive ? Math.min(1, flareIntensity * 0.3 + flareMinute / 12) : 0
    flareLine.material.opacity = opacity
    particles.material.opacity = opacity

    const flareStart = new THREE.Vector3(-2.2, 0.8, -0.2)
    const flareEnd = new THREE.Vector3(0.8, 0.2, 0.6)
    flareLine.geometry.setFromPoints([flareStart, flareEnd])

    const points = []
    const count = 30
    for (let i = 0; i < count; i += 1) {
      const t = (i / (count - 1)) * 0.9 + (flareMinute / 10) * 0.1
      const point = new THREE.Vector3().lerpVectors(flareStart, flareEnd, t)
      point.y += Math.sin((t + flareMinute) * Math.PI * 4) * 0.05
      point.x += Math.cos((t + flareMinute) * Math.PI * 3) * 0.03
      points.push(point)
    }
    particles.geometry.setFromPoints(points)

    const cmeOpacity = flareActive && flareMinute >= 3 ? Math.min(1, (flareMinute - 3) / 4) : 0
    cmeParticles.material.opacity = cmeOpacity
    cmeWave.material.opacity = cmeOpacity * 0.6

    if (flareActive && flareMinute >= 3) {
      const cmeProgress = (flareMinute - 3) / 7
      const cmeStart = new THREE.Vector3(-2.2, 0.8, -0.2)
      const cmeEnd = new THREE.Vector3(0.5, 0.1, 0.5)
      
      cmeWave.position.lerpVectors(cmeStart, cmeEnd, Math.min(1, cmeProgress))
      const waveScale = 1 + cmeProgress * 0.8
      cmeWave.scale.set(waveScale, waveScale, waveScale)

      const cmePoints = []
      const cmeCount = 50
      for (let i = 0; i < cmeCount; i += 1) {
        const t = (i / (cmeCount - 1)) * Math.min(1, cmeProgress)
        const basePoint = new THREE.Vector3().lerpVectors(cmeStart, cmeEnd, t)
        const angle = (i / cmeCount) * Math.PI * 2
        const spread = t * 0.4
        basePoint.x += Math.cos(angle) * spread
        basePoint.y += Math.sin(angle) * spread * 0.5
        basePoint.z += Math.sin(angle * 2) * spread * 0.3
        cmePoints.push(basePoint)
      }
      cmeParticles.geometry.setFromPoints(cmePoints)
    } else {
      cmeWave.position.copy(sun.position)
      cmeWave.scale.set(1, 1, 1)
      cmeParticles.geometry.setFromPoints([])
    }
  }, [flareActive, flareIntensity, flareMinute])

  return <div ref={containerRef} className="three-container" aria-label="太阳辐射与耀斑仿真" />
}

function updateRadiationTexture(texture, { subsolarLat, cloudFactor, elevation }) {
  const canvas = texture.image
  const width = 512
  const height = 256
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const elevationBoost = 1 + elevation * 0.08

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const lat = 90 - (y / height) * 180
      const lon = (x / width) * 360 - 180
      
      const latFactor = Math.cos(((lat - subsolarLat) * Math.PI) / 180)
      
      const hourAngle = lon * 15
      const timeFactor = Math.max(0, Math.cos((hourAngle * Math.PI) / 180))
      
      let intensity = Math.max(0, latFactor) * timeFactor * elevationBoost * (1 - cloudFactor * 0.8)
      
      const seasonFactor = 0.7 + 0.3 * Math.cos((subsolarLat * Math.PI) / 90)
      intensity *= seasonFactor
      
      const color = getHeatColor(intensity)
      ctx.fillStyle = color
      ctx.fillRect(x, y, 1, 1)
    }
  }

  ctx.globalAlpha = 0.25
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 1
  
  for (let i = 0; i <= 8; i += 1) {
    const y = (height / 8) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  
  for (let i = 0; i <= 12; i += 1) {
    const x = (width / 12) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 2
  
  const equatorY = height / 2
  ctx.beginPath()
  ctx.moveTo(0, equatorY)
  ctx.lineTo(width, equatorY)
  ctx.stroke()
  
  const primeMeridianX = width / 2
  ctx.beginPath()
  ctx.moveTo(primeMeridianX, 0)
  ctx.lineTo(primeMeridianX, height)
  ctx.stroke()
  
  ctx.globalAlpha = 1

  texture.needsUpdate = true
}

function getHeatColor(value) {
  const t = Math.max(0, Math.min(1, value))
  
  let r, g, b
  
  if (t < 0.2) {
    const x = t / 0.2
    r = Math.round(20 + 30 * x)
    g = Math.round(40 + 60 * x)
    b = Math.round(180 - 60 * x)
  } else if (t < 0.5) {
    const x = (t - 0.2) / 0.3
    r = Math.round(50 + 80 * x)
    g = Math.round(100 + 80 * x)
    b = Math.round(120 - 20 * x)
  } else if (t < 0.8) {
    const x = (t - 0.5) / 0.3
    r = Math.round(130 + 90 * x)
    g = Math.round(180 + 30 * x)
    b = Math.round(100 - 40 * x)
  } else {
    const x = (t - 0.8) / 0.2
    r = Math.round(220 + 35 * x)
    g = Math.round(210 - 90 * x)
    b = Math.round(60 - 40 * x)
  }
  
  return `rgb(${r},${g},${b})`
}

function RequiredThree() {
  const [drillIndex, setDrillIndex] = useState(0)
  const [timelineIndex, setTimelineIndex] = useState(3)
  const [selectedLayout, setSelectedLayout] = useState('paleozoic')
  const [activeEventId, setActiveEventId] = useState('oxygen')

  const drillLayers = useMemo(() => [...fossilLayers].reverse(), [])
  const currentLayer = drillLayers[drillIndex]
  const revealedLayers = drillLayers.slice(0, drillIndex + 1)

  const eraLayoutMap = {
    古生代: 'paleozoic',
    中生代: 'mesozoic',
    新生代: 'cenozoic',
  }
  const suggestedLayoutId = eraLayoutMap[currentLayer.era] ?? 'cenozoic'
  const layoutMatch = selectedLayout === suggestedLayoutId
  const selectedLayoutData = oceanLayoutOptions.find((option) => option.id === selectedLayout) ?? oceanLayoutOptions[0]

  const activeStage = timelineStages[timelineIndex]
  const activeEvent = timelineEvents.find((event) => event.id === activeEventId) ?? timelineEvents[0]
  const progress = ((drillIndex + 1) / drillLayers.length) * 100

  const handleDrillDown = () => {
    setDrillIndex((prev) => Math.min(prev + 1, drillLayers.length - 1))
  }

  const handleDrillUp = () => {
    setDrillIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块三：地层挖掘与地质年代复原</h1>
            <p className="muted">对应教材：必修 1 第一章《宇宙中的地球》第 3 节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>
                地质历史跨度巨大、化石顺序与环境变迁容易混淆，学生难以建立“地层—化石—地质年代”的对应关系。
                本实验通过钻探剖面、时间轴与关键事件标记，帮助学生构建清晰的时间感。
              </p>
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
              <h2>虚拟钻探控制台</h2>
              <p className="muted">点击“向下钻探”逐层揭示地层，观察岩性与化石线索。</p>
              <div className="control-group">
                <label>
                  当前深度：<span>第 {drillIndex + 1} 层</span>
                </label>
                <div className="drill-actions">
                  <button type="button" className="btn" onClick={handleDrillDown}>
                    向下钻探
                  </button>
                  <button type="button" className="btn ghost" onClick={handleDrillUp}>
                    返回上一层
                  </button>
                </div>
              </div>
              <div className="drill-progress">
                <div className="drill-progress__bar">
                  <div className="drill-progress__fill" style={{ width: `${progress}%` }} />
                </div>
                <span>已揭示 {revealedLayers.length} / {drillLayers.length} 层</span>
              </div>
            </div>

            <div className="panel-block">
              <h2>年代自动判定</h2>
              <p className="muted">系统根据化石组合自动判定年代，并提示典型环境。</p>
              <div className="era-card">
                <div>
                  <h3>{currentLayer.label}</h3>
                  <p>{currentLayer.lithology}</p>
                </div>
                <div className="era-tag">
                  <span>{currentLayer.era}</span>
                  <strong>{currentLayer.eraDetail}</strong>
                </div>
              </div>
              <div className="era-tip">
                <div>
                  <strong>环境复原：</strong>
                  <span>{currentLayer.environment}</span>
                </div>
                <div>
                  <strong>关键线索：</strong>
                  <span>{currentLayer.event}</span>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>🧪 真实数据对比探究</h2>
              <p className="muted">将你的钻探结果与国际标准地层数据进行对比，验证你的推断是否正确。</p>
              <div className="data-compare">
                <div className="compare-card your-data">
                  <h4>你的钻探数据</h4>
                  <div className="compare-row">
                    <span>地层年代：</span>
                    <strong>{currentLayer.eraDetail}</strong>
                  </div>
                  <div className="compare-row">
                    <span>岩性特征：</span>
                    <strong>{currentLayer.lithology}</strong>
                  </div>
                  <div className="compare-row">
                    <span>化石组合：</span>
                    <strong>{currentLayer.fossils?.join('、') || '待揭示'}</strong>
                  </div>
                  <div className="compare-row">
                    <span>推断环境：</span>
                    <strong>{currentLayer.environment}</strong>
                  </div>
                </div>
                <div className="compare-card real-data">
                  <h4>国际标准数据（参考）</h4>
                  <div className="compare-row">
                    <span>标准年代：</span>
                    <strong>{currentLayer.realEraDetail || currentLayer.eraDetail}</strong>
                  </div>
                  <div className="compare-row">
                    <span>标准岩性：</span>
                    <strong>{currentLayer.realLithology || currentLayer.lithology}</strong>
                  </div>
                  <div className="compare-row">
                    <span>典型化石：</span>
                    <strong>{currentLayer.realFossils?.join('、') || currentLayer.fossils?.join('、') || '待揭示'}</strong>
                  </div>
                  <div className="compare-row">
                    <span>真实环境：</span>
                    <strong>{currentLayer.realEnvironment || currentLayer.environment}</strong>
                  </div>
                </div>
              </div>
              <div className="compare-result">
                {currentLayer.realEraDetail ? (
                  currentLayer.realEraDetail === currentLayer.eraDetail ? (
                    <div className="result-match">
                      <strong>✅ 推断正确！</strong>
                      <span>你的地层年代判定与国际标准数据一致</span>
                    </div>
                  ) : (
                    <div className="result-mismatch">
                      <strong>⚠️ 存在偏差</strong>
                      <span>建议重新检查化石组合，参考标准数据进行修正</span>
                    </div>
                  )
                ) : (
                  <div className="result-pending">
                    <strong>🔍 继续钻探</strong>
                    <span>继续向下钻探，对比更多层位数据以验证推断</span>
                  </div>
                )}
              </div>
              <div className="compare-tip">
                <strong>探究提示：</strong>
                <p>地质学家正是通过这种方法，利用化石组合和岩性特征来推断地层年代和古环境。每一次钻探都是一次科学探究，需要仔细比对证据。</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>海陆格局选择</h2>
              <p className="muted">选择与当前化石年代相匹配的海陆格局，完成复原任务。</p>
              <div className="pill-row">
                {oceanLayoutOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`pill ${selectedLayout === option.id ? 'active' : ''}`}
                    onClick={() => setSelectedLayout(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className={`layout-check ${layoutMatch ? 'match' : ''}`}>
                <p>
                  系统建议：{oceanLayoutOptions.find((option) => option.id === suggestedLayoutId)?.label}
                </p>
                <strong>{layoutMatch ? '匹配正确：地层—年代—格局一致。' : '请再核对：注意化石年代线索。'}</strong>
                <span>{selectedLayoutData.description}</span>
              </div>
            </div>

            <div className="panel-block">
              <h2>地质年代时间轴</h2>
              <p className="muted">拖动滑块穿越 46 亿年，观察场景随时代切换。</p>
              <div className="control-group">
                <label>
                  当前时段：<span>{activeStage.label}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={timelineStages.length - 1}
                  step={1}
                  value={timelineIndex}
                  onChange={(event) => setTimelineIndex(parseInt(event.target.value, 10))}
                />
                <div className="pill-row">
                  {timelineStages.map((stage, index) => (
                    <button
                      key={stage.id}
                      type="button"
                      className={`pill ${index === timelineIndex ? 'active' : ''}`}
                      onClick={() => setTimelineIndex(index)}
                    >
                      {stage.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>关键事件标记</h2>
              <p className="muted">点击事件节点，查看简要动画提示与地质意义。</p>
              <div className="event-list">
                {timelineEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={`event-card ${activeEventId === event.id ? 'active' : ''}`}
                    onClick={() => setActiveEventId(event.id)}
                  >
                    <strong>{event.label}</strong>
                    <span>{event.time}</span>
                  </button>
                ))}
              </div>
              <div className="event-detail">
                <h3>{activeEvent.label}</h3>
                <p>{activeEvent.detail}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {investigationTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {geologyExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel canvas geology-canvas">
            <div className="stratigraphic-section">
              <div className="section-header">
                <h3>地质柱状剖面图</h3>
                <span className="depth-info">深度：{Math.round(drillIndex * 5000 / drillLayers.length)} - {Math.round((drillIndex + 1) * 5000 / drillLayers.length)} m</span>
              </div>
              <div className="section-visual">
                <div className="depth-scale">
                  {[0, 1250, 2500, 3750, 5000].map((depth) => (
                    <div key={depth} className="depth-mark">
                      <span>{depth}m</span>
                    </div>
                  ))}
                </div>
                <div className="column-section">
                  {drillLayers.map((layer, idx) => {
                    const isRevealed = idx <= drillIndex
                    const isCurrent = idx === drillIndex
                    return (
                      <div
                        key={layer.id}
                        className={`layer-block ${isRevealed ? 'revealed' : 'hidden'} ${isCurrent ? 'current' : ''}`}
                        style={{ backgroundColor: `#${layer.color.toString(16).padStart(6, '0')}` }}
                      >
                        {isRevealed && (
                          <>
                            <div className="layer-label">{layer.label}</div>
                            <div className="layer-era">{layer.era}</div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="drill-indicator" style={{ left: `${(drillIndex + 0.5) * (100 / drillLayers.length)}%` }}>
                  <span>钻头</span>
                  <div className="drill-bit" />
                </div>
              </div>
              <div className="section-legend">
                <h4>岩性图例</h4>
                <div className="legend-row">
                  {drillLayers.map((layer) => (
                    <div key={layer.id} className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: `#${layer.color.toString(16).padStart(6, '0')}` }} />
                      <span>{layer.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="canvas-overlay">
              <div className="overlay-meta">
                <span>{currentLayer.label}</span>
                <span>{currentLayer.eraDetail}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function RequiredThreeScene({ drillLayers, drillIndex, activeStage, currentLayer }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#e8f0f5')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(2.8, 2.4, 5.0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 2.8
    controls.maxDistance = 8.5
    controls.maxPolarAngle = Math.PI / 2.1

    const ambientLight = new THREE.AmbientLight(0xe8eef2, 0.65)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85)
    keyLight.position.set(4, 5, 3)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 20
    keyLight.shadow.camera.left = -5
    keyLight.shadow.camera.right = 5
    keyLight.shadow.camera.top = 5
    keyLight.shadow.camera.bottom = -5
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x9fc5e8, 0.3)
    fillLight.position.set(-3, 2, -4)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xcfe0f0, 0.25)
    rimLight.position.set(0, -2, 3)
    scene.add(rimLight)

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.3, 1.45, 0.18, 48),
      new THREE.MeshStandardMaterial({ 
        color: 0x4a5568, 
        roughness: 0.85,
        metalness: 0.1
      })
    )
    base.position.y = -0.62
    base.receiveShadow = true
    scene.add(base)

    const strataGroup = new THREE.Group()
    scene.add(strataGroup)

    const drillHead = new THREE.Group()
    const drillBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.15, 0.75, 24),
      new THREE.MeshStandardMaterial({ 
        color: 0x2d3748, 
        roughness: 0.4,
        metalness: 0.6
      })
    )
    drillBody.position.y = 0.38
    drillBody.castShadow = true
    drillHead.add(drillBody)

    const drillBit = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.22, 24),
      new THREE.MeshStandardMaterial({ 
        color: 0x718096, 
        roughness: 0.3,
        metalness: 0.8
      })
    )
    drillBit.position.y = 0.04
    drillBit.castShadow = true
    drillHead.add(drillBit)

    const drillTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 16, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0x4a5568, 
        roughness: 0.2,
        metalness: 0.9
      })
    )
    drillTip.position.y = -0.07
    drillHead.add(drillTip)

    drillHead.position.set(0, 1.6, 1.1)
    scene.add(drillHead)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      strataGroup,
      drillHead,
      targetDrillY: 1.6,
      highlightMesh: null,
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resize()
    window.addEventListener('resize', resize)
    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)

    let frameId
    const animate = () => {
      strataGroup.rotation.y += 0.003
      drillHead.rotation.y += 0.08
      if (sceneRef.current) {
        sceneRef.current.drillHead.position.y +=
          (sceneRef.current.targetDrillY - sceneRef.current.drillHead.position.y) * 0.08
      }
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    const { strataGroup } = sceneRef.current
    strataGroup.clear()

    const layerHeight = 0.35
    const totalHeight = drillLayers.length * layerHeight
    const startY = -totalHeight / 2 + layerHeight / 2

    drillLayers.forEach((layer, index) => {
      const geometry = new THREE.BoxGeometry(1.6, layerHeight * 0.9, 1.2)
      const material = new THREE.MeshStandardMaterial({
        color: layer.color,
        transparent: true,
        opacity: index <= drillIndex ? 0.95 : 0.35,
        roughness: 0.7,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.y = startY + index * layerHeight

      strataGroup.add(mesh)
    })

    const highlightMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, layerHeight * 1.05, 1.35),
      new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        transparent: true,
        opacity: 0.5,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.45,
      })
    )
    highlightMesh.position.y = startY + drillIndex * layerHeight
    strataGroup.add(highlightMesh)

    sceneRef.current.highlightMesh = highlightMesh
    sceneRef.current.targetDrillY = highlightMesh.position.y + 0.6
  }, [drillLayers, drillIndex])

  useEffect(() => {
    if (!sceneRef.current) return
    const { scene } = sceneRef.current
    scene.fog = new THREE.Fog(activeStage.color, 3, 10)
  }, [activeStage])

  useEffect(() => {
    if (!sceneRef.current) return
    const { camera } = sceneRef.current
    if (currentLayer.era === '古生代') camera.position.set(2.6, 2.2, 4.6)
    if (currentLayer.era === '中生代') camera.position.set(2.8, 2.0, 4.2)
    if (currentLayer.era === '新生代') camera.position.set(2.4, 2.4, 4.8)
  }, [currentLayer])

  return <div ref={containerRef} className="three-container" aria-label="三维地层柱状图" />
}

const atmosphereLayers = [
  {
    id: 'troposphere',
    name: '对流层',
    range: '0-12 km',
    height: 12,
    displayHeight: 18,
    color: 0x4a8dc5,
    note: '天气现象集中区，气温随高度递减',
  },
  {
    id: 'stratosphere',
    name: '平流层',
    range: '12-50 km',
    height: 38,
    displayHeight: 18,
    color: 0x2d5a87,
    note: '臭氧层吸收紫外线，气温随高度上升',
  },
  {
    id: 'mesosphere',
    name: '中间层',
    range: '50-80 km',
    height: 30,
    displayHeight: 14,
    color: 0x1e3a5f,
    note: '流星体烧蚀区，气温再次下降',
  },
  {
    id: 'thermosphere',
    name: '热层',
    range: '80-500 km',
    height: 420,
    displayHeight: 50,
    color: 0x0d1b2a,
    note: '极光、电离层所在，气温急剧升高',
  },
]

const temperatureStops = [
  { altitude: 0, temp: 15 },
  { altitude: 12, temp: -56 },
  { altitude: 50, temp: -2 },
  { altitude: 80, temp: -90 },
  { altitude: 120, temp: 180 },
]

const compositionData = [
  { id: 'n2', label: '氮气 N₂', value: 78, color: '#2563eb' },
  { id: 'o2', label: '氧气 O₂', value: 21, color: '#10b981' },
  { id: 'ar', label: '氩气 Ar', value: 0.93, color: '#f59e0b' },
  { id: 'other', label: '其他气体', value: 0.07, color: '#94a3b8' },
]

const flightItems = [
  { id: 'airliner', label: '民航飞机', correct: 'stratosphere' },
  { id: 'recon', label: '高空侦察机', correct: 'stratosphere' },
  { id: 'satellite', label: '卫星', correct: 'thermosphere' },
  { id: 'aurora', label: '极光', correct: 'thermosphere' },
  { id: 'meteor', label: '流星体', correct: 'mesosphere' },
]

const requiredFiveTasks = [
  {
    id: 'task-balloon',
    title: '控制热气球上升至 12 km 高度',
    detail: '记录此时气温，并判断所在大气分层。',
  },
  {
    id: 'task-co2',
    title: '将 CO₂ 浓度从 280 ppm 调整至 420 ppm',
    detail: '观察全球平均气温变化幅度，并解释温室效应。',
  },
]

const requiredFiveExamItems = [
  {
    id: 'exam-gd-2022',
    source: '2022·广东卷·1-2 题',
    stem:
      '大气垂直分层中，对流层气温随高度升高而降低，平流层气温随高度升高而升高。',
    questions: [
      {
        id: 'q1',
        stem: '对流层气温随高度升高而降低的主要原因是（ ）',
        options: ['A. 太阳辐射随高度增加而减弱', 'B. 地面是对流层大气的主要直接热源', 'C. 高空空气稀薄，保温作用弱', 'D. 高空水汽含量少，吸收热量少'],
        answer: 'B',
        explanation: '对流层主要热源来自地面辐射，因此随高度升高温度降低。',
      },
      {
        id: 'q2',
        stem: '平流层气温随高度升高而升高的原因是（ ）',
        options: ['A. 臭氧吸收紫外线', 'B. 水汽吸收红外线', 'C. 二氧化碳吸收地面辐射', 'D. 尘埃反射太阳辐射'],
        answer: 'A',
        explanation: '臭氧层吸收紫外线，导致平流层温度随高度升高。',
      },
    ],
  },
  {
    id: 'exam-bj-2021',
    source: '2021·北京卷·1-2 题',
    stem: '民航飞机通常在平流层底部飞行，主要原因是（ ）',
    questions: [
      {
        id: 'q3',
        stem: '平流层大气运动以平流运动为主，有利于（ ）',
        options: ['A. 节省燃料', 'B. 飞行平稳', 'C. 提高速度', 'D. 减少噪音'],
        answer: 'B',
        explanation: '平流层气流稳定，飞机飞行更平稳。',
      },
      {
        id: 'q4',
        stem: '对流层不适合飞机长时间飞行的主要原因是（ ）',
        options: ['A. 空气稀薄', 'B. 气温过低', 'C. 天气复杂多变', 'D. 紫外线过强'],
        answer: 'C',
        explanation: '对流层天气复杂多变，湍流多，不利于平稳飞行。',
      },
    ],
  },
]

const requiredSixEnergyToggles = [
  {
    id: 'cloud',
    label: '云层反射',
    detail: '反射太阳短波，削弱白天地表增温、增强夜间保温。',
    color: '#38bdf8',
  },
  {
    id: 'ozone',
    label: '臭氧吸收紫外线',
    detail: '削弱强紫外线，让平流层升温。',
    color: '#a855f7',
  },
  {
    id: 'co2',
    label: 'CO₂ 吸收地面辐射',
    detail: '增强大气逆辐射，夜间保温显著。',
    color: '#f97316',
  },
]

const requiredSixScenarios = [
  { id: 'clear-day', label: '晴朗白天', isDay: true, cloud: false, baseTemp: 27 },
  { id: 'clear-night', label: '晴朗夜晚', isDay: false, cloud: false, baseTemp: 5 },
  { id: 'cloudy-day', label: '多云白天', isDay: true, cloud: true, baseTemp: 22 },
  { id: 'cloudy-night', label: '多云夜晚', isDay: false, cloud: true, baseTemp: 9 },
]

const circulationPresets = [
  {
    id: 'urban-heat',
    label: '城市热岛',
    hot: 35,
    cold: 75,
    note: '城市升温形成热低压，近地面风从郊区吹向城市。',
  },
  {
    id: 'sea-land',
    label: '白天海陆风',
    hot: 30,
    cold: 80,
    note: '白天陆地升温快，形成陆地热低压，海风吹向陆地。',
  },
  {
    id: 'valley-night',
    label: '夜晚山谷风',
    hot: 70,
    cold: 30,
    note: '夜晚山坡冷却快，冷空气下沉进山谷形成局地环流。',
  },
]

const requiredSixTasks = [
  {
    id: 'task-frost',
    title: '模拟晴朗夜晚与多云夜晚的地面辐射损失',
    detail: '对比两种夜晚温度与逆辐射强度，解释“霜冻多在晴朗夜晚”。',
  },
  {
    id: 'task-heat-island',
    title: '设置城市与郊区温差',
    detail: '移动热源/冷源位置，观察热岛环流与近地面风向。',
  },
]

const requiredSixExamItems = [
  {
    id: 'exam-2023',
    source: '2023·全国乙卷·1-2 题',
    stem: '晴朗的夜晚往往比多云的夜晚气温低，容易出现霜冻。',
    questions: [
      {
        id: 'q1',
        stem: '晴朗夜晚气温低的主要原因是（ ）',
        options: ['A. 太阳辐射弱', 'B. 地面辐射强', 'C. 大气逆辐射弱', 'D. 大气反射强'],
        answer: 'C',
        explanation: '晴朗夜晚云少，大气逆辐射弱，地面散失热量多。',
      },
      {
        id: 'q2',
        stem: '霜冻夜晚燃烧秸秆制造烟雾，目的是（ ）',
        options: ['A. 增加太阳辐射', 'B. 增强大气逆辐射', 'C. 减少地面辐射', 'D. 降低空气湿度'],
        answer: 'B',
        explanation: '烟雾充当“云层”，增强逆辐射，减弱散热。',
      },
    ],
  },
  {
    id: 'exam-2022',
    source: '2022·湖南卷·1-2 题',
    stem: '城市热岛效应是城市气温高于郊区的现象。',
    questions: [
      {
        id: 'q3',
        stem: '城市热岛环流中，近地面风向是（ ）',
        options: ['A. 从城市吹向郊区', 'B. 从郊区吹向城市', 'C. 从高空吹向城市', 'D. 从高空吹向郊区'],
        answer: 'B',
        explanation: '近地面风从冷源（郊区）吹向热源（城市）。',
      },
      {
        id: 'q4',
        stem: '缓解城市热岛效应的有效措施是（ ）',
        options: ['A. 增加城市建筑密度', 'B. 扩大城市硬化地面', 'C. 增加城市绿地面积', 'D. 减少城市人口数量'],
        answer: 'C',
        explanation: '增加绿地可提升蒸散与反照率，降低热岛效应。',
      },
    ],
  },
]

function getAtmosphereLayer(altitude) {
  if (altitude < 12) return atmosphereLayers[0]
  if (altitude < 50) return atmosphereLayers[1]
  if (altitude < 80) return atmosphereLayers[2]
  return atmosphereLayers[3]
}

function getTemperatureAtAltitude(altitude) {
  if (altitude <= 12) return 15 - altitude * 6.5
  if (altitude <= 50) return -56 + (altitude - 12) * 1.4
  if (altitude <= 80) return -2 - (altitude - 50) * 2.9
  return -90 + (altitude - 80) * 3.4
}

function getPressureAtAltitude(altitude) {
  return 1013 * Math.exp(-altitude / 7.5)
}

function getDensityAtAltitude(altitude) {
  return 1.225 * Math.exp(-altitude / 7)
}

function RequiredFive() {
  const [altitude, setAltitude] = useState(6)
  const [co2Level, setCo2Level] = useState(280)
  const [o3Level, setO3Level] = useState(300)
  const [flightAssignments, setFlightAssignments] = useState(() =>
    flightItems.reduce((acc, item) => ({ ...acc, [item.id]: '' }), {})
  )

  const currentLayer = getAtmosphereLayer(altitude)
  const baseTemp = getTemperatureAtAltitude(altitude)
  const pressure = getPressureAtAltitude(altitude)
  const density = getDensityAtAltitude(altitude)
  const greenhouseBoost = ((co2Level - 280) / 140) * 1.4
  const ozoneShield = Math.max(0, Math.min(1, (o3Level - 100) / 200))
  const uvIndex = Math.round(10 - ozoneShield * 5 + (1 - ozoneShield) * 4)
  const adjustedTemp = baseTemp + greenhouseBoost
  const flowStateMap = {
    troposphere: { label: '对流活跃', detail: '垂直气流强，云雨对流明显' },
    stratosphere: { label: '平流稳定', detail: '水平气流为主，湍流小' },
    mesosphere: { label: '稀薄扰动', detail: '空气稀薄，流星体进入燃烧' },
    thermosphere: { label: '电离层扰动', detail: '高能粒子运动，极光出现' },
  }
  const flowState = flowStateMap[currentLayer.id] ?? flowStateMap.troposphere

  const tempCurvePoints = temperatureStops.map((stop, index) => {
    const x = (stop.temp + 100) * 1.5
    const y = 280 - (stop.altitude / 120) * 240
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  })

  const updateAssignment = (id, value) => {
    setFlightAssignments((prev) => ({ ...prev, [id]: value }))
  }

  const correctCount = flightItems.filter((item) => flightAssignments[item.id] === item.correct).length

  return (
    <div className="page">



      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块五：大气垂直分层与成分作用解析</h1>
            <p className="muted">对应教材：必修 1 第二章《地球上的大气》第 1 节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>
                微量气体（CO₂、O₃）作用巨大但易被忽视；对流层-平流层-中间层-热层气温变化呈“Z”
                字形难以记忆；飞机、卫星、极光所在层级混淆。本实验以热气球探测 + 气温曲线 +
                成分调控，帮助学生建立结构化认知。
              </p>
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
              <h2>热气球升空实验</h2>
              <p className="muted">拖动高度滑块，实时读取气温、气压、密度与气流状态。</p>
              <div className="control-group">
                <label>
                  热气球高度：<span>{altitude.toFixed(1)} km</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={120}
                  step={0.5}
                  value={altitude}
                  onChange={(event) => setAltitude(parseFloat(event.target.value))}
                />
              </div>
              <div className="live-data data-grid">
                <div className="data-item">
                  <span>所在分层</span>
                  <strong>{currentLayer.name}</strong>
                </div>
                <div className="data-item">
                  <span>气温</span>
                  <strong>{adjustedTemp.toFixed(1)}℃</strong>
                </div>
                <div className="data-item">
                  <span>气压</span>
                  <strong>{pressure.toFixed(0)} hPa</strong>
                </div>
                <div className="data-item">
                  <span>空气密度</span>
                  <strong>{density.toFixed(3)} kg/m³</strong>
                </div>
                <div className="data-item">
                  <span>参考高度带</span>
                  <strong>{currentLayer.range}</strong>
                </div>
                <div className="data-item">
                  <span>典型特征</span>
                  <strong>{currentLayer.note}</strong>
                </div>
              </div>
              <div className="flow-card">
                <strong>气流状态：{flowState.label}</strong>
                <p>{flowState.detail}</p>
              </div>
              <p className="data-note">提示：气压与密度随高度快速递减，气温呈“递减-递增-递减-递增”规律。</p>
            </div>

            <div className="panel-block">
              <h2>大气成分天平</h2>
              <p className="muted">观察干洁空气组成比例，并调节 CO₂ / O₃ 感受能量收支变化。</p>
              <div className="composition-grid">
                {compositionData.map((item) => (
                  <div key={item.id} className="composition-card">
                    <div className="composition-bar" style={{ background: item.color, width: `${item.value}%` }} />
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="control-group">
                <label>
                  CO₂ 浓度：<span>{co2Level} ppm</span>
                </label>
                <input
                  type="range"
                  min={280}
                  max={420}
                  step={10}
                  value={co2Level}
                  onChange={(event) => setCo2Level(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  O₃ 含量：<span>{o3Level} DU</span>
                </label>
                <input
                  type="range"
                  min={100}
                  max={300}
                  step={10}
                  value={o3Level}
                  onChange={(event) => setO3Level(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="status-grid">
                <div className="status-card">
                  <div className="status-header">
                    <span className="status-dot" />
                    <strong>温室效应</strong>
                  </div>
                  <p>全球平均气温增幅：+{greenhouseBoost.toFixed(1)}℃</p>
                </div>
                <div className="status-card">
                  <div className="status-header">
                    <span className="status-dot status-dot--alert" />
                    <strong>紫外线强度</strong>
                  </div>
                  <p>紫外线指数：{uvIndex}（指数越高越危险）</p>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {requiredFiveTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </li>
                ))}
              </ul>
              
              <div className="challenge-section">
                <h3>🚀 飞行器归位挑战</h3>
                <p className="muted">为飞行器选择正确的大气分层，完成后显示正确率。</p>
                <div className="assignment-grid">
                  {flightItems.map((item) => (
                    <div key={item.id} className="assignment-card">
                      <strong>{item.label}</strong>
                      <select
                        value={flightAssignments[item.id]}
                        onChange={(event) => updateAssignment(item.id, event.target.value)}
                      >
                        <option value="">选择分层</option>
                        {atmosphereLayers.map((layer) => (
                          <option key={layer.id} value={layer.id}>
                            {layer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <p className="data-note">当前正确：{correctCount} / {flightItems.length}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {requiredFiveExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>🧪 真实大气数据对比探究</h2>
              <p className="muted">对比模拟数据与真实大气观测数据，验证你对大气分层规律的理解。</p>
              
              <div className="temp-chart-section">
                <h3>🌡️ 气温垂直变化曲线</h3>
                <p className="muted">实时绘制“Z”字形温度曲线，高亮标注对流层顶与平流层顶。</p>
                <div className="temp-chart">
                  <svg viewBox="0 0 240 300" aria-label="气温垂直变化曲线">
                    <path d={tempCurvePoints.join(' ')} className="temp-line" />
                    <line x1="0" x2="240" y1="200" y2="200" className="temp-marker" />
                    <line x1="0" x2="240" y1="120" y2="120" className="temp-marker" />
                    <text x="12" y="192">对流层顶 12 km</text>
                    <text x="12" y="112">平流层顶 50 km</text>
                  </svg>
                  <div className="temp-legend">
                    <span>气温</span>
                    <span>高度</span>
                  </div>
                </div>
              </div>
              
              <div className="atmosphere-real-data">
                <div className="real-data-table">
                  <h4>国际标准大气参数（US Standard Atmosphere 1976）</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>高度 (km)</th>
                        <th>气温 (℃)</th>
                        <th>气压 (hPa)</th>
                        <th>密度 (kg/m³)</th>
                        <th>分层</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={altitude <= 0.5 ? 'highlight' : ''}>
                        <td>0</td>
                        <td>15.0</td>
                        <td>1013.25</td>
                        <td>1.225</td>
                        <td>对流层</td>
                      </tr>
                      <tr className={altitude >= 10 && altitude <= 12 ? 'highlight' : ''}>
                        <td>11</td>
                        <td>-56.5</td>
                        <td>227.00</td>
                        <td>0.364</td>
                        <td>对流层顶</td>
                      </tr>
                      <tr className={altitude >= 20 && altitude <= 30 ? 'highlight' : ''}>
                        <td>25</td>
                        <td>-51.9</td>
                        <td>25.49</td>
                        <td>0.040</td>
                        <td>平流层</td>
                      </tr>
                      <tr className={altitude >= 47 && altitude <= 53 ? 'highlight' : ''}>
                        <td>50</td>
                        <td>-2.5</td>
                        <td>1.00</td>
                        <td>0.001</td>
                        <td>平流层顶</td>
                      </tr>
                      <tr className={altitude >= 78 && altitude <= 82 ? 'highlight' : ''}>
                        <td>80</td>
                        <td>-86.2</td>
                        <td>0.01</td>
                        <td>0.00002</td>
                        <td>中间层顶</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="real-data-analysis">
                  <h4>数据对比分析</h4>
                  <div className="analysis-item">
                    <strong>气温递减率（对流层）</strong>
                    <p>实测：海拔每升高 1000m，气温下降约 6.5℃</p>
                    <p>你的观测：当前高度 {altitude.toFixed(1)} km，气温 {adjustedTemp.toFixed(1)}℃</p>
                    <em>规律：气温随高度递减是因为地面是低层大气的主要热源</em>
                  </div>
                  <div className="analysis-item highlight">
                    <strong>平流层升温（臭氧层）</strong>
                    <p>实测：25-30km 处气温开始上升，峰值约 -2.5℃</p>
                    <p>你的观测：当前高度 {altitude.toFixed(1)} km，气温 {adjustedTemp.toFixed(1)}℃</p>
                    <em>原因：臭氧吸收紫外线辐射转化为热能</em>
                  </div>
                  <div className="analysis-item">
                    <strong>气压指数递减</strong>
                    <p>实测：气压随高度呈指数递减，而非线性递减</p>
                    <p>你的观测：当前气压 {pressure.toFixed(0)} hPa（标准大气压的 {(pressure / 1013.25 * 100).toFixed(1)}%）</p>
                    <em>规律：P = P₀ × e^(-h/H)，H 为标高约 8.5km</em>
                  </div>
                </div>
              </div>
              <div className="seismic-evidence">
                <h4>🔍 大气探测科学方法</h4>
                <div className="evidence-chain">
                  <div className="evidence-step">
                    <span>1</span>
                    <div>
                      <strong>探空气球</strong>
                      <p>携带传感器自动记录温压湿</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>2</span>
                    <div>
                      <strong>气象卫星</strong>
                      <p>红外/微波遥感探测垂直结构</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>3</span>
                    <div>
                      <strong>无线电探空仪</strong>
                      <p>GPS定位结合气压推算高度</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>4</span>
                    <div>
                      <strong>数据同化</strong>
                      <p>全球站点数据整合成标准大气</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="compare-tip">
                <strong>科学验证：</strong>
                <p>国际标准大气模型是基于全球数千个气象站的观测数据建立的。它告诉我们，在标准条件下，对流层气温递减率为 6.5℃/km，这是大气科学的基础数据。</p>
              </div>
            </div>
          </section>

          <section className="panel canvas atmosphere-canvas">
            <div className="atmosphere-section">
              <div className="section-header">
                <h3>大气垂直分层示意图</h3>
                <span className="altitude-info">当前高度：{altitude} km</span>
              </div>
              <div className="atmosphere-visual">
                <div className="altitude-scale">
                  {[500, 80, 50, 12, 0].map((h) => (
                    <div key={h} className="altitude-mark">
                      <span>{h} km</span>
                    </div>
                  ))}
                </div>
                <div className="layer-stack">
                  {atmosphereLayers.map((layer, idx) => {
                    const bottomHeight = idx === 0 ? 0 : atmosphereLayers.slice(0, idx).reduce((sum, l) => sum + l.height, 0)
                    const isActive = layer.id === currentLayer.id
                    const ballonPos = altitude / 500
                    const layerStart = bottomHeight / 500
                    const layerEnd = (bottomHeight + layer.height) / 500
                    const isBalloonInLayer = ballonPos >= layerStart && ballonPos <= layerEnd
                    const totalDisplayHeight = atmosphereLayers.reduce((sum, l) => sum + (l.displayHeight || l.height), 0)
                    
                    return (
                      <div
                        key={layer.id}
                        className={`atmosphere-layer ${isActive ? 'active' : ''} ${isBalloonInLayer ? 'balloon-here' : ''}`}
                        style={{
                          backgroundColor: `#${layer.color.toString(16).padStart(6, '0')}`,
                          height: `${((layer.displayHeight || layer.height) / totalDisplayHeight) * 100}%`,
                        }}
                      >
                        <div className="layer-label">
                          <span className="layer-name">{layer.name}</span>
                          <span className="layer-range">{layer.range}</span>
                        </div>
                        <div className="layer-note">{layer.note}</div>
                        {isBalloonInLayer && (
                          <div className="balloon-indicator">
                            <div className="balloon-icon">🪂</div>
                            <span>探测气球</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="temperature-profile">
                  <h4>温度曲线</h4>
                  <svg viewBox="0 0 60 400" className="temp-svg">
                    <defs>
                      <linearGradient id="tempGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M30 380 L30 320 L45 280 L35 200 L50 120 L30 20"
                      fill="none"
                      stroke="url(#tempGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="30" cy="380" r="4" fill="#3b82f6" />
                    <circle cx="30" cy="320" r="4" fill="#3b82f6" />
                    <circle cx="45" cy="280" r="4" fill="#f59e0b" />
                    <circle cx="35" cy="200" r="4" fill="#ef4444" />
                    <circle cx="50" cy="120" r="4" fill="#ef4444" />
                    <circle cx="30" cy="20" r="4" fill="#ef4444" />
                  </svg>
                  <div className="temp-labels">
                    <span>1200°C</span>
                    <span>-90°C</span>
                    <span>-2°C</span>
                    <span>-56°C</span>
                    <span>15°C</span>
                  </div>
                </div>
              </div>
              <div className="atmosphere-legend">
                <h4>分层特征</h4>
                <div className="legend-grid">
                  {atmosphereLayers.map((layer) => (
                    <div key={layer.id} className={`legend-card ${layer.id === currentLayer.id ? 'active' : ''}`}>
                      <div className="legend-color" style={{ backgroundColor: `#${layer.color.toString(16).padStart(6, '0')}` }} />
                      <div className="legend-content">
                        <strong>{layer.name}</strong>
                        <p>{layer.range}</p>
                        <p className="note">{layer.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="canvas-overlay">
              <div className="overlay-meta">
                <span>{currentLayer.name}</span>
                <span>{currentLayer.range}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function RequiredEight() {
  const [latBand, setLatBand] = useState('subtropical')
  const [basinId, setBasinId] = useState(oceanBasins[0].id)
  const [precip, setPrecip] = useState(70)
  const [evap, setEvap] = useState(80)
  const [runoff, setRunoff] = useState(30)
  const [currentId, setCurrentId] = useState('neutral')
  const [selectedLayer, setSelectedLayer] = useState(marineLayers[0].id)
  const [highlightFactor, setHighlightFactor] = useState(null)
  const [bioMode, setBioMode] = useState('normal')

  const { openInfo } = useContext(InfoModalContext)

  const basin = oceanBasins.find((item) => item.id === basinId) ?? oceanBasins[0]
  const currentLabel = currentOptions.find((item) => item.id === currentId)?.label ?? '中性'
  const layer = marineLayers.find((item) => item.id === selectedLayer) ?? marineLayers[0]

  const latConfig = {
    equatorial: { label: '赤道 0°', tempShift: 6, salShift: -0.6 },
    subtropical: { label: '副热带 25°', tempShift: 2.2, salShift: 0.8 },
    subpolar: { label: '副极地 55°', tempShift: -6, salShift: -0.9 },
  }

  const currentEffect = currentId === 'warm' ? 1.5 : currentId === 'cold' ? -1.5 : 0
  const precipEffect = (50 - precip) * 0.04
  const evapEffect = (evap - 50) * 0.06
  const runoffEffect = (50 - runoff) * 0.05

  const surfaceTemp = Math.round(basin.baseTemp + latConfig[latBand].tempShift + currentEffect + precipEffect)
  const surfaceSalinity = Number(
    (basin.baseSalinity + latConfig[latBand].salShift + evapEffect + runoffEffect).toFixed(2)
  )
  const densityIndex = Number((1.02 + (surfaceSalinity - 34) * 0.001 - (surfaceTemp - 20) * 0.0006).toFixed(3))

  const layerTempTrend = {
    mixed: [surfaceTemp, surfaceTemp - 2, surfaceTemp - 4],
    thermo: [surfaceTemp - 4, surfaceTemp - 10, surfaceTemp - 16],
    deep: [surfaceTemp - 12, surfaceTemp - 15, surfaceTemp - 18],
  }

  const layerSalTrend = {
    mixed: [surfaceSalinity, surfaceSalinity + 0.2, surfaceSalinity + 0.4],
    thermo: [surfaceSalinity + 0.4, surfaceSalinity + 0.6, surfaceSalinity + 0.8],
    deep: [surfaceSalinity + 0.6, surfaceSalinity + 0.7, surfaceSalinity + 0.75],
  }

  const densityProfile = layerTempTrend[selectedLayer].map((temp, index) => {
    const sal = layerSalTrend[selectedLayer][index]
    return Number((1.02 + (sal - 34) * 0.001 - (temp - 20) * 0.0006).toFixed(3))
  })

  const bioStates = marineBioSamples.map((bio) => {
    const tempOk = surfaceTemp >= bio.tempRange[0] && surfaceTemp <= bio.tempRange[1]
    const salOk = surfaceSalinity >= bio.salRange[0] && surfaceSalinity <= bio.salRange[1]
    const score = (tempOk ? 0.6 : 0.2) + (salOk ? 0.4 : 0.15)
    const status = score > 0.7 ? '适宜' : score > 0.45 ? '压力' : '风险'
    return { ...bio, status }
  })

  const bioNote =
    bioMode === 'bleach'
      ? '温度或盐度异常 → 珊瑚白化，鱼群向深层或冷水区迁移。'
      : '海水性质适中 → 珊瑚、浮游生物与鱼群分层分布稳定。'

  const handleLatSwitch = (value) => {
    setLatBand(value)
    setHighlightFactor('latitude')
  }

  const handleFactorChange = (type, value) => {
    if (type === 'precip') setPrecip(value)
    if (type === 'evap') setEvap(value)
    if (type === 'runoff') setRunoff(value)
    setHighlightFactor(type)
  }

  const handleReset = () => {
    setLatBand('subtropical')
    setBasinId(oceanBasins[0].id)
    setPrecip(70)
    setEvap(80)
    setRunoff(30)
    setCurrentId('neutral')
    setSelectedLayer(marineLayers[0].id)
    setHighlightFactor(null)
    setBioMode('normal')
  }

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：海水温度、盐度与密度分布演示（实验 8）</h1>
            <p className="muted">对应教材：必修 1 第三章《地球上的水》第 2 节</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('海水性质剖面', '<p>本实验展示海水温度、盐度和密度的分布规律。</p><p><strong>操作说明：</strong></p><ul><li>调整纬度带、降水、蒸发等参数</li><li>观察海水温度、盐度、密度的变化</li><li>查看垂直分层曲线</li></ul><p><strong>海水性质规律：</strong></p><ul><li>温度：从赤道向两极递减</li><li>盐度：副热带海区最高（蒸发旺盛）</li><li>密度：与温度负相关，与盐度正相关</li></ul>')
              }}
            >
              操作指南
            </button>
            <button type="button" className="btn ghost" onClick={handleReset}>
              恢复默认
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>
                海水温度、盐度、密度的水平与垂直分布交织在一起，影响因子多且抽象。本实验把“纬度—降水—蒸发—径流—洋流”
                拆成可调控旋钮，并用剖面曲线与热力带帮助学生理解规律。
              </p>
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
              <h2>海区切换</h2>
              <p className="muted">选择不同大洋，观察基准温度与盐度。</p>
              <div className="control-group">
                <label>
                  当前海区：<span>{basin.name}</span>
                </label>
                <select value={basinId} onChange={(event) => setBasinId(event.target.value)}>
                  {oceanBasins.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <p className="data-note">{basin.note}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>影响因子控制台</h2>
              <p className="muted">调节纬度、降水、蒸发、径流与洋流性质。</p>
              <div className="control-group">
                <label>
                  纬度带：<span>{latConfig[latBand].label}</span>
                </label>
                <div className="pill-row">
                  {Object.keys(latConfig).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`pill ${latBand === key ? 'active' : ''}`}
                      onClick={() => handleLatSwitch(key)}
                    >
                      {latConfig[key].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="control-group">
                <label>
                  降水量：<span>{precip}</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={precip}
                  onChange={(event) => handleFactorChange('precip', parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  蒸发量：<span>{evap}</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={evap}
                  onChange={(event) => handleFactorChange('evap', parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  径流注入：<span>{runoff}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={runoff}
                  onChange={(event) => handleFactorChange('runoff', parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  洋流性质：<span>{currentLabel}</span>
                </label>
                <div className="pill-row">
                  {currentOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${currentId === item.id ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentId(item.id)
                        setHighlightFactor('current')
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="data-grid">
                <div className="data-item">
                  <span>表层温度</span>
                  <strong>{surfaceTemp}℃</strong>
                </div>
                <div className="data-item">
                  <span>表层盐度</span>
                  <strong>{surfaceSalinity}‰</strong>
                </div>
                <div className="data-item">
                  <span>表层密度</span>
                  <strong>{densityIndex} g/cm³</strong>
                </div>
                <div className="data-item">
                  <span>主导因子</span>
                  <strong>
                    {highlightFactor === 'evap'
                      ? '蒸发增强'
                      : highlightFactor === 'precip'
                      ? '降水增强'
                      : highlightFactor === 'runoff'
                      ? '径流补给'
                      : highlightFactor === 'current'
                      ? '洋流调节'
                      : '纬度控制'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>垂直分层演示</h2>
              <p className="muted">切换水层，查看温跃层、盐跃层与密度跃层。</p>
              <div className="pill-row">
                {marineLayers.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pill ${selectedLayer === item.id ? 'active' : ''}`}
                    onClick={() => setSelectedLayer(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="layer-panel">
                <div>
                  <strong>{layer.label}</strong>
                  <p>{layer.depth}</p>
                </div>
                <p className="muted">{layer.note}</p>
              </div>
              <div className="profile-grid">
                <div className="profile-card">
                  <h3>温度剖面</h3>
                  <ul>
                    {layerTempTrend[selectedLayer].map((temp, index) => (
                      <li key={`temp-${temp}-${index}`}>{['表层', '中层', '深层'][index]}：{temp}℃</li>
                    ))}
                  </ul>
                </div>
                <div className="profile-card">
                  <h3>盐度剖面</h3>
                  <ul>
                    {layerSalTrend[selectedLayer].map((sal, index) => (
                      <li key={`sal-${sal}-${index}`}>{['表层', '中层', '深层'][index]}：{sal.toFixed(1)}‰</li>
                    ))}
                  </ul>
                </div>
                <div className="profile-card">
                  <h3>密度剖面</h3>
                  <ul>
                    {densityProfile.map((density, index) => (
                      <li key={`den-${density}-${index}`}>{['表层', '中层', '深层'][index]}：{density} g/cm³</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>海洋生物影响模拟</h2>
              <p className="muted">调整温度或盐度，观察珊瑚、浮游生物、鱼群状态。</p>
              <div className="pill-row">
                <button
                  type="button"
                  className={`pill ${bioMode === 'normal' ? 'active' : ''}`}
                  onClick={() => setBioMode('normal')}
                >
                  正常海况
                </button>
                <button
                  type="button"
                  className={`pill ${bioMode === 'bleach' ? 'active' : ''}`}
                  onClick={() => setBioMode('bleach')}
                >
                  异常/白化
                </button>
              </div>
              <div className="bio-grid">
                {bioStates.map((bio) => (
                  <div key={bio.id} className={`bio-card status-${bio.status}`}>
                    <strong>{bio.name}</strong>
                    <span>适宜温度 {bio.tempRange[0]}~{bio.tempRange[1]}℃</span>
                    <span>适宜盐度 {bio.salRange[0]}~{bio.salRange[1]}‰</span>
                    <em>状态：{bio.status}</em>
                  </div>
                ))}
              </div>
              <p className="data-note">{bioNote}</p>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {marineTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {marineExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>🧪 真实海水性质数据对比探究</h2>
              <p className="muted">对比模拟数据与真实海洋观测数据，验证你对海水性质规律的理解。</p>
              <div className="seawater-real-data stacked">
                <div className="real-data-table">
                  <h4>真实观测案例：全球海洋表面平均（WOA数据）</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>纬度带</th>
                        <th>温度 (℃)</th>
                        <th>盐度 (‰)</th>
                        <th>密度 (g/cm³)</th>
                        <th>特征</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>赤道 0°</td>
                        <td>26.8</td>
                        <td>34.6</td>
                        <td>1.0235</td>
                        <td>高温低盐</td>
                      </tr>
                      <tr>
                        <td>副热带 25°</td>
                        <td>22.5</td>
                        <td>35.8</td>
                        <td>1.0248</td>
                        <td>高盐中心</td>
                      </tr>
                      <tr>
                        <td>副极地 55°</td>
                        <td>10.2</td>
                        <td>34.1</td>
                        <td>1.0272</td>
                        <td>低温高密</td>
                      </tr>
                      <tr>
                        <td>极地 75°</td>
                        <td>-1.8</td>
                        <td>34.8</td>
                        <td>1.0285</td>
                        <td>密度最大</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="real-data-analysis">
                  <h4>数据对比分析</h4>
                  <div className="analysis-item">
                    <strong>你的模拟数据</strong>
                    <p>表层温度：{surfaceTemp}℃</p>
                    <p>表层盐度：{surfaceSalinity}‰</p>
                    <p>表层密度：{densityIndex} g/cm³</p>
                    <em>提示：调节纬度和影响因子，观察与真实数据的匹配度</em>
                  </div>
                  <div className="analysis-item highlight">
                    <strong>温盐环流驱动力</strong>
                    <p>北大西洋深层水形成：温度2-4℃，盐度34.9‰</p>
                    <p>南极底层水形成：温度-1.5℃，盐度34.6‰</p>
                    <em>原理：高纬度冷盐水下沉驱动全球温盐环流</em>
                  </div>
                  <div className="analysis-item">
                    <strong>全球盐度分布规律</strong>
                    <p>最高盐度：副热带（蒸发&gt;降水）</p>
                    <p>最低盐度：赤道和高纬度（降水&gt;蒸发或有径流）</p>
                    <em>规律：盐度分布与蒸发降水差呈正相关</em>
                  </div>
                </div>
              </div>
              <div className="seismic-evidence">
                <h4>🔍 海洋观测方法</h4>
                <div className="evidence-chain">
                  <div className="evidence-step">
                    <span>1</span>
                    <div>
                      <strong>Argo浮标</strong>
                      <p>自动剖面测量温盐深</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>2</span>
                    <div>
                      <strong>CTD仪</strong>
                      <p>船载温盐深度测量</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>3</span>
                    <div>
                      <strong>卫星遥感</strong>
                      <p>SMOS/SMAP测海面盐度</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>4</span>
                    <div>
                      <strong>WOA数据集</strong>
                      <p>世界海洋数据库整合</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="compare-tip">
                <strong>科学验证：</strong>
                <p>根据世界海洋数据库(WOA)，全球海洋平均盐度为34.7‰，温度为17.5℃。密度取决于温度和盐度，遵循状态方程ρ = f(T,S,P)。</p>
              </div>
            </div>
          </section>

          <section className="panel canvas ocean-canvas">
            <div className="ocean-visual">
              <div className="ocean-header">
                <h3>{basin.name} · {latConfig[latBand].label}</h3>
                <p>表层温度 {surfaceTemp}℃ · 盐度 {surfaceSalinity}‰ · 密度 {densityIndex} g/cm³</p>
              </div>
              <div className="ocean-surface">
                <div className="ocean-heat">
                  <div className="heat-label">温度带</div>
                  <div className="heat-bar" style={{ '--heat': surfaceTemp }} />
                </div>
                <div className="ocean-salt">
                  <div className="salt-label">盐度带</div>
                  <div className="salt-bar" style={{ '--salinity': surfaceSalinity }} />
                </div>
              </div>
              <div className="ocean-section">
                <div className={`layer-slab ${selectedLayer}`}>表层</div>
                <div className={`layer-slab ${selectedLayer === 'thermo' ? 'active' : ''}`}>温跃层</div>
                <div className={`layer-slab ${selectedLayer === 'deep' ? 'active' : ''}`}>深层水</div>
                <div className="section-curve">
                  <div className="curve temp" style={{ height: `${Math.min(80, 30 + surfaceTemp)}%` }} />
                  <div className="curve sal" style={{ height: `${Math.min(80, 20 + (surfaceSalinity - 32) * 12)}%` }} />
                  <div className="curve den" style={{ height: `${Math.min(80, 20 + (densityIndex - 1.02) * 800)}%` }} />
                </div>
              </div>
              <div className="ocean-bio">
                {bioStates.map((bio) => (
                  <div key={bio.id} className={`bio-dot status-${bio.status}`}>
                    {bio.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="canvas-overlay" />
          </section>
        </div>
      </main>
    </div>
  )
}

function RequiredNine() {
  const [currentId, setCurrentId] = useState(oceanCurrents[0].id)
  const [showTrades, setShowTrades] = useState(true)
  const [showWesterlies, setShowWesterlies] = useState(true)
  const [tideMode, setTideMode] = useState('spring')
  const [ensoMode, setEnsoMode] = useState('normal')
  const [windSpeed, setWindSpeed] = useState(10)
  const [windDuration, setWindDuration] = useState(8)
  const [fetchSize, setFetchSize] = useState(300)

  const { openInfo } = useContext(InfoModalContext)

  const current = oceanCurrents.find((item) => item.id === currentId) ?? oceanCurrents[0]
  const tide = tideModes.find((item) => item.id === tideMode) ?? tideModes[0]
  const enso = ensoModes.find((item) => item.id === ensoMode) ?? ensoModes[0]

  const windDrive =
    current.latBand === '中高纬环流' ? (showWesterlies ? 1 : 0.2) : showTrades ? 1 : 0.2
  const effectiveStrength = Number((current.strength * windDrive).toFixed(1))
  const currentNote = windDrive < 0.4 ? '风带驱动削弱，环流明显减弱。' : current.note

  const waveHeight = Number((windSpeed * 0.12 + windDuration * 0.06 + fetchSize * 0.004).toFixed(1))
  const waveEnergy = Math.round(waveHeight * 12)

  const handleWavePreset = (presetId) => {
    const preset = waveExamples.find((item) => item.id === presetId)
    if (!preset) return
    setWindSpeed(preset.windSpeed)
    setWindDuration(preset.duration)
    setFetchSize(preset.fetch)
  }

  const handleReset = () => {
    setCurrentId(oceanCurrents[0].id)
    setShowTrades(true)
    setShowWesterlies(true)
    setTideMode('spring')
    setEnsoMode('normal')
    setWindSpeed(10)
    setWindDuration(8)
    setFetchSize(300)
  }

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：海水运动综合演示（实验 9）</h1>
            <p className="muted">对应教材：必修 1 第三章《地球上的水》第 3 节《海水的运动》</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('海水运动综合演示', '<p>本实验展示洋流、潮汐、海浪等海水运动现象。</p><p><strong>操作说明：</strong></p><ul><li>选择洋流系统，观察风带驱动</li><li>查看潮汐现象和ENSO对比</li><li>调整风速、风时、风区，观察海浪变化</li></ul><p><strong>海水运动形式：</strong></p><ul><li>洋流：大规模海水流动（风海流、补偿流）</li><li>潮汐：月球、太阳引力作用</li><li>海浪：风力作用形成</li></ul>')
              }}
            >
              操作指南
            </button>
            <button type="button" className="btn ghost" onClick={handleReset}>
              恢复默认
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p className="muted">围绕洋流成因、海浪潮汐与 ENSO 异常进行三步探究：风带驱动 → 海面波动 → 异常对比。</p>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>了解世界洋流的分布规律</li>
                    <li>掌握洋流的成因与类型</li>
                    <li>理解潮汐现象的形成原理</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析洋流对气候的影响</li>
                    <li>学会解释潮汐现象</li>
                    <li>培养地理综合分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>认识海洋运动的规律性</li>
                    <li>理解海洋对全球气候的调节作用</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>表层洋流沙盘</h2>
              <p className="muted">切换洋流与风带，观察环流强弱与寒暖流性质。</p>
              <div className="control-group">
                <label>
                  主要洋流：<span>{current.name}</span>
                </label>
                <select value={currentId} onChange={(event) => setCurrentId(event.target.value)}>
                  {oceanCurrents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <p className="data-note">{current.latBand} · {current.basin}</p>
              </div>
              <div className="pill-row">
                <button
                  type="button"
                  className={`pill ${showTrades ? 'active' : ''}`}
                  onClick={() => setShowTrades((value) => !value)}
                >
                  信风带 {showTrades ? '开启' : '关闭'}
                </button>
                <button
                  type="button"
                  className={`pill ${showWesterlies ? 'active' : ''}`}
                  onClick={() => setShowWesterlies((value) => !value)}
                >
                  西风带 {showWesterlies ? '开启' : '关闭'}
                </button>
              </div>
              <div className="data-grid">
                <div className="data-item">
                  <span>洋流性质</span>
                  <strong>{current.type === 'warm' ? '暖流' : '寒流'}</strong>
                </div>
                <div className="data-item">
                  <span>环流强度</span>
                  <strong>{effectiveStrength} 级</strong>
                </div>
                <div className="data-item">
                  <span>沿岸气候效应</span>
                  <strong>{current.type === 'warm' ? '增温增湿' : '降温减湿'}</strong>
                </div>
                <div className="data-item">
                  <span>补偿流提示</span>
                  <strong>{current.type === 'cold' ? '上升流显著' : '下沉流为主'}</strong>
                </div>
              </div>
              <p className="data-note">{currentNote}</p>
            </div>

            <div className="panel-block">
              <h2>海浪潮汐模拟器</h2>
              <p className="muted">调节风速、风时、风区与日月位置，观察浪高与潮差。</p>
              <div className="control-group">
                <label>
                  风速：<span>{windSpeed} m/s</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  step={1}
                  value={windSpeed}
                  onChange={(event) => setWindSpeed(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  风时：<span>{windDuration} h</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={windDuration}
                  onChange={(event) => setWindDuration(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  风区范围：<span>{fetchSize} km</span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={10}
                  value={fetchSize}
                  onChange={(event) => setFetchSize(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="pill-row">
                {waveExamples.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="pill"
                    onClick={() => handleWavePreset(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="control-group">
                <label>
                  日月地相对位置：<span>{tide.name}</span>
                </label>
                <div className="pill-row">
                  {tideModes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${tideMode === item.id ? 'active' : ''}`}
                      onClick={() => setTideMode(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="data-grid">
                <div className="data-item">
                  <span>浪高估算</span>
                  <strong>{waveHeight} m</strong>
                </div>
                <div className="data-item">
                  <span>波浪能量</span>
                  <strong>{waveEnergy} 单位</strong>
                </div>
                <div className="data-item">
                  <span>潮差</span>
                  <strong>{tide.tideRange} m</strong>
                </div>
                <div className="data-item">
                  <span>潮汐特征</span>
                  <strong>{tide.description}</strong>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>ENSO 异常对比</h2>
              <p className="muted">切换三种年型，观察赤道太平洋海温与降水异常。</p>
              <div className="pill-row">
                {ensoModes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pill ${ensoMode === item.id ? 'active' : ''}`}
                    onClick={() => setEnsoMode(item.id)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="data-grid">
                <div className="data-item">
                  <span>东太平洋海温</span>
                  <strong>{enso.eastTemp}℃</strong>
                </div>
                <div className="data-item">
                  <span>西太平洋海温</span>
                  <strong>{enso.westTemp}℃</strong>
                </div>
                <div className="data-item">
                  <span>环流</span>
                  <strong>{enso.current}</strong>
                </div>
                <div className="data-item">
                  <span>降水异常</span>
                  <strong>{enso.rain}</strong>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {requiredNineExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>🧪 真实洋流潮汐数据对比探究</h2>
              <p className="muted">对比模拟数据与真实海洋观测数据，验证你对海水运动规律的理解。</p>
              <div className="current-tide-real-data stacked">
                <div className="real-data-table">
                  <h4>真实观测案例：全球主要洋流参数（WOA数据）</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>洋流名称</th>
                        <th>类型</th>
                        <th>流速 (cm/s)</th>
                        <th>流量 (Sv)</th>
                        <th>水温差</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>墨西哥湾流</td>
                        <td>暖流</td>
                        <td>100-150</td>
                        <td>30-35</td>
                        <td>+10~15℃</td>
                      </tr>
                      <tr>
                        <td>北大西洋漂流</td>
                        <td>暖流</td>
                        <td>20-50</td>
                        <td>15-20</td>
                        <td>+5~8℃</td>
                      </tr>
                      <tr>
                        <td>秘鲁寒流</td>
                        <td>寒流</td>
                        <td>10-30</td>
                        <td>15-20</td>
                        <td>-8~-12℃</td>
                      </tr>
                      <tr>
                        <td>西风漂流</td>
                        <td>寒流</td>
                        <td>30-60</td>
                        <td>100+</td>
                        <td>-2~-5℃</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="real-data-analysis">
                  <h4>数据对比分析</h4>
                  <div className="analysis-item">
                    <strong>你的模拟数据</strong>
                    <p>当前洋流：{current.name}（{current.type === 'warm' ? '暖流' : '寒流'}）</p>
                    <p>模拟强度：{effectiveStrength} 级</p>
                    <p>浪高估算：{waveHeight} m</p>
                    <em>提示：调节风带和波浪参数，观察与真实数据的匹配度</em>
                  </div>
                  <div className="analysis-item highlight">
                    <strong>潮汐真实数据（中国沿海）</strong>
                    <p>钱塘江大潮：潮差可达 8-10m（世界第三）</p>
                    <p>渤海湾：潮差 2-4m</p>
                    <p>南海：潮差 1-2m</p>
                    <em>规律：潮差与海湾形状密切相关</em>
                  </div>
                  <div className="analysis-item">
                    <strong>ENSO真实观测（NOAA数据）</strong>
                    <p>厄尔尼诺：东太平洋升温 2-4℃，西太平洋降温 1-2℃</p>
                    <p>拉尼娜：东太平洋降温 1-3℃，西太平洋升温 1-2℃</p>
                    <em>影响：全球气候异常，中国南方易涝北方易旱</em>
                  </div>
                </div>
              </div>
              <div className="seismic-evidence">
                <h4>🔍 海洋运动观测方法</h4>
                <div className="evidence-chain">
                  <div className="evidence-step">
                    <span>1</span>
                    <div>
                      <strong>漂流浮标</strong>
                      <p>卫星追踪洋流轨迹</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>2</span>
                    <div>
                      <strong>ADCP测流仪</strong>
                      <p>声学多普勒流速剖面</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>3</span>
                    <div>
                      <strong>验潮站</strong>
                      <p>长期监测潮位变化</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>4</span>
                    <div>
                      <strong>卫星高度计</strong>
                      <p>测海面高度推算流速</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="compare-tip">
                <strong>科学验证：</strong>
                <p>全球海洋总环流输送量约为 100 Sv（1 Sv = 10^6 m³/s），其中西风漂流输送量最大，超过 100 Sv。潮汐能是一种可再生能源，中国沿海潮汐能资源丰富。</p>
              </div>
            </div>
          </section>

          <section className="panel canvas ocean-motion-canvas">
            <div className="motion-stage">
              <div className="stage-block currents">
                <div className="stage-header">
                  <div>
                    <h3>环流分布沙盘</h3>
                    <p>{current.basin} · {current.latBand}</p>
                  </div>
                  <span className={`badge ${current.type}`}>{current.type === 'warm' ? '暖流' : '寒流'}</span>
                </div>
                <div className="current-map">
                  <div className="current-basin">{current.basin}</div>
                  <div
                    className={`current-arrow ${current.type}`}
                    style={{ '--strength': effectiveStrength }}
                  />
                  <div className={`current-arrow secondary ${current.type}`} />
                  <div className="current-label">{current.name}</div>
                  {current.type === 'cold' && <div className="upwelling">上升补偿流</div>}
                </div>
                <div className="belt-row">
                  {windBelts.map((belt) => (
                    <div key={belt.id} className={`belt-card ${belt.id}`}>
                      <strong>{belt.name}</strong>
                      <span>{belt.direction}</span>
                      <em>{belt.note}</em>
                      <div className={`belt-status ${belt.id === 'trades' ? (showTrades ? 'on' : 'off') : showWesterlies ? 'on' : 'off'}`}>
                        {belt.id === 'trades' ? (showTrades ? '驱动中' : '已关闭') : showWesterlies ? '驱动中' : '已关闭'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stage-block waves">
                <div className="stage-header">
                  <div>
                    <h3>海浪/潮汐观测</h3>
                    <p>风浪能量与潮差同步对比</p>
                  </div>
                  <span className="badge neutral">潮差 {tide.tideRange} m</span>
                </div>
                <div className="wave-panel">
                  <div className="wave-line">
                    <div className="wave-crest" style={{ '--wave': waveHeight }} />
                  </div>
                  <div className="wave-metrics">
                    <div>
                      <span>浪高</span>
                      <strong>{waveHeight} m</strong>
                    </div>
                    <div>
                      <span>风速</span>
                      <strong>{windSpeed} m/s</strong>
                    </div>
                    <div>
                      <span>潮型</span>
                      <strong>{tide.name}</strong>
                    </div>
                  </div>
                </div>
                <div className="tide-orbit">
                  <div className="tide-orbit__sun">日</div>
                  <div className="tide-orbit__earth">地</div>
                  <div className={`tide-orbit__moon ${tideMode}`}>月</div>
                </div>
              </div>

              <div className="stage-block enso">
                <div className="stage-header">
                  <div>
                    <h3>ENSO 对比</h3>
                    <p>赤道太平洋温度与降水异常</p>
                  </div>
                  <span className="badge neutral">{enso.name}</span>
                </div>
                <div className="enso-map">
                  <div className="enso-label west">西太 {enso.westTemp}℃</div>
                  <div className="enso-label east">东太 {enso.eastTemp}℃</div>
                  <div className="enso-gradient" style={{ '--east': enso.eastTemp, '--west': enso.westTemp }} />
                  <div className="enso-current">{enso.current}</div>
                  <div className="enso-rain">{enso.rain}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function RequiredSeven() {
  const [selectedStage, setSelectedStage] = useState(waterCycleStages[0].id)
  const [vegetation, setVegetation] = useState(80)
  const [urban, setUrban] = useState(20)
  const [reservoir, setReservoir] = useState(15)
  const [basinId, setBasinId] = useState('yangtze')
  const [activeAction, setActiveAction] = useState(null)
  const [transferBoost, setTransferBoost] = useState(0)

  const { openInfo } = useContext(InfoModalContext)

  const basin = basinOptions.find((item) => item.id === basinId) ?? basinOptions[0]
  const currentStage = waterCycleStages.find((stage) => stage.id === selectedStage) ?? waterCycleStages[0]

  const vegetationFactor = vegetation / 100
  const urbanFactor = urban / 100
  const reservoirFactor = reservoir / 100

  const precip = Math.round(basin.base.precip * (1 + vegetationFactor * 0.05 - urbanFactor * 0.03))
  const evap = Math.round(basin.base.evap * (1 - vegetationFactor * 0.1) + reservoirFactor * 60 + urbanFactor * 20)
  const runoff = Math.round(basin.base.inflow * (1 + urbanFactor * 0.5 - vegetationFactor * 0.25))
  const infiltration = Math.round(basin.base.inflow * (0.5 + vegetationFactor * 0.35 - urbanFactor * 0.2))

  const balance = precip + runoff + transferBoost - evap
  const balanceLabel = balance >= 0 ? '盈余' : '亏损'
  const hazardLabel = runoff > basin.base.inflow * 1.25 ? '洪涝风险上升' : balance < 0 ? '干旱风险上升' : '水量相对平衡'

  const strengths = {
    evaporation: Math.min(1.2, Math.max(0.2, 0.45 + vegetationFactor * 0.4 + reservoirFactor * 0.2 - urbanFactor * 0.1)),
    transport: 0.8,
    precip: Math.min(1.1, Math.max(0.2, 0.5 + vegetationFactor * 0.2 - urbanFactor * 0.05)),
    runoff: Math.min(1.3, Math.max(0.2, 0.5 + urbanFactor * 0.6 - vegetationFactor * 0.2)),
    infiltration: Math.min(1.2, Math.max(0.2, 0.4 + vegetationFactor * 0.6 - urbanFactor * 0.3)),
    groundwater: Math.min(1.1, Math.max(0.2, 0.35 + vegetationFactor * 0.4 - urbanFactor * 0.15)),
  }

  const stageOpacity = (id) => (selectedStage === id ? 1 : 0.22)

  const handleAction = (actionId) => {
    setActiveAction(actionId)
    if (actionId === 'deforest') {
      setVegetation(20)
      setUrban((value) => Math.min(80, value + 15))
      setTransferBoost(0)
    }
    if (actionId === 'reservoir') {
      setReservoir(60)
      setTransferBoost(0)
    }
    if (actionId === 'transfer') {
      setTransferBoost(150)
    }
  }

  const resetSettings = () => {
    setVegetation(80)
    setUrban(20)
    setReservoir(15)
    setTransferBoost(0)
    setActiveAction(null)
  }

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块：水循环过程与水量平衡仿真</h1>
            <p className="muted">对应教材：必修 1 第三章《地球上的水》第 1 节</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('水循环过程示意', '<p>本实验展示水循环的基本过程和水量平衡原理。</p><p><strong>操作说明：</strong></p><ul><li>使用左侧控制台调整植被覆盖率、城市化程度等参数</li><li>观察水循环各环节的强度变化</li><li>查看水量平衡指标</li></ul><p><strong>水循环环节：</strong></p><ul><li>蒸发/蒸腾：水分返回大气</li><li>水汽输送：大气环流输送水汽</li><li>降水：水汽凝结形成降水</li><li>地表径流：雨水汇流入河</li></ul>')
              }}
            >
              操作指南
            </button>
            <button type="button" className="btn ghost" onClick={resetSettings}>
              恢复默认
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>
                水循环跨越海陆与大气，学生难以整体感知“蒸发—输送—降水—径流”的空间联系。
                本实验用二维剖面+数据仪表，将过程可视化，同时加入人类活动与水量平衡计算。
              </p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>了解水循环的主要环节</li>
                    <li>掌握全球水量平衡原理</li>
                    <li>理解不同水体的分布特征</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析水循环各环节的相互关系</li>
                    <li>学会解读水量平衡数据</li>
                    <li>培养综合分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>认识水资源的循环性和有限性</li>
                    <li>树立节约用水的意识</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>水循环关键环节</h2>
              <p className="muted">点击卡片查看解释，观察右侧循环路径的变化。</p>
              <div className="stage-grid">
                {waterCycleStages.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    className={`stage-card ${stage.id === selectedStage ? 'active' : ''}`}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    <strong>{stage.name}</strong>
                    <span>{stage.summary}</span>
                  </button>
                ))}
              </div>
              <div className="stage-detail">
                <strong>{currentStage.name}</strong>
                <p>{currentStage.detail}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>环节强度调节</h2>
              <p className="muted">滑动调节植被、城市化、水库建设，观察蒸发、下渗、径流变化。</p>
              <div className="control-group">
                <label>
                  植被覆盖率：<span>{vegetation}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={vegetation}
                  onChange={(event) => setVegetation(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  城市化程度：<span>{urban}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={urban}
                  onChange={(event) => setUrban(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="control-group">
                <label>
                  水库建设强度：<span>{reservoir}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={reservoir}
                  onChange={(event) => setReservoir(parseInt(event.target.value, 10))}
                />
              </div>
              <div className="data-grid">
                <div className="data-item">
                  <span>蒸发/蒸腾强度</span>
                  <strong>{strengths.evaporation.toFixed(2)}</strong>
                </div>
                <div className="data-item">
                  <span>降水补给强度</span>
                  <strong>{strengths.precip.toFixed(2)}</strong>
                </div>
                <div className="data-item">
                  <span>地表径流强度</span>
                  <strong>{strengths.runoff.toFixed(2)}</strong>
                </div>
                <div className="data-item">
                  <span>下渗补给比例</span>
                  <strong>{(infiltration / Math.max(runoff + infiltration, 1) * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>水量平衡计算器</h2>
              <p className="muted">选择流域，读取降水、径流与蒸发量，判断水量盈亏。</p>
              <div className="control-group">
                <label>
                  选择流域：<span>{basin.name}</span>
                </label>
                <select value={basinId} onChange={(event) => setBasinId(event.target.value)}>
                  {basinOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="data-note">{basin.note}</p>
              <div className="data-grid">
                <div className="data-item">
                  <span>年降水量</span>
                  <strong>{precip} mm</strong>
                </div>
                <div className="data-item">
                  <span>年径流量</span>
                  <strong>{runoff + transferBoost} mm</strong>
                </div>
                <div className="data-item">
                  <span>年蒸发量</span>
                  <strong>{evap} mm</strong>
                </div>
                <div className="data-item">
                  <span>水量平衡</span>
                  <strong>
                    {balanceLabel} {Math.abs(balance)} mm
                  </strong>
                </div>
              </div>
              <p className="data-note">综合提示：{hazardLabel}</p>
            </div>

            <div className="panel-block">
              <h2>人类活动影响模拟</h2>
              <p className="muted">点击事件按钮，观察环节变化及可能引发的灾害。</p>
              <div className="action-grid">
                {humanActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`action-card ${activeAction === action.id ? 'active' : ''}`}
                    onClick={() => handleAction(action.id)}
                  >
                    <strong>{action.name}</strong>
                    <span>{action.effect}</span>
                  </button>
                ))}
              </div>
              {activeAction ? (
                <div className="action-result">
                  <strong>当前情景：{humanActions.find((item) => item.id === activeAction)?.name}</strong>
                  <p>观察右侧水循环路径的粗细变化，联系洪涝/干旱风险。</p>
                </div>
              ) : null}
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {waterCycleTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {waterCycleExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>🧪 真实水量平衡数据对比探究</h2>
              <p className="muted">对比模拟数据与真实水文观测数据，验证你对水循环规律的理解。</p>
              <div className="water-balance-real-data stacked">
                <div className="real-data-table">
                  <h4>真实观测案例：长江流域水量平衡（1956-2000年平均）</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>项目</th>
                        <th>数值 (mm)</th>
                        <th>占比 (%)</th>
                        <th>备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>年降水量</td>
                        <td>1082</td>
                        <td>100</td>
                        <td>全流域平均</td>
                      </tr>
                      <tr>
                        <td>年蒸发量</td>
                        <td>513</td>
                        <td>47</td>
                        <td>含土壤蒸发</td>
                      </tr>
                      <tr>
                        <td>年径流量</td>
                        <td>569</td>
                        <td>53</td>
                        <td>入海水量</td>
                      </tr>
                      <tr>
                        <td>水量平衡</td>
                        <td>0</td>
                        <td>-</td>
                        <td>长期平衡</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="real-data-analysis">
                  <h4>数据对比分析</h4>
                  <div className="analysis-item">
                    <strong>全球水量平衡（多年平均）</strong>
                    <p>海洋：蒸发 50500 km³ → 降水 45800 km³ + 径流 4700 km³</p>
                    <p>陆地：降水 11900 km³ → 蒸发 7200 km³ + 径流 4700 km³</p>
                    <em>规律：全球水量收支平衡，海洋是大气水的主要来源</em>
                  </div>
                  <div className="analysis-item highlight">
                    <strong>你的模拟数据</strong>
                    <p>降水量：{precip} mm</p>
                    <p>蒸发量：{evap} mm</p>
                    <p>径流量：{runoff + transferBoost} mm</p>
                    <em>提示：调节植被和城市化参数，观察平衡变化</em>
                  </div>
                  <div className="analysis-item">
                    <strong>人类活动影响阈值</strong>
                    <p>当植被覆盖率低于30%：水土流失加剧</p>
                    <p>当城市化超过50%：径流系数显著增大</p>
                    <em>警示：过度开发可能打破区域水量平衡</em>
                  </div>
                </div>
              </div>
              <div className="seismic-evidence">
                <h4>🔍 水量平衡观测方法</h4>
                <div className="evidence-chain">
                  <div className="evidence-step">
                    <span>1</span>
                    <div>
                      <strong>水文站网</strong>
                      <p>监测河流水位流量</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>2</span>
                    <div>
                      <strong>遥感反演</strong>
                      <p>GRACE卫星测水储量变化</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>3</span>
                    <div>
                      <strong>通量塔</strong>
                      <p>观测蒸发蒸腾量</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>4</span>
                    <div>
                      <strong>水文模型</strong>
                      <p>SWAT/MIKE模拟水循环</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="compare-tip">
                <strong>科学验证：</strong>
                <p>根据全球水量平衡原理，对于任意闭合流域，多年平均降水量等于蒸发量与径流量之和。这是水资源评价和管理的理论基础。</p>
              </div>
            </div>
          </section>

          <section className="panel canvas water-cycle-canvas">
            <div className="water-cycle-visual">
              <svg viewBox="0 0 640 420" className="water-cycle-svg" role="img" aria-label="水循环示意图">
                <defs>
                  <linearGradient id="ocean" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4a8dc5" />
                    <stop offset="100%" stopColor="#1e3a5f" />
                  </linearGradient>
                  <linearGradient id="land" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6b8f7a" />
                    <stop offset="100%" stopColor="#2d4a3e" />
                  </linearGradient>
                  <linearGradient id="mountain" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7a7a7a" />
                    <stop offset="100%" stopColor="#5a5a5a" />
                  </linearGradient>
                  <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#87ceeb" />
                    <stop offset="100%" stopColor="#e8f0f5" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                <rect x="0" y="0" width="640" height="260" fill="url(#skyGradient)" />
                <rect x="0" y="260" width="300" height="160" fill="url(#ocean)" />
                <path d="M300 260 L480 210 L640 260 L640 420 L300 420 Z" fill="url(#land)" />
                <path d="M420 240 L470 200 L520 240" fill="url(#mountain)" />
                
                <ellipse cx="80" cy="262" rx="60" ry="8" fill="#6ab7f5" opacity="0.4" />
                <ellipse cx="180" cy="264" rx="50" ry="6" fill="#6ab7f5" opacity="0.3" />
                
                <g className="tree-row" opacity={0.35 + vegetationFactor * 0.6}>
                  <ellipse cx="364" cy="228" rx="10" ry="15" fill="#4a6f5a" />
                  <rect x="367" y="243" width="3" height="10" fill="#5d4e37" />
                  <ellipse cx="398" cy="233" rx="10" ry="15" fill="#4a6f5a" />
                  <rect x="401" y="248" width="3" height="10" fill="#5d4e37" />
                  <ellipse cx="432" cy="228" rx="10" ry="15" fill="#4a6f5a" />
                  <rect x="435" y="243" width="3" height="10" fill="#5d4e37" />
                  <ellipse cx="466" cy="235" rx="9" ry="13" fill="#4a6f5a" />
                  <rect x="469" y="248" width="3" height="10" fill="#5d4e37" />
                </g>

                <circle cx="120" cy="70" r="28" fill="#f5c962" opacity={stageOpacity('evaporation')} filter="url(#glow)" />
                <g opacity={stageOpacity('transport')}>
                  <ellipse cx="240" cy="85" rx="55" ry="22" fill="#e2e8f0" />
                  <ellipse cx="290" cy="75" rx="40" ry="18" fill="#f1f5f9" />
                  <ellipse cx="340" cy="88" rx="50" ry="20" fill="#e2e8f0" />
                  <ellipse cx="400" cy="78" rx="35" ry="16" fill="#f8fafc" />
                </g>

                <g className="ocean-inner-cycle">
                  <path
                    d="M80 255 C60 220 70 180 100 160 C130 140 160 150 150 190 C140 230 100 250 80 255"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth={2 + strengths.evaporation * 1.5}
                    strokeOpacity={stageOpacity('evaporation') * 0.8}
                    strokeLinecap="round"
                    markerEnd="url(#arrowheadUp)"
                  />
                  <path
                    d="M150 190 C160 230 120 250 90 255 C60 260 70 230 80 210 C90 190 120 185 150 190"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1.8 + strengths.precip * 1.5}
                    strokeOpacity={stageOpacity('precip') * 0.7}
                    strokeLinecap="round"
                    strokeDasharray="6 6"
                  />
                </g>
                
                <path
                  d="M140 245 C160 195 200 165 240 145"
                  fill="none"
                  stroke="#4a8dc5"
                  strokeWidth={2.5 + strengths.evaporation * 2.5}
                  strokeOpacity={stageOpacity('evaporation')}
                  strokeLinecap="round"
                  strokeDasharray="10 8"
                  filter="url(#glow)"
                />
                <path
                  d="M370 230 C385 190 410 165 445 150"
                  fill="none"
                  stroke="#4a8dc5"
                  strokeWidth={2 + strengths.evaporation * 2}
                  strokeOpacity={stageOpacity('evaporation') * 0.8}
                  strokeLinecap="round"
                  strokeDasharray="10 8"
                />
                
                <path
                  d="M245 145 C320 105 400 90 460 90"
                  fill="none"
                  stroke="#2d5a87"
                  strokeWidth={2.5 + strengths.transport * 2.5}
                  strokeOpacity={stageOpacity('transport')}
                  strokeLinecap="round"
                />
                
                <path
                  d="M460 90 C485 120 505 150 520 200"
                  fill="none"
                  stroke="#4a6f5a"
                  strokeWidth={2.5 + strengths.precip * 2.5}
                  strokeOpacity={stageOpacity('precip')}
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                />
                <path
                  d="M455 100 C470 135 485 165 495 200"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={2 + strengths.precip * 2}
                  strokeOpacity={stageOpacity('precip') * 0.7}
                  strokeLinecap="round"
                  strokeDasharray="5 5"
                />
                
                <g opacity={stageOpacity('precip')}>
                  <circle cx="505" cy="130" r="3" fill="#60a5fa" className="raindrop" />
                  <circle cx="515" cy="150" r="2.5" fill="#93c5fd" className="raindrop" />
                  <circle cx="500" cy="170" r="3" fill="#60a5fa" className="raindrop" />
                  <circle cx="520" cy="185" r="2.5" fill="#93c5fd" className="raindrop" />
                </g>
                
                <path
                  d="M520 250 C470 290 400 310 330 310"
                  fill="none"
                  stroke="#8b7355"
                  strokeWidth={2.8 + strengths.runoff * 2.8}
                  strokeOpacity={stageOpacity('runoff')}
                  strokeLinecap="round"
                />
                <path
                  d="M480 270 C450 300 410 315 370 320"
                  fill="none"
                  stroke="#a16207"
                  strokeWidth={2 + strengths.runoff * 2}
                  strokeOpacity={stageOpacity('runoff') * 0.7}
                  strokeLinecap="round"
                />
                
                <g className="stream-arrows" opacity={stageOpacity('runoff')}>
                  <polygon points="400,285 395,292 405,292" fill="#8b7355" />
                  <polygon points="340,308 335,315 345,315" fill="#8b7355" />
                </g>
                
                <path
                  d="M420 265 C418 300 405 335 370 360"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth={2.2 + strengths.infiltration * 2.2}
                  strokeOpacity={stageOpacity('infiltration')}
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                />
                <path
                  d="M380 280 C378 310 368 340 345 365"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={1.6 + strengths.infiltration * 1.6}
                  strokeOpacity={stageOpacity('infiltration') * 0.7}
                  strokeLinecap="round"
                  strokeDasharray="6 5"
                />
                
                <path
                  d="M370 365 C280 385 190 370 120 340"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={2.2 + strengths.groundwater * 2.2}
                  strokeOpacity={stageOpacity('groundwater')}
                  strokeLinecap="round"
                  strokeDasharray="10 6"
                />
                <path
                  d="M300 375 C230 385 160 375 100 345"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={1.8 + strengths.groundwater * 1.8}
                  strokeOpacity={stageOpacity('groundwater') * 0.6}
                  strokeLinecap="round"
                  strokeDasharray="8 5"
                />
                
                <g className="groundwater-arrows" opacity={stageOpacity('groundwater')}>
                  <polygon points="240,378 235,385 245,385" fill="#2563eb" />
                  <polygon points="160,360 155,367 165,367" fill="#2563eb" />
                </g>
                
                <g className="stage-labels">
                  <text x="160" y="185" opacity={stageOpacity('evaporation')} className="label">蒸发/蒸腾</text>
                  <text x="300" y="115" opacity={stageOpacity('transport')} className="label">水汽输送</text>
                  <text x="510" y="145" opacity={stageOpacity('precip')} className="label">降水</text>
                  <text x="450" y="310" opacity={stageOpacity('runoff')} className="label">地表径流</text>
                  <text x="425" y="345" opacity={stageOpacity('infiltration')} className="label">下渗</text>
                  <text x="200" y="385" opacity={stageOpacity('groundwater')} className="label">地下径流</text>
                </g>

                <g className="cycle-labels">
                  <text x="60" y="215" className="cycle-label">海洋内循环</text>
                  <text x="400" y="205" className="cycle-label">陆地内循环</text>
                  <text x="270" y="65" className="cycle-label">海陆间循环</text>
                </g>
                
                <g className="water-particles" opacity={stageOpacity('evaporation')}>
                  <circle cx="135" cy="235" r="3" fill="#60a5fa" className="particle-up" />
                  <circle cx="150" cy="220" r="2.5" fill="#93c5fd" className="particle-up" />
                  <circle cx="140" cy="205" r="3" fill="#60a5fa" className="particle-up" />
                </g>
                <g className="water-particles" opacity={stageOpacity('runoff')}>
                  <circle cx="450" cy="290" r="2.5" fill="#a16207" className="particle-down" />
                  <circle cx="400" cy="305" r="2" fill="#ca8a04" className="particle-down" />
                </g>
              </svg>
            </div>
            <div className="water-metrics">
              <div className={selectedStage === 'evaporation' ? 'active' : ''}>
                <span>蒸发/蒸腾</span>
                <strong>{strengths.evaporation.toFixed(2)}</strong>
              </div>
              <div className={selectedStage === 'transport' ? 'active' : ''}>
                <span>水汽输送</span>
                <strong>{strengths.transport.toFixed(2)}</strong>
              </div>
              <div className={selectedStage === 'precip' ? 'active' : ''}>
                <span>降水</span>
                <strong>{strengths.precip.toFixed(2)}</strong>
              </div>
              <div className={selectedStage === 'runoff' ? 'active' : ''}>
                <span>地表径流</span>
                <strong>{strengths.runoff.toFixed(2)}</strong>
              </div>
              <div className={selectedStage === 'infiltration' ? 'active' : ''}>
                <span>下渗</span>
                <strong>{strengths.infiltration.toFixed(2)}</strong>
              </div>
              <div className={selectedStage === 'groundwater' ? 'active' : ''}>
                <span>地下径流</span>
                <strong>{strengths.groundwater.toFixed(2)}</strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function RequiredSix() {
  const [energyState, setEnergyState] = useState({ cloud: true, ozone: true, co2: true })
  const [scenarioId, setScenarioId] = useState('clear-day')
  const [hotSpot, setHotSpot] = useState({ x: 30, y: 55 })
  const [coldSpot, setColdSpot] = useState({ x: 70, y: 45 })
  const [hemisphere, setHemisphere] = useState('north')
  const [pressureGradient, setPressureGradient] = useState(3)
  const [roughness, setRoughness] = useState(2)
  const [selectedAirMass, setSelectedAirMass] = useState(null)
  const [placementMode, setPlacementMode] = useState('hot')
  const [activePreset, setActivePreset] = useState('urban-heat')
  const [windProgress, setWindProgress] = useState(1)

  const scenario = requiredSixScenarios.find((item) => item.id === scenarioId) ?? requiredSixScenarios[0]
  const toggleEnergy = (id) => {
    setEnergyState((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const activePresetInfo = circulationPresets.find((item) => item.id === activePreset) ?? circulationPresets[0]

  const cloudImpact = energyState.cloud ? (scenario.cloud ? 1.5 : 0.8) : 1
  const ozoneImpact = energyState.ozone ? 0.5 : 0
  const co2Impact = energyState.co2 ? 1.2 : 0.6
  const dayBoost = scenario.isDay ? 8 : -2
  const baseTemp = scenario.baseTemp
  const adjustedTemp = baseTemp + dayBoost + cloudImpact + co2Impact + ozoneImpact
  const backRadiation = (energyState.cloud ? 1.4 : 0.7) + (energyState.co2 ? 1.2 : 0.5)
  const netLoss = scenario.isDay ? 2 - cloudImpact : 6 - backRadiation

  const selectedAirInfo = useMemo(() => {
    if (!selectedAirMass) return null
    const baseSpeed = pressureGradient * 1.2
    const frictionLoss = roughness * 0.6
    const finalSpeed = Math.max(0.6, baseSpeed - frictionLoss)
    const coriolis = hemisphere === 'north' ? 1 : -1
    const deflection = Math.min(40, Math.max(10, pressureGradient * 8))
    const angle = 90 - deflection * coriolis
    return {
      id: selectedAirMass,
      label: '气团 A',
      forces: [
        { id: 'pgf', label: '水平气压梯度力', value: pressureGradient, note: '指向低压' },
        { id: 'cor', label: '地转偏向力', value: Math.abs(deflection / 10), note: '随风速增强' },
        { id: 'fric', label: '摩擦力', value: roughness, note: '近地面阻力' },
      ],
      speed: finalSpeed.toFixed(1),
      angle,
      stable: pressureGradient >= roughness,
    }
  }, [selectedAirMass, pressureGradient, roughness, hemisphere])

  const windTargetAngle = useMemo(() => {
    const coriolis = hemisphere === 'north' ? -1 : 1
    const deflection = Math.min(40, Math.max(10, pressureGradient * 8))
    return deflection * coriolis
  }, [hemisphere, pressureGradient])

  const tempDayCurve = useMemo(() => {
    return [
      { hour: 0, temp: adjustedTemp - 8 },
      { hour: 6, temp: adjustedTemp - 4 },
      { hour: 9, temp: adjustedTemp + 2 },
      { hour: 12, temp: adjustedTemp + 6 },
      { hour: 15, temp: adjustedTemp + 8 },
      { hour: 18, temp: adjustedTemp + 3 },
      { hour: 21, temp: adjustedTemp - 2 },
      { hour: 24, temp: adjustedTemp - 6 },
    ]
  }, [adjustedTemp])

  const tempRange = useMemo(() => {
    const maxTemp = Math.max(...tempDayCurve.map((p) => p.temp)) + 2
    const minTemp = Math.min(...tempDayCurve.map((p) => p.temp)) - 2
    return { maxTemp, minTemp }
  }, [tempDayCurve])

  const tempPath = useMemo(() => {
    return tempDayCurve
      .map((point, index) => {
        const x = (point.hour / 24) * 320
        const y = 180 - ((point.temp - tempRange.minTemp) / (tempRange.maxTemp - tempRange.minTemp)) * 160
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [tempDayCurve, tempRange])

  const tempTicks = useMemo(() => {
    return [0, 6, 12, 18, 24]
  }, [])

  useEffect(() => {
    setWindProgress(0)
    const start = Date.now()
    let frameId
    const animate = () => {
      const elapsed = Date.now() - start
      const next = Math.min(1, elapsed / 1200)
      setWindProgress(next)
      if (next < 1) {
        frameId = requestAnimationFrame(animate)
      }
    }
    animate()
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [pressureGradient, roughness, hemisphere])

  const moveSpot = (type, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const next = { x: Math.min(90, Math.max(10, x)), y: Math.min(85, Math.max(15, y)) }
    if (type === 'hot') {
      setHotSpot(next)
    } else {
      setColdSpot(next)
    }
  }

  const handleSelectPreset = (preset) => {
    setActivePreset(preset.id)
    setHotSpot({ x: preset.hot, y: 55 })
    setColdSpot({ x: preset.cold, y: 45 })
  }

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块六：大气能量收支与热力环流仿真</h1>
            <p className="muted">对应教材：必修 1 第二章《地球上的大气》第 2 节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>
                能量传递过程抽象（地面是近地面大气主要直接热源）；热力环流形成机制逻辑链条长；风向受力分析动态平衡难理解。
                通过“能量收支仪 → 昼夜/阴晴对比 → 热力环流沙盒 → 风向受力分析”逐步呈现。
              </p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objectives-grid">
                <div className="objective-card">
                  <h4>📚 知识目标</h4>
                  <ul>
                    <li>理解大气能量收支平衡原理</li>
                    <li>掌握大气保温作用（温室效应）机制</li>
                    <li>了解热力环流的形成过程</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>💡 能力目标</h4>
                  <ul>
                    <li>能够分析大气能量流动过程</li>
                    <li>学会解释海陆风、山谷风的形成</li>
                    <li>培养地理因果分析能力</li>
                  </ul>
                </div>
                <div className="objective-card">
                  <h4>🌍 情感态度</h4>
                  <ul>
                    <li>理解人类活动对气候的影响</li>
                    <li>树立节能减排意识</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>大气受热过程演示仪</h2>
              <p className="muted">单独开启/关闭关键过程，箭头粗细代表能量强弱。</p>
              <div className="toggle-grid">
                {requiredSixEnergyToggles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`toggle-card ${energyState[item.id] ? 'active' : ''}`}
                    onClick={() => toggleEnergy(item.id)}
                  >
                    <span className="toggle-dot" style={{ background: item.color }} />
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="energy-summary">
                <div>
                  <span>地表温度</span>
                  <strong>{adjustedTemp.toFixed(1)}℃</strong>
                </div>
                <div>
                  <span>逆辐射强度</span>
                  <strong>{backRadiation.toFixed(1)} 级</strong>
                </div>
                <div>
                  <span>净辐射损失</span>
                  <strong>{netLoss.toFixed(1)} 级</strong>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>昼夜 / 阴晴对比</h2>
              <p className="muted">点击情景按钮，对比气温与能量收支差异。</p>
              <div className="pill-row">
                {requiredSixScenarios.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pill ${scenarioId === item.id ? 'active' : ''}`}
                    onClick={() => setScenarioId(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="scenario-grid">
                <div>
                  <h3>{scenario.label}</h3>
                  <p>云量：{scenario.cloud ? '多云' : '晴朗'} · 时段：{scenario.isDay ? '白天' : '夜晚'}</p>
                  <p>地表基础温度：{scenario.baseTemp}℃</p>
                  <p>提示：晴朗夜晚逆辐射弱，净辐射损失最大。</p>
                </div>
                <div className="scenario-meter">
                  <div className={`meter-bar ${scenario.isDay ? 'day' : 'night'}`} style={{ height: `${50 + adjustedTemp}%` }} />
                  <div className={`meter-bar back`} style={{ height: `${backRadiation * 18}%` }} />
                  <div className={`meter-bar loss`} style={{ height: `${netLoss * 12}%` }} />
                  <div className="meter-labels">
                    <span>地表温度</span>
                    <span>逆辐射</span>
                    <span>净损失</span>
                  </div>
                </div>
              </div>
              <div className="temp-curve">
                <div className="temp-curve__head">
                  <strong>昼夜温度变化曲线</strong>
                  <span>最高/最低温度可直观看出霜冻风险</span>
                </div>
                <svg viewBox="0 0 360 180" aria-label="昼夜温度变化曲线">
                  <line x1="50" y1="20" x2="50" y2="160" className="temp-curve__axis-y" />
                  <line x1="50" y1="160" x2="350" y2="160" className="temp-curve__axis-x" />
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = 160 - ratio * 140
                    const temp = tempRange.minTemp + ratio * (tempRange.maxTemp - tempRange.minTemp)
                    return (
                      <g key={i}>
                        <line x1="48" y1={y} x2="50" y2={y} className="temp-curve__grid-line" />
                        <text x="42" y={y + 4} className="temp-curve__y-tick" textAnchor="end">
                          {temp.toFixed(0)}℃
                        </text>
                      </g>
                    )
                  })}
                  <path d={tempPath.replace(/M (\d+)/g, 'M ').replace(/L (\d+)/g, 'L ').replace(/(\d+\.?\d*) /g, (m, n) => `${parseFloat(n) + 50} `)} className="temp-curve__line" />
                  {tempDayCurve.map((point) => (
                    <circle
                      key={point.hour}
                      cx={(point.hour / 24) * 320 + 50}
                      cy={160 - ((point.temp - tempRange.minTemp) / (tempRange.maxTemp - tempRange.minTemp)) * 140}
                      r="5"
                      className="temp-curve__dot"
                    />
                  ))}
                  {tempTicks.map((tick) => (
                    <text key={tick} x={(tick / 24) * 320 + 50} y={175} className="temp-curve__tick">
                      {tick}时
                    </text>
                  ))}
                  <text x="25" y="10" className="temp-curve__axis-label" textAnchor="middle">温度</text>
                  <text x="200" y="175" className="temp-curve__axis-label-x">时间</text>
                </svg>
                <div className="temp-curve__stats">
                  <span>最高温度：{Math.max(...tempDayCurve.map(p => p.temp)).toFixed(1)}℃</span>
                  <span>最低温度：{Math.min(...tempDayCurve.map(p => p.temp)).toFixed(1)}℃</span>
                  <span>日较差：{(Math.max(...tempDayCurve.map(p => p.temp)) - Math.min(...tempDayCurve.map(p => p.temp))).toFixed(1)}℃</span>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>热力环流沙盒</h2>
              <p className="muted">切换热力情景或点击沙盒放置热源/冷源。</p>
              <div className="circulation-tools">
                {circulationPresets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`pill ${item.id === activePreset ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(item)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="placement-toggle">
                <button
                  type="button"
                  className={`pill ${placementMode === 'hot' ? 'active' : ''}`}
                  onClick={() => setPlacementMode('hot')}
                >
                  放置热源
                </button>
                <button
                  type="button"
                  className={`pill ${placementMode === 'cold' ? 'active' : ''}`}
                  onClick={() => setPlacementMode('cold')}
                >
                  放置冷源
                </button>
              </div>
              <div className="sandbox" onClick={(event) => moveSpot(placementMode, event)}>
                <div className="spot hot" style={{ left: `${hotSpot.x}%`, top: `${hotSpot.y}%` }}>
                  热源
                </div>
                <div className="spot cold" style={{ left: `${coldSpot.x}%`, top: `${coldSpot.y}%` }}>
                  冷源
                </div>
                <div className="flow-arrow" style={{ left: '20%', top: '30%' }} />
                <div className="flow-arrow reverse" style={{ left: '55%', top: '65%' }} />
                <div className="particle up" style={{ left: `${hotSpot.x}%` }} />
                <div className="particle down" style={{ left: `${coldSpot.x}%` }} />
              </div>
              <div className="circulation-note">
                <strong>{activePresetInfo.label}</strong>
                <p>{activePresetInfo.note}</p>
              </div>
              <p className="data-note">提示：热源上升 → 高空向冷源流动 → 冷源下沉 → 近地面回流。</p>
            </div>

            <div className="panel-block">
              <h2>风的形成受力分析仪</h2>
              <p className="muted">点击气团查看受力与偏转，观察稳定风向。</p>
              <div className="control-group">
                <label>
                  水平气压梯度力：<span>{pressureGradient.toFixed(1)} 级</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={pressureGradient}
                  onChange={(event) => setPressureGradient(parseFloat(event.target.value))}
                />
              </div>
              <div className="control-group">
                <label>
                  地面粗糙度：<span>{roughness.toFixed(1)} 级</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={roughness}
                  onChange={(event) => setRoughness(parseFloat(event.target.value))}
                />
              </div>
              <div className="control-group">
                <label>
                  半球切换：<span>{hemisphere === 'north' ? '北半球' : '南半球'}</span>
                </label>
                <div className="pill-row">
                  <button
                    type="button"
                    className={`pill ${hemisphere === 'north' ? 'active' : ''}`}
                    onClick={() => setHemisphere('north')}
                  >
                    北半球
                  </button>
                  <button
                    type="button"
                    className={`pill ${hemisphere === 'south' ? 'active' : ''}`}
                    onClick={() => setHemisphere('south')}
                  >
                    南半球
                  </button>
                </div>
              </div>
              <div className="wind-board">
                <div className="air-mass" onClick={() => setSelectedAirMass('air-1')}>
                  气团 A
                </div>
                <div className="wind-vector" style={{ transform: `rotate(${windTargetAngle * windProgress}deg)` }} />
                <div className={`wind-vector coriolis ${hemisphere}`} />
                <div className="wind-vector friction" />
                <div className="wind-progress">
                  稳定进度：{Math.round(windProgress * 100)}%
                </div>
              </div>
              {selectedAirInfo && (
                <div className="force-panel">
                  <h3>气团 A 受力分析</h3>
                  <div className="force-grid">
                    {selectedAirInfo.forces.map((force) => (
                      <div key={force.id} className="force-card">
                        <strong>{force.label}</strong>
                        <p>{force.note}</p>
                        <span>{force.value.toFixed(1)} 级</span>
                      </div>
                    ))}
                  </div>
                  <div className="force-summary">
                    <div>
                      <span>稳定风速</span>
                      <strong>{selectedAirInfo.speed} m/s</strong>
                    </div>
                    <div>
                      <span>偏转角</span>
                      <strong>{Math.abs(selectedAirInfo.angle).toFixed(0)}°</strong>
                    </div>
                    <div>
                      <span>状态</span>
                      <strong>{selectedAirInfo.stable ? '趋于稳定' : '调整中'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {requiredSixTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {requiredSixExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-block">
              <h2>🧪 真实热力环流数据对比探究</h2>
              <p className="muted">对比模拟数据与真实气象观测数据，验证你对热力环流规律的理解。</p>
              <div className="circulation-real-data">
                <div className="real-data-table">
                  <h4>真实观测案例：海陆风环流（青岛观测站）</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>时段</th>
                        <th>海风强度</th>
                        <th>陆风强度</th>
                        <th>温差驱动</th>
                        <th>环流高度</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>06:00</td>
                        <td>1.2 m/s</td>
                        <td>3.5 m/s</td>
                        <td>海温&gt;陆温 2.8℃</td>
                        <td>400-600m</td>
                      </tr>
                      <tr>
                        <td>12:00</td>
                        <td>4.8 m/s</td>
                        <td>0.3 m/s</td>
                        <td>陆温&gt;海温 4.2℃</td>
                        <td>800-1200m</td>
                      </tr>
                      <tr>
                        <td>18:00</td>
                        <td>3.2 m/s</td>
                        <td>0.8 m/s</td>
                        <td>陆温&gt;海温 1.5℃</td>
                        <td>500-800m</td>
                      </tr>
                      <tr>
                        <td>24:00</td>
                        <td>0.5 m/s</td>
                        <td>2.8 m/s</td>
                        <td>海温&gt;陆温 3.1℃</td>
                        <td>300-500m</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="real-data-analysis">
                    <h4>数据对比分析</h4>
                    <div className="analysis-item">
                      <strong>海陆风日变化规律</strong>
                      <p>实测：海风最强12-14时，陆风最强04-06时</p>
                      <p>你的模拟：当前温差驱动强度 {pressureGradient} 级</p>
                      <em>规律：环流强度与海陆温差成正比</em>
                    </div>
                    <div className="analysis-item highlight">
                      <strong>城市热岛环流（北京夏季观测）</strong>
                      <p>实测：城区温度比郊区高 2-4℃</p>
                      <p>环流特征：夜间热岛效应更强，可达 5-6℃</p>
                      <em>原因：城市下垫面蓄热能力强，夜晚散热慢</em>
                    </div>
                    <div className="analysis-item">
                      <strong>山谷风环流（祁连山观测）</strong>
                      <p>实测：谷风上午10时开始，山风夜间22时开始</p>
                      <p>环流高度：谷风可达 1500-2000m</p>
                      <em>规律：山坡受热不均触发垂直环流</em>
                    </div>
                  </div>
                </div>
              </div>
              <div className="seismic-evidence">
                <h4>🔍 热力环流观测方法</h4>
                <div className="evidence-chain">
                  <div className="evidence-step">
                    <span>1</span>
                    <div>
                      <strong>自动气象站</strong>
                      <p>连续监测温压湿风</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>2</span>
                    <div>
                      <strong>系留气球</strong>
                      <p>探测垂直温度廓线</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>3</span>
                    <div>
                      <strong>激光雷达</strong>
                      <p>遥感大气边界层结构</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>4</span>
                    <div>
                      <strong>数值模拟</strong>
                      <p>WRF模式重现环流过程</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="compare-tip">
                <strong>科学验证：</strong>
                <p>真实气象观测表明，海陆风环流的强度与海陆温差呈正相关。当温差超过3℃时，环流开始明显；温差达到5℃以上时，可形成稳定的局地环流系统。</p>
              </div>
            </div>
          </section>

          <section className="panel canvas atmosphere-canvas">
            <RequiredSixScene
              scenario={scenario}
              energyState={energyState}
              hotSpot={hotSpot}
              coldSpot={coldSpot}
              hemisphere={hemisphere}
              pressureGradient={pressureGradient}
              roughness={roughness}
              selectedAirMass={selectedAirMass}
              windProgress={windProgress}
              windTargetAngle={windTargetAngle}
              onSelectAirMass={() => setSelectedAirMass('air-1')}
            />
            <div className="canvas-overlay">
              <div className="overlay-meta">
                <span>{scenario.label}</span>
                <span>{scenario.isDay ? '白天' : '夜晚'}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function RequiredSixScene({
  scenario,
  energyState,
  hotSpot,
  coldSpot,
  hemisphere,
  pressureGradient,
  roughness,
  selectedAirMass,
  windProgress,
  windTargetAngle,
  onSelectAirMass,
}) {
  return (
    <div className="energy-scene">
      {/* 大气能量收支区域 */}
      <div className="energy-budget-section">
        <div className="section-header">
          <h3>🌞 大气能量收支平衡</h3>
          <p className="section-desc">太阳辐射 → 地面吸收 → 大气逆辐射</p>
        </div>
        
        {/* 太阳辐射层 */}
        <div className={`energy-sky ${scenario.isDay ? 'day' : 'night'}`}>
          <div className="sun-container">
            <div className="sun" />
            <span className="sun-label">太阳</span>
          </div>
          {scenario.cloud && <div className="cloud" />}
          {scenario.cloud && <div className="cloud small" />}
          
          {/* 太阳短波辐射箭头 */}
          <div className="radiation-arrow solar">
            <div className="arrow-line" />
            <div className="arrow-head down" />
            <span className="arrow-label">太阳短波辐射 (约100%)</span>
          </div>
        </div>
        
        {/* 大气作用层 */}
        <div className="atmosphere-layer">
          <div className="atmosphere-label">大气层</div>
          
          {/* 云层反射 */}
          {energyState.cloud && (
            <div className="radiation-arrow reflect">
              <div className="arrow-line" />
              <div className="arrow-head up" />
              <span className="arrow-label">云层反射 (约20%)</span>
            </div>
          )}
          
          {/* 臭氧吸收 */}
          {energyState.ozone && (
            <div className="radiation-arrow ozone">
              <div className="absorption-indicator" />
              <span className="arrow-label">臭氧吸收 (约3%)</span>
            </div>
          )}
          
          {/* 大气逆辐射 */}
          {energyState.co2 && (
            <div className="radiation-arrow back">
              <div className="arrow-line" />
              <div className="arrow-head down" />
              <span className="arrow-label">大气逆辐射 (温室效应)</span>
            </div>
          )}
        </div>
        
        {/* 地面层 */}
        <div className="energy-ground">
          <div className="ground-label">地面</div>
          <div className="hot-area" style={{ left: `${hotSpot.x}%` }} />
          <div className="cold-area" style={{ left: `${coldSpot.x}%` }} />
          <div className="hot-label" style={{ left: `${hotSpot.x}%` }}>热源</div>
          <div className="cold-label" style={{ left: `${coldSpot.x}%` }}>冷源</div>
          
          {/* 地面长波辐射 */}
          <div className="radiation-arrow ground-up">
            <div className="arrow-line" />
            <div className="arrow-head up" />
            <span className="arrow-label">地面长波辐射 (约50%)</span>
          </div>
        </div>
        
        {/* 能量收支平衡表 */}
        <div className="energy-budget-table">
          <h4>能量收支平衡</h4>
          <div className="budget-row">
            <span className="budget-label">收入：</span>
            <span className="budget-value">太阳辐射 100%</span>
          </div>
          <div className="budget-row">
            <span className="budget-label">支出：</span>
            <span className="budget-value">反射20% + 吸收50% + 透射30%</span>
          </div>
          <div className="budget-row balance">
            <span className="budget-label">净收支：</span>
            <span className="budget-value">≈ 0（平衡状态）</span>
          </div>
        </div>
        
        {/* 能量箭头图例 */}
        <div className="energy-legend">
          <div className="legend-item">
            <span className="legend-color solar" />
            <span>太阳短波辐射</span>
          </div>
          <div className="legend-item">
            <span className="legend-color reflect" />
            <span>云层反射</span>
          </div>
          <div className="legend-item">
            <span className="legend-color ozone" />
            <span>臭氧吸收</span>
          </div>
          <div className="legend-item">
            <span className="legend-color ground" />
            <span>地面长波辐射</span>
          </div>
          <div className="legend-item">
            <span className="legend-color back" />
            <span>大气逆辐射</span>
          </div>
        </div>
      </div>
      
      {/* 热力环流区域 */}
      <div className="circulation-section">
        <div className="section-header">
          <h3>🌀 热力环流形成机制</h3>
          <p className="section-desc">热上升 → 冷下沉 → 水平气流</p>
        </div>
        
        <div className="circulation-container">
          {/* 热源和冷源 */}
          <div className="circulation-ground">
            <div className="ground-source hot" style={{ left: `${hotSpot.x}%` }}>
              <div className="source-icon">🔥</div>
              <span className="source-label">热源</span>
            </div>
            <div className="ground-source cold" style={{ left: `${coldSpot.x}%` }}>
              <div className="source-icon">❄️</div>
              <span className="source-label">冷源</span>
            </div>
          </div>
          
          {/* 环流箭头 */}
          <div className="circulation-loop">
            {/* 上升气流 */}
            <div className="loop-arrow up" style={{ left: `${hotSpot.x}%` }}>
              <div className="loop-line animate-up" />
              <div className="loop-particles">
                <div className="particle" />
                <div className="particle" />
                <div className="particle" />
              </div>
              <span className="loop-label">热空气上升</span>
            </div>
            
            {/* 下沉气流 */}
            <div className="loop-arrow down" style={{ left: `${coldSpot.x}%` }}>
              <div className="loop-line animate-down" />
              <div className="loop-particles">
                <div className="particle" />
                <div className="particle" />
                <div className="particle" />
              </div>
              <span className="loop-label">冷空气下沉</span>
            </div>
            
            {/* 高空水平气流 */}
            <div className="loop-arrow horizontal top">
              <div className="loop-line animate-right" />
              <span className="loop-label">高空风</span>
            </div>
            
            {/* 地面水平气流 */}
            <div className="loop-arrow horizontal bottom">
              <div className="loop-line animate-left" />
              <span className="loop-label">地面风</span>
            </div>
          </div>
          
          {/* 气压标识 */}
          <div className="pressure-indicator" style={{ left: `${hotSpot.x}%` }}>
            <div className="pressure-icon">⬇️</div>
            <span className="pressure-label">低压</span>
            <span className="pressure-desc">空气上升形成</span>
          </div>
          <div className="pressure-indicator high" style={{ left: `${coldSpot.x}%` }}>
            <div className="pressure-icon">⬆️</div>
            <span className="pressure-label">高压</span>
            <span className="pressure-desc">空气下沉形成</span>
          </div>
          
          {/* 等压线示意 */}
          <div className="isobar-lines">
            <div className="isobar" />
            <div className="isobar" />
            <div className="isobar" />
          </div>
        </div>
        
        {/* 图例 */}
        <div className="circulation-legend">
          <div className="legend-item">
            <span className="legend-arrow up" />
            <span>上升气流</span>
          </div>
          <div className="legend-item">
            <span className="legend-arrow down" />
            <span>下沉气流</span>
          </div>
          <div className="legend-item">
            <span className="legend-circle low" />
            <span>低压区</span>
          </div>
          <div className="legend-item">
            <span className="legend-circle high" />
            <span>高压区</span>
          </div>
        </div>
      </div>
      
      {/* 风向受力分析区域 */}
      <div className="wind-analysis-section">
        <div className="section-header">
          <h3>💨 风向受力分析</h3>
          <p className="section-desc">气压梯度力 → 科里奥利力 → 摩擦力</p>
        </div>
        
        <div className="wind-layer">
          <div
            className={`air-mass-node ${selectedAirMass ? 'active' : ''}`}
            style={{ left: '50%', top: '50%' }}
            onClick={onSelectAirMass}
          >
            气团 A
          </div>
          
          {/* 气压梯度力（垂直于等压线，从高压指向低压） */}
          <div className="wind-force gradient" style={{ transform: `rotate(${windTargetAngle}deg)` }}>
            <div className="force-line" />
            <div className="force-arrow" />
            <span className="force-label">气压梯度力</span>
          </div>
          
          {/* 科里奥利力（垂直于风向，北半球向右偏） */}
          <div className={`wind-force coriolis ${hemisphere === 'north' ? 'north' : 'south'}`} 
               style={{ transform: `rotate(${windTargetAngle + (hemisphere === 'north' ? 90 : -90)}deg)` }}>
            <div className="force-line" />
            <div className="force-arrow" />
            <span className="force-label">科里奥利力</span>
          </div>
          
          {/* 摩擦力（与风向相反） */}
          <div className="wind-force friction" 
               style={{ transform: `rotate(${windTargetAngle + 180}deg)`, opacity: roughness / 4 }}>
            <div className="force-line" />
            <div className="force-arrow" />
            <span className="force-label">摩擦力</span>
          </div>
          
          {/* 实际风向 */}
          <div className="wind-result" style={{ transform: `rotate(${windTargetAngle * windProgress}deg)` }}>
            <div className="result-arrow" />
            <span className="result-label">实际风向</span>
          </div>
          
          {/* 风速和进度 */}
          <div className="wind-info">
            <div className="wind-speed">风速：{Math.max(1, pressureGradient - roughness).toFixed(1)} m/s</div>
            <div className="wind-progress">稳定进度：{Math.round(windProgress * 100)}%</div>
            <div className="hemisphere-info">半球：{hemisphere === 'north' ? '北半球' : '南半球'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RequiredFiveScene({ altitude, currentLayer }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a1628')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50)
    camera.position.set(0, 1.6, 4.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 2.8
    controls.maxDistance = 8.5

    const ambientLight = new THREE.AmbientLight(0xcfe0f0, 0.45)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.75)
    keyLight.position.set(4, 5, 3)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x9fc5e8, 0.3)
    fillLight.position.set(-3, 2, -4)
    scene.add(fillLight)

    const starField = new THREE.Group()
    for (let i = 0; i < 100; i++) {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.005 + Math.random() * 0.01, 8, 8),
        new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.3 + Math.random() * 0.7
        })
      )
      star.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 10
      )
      starField.add(star)
    }
    scene.add(starField)

    const layerGroup = new THREE.Group()
    scene.add(layerGroup)

    const totalHeight = 3.4
    let cumulativeHeight = 0
    const layerMeshes = atmosphereLayers.map((layer) => {
      const height = (layer.height / 500) * totalHeight
      const geometry = new THREE.BoxGeometry(2.0, height, 1.4)
      const material = new THREE.MeshStandardMaterial({
        color: layer.color,
        transparent: true,
        opacity: 0.45,
        roughness: 0.8,
        metalness: 0.05,
        side: THREE.DoubleSide,
      })
      const mesh = new THREE.Mesh(geometry, material)
      const y = -totalHeight / 2 + height / 2 + cumulativeHeight
      cumulativeHeight += height
      mesh.position.y = y
      layerGroup.add(mesh)
      return mesh
    })

    const balloon = new THREE.Group()
    
    const balloonBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 32, 32),
      new THREE.MeshStandardMaterial({ 
        color: 0x4a6f7a, 
        roughness: 0.3,
        metalness: 0.1
      })
    )
    balloon.add(balloonBody)

    const balloonCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.12, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0x3d4849, 
        roughness: 0.5
      })
    )
    balloonCone.position.y = -0.15
    balloon.add(balloonCone)

    const basket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.06, 0.1, 16),
      new THREE.MeshStandardMaterial({ 
        color: 0x8b4513, 
        roughness: 0.7
      })
    )
    basket.position.y = -0.22
    balloon.add(basket)

    balloon.position.set(0, -totalHeight / 2, 0.6)
    scene.add(balloon)

    sceneRef.current = { scene, camera, renderer, controls, layerMeshes, balloon }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resize()
    window.addEventListener('resize', resize)
    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)

    let frameId
    const animate = () => {
      balloon.rotation.y += 0.01
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    const { layerMeshes, balloon } = sceneRef.current
    const totalHeight = 3.2
    const heightRatio = Math.min(altitude / 120, 1)
    balloon.position.y = -totalHeight / 2 + heightRatio * totalHeight

    layerMeshes.forEach((mesh, index) => {
      mesh.material.opacity = atmosphereLayers[index].id === currentLayer.id ? 0.85 : 0.45
    })
  }, [altitude, currentLayer])

  return <div ref={containerRef} className="three-container" aria-label="大气垂直分层仿真" />
}

function RequiredFour() {
  const [layerIndex, setLayerIndex] = useState(0)
  const [quakeActive, setQuakeActive] = useState(false)
  const [waveStep, setWaveStep] = useState(0)
  const [activeFlow, setActiveFlow] = useState(interactionFlows[0].id)

  const currentLayer = earthLayerCards[layerIndex]
  const maxWaveIndex = seismicWaveProfile.length - 1
  const waveProgress = Math.min(waveStep, maxWaveIndex)
  const activeFlowItem = interactionFlows.find((flow) => flow.id === activeFlow) ?? interactionFlows[0]

  useEffect(() => {
    if (!quakeActive) return undefined
    setWaveStep(0)
    const timer = setInterval(() => {
      setWaveStep((prev) => {
        if (prev >= maxWaveIndex) {
          return maxWaveIndex
        }
        return prev + 1
      })
    }, 700)
    return () => clearInterval(timer)
  }, [quakeActive, maxWaveIndex])

  const handleTriggerQuake = () => {
    setQuakeActive(true)
  }

  const handleResetQuake = () => {
    setQuakeActive(false)
    setWaveStep(0)
  }

  return (
    <div className="page">

      <main className="container exp-wrap exp-full">
        <div className="exp-top">
          <div>
            <h1>模块四：地球内部圈层结构与地震波证据链</h1>
            <p className="muted">对应教材：必修 1 第一章《宇宙中的地球》第 4 节</p>
          </div>
          <div className="exp-actions">
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>
                地球内部不可直接观测，圈层界面与软流层位置抽象难记。本实验用“地震波证据链 +
                圈层剥离”帮助学生从现象推理结论，构建清晰的圈层结构认知。
              </p>
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
              <h2>地震波 CT 扫描</h2>
              <p className="muted">点击按钮发射地震波，观察 P/S 波速度随深度变化。</p>
              <div className="control-group">
                <div className="drill-actions">
                  <button type="button" className="btn" onClick={handleTriggerQuake}>
                    发射地震波
                  </button>
                  <button type="button" className="btn ghost" onClick={handleResetQuake}>
                    重置波形
                  </button>
                </div>
              </div>
              <div className="wave-table">
                {seismicWaveProfile.map((item, index) => {
                  const active = index <= waveProgress
                  const maxP = 14
                  const maxS = 7
                  return (
                    <div key={item.depth} className={`wave-row ${active ? 'active' : ''}`}>
                      <div className="wave-depth">
                        <span>{item.depth}</span>
                        {item.mark && <em>{item.mark}</em>}
                      </div>
                      <div className="wave-bars">
                        <div className="wave-bar">
                          <span>P 波</span>
                          <div className="bar-track">
                            <div className="bar-fill p" style={{ width: `${(item.p / maxP) * 100}%` }} />
                          </div>
                          <strong>{item.p}</strong>
                        </div>
                        <div className="wave-bar">
                          <span>S 波</span>
                          <div className="bar-track">
                            <div className="bar-fill s" style={{ width: `${(item.s / maxS) * 100}%` }} />
                          </div>
                          <strong>{item.s === 0 ? '消失' : item.s}</strong>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="panel-block">
              <h2>阴影区演示</h2>
              <p className="muted">S 波在 2900 km 消失 → 外核为液态，这是推断证据链的关键环节。</p>
              <ul className="legend">
                {shadowZones.map((zone) => (
                  <li key={zone.id}>
                    <span className={`legend-dot ${zone.id === 's' ? 'legend-dot--alert' : ''}`} />
                    <span>{zone.label}</span>
                    <strong>{zone.range}</strong>
                  </li>
                ))}
              </ul>
              <p className="data-note">提示：S 波不能在液体中传播，因此 S 波阴影区指向“外核为液态”。</p>
            </div>

            <div className="panel-block">
              <h2>圈层剥洋葱</h2>
              <p className="muted">拖动滑块逐层剥离地球，观察厚度、成分与物理状态。</p>
              <div className="control-group">
                <label>
                  当前圈层：<span>{currentLayer.name}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={earthLayerCards.length - 1}
                  step={1}
                  value={layerIndex}
                  onChange={(event) => setLayerIndex(parseInt(event.target.value, 10))}
                />
                <div className="pill-row">
                  {earthLayerCards.map((layer, index) => (
                    <button
                      key={layer.id}
                      type="button"
                      className={`pill ${index === layerIndex ? 'active' : ''}`}
                      onClick={() => setLayerIndex(index)}
                    >
                      {layer.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="layer-card">
                <div className="layer-meta">
                  <span>{currentLayer.depth}</span>
                  <strong>{currentLayer.state}</strong>
                </div>
                <h3>{currentLayer.material}</h3>
                <p>{currentLayer.highlight}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>圈层相互作用模拟</h2>
              <p className="muted">选择事件观察物质与能量流动方向。</p>
              <div className="pill-row">
                {interactionFlows.map((flow) => (
                  <button
                    key={flow.id}
                    type="button"
                    className={`pill ${activeFlow === flow.id ? 'active' : ''}`}
                    onClick={() => setActiveFlow(flow.id)}
                  >
                    {flow.title}
                  </button>
                ))}
              </div>
              <div className="flow-card">
                <strong>{activeFlowItem.title}</strong>
                <p>{activeFlowItem.detail}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>🧪 真实地震波数据对比探究</h2>
              <p className="muted">对比模拟数据与真实地震波记录，验证你对地球内部结构的推断。</p>
              <div className="seismic-compare">
                <div className="seismic-depth-chart">
                  <h4>地震波速度-深度曲线</h4>
                  <div className="depth-axis">
                    <span>0 km</span>
                    <span>35 km</span>
                    <span>2900 km</span>
                    <span>5150 km</span>
                    <span>6371 km</span>
                  </div>
                  <div className="velocity-curve">
                    <svg viewBox="0 0 300 180" className="wave-svg">
                      <defs>
                        <linearGradient id="pWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#2563eb" />
                          <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                        <linearGradient id="sWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                      </defs>
                      <path d="M 20 10 L 20 30 Q 25 50 40 65 L 60 80 Q 100 95 130 130 L 150 150 Q 180 160 200 165 L 280 170" className="p-wave-path" />
                      <path d="M 20 20 L 20 35 Q 30 55 45 70 L 70 90 Q 110 100 145 0 L 145 180" className="s-wave-path" />
                      <line x1="20" y1="90" x2="280" y2="90" className="moho-line" />
                      <line x1="20" y1="130" x2="280" y2="130" className="gutenberg-line" />
                      <line x1="20" y1="155" x2="280" y2="155" className="cmb-line" />
                      <text x="25" y="85">莫霍面</text>
                      <text x="25" y="125">古登堡面</text>
                      <text x="25" y="150">核幔边界</text>
                      <g className="wave-legend">
                        <line x1="220" y1="15" x2="250" y2="15" className="p-wave-path" />
                        <text x="255" y="18">P波</text>
                        <line x1="220" y1="35" x2="250" y2="35" className="s-wave-path" />
                        <text x="255" y="38">S波</text>
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="seismic-interpretation">
                  <h4>数据解读</h4>
                  <div className="interpretation-item">
                    <strong>0-35 km（地壳）</strong>
                    <p>P波：6-8 km/s → 8 km/s（递增）</p>
                    <p>S波：3.5-4.5 km/s → 4.5 km/s（递增）</p>
                    <em>岩石固态，速度随深度递增</em>
                  </div>
                  <div className="interpretation-item highlight">
                    <strong>35-2900 km（地幔）</strong>
                    <p>P波：8 km/s → 13 km/s（递增）</p>
                    <p>S波：4.5 km/s → 7 km/s（递增）</p>
                    <em>固态岩石，速度持续增加</em>
                  </div>
                  <div className="interpretation-item critical">
                    <strong>2900-5150 km（外核）</strong>
                    <p>P波：13 km/s → 8 km/s（骤降）</p>
                    <p>S波：7 km/s → 0 km/s（消失！）</p>
                    <em className="alert">液态铁镁混合物，S波无法通过</em>
                  </div>
                  <div className="interpretation-item">
                    <strong>5150-6371 km（内核）</strong>
                    <p>P波：8 km/s → 11 km/s（恢复）</p>
                    <p>S波：0 km/s → 3.5 km/s（出现）</p>
                    <em>固态铁合金，内外核状态不同</em>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                {requiredFourTasks.map((task) => (
                  <li key={task.id}>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                  </li>
                ))}
              </ul>
              <div className="seismic-evidence">
                <h4>🔍 科学探究任务</h4>
                <div className="evidence-chain">
                  <div className="evidence-step">
                    <span>1</span>
                    <div>
                      <strong>观察现象</strong>
                      <p>S波在2900km深度突然消失</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>2</span>
                    <div>
                      <strong>提出假设</strong>
                      <p>外核可能为液态或软流态</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>3</span>
                    <div>
                      <strong>验证证据</strong>
                      <p>P波减速佐证液态外核</p>
                    </div>
                  </div>
                  <div className="evidence-arrow">→</div>
                  <div className="evidence-step">
                    <span>4</span>
                    <div>
                      <strong>得出结论</strong>
                      <p>地球外核为液态，内核为固态</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="compare-tip">
                <strong>科学家视角：</strong>
                <p>地震波是科学家探测地球内部结构的唯一直接手段。通过分析全球数千个地震台的记录，地球物理学家能够构建出精确的地球内部模型。这就是为什么地震学被称为"给地球做CT"。</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>真题诊断</h2>
              <div className="exam-list">
                {requiredFourExamItems.map((exam) => (
                  <div key={exam.id} className="exam-card">
                    <h3>{exam.source}</h3>
                    <p className="muted">{exam.stem}</p>
                    <div className="exam-questions">
                      {exam.questions.map((question) => (
                        <div key={question.id} className="exam-question">
                          <p className="quiz-stem">{question.stem}</p>
                          <ul>
                            {question.options.map((option) => (
                              <li key={option}>{option}</li>
                            ))}
                          </ul>
                          <p className="quiz-answer">答案：{question.answer}</p>
                          <p className="quiz-explain">{question.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel canvas earth-layer-canvas">
            <div className="earth-cross-section">
              <div className="section-header">
                <h3>地球内部圈层剖面图</h3>
                <span className="section-subtitle">半径：6371 km</span>
              </div>
              <div className="cross-visual">
                <svg viewBox="0 0 400 400" className="earth-svg">
                  <defs>
                    {earthLayerCards.map((layer) => (
                      <radialGradient key={layer.id} id={`gradient-${layer.id}`} cx="30%" cy="30%">
                        <stop offset="0%" stopColor={`#${(layer.color + 0x222222).toString(16).slice(0, 7)}`} />
                        <stop offset="100%" stopColor={`#${layer.color.toString(16).padStart(6, '0')}`} />
                      </radialGradient>
                    ))}
                  </defs>
                  {earthLayerCards.map((layer) => {
                    const r = (layer.radius / 2.3) * 180
                    return (
                      <circle
                        key={layer.id}
                        cx="200"
                        cy="200"
                        r={r}
                        fill={`url(#gradient-${layer.id})`}
                        stroke={currentLayer.id === layer.id ? '#2563eb' : 'none'}
                        strokeWidth={currentLayer.id === layer.id ? 3 : 0}
                        opacity={currentLayer.id === layer.id ? 0.9 : 0.6}
                        className={currentLayer.id === layer.id ? 'active-layer' : ''}
                      />
                    )
                  })}
                  <line x1="200" y1="20" x2="200" y2="380" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="20" y1="200" x2="380" y2="200" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                  {earthLayerCards.map((layer) => {
                    const r = (layer.radius / 2.3) * 180
                    return (
                      <text
                        key={`label-${layer.id}`}
                        x="200"
                        y={200 - r - 10}
                        textAnchor="middle"
                        className="layer-text"
                        fill={currentLayer.id === layer.id ? '#1e40af' : '#475569'}
                      >
                        {layer.name}
                      </text>
                    )
                  })}
                  {quakeActive && (
                    <g className="seismic-waves">
                      {seismicWaveProfile.slice(0, waveProgress + 1).map((wave, idx) => {
                        const r = 40 + idx * 30
                        return (
                          <circle
                            key={idx}
                            cx="200"
                            cy="200"
                            r={r}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            opacity={0.8 - idx * 0.1}
                          />
                        )
                      })}
                    </g>
                  )}
                </svg>
                <div className="layer-info-panel">
                  <h4>当前圈层：{currentLayer.name}</h4>
                  <div className="info-row">
                    <span className="info-label">深度范围：</span>
                    <span className="info-value">{currentLayer.depth}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">物质组成：</span>
                    <span className="info-value">{currentLayer.material}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">状态：</span>
                    <span className="info-value">{currentLayer.state}</span>
                  </div>
                  <div className="info-row highlight">
                    <span className="info-label">特征：</span>
                    <span className="info-value">{currentLayer.highlight}</span>
                  </div>
                </div>
              </div>
              <div className="wave-legend">
                <div className="legend-item">
                  <span className="legend-line p-wave" />
                  <span>P波（纵波）</span>
                </div>
                <div className="legend-item">
                  <span className="legend-line s-wave" />
                  <span>S波（横波）</span>
                </div>
              </div>
            </div>
            <div className="canvas-overlay">
              <div className="overlay-meta">
                <span>{currentLayer.name}</span>
                <span>{currentLayer.depth}</span>
              </div>
            </div>
          </section>
        </div>


      </main>
    </div>
  )
}

function RequiredFourScene({ layerIndex, quakeActive, currentLayer }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const quakeActiveRef = useRef(quakeActive)
  quakeActiveRef.current = quakeActive

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#1a2735')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 1.6, 4.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 2.5
    controls.maxDistance = 8.5
    controls.maxPolarAngle = Math.PI / 2.05

    const ambientLight = new THREE.AmbientLight(0xcfe0f0, 0.5)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8)
    keyLight.position.set(4, 5, 3)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0x9fc5e8, 0.35)
    fillLight.position.set(-3, 2, -4)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x6ba3d9, 0.3)
    rimLight.position.set(0, -3, 2)
    scene.add(rimLight)

    const layerGroup = new THREE.Group()
    scene.add(layerGroup)

    const layerMeshes = earthLayerCards.map((layer) => {
      const opacity = 0.35
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(layer.radius, 64, 64),
        new THREE.MeshStandardMaterial({
          color: layer.color,
          transparent: true,
          opacity: opacity,
          roughness: 0.55,
          metalness: 0.1,
          side: THREE.DoubleSide,
        })
      )
      layerGroup.add(mesh)
      return mesh
    })

    const makeLabel = (text, color) => {
      const canvas = document.createElement('canvas')
      canvas.width = 320
      canvas.height = 120
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.8)'
      ctx.lineWidth = 4
      ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12)
      ctx.fillStyle = color
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const sprite = new THREE.Sprite(material)
      sprite.scale.set(1.2, 0.45, 1)
      return sprite
    }

    const boundaryGroup = new THREE.Group()
    scene.add(boundaryGroup)

    const addBoundaryRing = (radius, color) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.015, 12, 120),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 })
      )
      ring.rotation.x = Math.PI / 2
      boundaryGroup.add(ring)
      return ring
    }

    const mohoRing = addBoundaryRing(1.72, 0x60a5fa)
    const gutenbergRing = addBoundaryRing(1.25, 0xf97316)
    const lithosphereRing = addBoundaryRing(1.6, 0x22c55e)
    const asthenoRing = addBoundaryRing(1.48, 0xfbbf24)

    const mohoLabel = makeLabel('莫霍面', '#e2e8f0')
    const gutenbergLabel = makeLabel('古登堡面', '#fde68a')
    const lithLabel = makeLabel('岩石圈', '#bbf7d0')
    const asthLabel = makeLabel('软流层', '#fde68a')

    if (mohoLabel) {
      mohoLabel.position.set(2.2, 0.4, 0)
      boundaryGroup.add(mohoLabel)
    }
    if (gutenbergLabel) {
      gutenbergLabel.position.set(1.85, -0.5, 0)
      boundaryGroup.add(gutenbergLabel)
    }
    if (lithLabel) {
      lithLabel.position.set(-2.1, 0.65, 0)
      boundaryGroup.add(lithLabel)
    }
    if (asthLabel) {
      asthLabel.position.set(-2.0, -0.2, 0)
      boundaryGroup.add(asthLabel)
    }

    const waveGroup = new THREE.Group()
    scene.add(waveGroup)

    const pWaveLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.9 })
    )
    const sWaveLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.9 })
    )

    const pInnerLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.8 })
    )
    const sInnerLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.8 })
    )

    waveGroup.add(pWaveLine)
    waveGroup.add(sWaveLine)
    waveGroup.add(pInnerLine)
    waveGroup.add(sInnerLine)

    const waveRing = new THREE.Mesh(
      new THREE.RingGeometry(1.8, 1.95, 64),
      new THREE.MeshBasicMaterial({
        color: 0x2563eb,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
      })
    )
    waveRing.rotation.x = Math.PI / 2
    scene.add(waveRing)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      layerGroup,
      layerMeshes,
      waveRing,
      ringScale: 1,
      waveProgress: 0,
      waveGroup,
      pWaveLine,
      sWaveLine,
      pInnerLine,
      sInnerLine,
      boundaryGroup,
      rings: [mohoRing, gutenbergRing, lithosphereRing, asthenoRing],
      labels: [mohoLabel, gutenbergLabel, lithLabel, asthLabel].filter(Boolean),
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resize()
    window.addEventListener('resize', resize)
    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)

    const createArcPoints = (radius, angle) => {
      const points = []
      const segments = 90
      for (let i = 0; i <= segments; i += 1) {
        const theta = (i / segments) * angle
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius))
      }
      return points
    }

    const createInnerCurve = (targetRadius, progress) => {
      const start = new THREE.Vector3(1.75, 0.15, 0)
      const end = new THREE.Vector3(-targetRadius * progress, -0.25, 0)
      const mid = new THREE.Vector3(0, 0.3, 0.6)
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      return curve.getPoints(50)
    }

    const syncBoundaryOpacity = (depthIndex) => {
      const highlightIndex = Math.max(0, Math.min(depthIndex, earthLayerCards.length - 1))
      const targetRadius = earthLayerCards[highlightIndex]?.radius ?? 1.5
      if (!sceneRef.current) return
      sceneRef.current.rings.forEach((ring) => {
        const isNear = Math.abs(ring.geometry.parameters.radius - targetRadius) < 0.2
        ring.material.opacity = isNear ? 1 : 0.35
      })
      sceneRef.current.labels.forEach((label) => {
        label.material.opacity = 0.35
      })
      if (sceneRef.current.labels[0] && highlightIndex >= 3) sceneRef.current.labels[0].material.opacity = 1
      if (sceneRef.current.labels[1] && highlightIndex >= 4) sceneRef.current.labels[1].material.opacity = 1
      if (sceneRef.current.labels[2] && highlightIndex >= 3) sceneRef.current.labels[2].material.opacity = 1
      if (sceneRef.current.labels[3] && highlightIndex >= 4) sceneRef.current.labels[3].material.opacity = 1
    }

    syncBoundaryOpacity(0)

    let frameId
    const animate = () => {
      layerGroup.rotation.y += 0.002
      if (sceneRef.current) {
        const ref = sceneRef.current
        if (quakeActiveRef.current) {
          ref.ringScale += 0.01
          if (ref.ringScale > 1.4) {
            ref.ringScale = 1
          }
          ref.waveRing.scale.setScalar(ref.ringScale)
          ref.waveRing.material.opacity = 0.35
          ref.waveProgress = (ref.waveProgress + 0.012) % 1

          const pAngle = Math.PI * 1.6 * ref.waveProgress
          const sAngle = Math.PI * 1.05 * ref.waveProgress

          ref.pWaveLine.geometry.setFromPoints(createArcPoints(1.78, pAngle))
          ref.sWaveLine.geometry.setFromPoints(createArcPoints(1.76, sAngle))
          ref.pInnerLine.geometry.setFromPoints(createInnerCurve(0.48, ref.waveProgress))
          ref.sInnerLine.geometry.setFromPoints(createInnerCurve(1.25, Math.min(ref.waveProgress, 0.75)))
        } else {
          ref.waveRing.material.opacity = 0
          ref.pWaveLine.geometry.setFromPoints([])
          ref.sWaveLine.geometry.setFromPoints([])
          ref.pInnerLine.geometry.setFromPoints([])
          ref.sInnerLine.geometry.setFromPoints([])
        }
      }
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.layerMeshes.forEach((mesh, index) => {
      const isCurrent = index === layerIndex
      const isVisible = index >= layerIndex
      mesh.material.opacity = isCurrent ? 0.95 : isVisible ? 0.45 : 0.08
      mesh.material.emissive = new THREE.Color(isCurrent ? currentLayer.color : '#000000')
      mesh.material.emissiveIntensity = isCurrent ? 0.35 : 0
    })
    sceneRef.current.rings.forEach((ring) => {
      const isNear = Math.abs(ring.geometry.parameters.radius - currentLayer.radius) < 0.2
      ring.material.opacity = isNear ? 1 : 0.35
    })
    sceneRef.current.labels.forEach((label) => {
      label.material.opacity = 0.35
    })
    if (sceneRef.current.labels[0] && layerIndex >= 3) sceneRef.current.labels[0].material.opacity = 1
    if (sceneRef.current.labels[1] && layerIndex >= 4) sceneRef.current.labels[1].material.opacity = 1
    if (sceneRef.current.labels[2] && layerIndex >= 3) sceneRef.current.labels[2].material.opacity = 1
    if (sceneRef.current.labels[3] && layerIndex >= 4) sceneRef.current.labels[3].material.opacity = 1
  }, [layerIndex, currentLayer])

  useEffect(() => {
    if (!sceneRef.current) return
    sceneRef.current.waveRing.material.opacity = quakeActive ? 0.35 : 0
    if (!quakeActive) {
      sceneRef.current.waveRing.scale.setScalar(1)
      sceneRef.current.ringScale = 1
      sceneRef.current.waveProgress = 0
    }
  }, [quakeActive])

  return <div ref={containerRef} className="three-container" aria-label="地球圈层透视仿真" />
}




function GlobeScene({ latitude, longitude, hour, dayIndex, flightPath = null }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const propsRef = useRef({ latitude, longitude, hour, dayIndex })
  propsRef.current = { latitude, longitude, hour, dayIndex }
  const rendererRef = useRef(null)
  const globeRef = useRef(null)
  const observerRef = useRef(null)
  const subsolarRef = useRef(null)
  const twilightRef = useRef(null)
  const twilightLineRef = useRef(null)
  const directionalLightRef = useRef(null)
  const airplaneRef = useRef(null)
  const flightLineRef = useRef(null)
  const axisLabelNRef = useRef(null)
  const axisLabelSRef = useRef(null)
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a1628)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.set(5, 2, 5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.localClippingEnabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)
    directionalLightRef.current = directionalLight

    const globeGeometry = new THREE.SphereGeometry(2, 64, 64)
    const globeTexture = new THREE.TextureLoader().load('/picture/experiments/required/world-map.jpg')
    globeTexture.colorSpace = THREE.SRGBColorSpace
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: globeTexture,
      specular: 0x333333,
      shininess: 5,
      transparent: true,
      opacity: 1,
    })
    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    scene.add(globe)
    globeRef.current = globe

    const createAxis = () => {
      const points = []
      points.push(new THREE.Vector3(0, -2.5, 0))
      points.push(new THREE.Vector3(0, 2.5, 0))
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 3 })
      const axis = new THREE.Line(geometry, material)
      globe.add(axis)

      const northPoleGeometry = new THREE.SphereGeometry(0.08, 16, 16)
      const northPoleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const northPole = new THREE.Mesh(northPoleGeometry, northPoleMaterial)
      northPole.position.set(0, 2.05, 0)
      globe.add(northPole)

      const southPoleGeometry = new THREE.SphereGeometry(0.08, 16, 16)
      const southPoleMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa })
      const southPole = new THREE.Mesh(southPoleGeometry, southPoleMaterial)
      southPole.position.set(0, -2.05, 0)
      globe.add(southPole)

      const createTextSprite = (text, color) => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = color
        ctx.font = 'bold 40px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, canvas.width / 2, canvas.height / 2)
        const texture = new THREE.CanvasTexture(canvas)
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
        const sprite = new THREE.Sprite(spriteMaterial)
        sprite.scale.set(0.2, 0.2, 1)
        return sprite
      }

      const northLabel = createTextSprite('N', '#ffffff')
      northLabel.position.set(0.15, 2.25, 0)
      globe.add(northLabel)
      axisLabelNRef.current = northLabel

      const southLabel = createTextSprite('S', '#aaaaaa')
      southLabel.position.set(0.15, -2.25, 0)
      globe.add(southLabel)
      axisLabelSRef.current = southLabel
    }
    createAxis()

    const createLatitudeLine = (lat) => {
      const points = []
      const radius = 2.01
      const latRad = (lat * Math.PI) / 180
      const y = radius * Math.sin(latRad)
      const r = radius * Math.cos(latRad)
      for (let lon = 0; lon <= 360; lon += 2) {
        const lonRad = (lon * Math.PI) / 180
        points.push(new THREE.Vector3(r * Math.cos(lonRad), y, r * Math.sin(lonRad)))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color: 0x4488ff, opacity: 0.5, transparent: true })
      const line = new THREE.Line(geometry, material)
      globe.add(line)
    }

    const createLongitudeLine = (lon) => {
      const points = []
      const radius = 2.01
      for (let lat = -90; lat <= 90; lat += 2) {
        const latRad = (lat * Math.PI) / 180
        const lonRad = (lon * Math.PI) / 180
        points.push(new THREE.Vector3(
          radius * Math.cos(latRad) * Math.cos(lonRad),
          radius * Math.sin(latRad),
          radius * Math.cos(latRad) * Math.sin(lonRad)
        ))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color: 0x4488ff, opacity: 0.3, transparent: true })
      const line = new THREE.Line(geometry, material)
      globe.add(line)
    }

    for (let lat = -80; lat <= 80; lat += 20) {
      createLatitudeLine(lat)
    }
    for (let lon = 0; lon < 360; lon += 30) {
      createLongitudeLine(lon)
    }

    const createSpecialLongitudeLine = (lon, color, label) => {
      const points = []
      const radius = 2.02
      for (let lat = -90; lat <= 90; lat += 2) {
        const latRad = (lat * Math.PI) / 180
        const lonRad = (lon * Math.PI) / 180
        points.push(new THREE.Vector3(
          radius * Math.cos(latRad) * Math.cos(lonRad),
          radius * Math.sin(latRad),
          radius * Math.cos(latRad) * Math.sin(lonRad)
        ))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color, opacity: 1, transparent: true, linewidth: 3 })
      const line = new THREE.Line(geometry, material)
      globe.add(line)

      const labelPosLat = 10
      const latRad = (labelPosLat * Math.PI) / 180
      const lonRad = (lon * Math.PI) / 180
      const x = radius * Math.cos(latRad) * Math.cos(lonRad)
      const y = radius * Math.sin(latRad)
      const z = radius * Math.cos(latRad) * Math.sin(lonRad)

      const canvas = document.createElement('canvas')
      canvas.width = 128
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.set(x * 1.1, y * 1.1, z * 1.1)
      sprite.scale.set(0.4, 0.1, 1)
      globe.add(sprite)
    }

    createSpecialLongitudeLine(0, 0xff0000, '本初子午线 0°')
    createSpecialLongitudeLine(180, 0xff00ff, '国际日期变更线 180°')

    const specialLines = [
      { lat: 23.44, color: 0xff6600, label: '北回归线' },
      { lat: -23.44, color: 0xff8800, label: '南回归线' },
      { lat: 66.56, color: 0x00ccff, label: '北极圈' },
      { lat: -66.56, color: 0x00aadd, label: '南极圈' },
    ]

    specialLines.forEach(({ lat, color }) => {
      const points = []
      const radius = 2.02
      const latRad = (lat * Math.PI) / 180
      const y = radius * Math.sin(latRad)
      const r = radius * Math.cos(latRad)
      for (let lon = 0; lon <= 360; lon += 2) {
        const lonRad = (lon * Math.PI) / 180
        points.push(new THREE.Vector3(r * Math.cos(lonRad), y, r * Math.sin(lonRad)))
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({ color, opacity: 0.8, transparent: true })
      const line = new THREE.Line(geometry, material)
      globe.add(line)
    })

    const observerGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const observerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    const observer = new THREE.Mesh(observerGeometry, observerMaterial)
    observer.userData = { type: 'observer', name: '观测点' }
    scene.add(observer)
    observerRef.current = observer

    const subsolarGeometry = new THREE.SphereGeometry(0.06, 16, 16)
    const subsolarMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const subsolar = new THREE.Mesh(subsolarGeometry, subsolarMaterial)
    subsolar.userData = { type: 'subsolar', name: '太阳直射点' }
    scene.add(subsolar)
    subsolarRef.current = subsolar

    const cities = [
      { name: '北京', lat: 39.9, lon: 116.4 },
      { name: '纽约', lat: 40.7, lon: -74.0 },
      { name: '伦敦', lat: 51.5, lon: -0.1 },
      { name: '东京', lat: 35.7, lon: 139.7 },
      { name: '悉尼', lat: -33.9, lon: 151.2 },
    ]

    cities.forEach((city) => {
      const phi = (90 - city.lat) * (Math.PI / 180)
      const theta = (city.lon + 180) * (Math.PI / 180)
      const x = 2.03 * Math.sin(phi) * Math.cos(theta)
      const y = 2.03 * Math.cos(phi)
      const z = 2.03 * Math.sin(phi) * Math.sin(theta)

      const cityGeometry = new THREE.SphereGeometry(0.03, 8, 8)
      const cityMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      const cityMarker = new THREE.Mesh(cityGeometry, cityMaterial)
      cityMarker.position.set(x, y, z)
      cityMarker.userData = { type: 'city', name: city.name }
      globe.add(cityMarker)
    })

    const createAirplaneIcon = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.font = '40px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✈️', canvas.width / 2, canvas.height / 2)
      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const airplane = new THREE.Sprite(spriteMaterial)
      airplane.scale.set(0.2, 0.2, 1)
      airplane.visible = false
      globe.add(airplane)
      airplaneRef.current = airplane
    }
    createAirplaneIcon()

    const flightLineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.8, transparent: true })
    const flightLineGeometry = new THREE.BufferGeometry()
    const flightLine = new THREE.Line(flightLineGeometry, flightLineMaterial)
    flightLine.visible = false
    globe.add(flightLine)
    flightLineRef.current = flightLine

    const createLatLonLabels = () => {
      for (let lat = -60; lat <= 60; lat += 30) {
        for (let lon = 0; lon < 360; lon += 30) {
          const phi = (90 - lat) * (Math.PI / 180)
          const theta = (lon + 180) * (Math.PI / 180)
          const x = 2.08 * Math.sin(phi) * Math.cos(theta)
          const y = 2.08 * Math.cos(phi)
          const z = 2.08 * Math.sin(phi) * Math.sin(theta)

          const canvas = document.createElement('canvas')
          canvas.width = 128
          canvas.height = 32
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 12px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          const latStr = lat >= 0 ? `${lat}°N` : `${Math.abs(lat)}°S`
          const lonStr = lon <= 180 ? `${lon}°E` : `${360 - lon}°W`
          ctx.fillText(`${latStr} ${lonStr}`, canvas.width / 2, canvas.height / 2)

          const texture = new THREE.CanvasTexture(canvas)
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
          const sprite = new THREE.Sprite(spriteMaterial)
          sprite.position.set(x, y, z)
          sprite.scale.set(0.3, 0.075, 1)
          globe.add(sprite)
        }
      }
    }
    createLatLonLabels()

    const twilightGeometry = new THREE.SphereGeometry(2.005, 128, 128, 0, Math.PI)
    const twilightMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a1628,
      transparent: true,
      opacity: 0.85,
      side: THREE.FrontSide,
      shininess: 0,
    })
    const twilight = new THREE.Mesh(twilightGeometry, twilightMaterial)
    globe.add(twilight)
    twilightRef.current = twilight

    const twilightLineGeometry = new THREE.BufferGeometry()
    const twilightLinePositions = []
    for (let lat = -90; lat <= 90; lat += 2) {
      twilightLinePositions.push(2.02 * Math.cos((lat * Math.PI) / 180), 2.02 * Math.sin((lat * Math.PI) / 180), 0)
    }
    twilightLineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(twilightLinePositions, 3))
    const twilightLineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffcc, 
      linewidth: 2,
      transparent: true,
      opacity: 0.95
    })
    const twilightLine = new THREE.Line(twilightLineGeometry, twilightLineMaterial)
    globe.add(twilightLine)
    twilightLineRef.current = twilightLine

    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 64)
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      shininess: 10,
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    globe.add(atmosphere)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 3
    controls.maxDistance = 10

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const interactiveObjects = []

    const collectInteractiveObjects = () => {
      interactiveObjects.length = 0
      scene.traverse((obj) => {
        if (obj.userData && obj.userData.type) {
          interactiveObjects.push(obj)
        }
      })
    }
    collectInteractiveObjects()

    const handleMouseMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(interactiveObjects)

      if (intersects.length > 0) {
        const obj = intersects[0].object
        const { type, name } = obj.userData
        let description = ''
        if (type === 'city') {
          const city = cityPresets.find(c => c.name === name)
          if (city) {
            description = `${name}\n纬度: ${city.lat}°\n经度: ${city.lon}°`
          }
        } else if (type === 'observer') {
          const { latitude: currentLatitude, longitude: currentLongitude } = propsRef.current
          description = `观测点\n纬度: ${currentLatitude.toFixed(1)}°\n经度: ${currentLongitude.toFixed(1)}°`
        } else if (type === 'subsolar') {
          const { dayIndex: currentDayIndex, hour: currentHour, longitude: currentLongitude } = propsRef.current
          const decl = dayPresets[currentDayIndex]?.declination ?? 0
          description = `太阳直射点\n赤纬: ${decl.toFixed(1)}°\n当前时间小时角: ${((currentHour + currentLongitude / 15) % 24 - 12) * 15}°`
        }
        setTooltip({ show: true, text: description, x: event.clientX - rect.left, y: event.clientY - rect.top })
      } else {
        setTooltip({ show: false, text: '', x: 0, y: 0 })
      }
    }

    renderer.domElement.addEventListener('mousemove', handleMouseMove)

    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.domElement.removeEventListener('mousemove', handleMouseMove)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  useEffect(() => {
    if (!observerRef.current || !subsolarRef.current) return

    const updateMarkerPosition = (marker, lat, lon, height = 0.1) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      marker.position.x = (2 + height) * Math.sin(phi) * Math.cos(theta)
      marker.position.y = (2 + height) * Math.cos(phi)
      marker.position.z = (2 + height) * Math.sin(phi) * Math.sin(theta)
    }

    updateMarkerPosition(observerRef.current, latitude, longitude, 0.1)

    const declination = dayPresets[dayIndex]?.declination ?? 0
    const utcHour = (hour + longitude / 15) % 24
    const hourAngle = (utcHour - 12) * 15
    const ssLat = declination
    const ssLon = -hourAngle
    updateMarkerPosition(subsolarRef.current, ssLat, ssLon, 0.12)

    const sunLatRad = ssLat * (Math.PI / 180)
    const sunLonRad = ssLon * (Math.PI / 180)
    const sunDistance = 10

    if (directionalLightRef.current) {
      const sunPhi = (90 - ssLat) * (Math.PI / 180)
      const sunTheta = (ssLon + 180) * (Math.PI / 180)
      directionalLightRef.current.position.x = sunDistance * Math.sin(sunPhi) * Math.cos(sunTheta)
      directionalLightRef.current.position.y = sunDistance * Math.cos(sunPhi)
      directionalLightRef.current.position.z = sunDistance * Math.sin(sunPhi) * Math.sin(sunTheta)
    }

    const twilightRotationX = -sunLatRad
    const twilightRotationY = -sunLonRad + Math.PI / 2

    if (twilightRef.current) {
      twilightRef.current.rotation.x = twilightRotationX
      twilightRef.current.rotation.y = twilightRotationY
    }

    if (twilightLineRef.current) {
      twilightLineRef.current.rotation.x = twilightRotationX
      twilightLineRef.current.rotation.y = twilightRotationY
    }
  }, [latitude, longitude, hour, dayIndex])

  useEffect(() => {
    if (!flightPath || !airplaneRef.current || !flightLineRef.current) {
      if (airplaneRef.current) airplaneRef.current.visible = false
      if (flightLineRef.current) flightLineRef.current.visible = false
      return
    }

    const { from, to, progress } = flightPath
    if (progress <= 0 || progress >= 100) {
      airplaneRef.current.visible = false
      flightLineRef.current.visible = false
      return
    }

    const currentLat = from.lat + (to.lat - from.lat) * (progress / 100)
    const currentLon = from.lon + (to.lon - from.lon) * (progress / 100)
    const currentPhi = (90 - currentLat) * (Math.PI / 180)
    const currentTheta = (currentLon + 180) * (Math.PI / 180)

    const x = 2.15 * Math.sin(currentPhi) * Math.cos(currentTheta)
    const y = 2.15 * Math.cos(currentPhi)
    const z = 2.15 * Math.sin(currentPhi) * Math.sin(currentTheta)

    airplaneRef.current.position.set(x, y, z)
    airplaneRef.current.visible = true

    const points = []
    const numPoints = Math.floor(progress * 0.5)
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / (numPoints || 1)) * (progress / 100)
      const lat = from.lat + (to.lat - from.lat) * t
      const lon = from.lon + (to.lon - from.lon) * t
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      points.push(new THREE.Vector3(
        2.1 * Math.sin(phi) * Math.cos(theta),
        2.1 * Math.cos(phi),
        2.1 * Math.sin(phi) * Math.sin(theta)
      ))
    }
    flightLineRef.current.geometry.setFromPoints(points)
    flightLineRef.current.visible = true
  }, [flightPath])

  const sunPathData = useMemo(() => {
    const rad = Math.PI / 180
    const latRad = latitude * rad
    const decRad = (dayPresets[dayIndex]?.declination || 0) * rad
    const localSolarHr = hour + longitude / 15
    
    const cosH0 = -Math.tan(latRad) * Math.tan(decRad)
    const clampedCosH0 = Math.max(-1, Math.min(1, cosH0))
    const H0 = Math.acos(clampedCosH0)
    
    const sunriseHourAngle = -(H0 * 180) / Math.PI
    const sunsetHourAngle = (H0 * 180) / Math.PI
    
    const hourAngle = (localSolarHr - 12) * 15
    const hourAngleRad = hourAngle * rad
    
    const altitudeRad = Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
      Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad)
    )
    const sunAltitude = (altitudeRad * 180) / Math.PI
    
    const toScreenCoords = (altDeg, azDeg) => {
      const altRad = altDeg * rad
      const azRad = (azDeg - 90) * rad
      const r = Math.cos(altRad) * 60
      const x = 100 + r * Math.cos(azRad)
      const y = 100 - r * Math.sin(azRad) - Math.sin(altRad) * 50
      return { x, y }
    }
    
    const sunAzimuthRad = Math.atan2(
      -Math.sin(hourAngleRad),
      Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(hourAngleRad)
    )
    let sunAzimuth = ((sunAzimuthRad * 180) / Math.PI + 360) % 360
    
    const sunPos = toScreenCoords(sunAltitude, sunAzimuth)
    const sunrisePos = toScreenCoords(0, 90 + sunriseHourAngle / 15 * 15)
    const sunsetPos = toScreenCoords(0, 90 + sunsetHourAngle / 15 * 15)
    
    const shadowLength = sunAltitude > 0 ? 25 / Math.tan(altitudeRad) : 0
    const shadowAzimuth = (sunAzimuth + 180) % 360
    const shadowAzRad = (shadowAzimuth - 90) * rad
    const shadowX = 100 + Math.min(shadowLength, 40) * Math.cos(shadowAzRad)
    const shadowY = 100 - Math.min(shadowLength, 40) * Math.sin(shadowAzRad)
    
    return {
      sunPos,
      sunrisePos,
      sunsetPos,
      shadowX,
      shadowY,
      sunAltitude,
      dayLengthHours: (2 * H0 * 180) / (Math.PI * 15),
    }
  }, [latitude, longitude, hour, dayIndex])

  return (
    <>
      <div ref={containerRef} className="cesium-container" aria-label="Three.js 三维地球仿真" />
      <div className="sun-path-overlay">
        <svg viewBox="0 0 200 160" className="sun-path-svg">
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#E0F4FF" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#90EE90" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#228B22" stopOpacity="0.3" />
            </linearGradient>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#FFD700" />
            </marker>
          </defs>
          
          <rect x="5" y="5" width="190" height="150" rx="5" ry="5" fill="none" stroke="#666" strokeWidth="2" />
          
          <ellipse cx="100" cy="100" rx="90" ry="30" fill="url(#groundGradient)" />
          
          <path d="M 10 100 A 90 60 0 0 1 190 100" fill="url(#skyGradient)" stroke="#4A90D9" strokeWidth="1" />
          
          <text x="100" y="25" textAnchor="middle" fill="#333" fontSize="10" fontWeight="bold">天顶</text>
          <text x="185" y="105" textAnchor="middle" fill="#333" fontSize="8">北</text>
          <text x="15" y="105" textAnchor="middle" fill="#333" fontSize="8">南</text>
          
          <path d="M 25 100 L 175 100" stroke="#666" strokeWidth="1" strokeDasharray="3,2" />
          <text x="100" y="118" textAnchor="middle" fill="#666" fontSize="7">地平线</text>
          
          <circle cx="100" cy="100" r="3" fill="#FF6B6B" />
          <circle cx="100" cy="100" r="6" fill="#FF6B6B" fillOpacity="0.3" />
          <text x="100" y="92" textAnchor="middle" fill="#CC5555" fontSize="7">观测者</text>
          
          {sunPathData.sunAltitude > 0 && (
            <>
              <line x1="100" y1="100" x2={sunPathData.sunPos.x} y2={sunPathData.sunPos.y} stroke="#FFD700" strokeWidth="2" markerEnd="url(#arrow)" />
              <circle cx={sunPathData.sunPos.x} cy={sunPathData.sunPos.y} r="5" fill="#FFD700" />
              <text x={sunPathData.sunPos.x} y={sunPathData.sunPos.y - 8} textAnchor="middle" fill="#FFA500" fontSize="7">太阳</text>
              
              <line x1="100" y1="100" x2={sunPathData.shadowX} y2={sunPathData.shadowY} stroke="#555" strokeWidth="2" strokeDasharray="4,2" />
              <text x={sunPathData.shadowX + 5} y={sunPathData.shadowY + 5} fill="#555" fontSize="6">影子</text>
            </>
          )}
          
          {sunPathData.sunAltitude <= 0 && (
            <text x="100" y="85" textAnchor="middle" fill="#888" fontSize="7">夜间</text>
          )}
          
          <circle cx={Math.max(15, Math.min(185, sunPathData.sunrisePos.x))} cy={Math.max(95, Math.min(105, sunPathData.sunrisePos.y))} r="4" fill="#FFA500" />
          <text x={Math.max(15, Math.min(185, sunPathData.sunrisePos.x))} y={Math.max(85, Math.min(95, sunPathData.sunrisePos.y))} textAnchor="middle" fill="#FF8C00" fontSize="6">日出</text>
          
          <circle cx={Math.max(15, Math.min(185, sunPathData.sunsetPos.x))} cy={Math.max(95, Math.min(105, sunPathData.sunsetPos.y))} r="4" fill="#FF6347" />
          <text x={Math.max(15, Math.min(185, sunPathData.sunsetPos.x))} y={Math.max(85, Math.min(95, sunPathData.sunsetPos.y))} textAnchor="middle" fill="#DC143C" fontSize="6">日落</text>
          
          <path 
            d={`M ${Math.max(15, Math.min(185, sunPathData.sunrisePos.x))} ${Math.max(95, Math.min(105, sunPathData.sunrisePos.y))} A 65 40 0 0 1 ${Math.max(15, Math.min(185, sunPathData.sunsetPos.x))} ${Math.max(95, Math.min(105, sunPathData.sunsetPos.y))}`} 
            stroke="#FFA500" strokeWidth="1.5" fill="none" strokeDasharray="4,2" 
          />
          
          <text x="100" y="140" textAnchor="middle" fill="#666" fontSize="6">
            昼长: {sunPathData.dayLengthHours.toFixed(1)}h
          </text>
        </svg>
      </div>
      
      {tooltip.show && (
        <div className="globe-tooltip" style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}>
          {tooltip.text.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
    </>
  )
}

// 预设城市数据
const cityPresets = [
  { name: '北京', lat: 39.9, lon: 116.4, utcOffset: 8 },
  { name: '上海', lat: 31.2, lon: 121.5, utcOffset: 8 },
  { name: '广州', lat: 23.1, lon: 113.3, utcOffset: 8 },
  { name: '哈尔滨', lat: 45.8, lon: 126.6, utcOffset: 8 },
  { name: '乌鲁木齐', lat: 43.8, lon: 87.6, utcOffset: 8 },
  { name: '悉尼', lat: -33.9, lon: 151.2, utcOffset: 10 },
  { name: '纽约', lat: 40.7, lon: -74.0, utcOffset: -5 },
  { name: '伦敦', lat: 51.5, lon: -0.1, utcOffset: 0 },
  { name: '东京', lat: 35.7, lon: 139.7, utcOffset: 9 },
]

function ElectiveOne() {
  const [latitude, setLatitude] = useState(39.9)
  const [longitude, setLongitude] = useState(116.4)
  const [dayIndex, setDayIndex] = useState(2)
  const [hour, setHour] = useState(14)
  
  // 时空穿梭状态
  const [departureCity, setDepartureCity] = useState('北京')
  const [departureTime, setDepartureTime] = useState('08:00')
  const [destinationCity, setDestinationCity] = useState('纽约')
  const [isFlying, setIsFlying] = useState(false)
  const [flightProgress, setFlightProgress] = useState(0)
  const [landingTime, setLandingTime] = useState(null)

  const { openInfo } = useContext(InfoModalContext)

  const declination = dayPresets[dayIndex]?.declination ?? 0

  // 时间格式化函数
  const formatClock = (hoursFloat) => {
    if (!Number.isFinite(hoursFloat)) return '—'
    let totalMinutes = Math.round(hoursFloat * 60)
    totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const mm = String(totalMinutes % 60).padStart(2, '0')
    return `${hh}:${mm}`
  }

  const localSolarHour = useMemo(() => hour + longitude / 15, [hour, longitude])

  const sunAltitude = useMemo(() => {
    const rad = Math.PI / 180
    const latRad = latitude * rad
    const decRad = declination * rad
    const hourAngle = (localSolarHour - 12) * 15 * rad
    const altitudeRad = Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
        Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngle)
    )
    return (altitudeRad * 180) / Math.PI
  }, [latitude, declination, localSolarHour])

  // 太阳天顶角 = 90° - 太阳高度角
  const sunZenithAngle = useMemo(() => 90 - sunAltitude, [sunAltitude])

  // 地方时角
  const localHourAngle = useMemo(() => {
    return ((localSolarHour - 12) * 15 + 360) % 360
  }, [localSolarHour])

  // UTC时间
  const utcTime = useMemo(() => formatClock(hour), [hour])

  // 北京时间（UTC+8）
  const beijingTime = useMemo(() => {
    const beijingHour = hour + 8
    return formatClock(beijingHour)
  }, [hour])

  const sunAzimuth = useMemo(() => {
    const rad = Math.PI / 180
    const latRad = latitude * rad
    const decRad = declination * rad
    const hourAngle = (localSolarHour - 12) * 15 * rad
    let azimuthRad = Math.atan2(
      -Math.sin(hourAngle),
      Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(hourAngle)
    )
    if (azimuthRad < 0) azimuthRad += 2 * Math.PI
    return (azimuthRad * 180) / Math.PI
  }, [latitude, declination, localSolarHour])

  const formatAzimuthLabel = (azimuthValue) => {
    const normalized = (azimuthValue + 360) % 360
    if (normalized < 22.5 || normalized >= 337.5) return `正北`
    if (normalized < 67.5) return `北偏东 ${(normalized).toFixed(1)}°`
    if (normalized < 112.5) return `东偏北 ${(90 - normalized).toFixed(1)}°`
    if (normalized < 157.5) return `东偏南 ${(normalized - 90).toFixed(1)}°`
    if (normalized < 202.5) return `南偏东 ${(180 - normalized).toFixed(1)}°`
    if (normalized < 247.5) return `南偏西 ${(normalized - 180).toFixed(1)}°`
    if (normalized < 292.5) return `西偏南 ${(270 - normalized).toFixed(1)}°`
    if (normalized < 337.5) return `西偏北 ${(normalized - 270).toFixed(1)}°`
    return `正北`
  }

  const azimuthLabel = useMemo(() => formatAzimuthLabel(sunAzimuth), [sunAzimuth])

  const shadowAzimuthLabel = useMemo(() => {
    const shadowAzimuth = (sunAzimuth + 180) % 360
    return formatAzimuthLabel(shadowAzimuth)
  }, [sunAzimuth])

  const shadowLength = useMemo(() => {
    if (sunAltitude <= 0) return null
    const length = 1 / Math.tan((sunAltitude * Math.PI) / 180)
    return Math.min(length, 10)
  }, [sunAltitude])

  const noonAltitude = useMemo(() => {
    return 90 - Math.abs(latitude - declination)
  }, [latitude, declination])

  // 直射点纬度≈太阳赤纬；这里为教学简化（未引入均时差、椭圆轨道等）
  const subsolarLat = declination
  const subsolarLon = useMemo(() => {
    const hourAngle = (localSolarHour - 12) * 15
    const lon = longitude - hourAngle
    return ((lon + 180) % 360) - 180
  }, [longitude, localSolarHour])

  const dayLengthHours = useMemo(() => {
    const rad = Math.PI / 180
    const latRad = latitude * rad
    const decRad = declination * rad

    // cos(H0) = -tanφ tanδ，H0 为日出/日落时角（弧度，范围 0..π）
    const cosH0 = -Math.tan(latRad) * Math.tan(decRad)

    // 极昼/极夜处理
    if (cosH0 >= 1) return 0
    if (cosH0 <= -1) return 24

    const H0 = Math.acos(cosH0)
    return (2 * H0 * 180) / (Math.PI * 15)
  }, [latitude, declination])

  const nightLengthHours = useMemo(() => 24 - dayLengthHours, [dayLengthHours])

  const sunriseHour = useMemo(() => 12 - dayLengthHours / 2, [dayLengthHours])
  const sunsetHour = useMemo(() => 12 + dayLengthHours / 2, [dayLengthHours])

  const localSolarTime = useMemo(() => formatClock(localSolarHour), [localSolarHour])
  const sunriseTime = useMemo(() => formatClock(sunriseHour), [sunriseHour])
  const sunsetTime = useMemo(() => formatClock(sunsetHour), [sunsetHour])

  // 时空穿梭功能
  const handleTimeTravel = () => {
    const departure = cityPresets.find(c => c.name === departureCity)
    const destination = cityPresets.find(c => c.name === destinationCity)
    if (!departure || !destination) return

    // 解析起飞时间
    const [depHour, depMin] = departureTime.split(':').map(Number)
    const depTotalHours = depHour + depMin / 60

    // 计算时差
    // 城市民用标准时区（不含夏令时）；经度换算地方时，不能替代法定时区。
    const departureOffset = departure.utcOffset
    const destinationOffset = destination.utcOffset
    const timeDiff = destinationOffset - departureOffset

    // 飞行时间（简化计算：每1000公里约1小时）
    const rad = Math.PI / 180
    const dLat = (destination.lat - departure.lat) * rad
    const dLon = (destination.lon - departure.lon) * rad
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(departure.lat * rad) * Math.cos(destination.lat * rad) * Math.sin(dLon / 2) ** 2
    const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const flightHours = Math.round((distance / 850) * 10) / 10

    // 计算落地时间
    const arrivalUtc = depTotalHours - departureOffset + flightHours
    const arrivalDestinationHours = arrivalUtc + destinationOffset
    const dayOffset = Math.floor(arrivalDestinationHours / 24)
    const arrivalLocalTime = arrivalDestinationHours
    const arrivalBeijingTime = arrivalUtc + 8

    setLandingTime({
      local: formatClock(arrivalLocalTime),
      beijing: formatClock(arrivalBeijingTime),
      flightHours,
      timeDiff,
      distance: Math.round(distance),
      dayOffset
    })

    // 开始飞行动画
    setIsFlying(true)
    setFlightProgress(0)

    const interval = setInterval(() => {
      setFlightProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsFlying(false)
          return 100
        }
        return prev + 2
      })
    }, 100)

    // 更新目的地经纬度用于显示
    setTimeout(() => {
      setLatitude(destination.lat)
      setLongitude(destination.lon)
    }, 2000)
  }

  // 快速选择城市
  const handleSelectCity = (cityName) => {
    const city = cityPresets.find(c => c.name === cityName)
    if (city) {
      setLatitude(city.lat)
      setLongitude(city.lon)
    }
  }

  return (
    <div className="page">

      <main className="container exp-wrap">
        <div className="exp-top">
          <div>
            <h1>模块一：时空穿梭者——地球运动与方位角仿真</h1>
            <p className="muted">对应教材：选择性必修 1 第一章《地球的运动》</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('时空穿梭者实验指南', '<p>本实验通过交互式三维地球模型，展示地球运动与太阳视运动规律。</p><p><strong>操作说明：</strong></p><ul><li>🌍 <strong>地球操作：</strong>拖拽旋转地球，滚轮缩放，左键点击选择观测点</li><li>📅 <strong>日期选择：</strong>点击二分二至按钮或拖动滑块切换季节</li><li>🕐 <strong>时刻调整：</strong>拖动时间滑块观察24小时变化</li><li>📍 <strong>定位观测：</strong>输入经纬度或选择预设城市</li><li>✈️ <strong>时空穿梭：</strong>设置起飞地和目的地，体验时差变化</li></ul><p><strong>核心概念：</strong></p><ul><li>太阳高度角：太阳光线与地平面的夹角</li><li>太阳方位角：太阳在水平面上的方向（从正北顺时针）</li><li>地方时：根据经度计算的本地时间</li><li>时差：不同经度地点的时间差异</li></ul><p><strong>探究任务：</strong></p><ul><li>观察不同纬度的太阳轨迹差异</li><li>比较二分二至日的正午太阳高度</li><li>体验极昼极夜现象</li><li>计算不同地点的时差</li></ul>')
              }}
            >
              操作指南
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block">
              <h2>课程痛点</h2>
              <p>太阳视运动轨迹、正午太阳高度与方位角变化抽象难懂，需要可视化 + 交互辅助理解。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objective-section">
                <h3>📚 知识目标</h3>
                <ul>
                  <li>理解太阳视运动轨迹的时空变化规律，掌握正午太阳高度角的计算方法</li>
                  <li>掌握太阳方位角的概念，理解其随纬度、季节和时间的变化规律</li>
                  <li>理解地方时、区时的概念，掌握时区划分和时间计算方法</li>
                  <li>理解地球自转和公转的基本特征及其地理意义</li>
                </ul>
              </div>
              <div className="objective-section">
                <h3>🎯 能力目标</h3>
                <ul>
                  <li>能够运用太阳高度角和方位角知识分析不同地区的光照条件</li>
                  <li>能够进行地方时与区时的换算，解决实际时间问题</li>
                  <li>能够通过仿真实验观察和分析太阳视运动的变化规律</li>
                  <li>培养空间想象能力和地理思维能力</li>
                </ul>
              </div>
              <div className="objective-section">
                <h3>💡 情感态度价值观目标</h3>
                <ul>
                  <li>激发对地球运动规律的探究兴趣，培养科学探究精神</li>
                  <li>理解地理环境的时空差异性，树立正确的时空观念</li>
                  <li>体会人类活动与地理环境的关系，增强人地协调观念</li>
                </ul>
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <p>通过交互式三维地球模型，探究太阳视运动轨迹、正午太阳高度与方位角变化规律。</p>
            </div>

            <div className="panel-block">
              <h2>高考题型训练</h2>
              <div className="exam-list">
                <div className="exam-card">
                  <h3>题型训练·跨时区时间计算（情境改编）</h3>
                  <p className="quiz-stem">假设纽约采用 UTC−5 标准时且不计夏令时。北京时间2023年6月22日12时，一架飞机从北京（40°N，116°E）起飞，经过12小时飞行到达纽约（40°N，74°W）。据此完成下列问题。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">（1）飞机起飞时，纽约的当地时间是（ ）</p>
                      <p className="quiz-answer">答案：6月21日23时</p>
                      <p className="quiz-explain">解析：北京位于东八区，纽约位于西五区，时差为13小时。北京时间6月22日12时，纽约时间为6月22日12时 - 13小时 = 6月21日23时。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-block sim-controls">
              <h2>仿真控制台</h2>
              <p className="muted">
                交互式三维地球模型，展示地球运动与太阳视运动规律。
              </p>
              
              {/* 快速城市选择 */}
              <div className="control-group">
                <label>
                  快速定位：<span>{cityPresets.find(c => Math.abs(c.lat - latitude) < 1 && Math.abs(c.lon - longitude) < 1)?.name || '自定义位置'}</span>
                </label>
                <div className="pill-row city-picker">
                  {cityPresets.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      className={`pill ${Math.abs(city.lat - latitude) < 1 && Math.abs(city.lon - longitude) < 1 ? 'active' : ''}`}
                      onClick={() => handleSelectCity(city.name)}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 经纬度输入 */}
              <div className="control-group">
                <label>观测点坐标</label>
                <div className="coord-inputs">
                  <div>
                    <span>纬度</span>
                    <input
                      type="number"
                      min={-90}
                      max={90}
                      step={0.1}
                      value={latitude.toFixed(1)}
                      onChange={(event) => setLatitude(parseFloat(event.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <span>经度</span>
                    <input
                      type="number"
                      min={-180}
                      max={180}
                      step={0.1}
                      value={longitude.toFixed(1)}
                      onChange={(event) => setLongitude(parseFloat(event.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              {/* 日期选择 */}
              <div className="control-group">
                <label>
                  节气：<span>{dayPresets[dayIndex]?.label}</span>
                  <span className="sub-label">太阳赤纬：{declination.toFixed(1)}°</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={dayPresets.length - 1}
                  step={1}
                  value={dayIndex}
                  onChange={(event) => setDayIndex(parseInt(event.target.value, 10))}
                />
                <div className="pill-row">
                  {dayPresets.map((item, index) => (
                    <button
                      key={item.value}
                      type="button"
                      className={`pill ${index === dayIndex ? 'active' : ''}`}
                      onClick={() => setDayIndex(index)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 时间控制 */}
              <div className="control-group">
                <label>
                  UTC时刻：<span>{hour.toFixed(1)} 时</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={0.5}
                  value={hour}
                  onChange={(event) => setHour(parseFloat(event.target.value))}
                />
                <div className="time-markers">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </div>

            <div className="panel-block live-data">
              <h2>实时数据</h2>
              <div className="data-grid expanded">
                {/* 太阳相关参数 */}
                <div className="data-item sun">
                  <span>太阳高度角</span>
                  <strong>{sunAltitude.toFixed(1)}°</strong>
                </div>
                <div className="data-item">
                  <span>太阳天顶角</span>
                  <strong>{sunZenithAngle.toFixed(1)}°</strong>
                </div>
                <div className="data-item">
                  <span>太阳方位角</span>
                  <strong>{sunAzimuth.toFixed(1)}°</strong>
                </div>
                <div className="data-item">
                  <span>太阳赤纬</span>
                  <strong>{declination.toFixed(1)}°</strong>
                </div>
                <div className="data-item">
                  <span>地方时角</span>
                  <strong>{localHourAngle.toFixed(1)}°</strong>
                </div>
                <div className="data-item">
                  <span>正午太阳高度</span>
                  <strong>{noonAltitude.toFixed(1)}°</strong>
                </div>
                
                {/* 直射点参数 */}
                <div className="data-item highlight">
                  <span>直射点纬度</span>
                  <strong>{subsolarLat.toFixed(1)}°</strong>
                </div>
                <div className="data-item highlight">
                  <span>直射点经度</span>
                  <strong>{subsolarLon.toFixed(1)}°</strong>
                </div>
                
                {/* 时间相关参数 */}
                <div className="data-item time">
                  <span>UTC（世界时）</span>
                  <strong>{utcTime}</strong>
                </div>
                <div className="data-item time">
                  <span>北京时间 (UTC+8)</span>
                  <strong>{beijingTime}</strong>
                </div>
                <div className="data-item time">
                  <span>地方时 (观测点)</span>
                  <strong>{localSolarTime}</strong>
                </div>
                <div className="data-item">
                  <span>日出时间 (地方时)</span>
                  <strong>{sunriseTime}</strong>
                </div>
                <div className="data-item">
                  <span>日落时间 (地方时)</span>
                  <strong>{sunsetTime}</strong>
                </div>
                
                {/* 昼夜时长 */}
                <div className="data-item">
                  <span>昼长</span>
                  <strong>{dayLengthHours.toFixed(1)} 小时</strong>
                </div>
                <div className="data-item">
                  <span>夜长</span>
                  <strong>{nightLengthHours.toFixed(1)} 小时</strong>
                </div>
                
                {/* 影子参数 */}
                {sunAltitude > 0 && (
                  <>
                    <div className="data-item">
                      <span>影子长度</span>
                      <strong>{shadowLength?.toFixed(2) || '—'} 倍杆长</strong>
                    </div>
                    <div className="data-item">
                      <span>影子方向</span>
                      <strong>{shadowAzimuthLabel}</strong>
                    </div>
                  </>
                )}
                {sunAltitude <= 0 && (
                  <div className="data-item muted">
                    <span>夜间无阳光，无杆影</span>
                  </div>
                )}
                
                {/* 当前位置 */}
                <div className="data-item">
                  <span>当前纬度</span>
                  <strong>{latitude.toFixed(1)}°{latitude >= 0 ? 'N' : 'S'}</strong>
                </div>
                <div className="data-item">
                  <span>当前经度</span>
                  <strong>{longitude.toFixed(1)}°{longitude >= 0 ? 'E' : 'W'}</strong>
                </div>
              </div>
              <p className="muted data-note">
                说明：数值基于理想化太阳视运动模型（忽略均时差与轨道偏心）。
              </p>
            </div>

            {/* 时空穿梭功能 */}
            <div className="panel-block time-travel">
              <h2>时空穿梭 ✈️</h2>
              <p className="muted">体验跨时区飞行，理解时差计算原理</p>
              
              <div className="travel-controls">
                <div className="travel-group">
                  <label>起飞地点</label>
                  <select value={departureCity} onChange={(e) => setDepartureCity(e.target.value)}>
                    {cityPresets.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="travel-arrow">→</div>
                
                <div className="travel-group">
                  <label>起飞时间（地方时）</label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  />
                </div>
                
                <div className="travel-arrow">→</div>
                
                <div className="travel-group">
                  <label>目的地</label>
                  <select value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)}>
                    {cityPresets.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                type="button"
                className="btn primary"
                onClick={handleTimeTravel}
                disabled={isFlying}
              >
                {isFlying ? '飞行中...' : '开始穿梭'}
              </button>
              
              {/* 飞行进度 */}
              {isFlying && (
                <div className="flight-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${flightProgress}%` }} />
                  </div>
                  <span>{flightProgress}%</span>
                </div>
              )}
              
              {/* 落地结果 */}
              {landingTime && !isFlying && (
                <div className="landing-result">
                  <h3>✈️ 到达目的地</h3>
                  <p className="muted">按城市标准时区估算（不计夏令时）；航程按大圆距离与 850 km/h 巡航速度估算。</p>
                  <div className="result-grid">
                    <div>
                      <span>飞行距离</span>
                      <strong>{landingTime.distance} 公里</strong>
                    </div>
                    <div>
                      <span>飞行时间</span>
                      <strong>{landingTime.flightHours} 小时</strong>
                    </div>
                    <div>
                      <span>时差</span>
                      <strong>{landingTime.timeDiff > 0 ? '+' : ''}{landingTime.timeDiff} 小时</strong>
                    </div>
                    <div>
                      <span>落地当地时间</span>
                      <strong>{landingTime.local}{landingTime.dayOffset > 0 ? `（次日 +${landingTime.dayOffset}）` : landingTime.dayOffset < 0 ? `（前一日 ${landingTime.dayOffset}）` : '（当日）'}</strong>
                    </div>
                    <div>
                      <span>落地北京时间</span>
                      <strong>{landingTime.beijing}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <h2>仿真功能</h2>
            <ul>
              <li>三维地球模型：可拖拽旋转，切换经纬度视角。</li>
              <li>动态光影系统：展示太阳直射点与昼夜分布。</li>
              <li>时间滑块：控制日期（二分二至日）与时刻（0-24 时）。</li>
              <li>方位角可视化：绘制太阳轨迹线并显示当前方位角。</li>
              <li>影子追踪：同步展示物体影子长短与方向。</li>
            </ul>

            <div className="kpi">
              <div className="k">
                <strong>方位角</strong>
                <span>{azimuthLabel}</span>
              </div>
              <div className="k">
                <strong>正午高度</strong>
                <span>{noonAltitude.toFixed(1)}°</span>
              </div>
              <div className="k">
                <strong>影子长度</strong>
                <span>{sunAltitude > 0 ? (shadowLength?.toFixed(2) || '—') + ' 倍杆长' : '夜间无'}
</span>
              </div>
            </div>
          </section>

          <section className="panel canvas">
            <GlobeScene
              latitude={latitude}
              longitude={longitude}
              hour={hour}
              dayIndex={dayIndex}
              flightPath={isFlying ? { from: { lat: 39.9, lon: 116.4 }, to: { lat: 40.7, lon: -74.0 }, progress: flightProgress } : null}
            />
            <div className="canvas-overlay" />
          </section>
        </div>
      </main>
    </div>
  )
}

function ElectiveTwo() {
  const [seasonIndex, setSeasonIndex] = useState(0)
  const [windIntensity, setWindIntensity] = useState(1)
  const [showTerrain, setShowTerrain] = useState(false)
  const [showMonsoon, setShowMonsoon] = useState(true)
  const [showITCZ, setShowITCZ] = useState(true)
  const [showCirculation, setShowCirculation] = useState(true)
  const [showParticles, setShowParticles] = useState(true)

  const { openInfo } = useContext(InfoModalContext)

  const season = seasonPresets[seasonIndex]
  const subsolarLat = season?.subsolarLat ?? 0
  const bandShift = subsolarLat * 0.7

  const shiftedPressureBands = useMemo(() => {
    return pressureBands.map((band) => {
      const shifted = Math.max(-90, Math.min(90, band.baseLat + bandShift))
      return { ...band, lat: shifted }
    })
  }, [bandShift])

  const shiftedWindBands = useMemo(() => {
    return windBands.map((band) => {
      const start = Math.max(-90, Math.min(90, band.startLat + bandShift))
      const end = Math.max(-90, Math.min(90, band.endLat + bandShift))
      return { ...band, startLat: start, endLat: end }
    })
  }, [bandShift])

  const eastAsiaMonsoonNote = subsolarLat > 0
    ? '北半球受热增强；东亚夏季风还需结合海陆热力差异、气压场和水汽来源判读。'
    : '北半球受热减弱；东亚冬季风还需结合大陆冷高压、海陆气压梯度和地形判读。'

  const saharaNote = subsolarLat > 0
    ? 'ITCZ 北移至萨赫勒附近，西非季风加强，雨带北推。'
    : 'ITCZ 南撤，撒哈拉—萨赫勒受信风与下沉气流控制，干季范围扩大。'

  const itczPosition = subsolarLat * 0.8
  const monsoonType = subsolarLat > 10 ? '夏季风' : subsolarLat < -10 ? '冬季风' : '过渡季'

  return (
    <div className="page">

      <main className="container exp-wrap">
        <div className="exp-top">
          <div>
            <h1>模块二：气压带与风带动态仿真</h1>
            <p className="muted">对应教材：选择性必修 1 第二章《大气环流与气候》</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('气压带与风带动态仿真', '<p>本实验通过三维可视化展示全球气压带与风带的分布与季节性移动。</p><p><strong>操作说明：</strong></p><ul><li>拖拽旋转地球，从不同角度观察三圈环流</li><li>切换季节（春分/夏至/秋分/冬至），观察气压带风带的南北摆动</li><li>调整风速强度，观察气流速度变化</li><li>开启地形影响，观察青藏高原对西风的阻挡</li><li>观察ITCZ（赤道辐合带）的季节性移动</li></ul><p><strong>三圈环流：</strong></p><ul><li>Hadley环流（低纬）：赤道上升→高空北流→副高下沉→低空南流</li><li>Ferrel环流（中纬）：副高下沉→低空北流→副极地低压上升→高空南流</li><li>Polar环流（高纬）：极地高压下沉→低空南流→副极地低压上升→高空北流</li></ul><p><strong>气压带：</strong></p><ul><li>赤道低压带（热力低压）</li><li>副热带高压带（动力高压）</li><li>副极地低压带（动力低压）</li><li>极地高压带（热力高压）</li></ul>')
              }}
            >
              操作指南
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block">
              <h2>课程痛点</h2>
              <p>气压带与风带的季节性移动抽象，学生难以理解三圈环流与季风形成的关系。本实验通过动态可视化展示气压带风带的南北摆动，帮助学生理解季风气候的形成机制。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objective-section">
                <h3>📚 知识目标</h3>
                <ul>
                  <li>理解三圈环流（哈德莱环流、费雷尔环流、极地环流）的形成机制</li>
                  <li>掌握全球七个气压带和六个风带的分布规律</li>
                  <li>理解气压带风带季节性移动的原因和规律</li>
                  <li>掌握季风的形成原因，理解东亚季风与南亚季风的差异</li>
                </ul>
              </div>
              <div className="objective-section">
                <h3>🎯 能力目标</h3>
                <ul>
                  <li>能够绘制全球气压带风带分布图</li>
                  <li>能够分析气压带风带对气候的影响</li>
                  <li>能够解释季风气候的形成原因和特点</li>
                  <li>培养运用地理原理解释地理现象的能力</li>
                </ul>
              </div>
              <div className="objective-section">
                <h3>💡 情感态度价值观目标</h3>
                <ul>
                  <li>感受大气环流的复杂性和规律性，培养科学探究兴趣</li>
                  <li>理解全球气候的差异性，树立全球视野</li>
                  <li>认识大气环流对人类活动的影响，增强环境保护意识</li>
                </ul>
              </div>
            </div>

            <div className="panel-block sim-controls">
              <h2>仿真控制台</h2>
              <div className="control-group">
                <label>
                  季节滑块：<span>{season?.label}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={seasonPresets.length - 1}
                  step={1}
                  value={seasonIndex}
                  onChange={(event) => setSeasonIndex(parseInt(event.target.value, 10))}
                />
                <div className="pill-row">
                  {seasonPresets.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${index === seasonIndex ? 'active' : ''}`}
                      onClick={() => setSeasonIndex(index)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label>
                  风速强度：<span>{windIntensity.toFixed(1)} 倍</span>
                </label>
                <input
                  type="range"
                  min={0.4}
                  max={1.6}
                  step={0.1}
                  value={windIntensity}
                  onChange={(event) => setWindIntensity(parseFloat(event.target.value))}
                />
              </div>

              <div className="control-group">
                <label>
                  叠加地形影响
                  <span>{showTerrain ? '开启' : '关闭'}</span>
                </label>
                <button type="button" className="btn ghost" onClick={() => setShowTerrain((prev) => !prev)}>
                  {showTerrain ? '关闭山脉' : '开启山脉'}
                </button>
              </div>

              <div className="control-group">
                <h4>可视化选项</h4>
                <div className="checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showCirculation} onChange={(e) => setShowCirculation(e.target.checked)} />
                    三圈环流
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showMonsoon} onChange={(e) => setShowMonsoon(e.target.checked)} />
                    季风环流
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showITCZ} onChange={(e) => setShowITCZ(e.target.checked)} />
                    ITCZ云带
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showParticles} onChange={(e) => setShowParticles(e.target.checked)} />
                    风粒子
                  </label>
                </div>
              </div>
            </div>

            <div className="panel-block live-data">
              <h2>诊断量（概念化）</h2>
              <p className="data-note">气压带与 ITCZ 的位移采用理想化比例关系演示季节趋势，不是逐日观测值；地方环流与季风还受海陆热力差异、地形和海温影响。</p>
              <div className="data-grid">
                <div className="data-item">
                  <span>太阳直射点纬度</span>
                  <strong>{subsolarLat.toFixed(1)}°</strong>
                </div>
                <div className="data-item">
                  <span>气压带整体偏移</span>
                  <strong>{bandShift.toFixed(1)}°</strong>
                </div>
                <div className="data-item">
                  <span>ITCZ 位置</span>
                  <strong>{Math.abs(itczPosition).toFixed(1)}°{itczPosition >= 0 ? 'N' : 'S'}</strong>
                </div>
                <div className="data-item">
                  <span>季风类型</span>
                  <strong className={subsolarLat > 10 ? 'text-success' : subsolarLat < -10 ? 'text-warning' : 'text-muted'}>
                    {monsoonType}
                  </strong>
                </div>
                <div className="data-item">
                  <span>东亚季风诊断</span>
                  <strong>{eastAsiaMonsoonNote}</strong>
                </div>
                <div className="data-item">
                  <span>西非季风诊断</span>
                  <strong>{saharaNote}</strong>
                </div>
              </div>
            </div>

            <h2>三圈环流与气压带（纬向理想化）</h2>
            <ul className="legend">
              {shiftedPressureBands.map((band) => (
                <li key={band.id}>
                  <span className="legend-dot" style={{ background: band.color }} />
                  <strong>{band.name}</strong>
                  <span>{band.lat.toFixed(1)}°</span>
                </li>
              ))}
            </ul>

            <h2>风带与主导风向（科氏力偏转）</h2>
            <ul className="legend">
              {shiftedWindBands.map((band) => (
                <li key={band.id}>
                  <span className="legend-dot" style={{ background: band.color }} />
                  <strong>{band.name}</strong>
                  <span>
                    {band.startLat.toFixed(0)}° ~ {band.endLat.toFixed(0)}°
                  </span>
                </li>
              ))}
            </ul>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                <li>
                  <strong>任务1：观察气压带季节性移动</strong>
                  <p>拖动季节滑块，观察赤道低压带（ITCZ）、副热带高压带、副极地低压带的南北移动规律，记录夏至和冬至时各气压带的纬度位置。</p>
                  <span className="task-hint">💡 提示：气压带移动幅度约为10-15个纬度。</span>
                </li>
                <li>
                  <strong>任务2：分析东亚季风形成</strong>
                  <p>切换季节，观察夏季风和冬季风的风向变化，结合海陆热力差异和气压带移动，解释东亚季风的形成原因。</p>
                  <span className="task-hint">💡 提示：夏季大陆热低压、海洋冷高压；冬季相反。</span>
                </li>
                <li>
                  <strong>任务3：对比撒哈拉干湿季</strong>
                  <p>观察1月和7月撒哈拉地区的气压与风向差异，说明ITCZ移动如何造成该地区的干湿季交替。</p>
                  <span className="task-hint">💡 提示：ITCZ北移时带来降水，南撤时受下沉气流控制。</span>
                </li>
                <li>
                  <strong>任务4：地形对气流的影响</strong>
                  <p>开启/关闭地形影响，观察青藏高原对西风带的阻挡和分流作用，理解大地形对大气环流的强迫作用。</p>
                </li>
              </ul>
            </div>

            <div className="panel-block">
              <h2>高考题型训练</h2>
              <div className="exam-list">
                <div className="exam-card">
                  <h3>高考题型训练·气压带风带与降水（情境改编）</h3>
                  <p className="quiz-stem">阅读图文材料，完成下列要求。
<br/>
印度河是南亚地区重要的河流，其流域气候受季风环流影响显著。图a示意印度河流域所在区域的气压带和风带分布，图b示意该流域某一季节的盛行风向。
<br/>
（1）指出图示季节，并说明判断依据。
<br/>
（2）分析该季节印度河流域降水较少的原因。</p>
                  <div className="quiz-answer">
                    <strong>答案：</strong>
                    <p>（1）夏季。依据：图中显示南亚盛行西南季风，西南季风是夏季风的典型特征。</p>
                    <p>（2）该季节印度河流域受副热带高压控制，盛行下沉气流；西南季风受地形阻挡，难以深入流域内部；来自阿拉伯海的水汽有限。</p>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·季风与锋面降水（情境改编）</h3>
                  <p className="quiz-stem">小满节气前后，广东地区通常会出现“龙舟水”天气。此时，南海夏季风爆发，暖湿气流活跃，与北方冷空气交汇，形成强降水。据此完成1-2题。</p>
                  <ul>
                    <li>1. 小满节气前后，控制广东地区的主要气压系统是（ ）
                      <br/>A. 亚洲高压 B. 亚洲低压 C. 副热带高压 D. 赤道低压
                    </li>
                    <li>2. “龙舟水”现象的形成主要与（ ）有关。
                      <br/>A. 海陆热力差异 B. 气压带风带移动 C. 地形抬升作用 D. 以上都是
                    </li>
                  </ul>
                  <div className="quiz-answer">
                    <strong>答案：1.C 2.D</strong>
                    <p>解析：小满节气前后（5月底-6月初），副热带高压北抬，南海夏季风爆发，暖湿气流与冷空气交汇形成降水。</p>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·季节环流判断（情境改编）</h3>
                  <p className="quiz-stem">阅读图文资料，完成下列要求。
<br/>
非洲西部几内亚湾沿岸地区气候湿润，降水丰富。图示意该地区气压带和风带的季节性移动。</p>
                  <ul>
                    <li>（1）指出图示季节，并说明该季节几内亚湾沿岸盛行风的形成原因。</li>
                    <li>（2）分析该季节几内亚湾沿岸降水丰富的原因。</li>
                  </ul>
                  <div className="quiz-answer">
                    <strong>答案：</strong>
                    <p>（1）夏季。夏季太阳直射点北移，南半球东南信风越过赤道偏转形成西南风；同时海陆热力差异增强了西南季风。</p>
                    <p>（2）西南风从海洋带来大量水汽；地形抬升作用显著；赤道辐合带（ITCZ）北移至该地区，对流旺盛。</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel canvas">
            <CirculationScene
              subsolarLat={subsolarLat}
              windIntensity={windIntensity}
              showTerrain={showTerrain}
              showMonsoon={showMonsoon}
              showITCZ={showITCZ}
              showCirculation={showCirculation}
              showParticles={showParticles}
            />
            <div className="canvas-overlay" />
          </section>
        </div>
      </main>
    </div>
  )
}

function ElectiveThree() {
  const { openInfo } = useContext(InfoModalContext)
  const [scenarioId, setScenarioId] = useState('cold')
  const [stageIndex, setStageIndex] = useState(1)
  const [viewMode, setViewMode] = useState('scene')
  const [showStations, setShowStations] = useState(true)
  const [showClouds, setShowClouds] = useState(true)
  const [showRadar, setShowRadar] = useState(false)
  const [showWindShear, setShowWindShear] = useState(false)
  const [showTemperatureAdvection, setShowTemperatureAdvection] = useState(false)

  const scenario = useMemo(
    () => frontScenarios.find((item) => item.id === scenarioId) ?? frontScenarios[0],
    [scenarioId]
  )

  const tempValue = scenario.tempCurve[stageIndex]
  const pressureValue = scenario.pressureCurve[stageIndex]
  const windValue = scenario.windCurve[stageIndex]
  const rainValue = scenario.rainCurve[stageIndex]
  const stageProgress = stageIndex / (frontStageLabels.length - 1)
  const frontShift = -40 + stageProgress * 80
  const cloudOpacity = 0.3 + stageProgress * 0.6
  const rainIntensity = Math.min(1, stageProgress * 1.2)
  const humidityValue = 60 + stageProgress * 30

  const tempPoints = useMemo(() => {
    const values = scenario.tempCurve
    const min = Math.min(...values) - 1
    const max = Math.max(...values) + 1
    const width = 220
    const height = 80
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width
        const y = height - ((value - min) / (max - min)) * height
        return `${x},${y}`
      })
      .join(' ')
  }, [scenario])

  const pressurePoints = useMemo(() => {
    const values = scenario.pressureCurve
    const min = Math.min(...values) - 2
    const max = Math.max(...values) + 2
    const width = 220
    const height = 80
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width
        const y = height - ((value - min) / (max - min)) * height
        return `${x},${y}`
      })
      .join(' ')
  }, [scenario])

  return (
    <div className="page">

      <main className="container exp-wrap">
        <div className="exp-top">
          <div>
            <h1>模块三：锋面系统与气旋模拟实验</h1>
            <p className="muted">对应教材：选择性必修 1 第二章《大气环流与气候》第 3 节</p>
          </div>
          <div className="exp-actions">
            <button
              type="button"
              className="btn info-btn"
              onClick={() => {
                openInfo('锋面系统与气旋模拟实验指南', '<p>本实验通过交互式仿真，展示冷锋、暖锋和温带气旋的形成与演变过程。</p><p><strong>操作说明：</strong></p><ul><li>选择场景：切换冷锋、暖锋、温带气旋</li><li>拖动时间轴：观察锋面过境的温压风雨变化</li><li>切换视角：从剖面和俯视两个角度观察</li><li>显示站点：叠加气象站数据对比分析</li><li>开启云系演变：观察不同阶段云系特征</li><li>查看雷达回波：了解降水强度分布</li></ul><p><strong>锋面类型：</strong></p><ul><li>冷锋：冷气团主动推进，锋后降水，坡度较陡，移动快</li><li>暖锋：暖气团主动爬升，锋前降水，坡度较缓，移动慢</li><li>温带气旋：冷暖锋耦合，逆时针旋转，产生大范围降水</li></ul><p><strong>天气要素：</strong></p><ul><li>温度平流：冷暖空气的水平输送</li><li>垂直运动：上升气流形成云系和降水</li><li>风切变：风向风速随高度变化</li></ul>')
              }}
            >
              操作指南
            </button>
            <Link className="btn" to="/">
              返回首页
            </Link>
          </div>
        </div>

        <div className="layout">
          <section className="panel">
            <div className="panel-block task-highlight">
              <h2>课程痛点</h2>
              <p>冷锋、暖锋与温带气旋的抬升过程与降水带移动难以动态理解，需要“剖面 + 平面 + 时间轴”联动展示。学生难以建立锋面过境时温压风雨的变化关联。</p>
            </div>

            <div className="panel-block">
              <h2>教学目标</h2>
              <div className="objective-section">
                <h3>📚 知识目标</h3>
                <ul>
                  <li>理解锋面的概念，掌握冷锋、暖锋、准静止锋的形成条件</li>
                  <li>掌握冷锋与暖锋的天气特征，包括降水位置、锋面坡度、移动速度</li>
                  <li>理解温带气旋的形成过程和结构特征</li>
                  <li>掌握锋面气旋的天气演变规律</li>
                </ul>
              </div>
              <div className="objective-section">
                <h3>🎯 能力目标</h3>
                <ul>
                  <li>能够根据天气图判断锋面类型和移动方向</li>
                  <li>能够分析锋面过境前后的天气变化</li>
                  <li>能够解释温带气旋的形成和发展过程</li>
                  <li>培养综合分析地理问题的能力和地理实践能力</li>
                </ul>
              </div>
              <div className="objective-section">
                <h3>💡 情感态度价值观目标</h3>
                <ul>
                  <li>增强对天气现象的好奇心，培养科学探究精神</li>
                  <li>理解天气变化对人类生活的影响，树立防灾减灾意识</li>
                  <li>培养辩证思维，认识地理事物的复杂性和关联性</li>
                </ul>
              </div>
            </div>

            <div className="panel-block sim-controls">
              <h2>仿真控制台</h2>
              <div className="control-group">
                <label>
                  场景选择：<span>{scenario.name}</span>
                </label>
                <div className="pill-row">
                  {frontScenarios.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`pill ${item.id === scenarioId ? 'active' : ''}`}
                      onClick={() => {
                        setScenarioId(item.id)
                        setViewMode(item.id === 'cyclone' ? 'plan' : 'scene')
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label>
                  时间轴：<span>{frontStageLabels[stageIndex]}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={frontStageLabels.length - 1}
                  step={1}
                  value={stageIndex}
                  onChange={(event) => setStageIndex(parseInt(event.target.value, 10))}
                />
              </div>

              <div className="control-group">
                <label>
                  视角模式：<span>{viewMode === 'section' ? '剖面' : viewMode === 'plan' ? '平面/俯视' : '云系场景'}</span>
                </label>
                <div className="pill-row">
                  <button
                    type="button"
                    className={`pill ${viewMode === 'scene' ? 'active' : ''}`}
                    onClick={() => setViewMode('scene')}
                    disabled={scenarioId === 'cyclone'}
                    title={scenarioId === 'cyclone' ? '温带气旋请使用俯视气旋图' : undefined}
                  >
                    云系场景
                  </button>
                  <button
                    type="button"
                    className={`pill ${viewMode === 'section' ? 'active' : ''}`}
                    onClick={() => setViewMode('section')}
                  >
                    二维剖面
                  </button>
                  <button
                    type="button"
                    className={`pill ${viewMode === 'plan' ? 'active' : ''}`}
                    onClick={() => setViewMode('plan')}
                  >
                    俯视气旋
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>
                  叠加气象站数据<span>{showStations ? '开启' : '关闭'}</span>
                </label>
                <button type="button" className="btn ghost" onClick={() => setShowStations((prev) => !prev)}>
                  {showStations ? '隐藏站点' : '显示站点'}
                </button>
              </div>

              <div className="control-group">
                <h4>高级可视化</h4>
                <div className="checkbox-grid">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showClouds} onChange={(e) => setShowClouds(e.target.checked)} />
                    云系演变
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showRadar} onChange={(e) => setShowRadar(e.target.checked)} />
                    雷达回波
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showWindShear} onChange={(e) => setShowWindShear(e.target.checked)} />
                    风切变
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" checked={showTemperatureAdvection} onChange={(e) => setShowTemperatureAdvection(e.target.checked)} />
                    温度平流
                  </label>
                </div>
              </div>
            </div>

            <div className="panel-block live-data">
              <h2>过程诊断（典型情境示意）</h2>
              <p className="data-note">温压风雨曲线用于比较锋面过境前后的变化方向，不对应某一气象站实况或数值预报；判题时先看风向、气温和气压的先后变化，再定位锋面与降水区。</p>
              <div className="data-grid">
                <div className="data-item">
                  <span>气温</span>
                  <strong>{tempValue}℃</strong>
                </div>
                <div className="data-item">
                  <span>气压</span>
                  <strong>{pressureValue} hPa</strong>
                </div>
                <div className="data-item">
                  <span>风向</span>
                  <strong>{windValue}</strong>
                </div>
                <div className="data-item">
                  <span>降水</span>
                  <strong>{rainValue}</strong>
                </div>
                <div className="data-item">
                  <span>湿度</span>
                  <strong>{humidityValue}%</strong>
                </div>
                <div className="data-item">
                  <span>天气</span>
                  <strong>{stageIndex <= 1 ? '晴暖' : stageIndex <= 2 ? '阴雨' : '转晴'}</strong>
                </div>
              </div>
              <div className="front-curves">
                <div>
                  <span>气温曲线</span>
                  <svg viewBox="0 0 220 80" role="img" aria-label="气温变化曲线">
                    <polyline className="front-curve temp" points={tempPoints} />
                  </svg>
                </div>
                <div>
                  <span>气压曲线</span>
                  <svg viewBox="0 0 220 80" role="img" aria-label="气压变化曲线">
                    <polyline className="front-curve pressure" points={pressurePoints} />
                  </svg>
                </div>
              </div>
              <div className="front-stage-note">
                <strong>{frontStageDetails[stageIndex].title}</strong>
                <p>{frontStageDetails[stageIndex].detail}</p>
              </div>
            </div>

            <div className="panel-block">
              <h2>交互探究任务</h2>
              <ul className="task-list">
                <li>
                  <strong>任务1：观察冷锋过境</strong>
                  <p>选择冷锋场景，拖动时间轴，观察气温、气压、风向和降水的变化，记录过境前、过境时、过境后的天气特征。</p>
                  <span className="task-hint">💡 提示：冷锋过境时气温骤降、气压升高、出现风雨天气。</span>
                </li>
                <li>
                  <strong>任务2：对比冷暖锋差异</strong>
                  <p>分别选择冷锋和暖锋场景，对比两种锋面的坡度、降水位置、气温变化特点，总结它们的区别。</p>
                  <span className="task-hint">💡 提示：冷锋坡度陡、锋后降水；暖锋坡度缓、锋前降水。</span>
                </li>
                <li>
                  <strong>任务3：分析温带气旋结构</strong>
                  <p>选择温带气旋场景，切换剖面和平面视角，观察气旋的逆时针旋转和降水分布，理解气旋的形成机制。</p>
                  <span className="task-hint">💡 提示：气旋中心为低压，四周空气向中心辐合上升。</span>
                </li>
                <li>
                  <strong>任务4：气象站数据分析</strong>
                  <p>开启气象站数据，对比不同站点在锋面过境时的温压变化，验证锋面移动规律。</p>
                </li>
              </ul>
            </div>

            <div className="panel-block">
              <h2>高考题型训练</h2>
              <div className="exam-list">
                <div className="exam-card">
                  <h3>高考题型训练·锋面过境天气表（情境改编）</h3>
                  <p className="quiz-stem">我国某城市2022年11月15-18日的天气变化如下表所示。</p>
                  <div className="front-table">
                    <div className="front-table__row head">
                      <span>日期</span>
                      <span>天气</span>
                      <span>气温</span>
                      <span>风向风力</span>
                    </div>
                    <div className="front-table__row">
                      <span>15日</span>
                      <span>晴</span>
                      <span>12~22℃</span>
                      <span>东北风3级</span>
                    </div>
                    <div className="front-table__row">
                      <span>16日</span>
                      <span>多云转雨</span>
                      <span>8~16℃</span>
                      <span>东北风5级</span>
                    </div>
                    <div className="front-table__row">
                      <span>17日</span>
                      <span>雨转晴</span>
                      <span>2~10℃</span>
                      <span>西北风4级</span>
                    </div>
                    <div className="front-table__row">
                      <span>18日</span>
                      <span>晴</span>
                      <span>-2~8℃</span>
                      <span>西北风2级</span>
                    </div>
                  </div>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">7. 影响该城市此次天气变化的天气系统是（ ）</p>
                      <ul>
                        <li>A. 暖锋 B. 冷锋 C. 气旋 D. 反气旋</li>
                      </ul>
                      <p className="quiz-answer">参考答案：B</p>
                    </div>
                    <div>
                      <p className="quiz-stem">8. 16日夜间至17日白天，该城市经历的天气现象是（ ）</p>
                      <ul>
                        <li>A. 连续性降水 B. 狂风暴雨 C. 雾霾消散 D. 风沙漫天</li>
                      </ul>
                      <p className="quiz-answer">参考答案：B</p>
                      <p className="quiz-explain">解析：冷锋过境时，冷气团迅速推进，常伴有大风、降温、雨雪天气。</p>
                    </div>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·锋面系统读图（情境改编）</h3>
                  <p className="quiz-stem">下图为亚洲部分地区某日海平面气压分布图。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">23. 图中①②③④四地中，最可能出现降水的是（ ）</p>
                      <ul>
                        <li>A. ①② B. ②③ C. ③④ D. ①④</li>
                      </ul>
                      <p className="quiz-answer">参考答案：B</p>
                    </div>
                    <div>
                      <p className="quiz-stem">24. 此时，下列城市中风向为偏北风的是（ ）</p>
                      <ul>
                        <li>A. 东京 B. 首尔 C. 上海 D. 北京</li>
                      </ul>
                      <p className="quiz-answer">参考答案：D</p>
                      <p className="quiz-explain">解析：根据等压线分布，北京位于高压中心南侧，盛行偏北风。</p>
                    </div>
                  </div>
                </div>
                <div className="exam-card">
                  <h3>高考题型训练·温带气旋推理（情境改编）</h3>
                  <p className="quiz-stem">阅读图文资料，完成下列要求。
<br/>
下图为某日8时亚洲部分地区海平面气压分布图。图示时刻，甲地盛行东北风，乙地出现降水。</p>
                  <div className="exam-questions">
                    <div>
                      <p className="quiz-stem">（1）判断图示时刻乙地的天气系统类型，并说明判断依据。</p>
                      <p className="quiz-answer">参考答案：冷锋。依据：乙地位于低压槽附近，且出现降水；甲地盛行东北风，说明冷气团主动向暖气团移动。</p>
                    </div>
                    <div>
                      <p className="quiz-stem">（2）分析乙地未来一段时间内的天气变化趋势。</p>
                      <p className="quiz-answer">参考答案：冷锋过境后，乙地气温下降，气压升高，天气转晴。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="panel canvas front-canvas">
            <div className="front-toolbar">
              <div className="badge">{scenario.name}</div>
              <span className="muted">{scenario.summary}</span>
            </div>

            <div className="front-metrics">
              <div>
                <span>暖区</span>
                <strong>{scenario.warmTemp}℃</strong>
              </div>
              <div>
                <span>冷区</span>
                <strong>{scenario.coldTemp}℃</strong>
              </div>
              <div>
                <span>气压</span>
                <strong>{pressureValue} hPa</strong>
              </div>
              <div>
                <span>风向</span>
                <strong>{windValue}</strong>
              </div>
            </div>

            <div className={`front-view ${viewMode}`}>
              {viewMode === 'scene' ? (
                <div className="front-scene-render">
                  <img
                    src={scenarioId === 'warm' ? '/picture/experiments/warm-front-scene-v1.jpg' : '/picture/experiments/cold-front-scene-v1.jpg'}
                    alt={scenarioId === 'warm' ? '暖空气沿缓坡爬升，在锋前形成层状云和连续降水的三维场景' : '冷锋推进、抬升暖湿气流并形成雨带的三维场景'}
                  />
                  <div className="front-scene-shade" />
                  <div className="front-scene-frontline" style={{ left: `${18 + stageProgress * 60}%` }}>
                    <span>锋线 · {frontStageLabels[stageIndex]}</span>
                  </div>
                  <div className="front-scene-readout">
                    <span>当前天气过程</span>
                    <strong>{scenario.name} · {frontStageLabels[stageIndex]}</strong>
                    <small>气温 {tempValue}℃ · 气压 {pressureValue} hPa · 降水指数 {Math.round(rainIntensity * 100)}</small>
                  </div>
                </div>
              ) : viewMode === 'section' ? (
                <div className="front-section">
                  <div className="front-band warm" aria-hidden="true" />
                  <div className="front-band cold" aria-hidden="true" />
                  <div className="front-grid" aria-hidden="true" />
                  
                  {/* 温度平流指示 */}
                  {showTemperatureAdvection && (
                    <div className="temp-advection">
                      <div className="advection-arrow warm" style={{ transform: `translateX(${frontShift * 0.5}px)` }}>
                        <span>暖平流</span>
                      </div>
                      <div className="advection-arrow cold" style={{ transform: `translateX(${frontShift * -0.5}px) rotate(180deg)` }}>
                        <span>冷平流</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="front-ground">
                    <span>地面</span>
                    <div className="frontline" style={{ transform: `translateX(${frontShift}px)` }}>
                      <span>锋线</span>
                      <div className="front-symbol">{scenarioId === 'cold' ? '▲' : scenarioId === 'warm' ? '▼' : '⊕'}</div>
                    </div>
                  </div>
                  
                  {/* 气团标识 */}
                  <div className="air-mass warm">
                    <span>暖湿气团</span>
                    <strong>{scenario.warmTemp}℃</strong>
                    <span className="humidity-indicator">湿度: {humidityValue}%</span>
                  </div>
                  <div className="air-mass cold">
                    <span>冷干气团</span>
                    <strong>{scenario.coldTemp}℃</strong>
                    <span className="humidity-indicator">湿度: {Math.round(humidityValue * 0.6)}%</span>
                  </div>
                  
                  {/* 锋面抬升 */}
                  <div className="front-slope" style={{ transform: `translateX(${frontShift}px) skewX(${scenarioId === 'warm' ? '-8deg' : '-15deg'})` }}>
                    <div className={`front-lift ${scenarioId}`}>
                      <span>抬升带</span>
                      <div className="lift-arrow" />
                      <div className="vertical-velocity">W: {Math.round(stageProgress * 30)} cm/s</div>
                    </div>
                    
                    {/* 云系演变 */}
                    {showClouds && (
                      <div className="cloud-system" style={{ opacity: cloudOpacity }}>
                        <div className="cloud-layer altostratus">
                          <span>高层云</span>
                        </div>
                        <div className="cloud-layer nimbostratus">
                          <span>雨层云</span>
                        </div>
                        <div className="cloud-layer cumulus" style={{ opacity: rainIntensity }}>
                          <span>积雨云</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 降水带 */}
                    <div className="cloud-band" style={{ opacity: cloudOpacity }}>
                      <span>云雨带</span>
                      <div className="precipitation" style={{ opacity: rainIntensity }}>
                        <div className={`rain-type ${scenarioId === 'cold' ? 'showers' : 'drizzle'}`}>
                          {scenarioId === 'cold' ? '阵性降水' : '连续性降水'}
                        </div>
                        <div className="rain-dots">
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 气流运动 */}
                  <div className="front-flow">
                    <div className="flow-arrow warm" style={{ transform: `translateX(${frontShift * 0.35}px)` }} />
                    <div className="flow-arrow cold" style={{ transform: `translateX(${frontShift * -0.35}px) rotate(180deg)` }} />
                    <div className="flow-label warm">暖湿气流上升</div>
                    <div className="flow-label cold">冷气团推进</div>
                  </div>
                  
                  {/* 风切变指示 */}
                  {showWindShear && (
                    <div className="wind-shear">
                      <div className="shear-layer upper">
                        <span>上层风: 西南风</span>
                        <div className="wind-arrow" style={{ transform: 'rotate(225deg)' }} />
                      </div>
                      <div className="shear-layer lower">
                        <span>下层风: 东北风</span>
                        <div className="wind-arrow" style={{ transform: 'rotate(45deg)' }} />
                      </div>
                      <div className="shear-label">风切变</div>
                    </div>
                  )}
                  
                  {/* 雷达回波 */}
                  {showRadar && (
                    <div className="radar-overlay">
                      <div className="radar-ring" style={{ transform: `translate(${frontShift}px, -20px) scale(${0.5 + stageProgress * 0.5})` }} />
                      <div className="radar-ring inner" style={{ transform: `translate(${frontShift}px, -20px) scale(${0.3 + stageProgress * 0.3})` }} />
                      <span className="radar-label">雷达回波</span>
                    </div>
                  )}
                  
                  {/* 垂直剖面图 */}
                  <div className="front-thermo">
                    <div>
                      <span>温度垂直梯度</span>
                      <div className="thermo-bar temp" style={{ ['--fill']: `${60 + stageProgress * 30}%` }} />
                    </div>
                    <div>
                      <span>气压垂直梯度</span>
                      <div className="thermo-bar pressure" style={{ ['--fill']: `${40 + stageProgress * 40}%` }} />
                    </div>
                    <div>
                      <span>相对湿度</span>
                      <div className="thermo-bar humidity" style={{ ['--fill']: `${humidityValue}%` }} />
                    </div>
                  </div>
                  
                  {/* 图例 */}
                  <div className="front-legend">
                    <div>
                      <span className="legend-box warm" />
                      暖气团
                    </div>
                    <div>
                      <span className="legend-box cold" />
                      冷气团
                    </div>
                    <div>
                      <span className="legend-box lift" />
                      抬升区
                    </div>
                    <div>
                      <span className="legend-box rain" />
                      云雨带
                    </div>
                    <div>
                      <span className="legend-box cloud" />
                      云系
                    </div>
                  </div>
                  
                  {/* 气象站 */}
                  {showStations && (
                    <div className="front-stations">
                      <div className="station">
                        <strong>武汉</strong>
                        <span>{stageIndex <= 1 ? '降水' : '转晴'}</span>
                        <div className="station-data">
                          <span>T: {stageIndex <= 1 ? tempValue : tempValue - 5}℃</span>
                          <span>P: {stageIndex <= 1 ? pressureValue : pressureValue + 5} hPa</span>
                        </div>
                      </div>
                      <div className="station">
                        <strong>南昌</strong>
                        <span>{stageIndex <= 2 ? '晴暖' : '阴雨'}</span>
                        <div className="station-data">
                          <span>T: {stageIndex <= 2 ? scenario.warmTemp : scenario.warmTemp - 3}℃</span>
                          <span>P: {stageIndex <= 2 ? pressureValue - 3 : pressureValue} hPa</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="front-plan">
                  <div className="plan-grid" aria-hidden="true" />
                  
                  {/* 等压线系统 */}
                  <div className="pressure-system">
                    <div className="low-center">
                      <strong>L</strong>
                      <span>低压中心</span>
                      <span className="pressure-value">{pressureValue} hPa</span>
                    </div>
                    <div className="isobar outer" style={{ transform: `translate(-50%, -50%) scale(${1 + stageProgress * 0.15})` }}>
                      <span className="isobar-label">1008</span>
                    </div>
                    <div className="isobar middle" style={{ transform: `translate(-50%, -50%) scale(${0.8 + stageProgress * 0.15})` }}>
                      <span className="isobar-label">1004</span>
                    </div>
                    <div className="isobar inner" style={{ transform: `translate(-50%, -50%) scale(${0.6 + stageProgress * 0.15})` }}>
                      <span className="isobar-label">1000</span>
                    </div>
                  </div>
                  
                  {/* 锋面弧 */}
                  <div className={`front-arc warm ${scenarioId}`} style={{ transform: `translate(-50%, -50%) rotate(${stageProgress * 20}deg)` }}>
                    <span className="arc-label">暖锋</span>
                  </div>
                  <div className={`front-arc cold ${scenarioId}`} style={{ transform: `translate(-50%, -50%) rotate(${stageProgress * -15}deg)` }}>
                    <span className="arc-label">冷锋</span>
                  </div>
                  
                  {/* 气流螺旋 */}
                  <div className="front-spiral" style={{ opacity: 0.3 + stageProgress * 0.6 }} />
                  <div className="spiral-direction">
                    <span>逆时针旋转</span>
                    <div className="rotation-arrow" />
                  </div>
                  
                  {/* 风向指示 */}
                  <div className="wind-field">
                    <div className="front-wind north" style={{ transform: `rotate(${20 + stageProgress * 10}deg)` }}>
                      <span>NW</span>
                    </div>
                    <div className="front-wind south" style={{ transform: `rotate(${-30 - stageProgress * 10}deg)` }}>
                      <span>SE</span>
                    </div>
                    <div className="front-wind east" style={{ transform: `rotate(${90 + stageProgress * 10}deg)` }}>
                      <span>N</span>
                    </div>
                    <div className="front-wind west" style={{ transform: `rotate(${-90 - stageProgress * 10}deg)` }}>
                      <span>S</span>
                    </div>
                  </div>
                  
                  {/* 降水区域 */}
                  {showClouds && (
                    <div className="precipitation-area" style={{ opacity: rainIntensity }}>
                      <div className="rain-region warm-side" />
                      <div className="rain-region cold-side" />
                    </div>
                  )}
                  
                  {/* 雷达回波 */}
                  {showRadar && (
                    <div className="plan-radar">
                      <div className="radar-sweep" style={{ transform: `rotate(${stageProgress * 360}deg)` }} />
                      <span className="radar-label">雷达扫描</span>
                    </div>
                  )}
                  
                  {/* 温度平流 */}
                  {showTemperatureAdvection && (
                    <div className="plan-advection">
                      <div className="advection-cell warm">暖平流</div>
                      <div className="advection-cell cold">冷平流</div>
                    </div>
                  )}
                  
                  <div className="plan-pressure">
                    <span>低压区</span>
                    <span>风向逆时针辐合</span>
                  </div>
                  
                  {/* 图例 */}
                  <div className="front-legend plan">
                    <div>
                      <span className="legend-box warm" />
                      暖锋
                    </div>
                    <div>
                      <span className="legend-box cold" />
                      冷锋
                    </div>
                    <div>
                      <span className="legend-box isobar" />
                      等压线
                    </div>
                    <div>
                      <span className="legend-box rain" />
                      降水区
                    </div>
                  </div>
                  
                  {/* 气象站 */}
                  {showStations && (
                    <div className="front-stations plan">
                      <div className="station">
                        <strong>武汉</strong>
                        <span>锋前降水</span>
                        <div className="station-data">
                          <span>{scenario.warmTemp}℃</span>
                        </div>
                      </div>
                      <div className="station">
                        <strong>南昌</strong>
                        <span>锋后降温</span>
                        <div className="station-data">
                          <span>{scenario.coldTemp}℃</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="front-timeline">
              {frontStageLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`stage-card ${index === stageIndex ? 'active' : ''}`}
                  onClick={() => setStageIndex(index)}
                >
                  <strong>阶段 {index + 1}</strong>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function CirculationScene({ subsolarLat, windIntensity, showTerrain, showMonsoon = true, showITCZ = true, showCirculation = true, showParticles = true }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const windIntensityRef = useRef(windIntensity)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#e8f4fd')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 1.5, 3.6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2
    controls.maxDistance = 7

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.0)
    sunLight.position.set(4, 3, 5)
    scene.add(sunLight)

    const earthTexture = new THREE.TextureLoader().load('/picture/experiments/required/world-map.jpg')
    earthTexture.colorSpace = THREE.SRGBColorSpace
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({
        map: earthTexture ?? undefined,
        roughness: 0.7,
        metalness: 0.1,
      })
    )
    scene.add(earth)

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      })
    )
    scene.add(atmosphere)

    const bandGroup = new THREE.Group()
    scene.add(bandGroup)

    const windGroup = new THREE.Group()
    scene.add(windGroup)

    const terrainGroup = new THREE.Group()
    scene.add(terrainGroup)

    const circulationGroup = new THREE.Group()
    scene.add(circulationGroup)

    const itczGroup = new THREE.Group()
    scene.add(itczGroup)

    const monsoonGroup = new THREE.Group()
    scene.add(monsoonGroup)

    const particleGroup = new THREE.Group()
    scene.add(particleGroup)

    const axis = new THREE.AxesHelper(1.5)
    axis.material.transparent = true
    axis.material.opacity = 0.12
    scene.add(axis)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      earth,
      bandGroup,
      windGroup,
      terrainGroup,
      circulationGroup,
      itczGroup,
      monsoonGroup,
      particleGroup,
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resize()
    window.addEventListener('resize', resize)
    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)

    const particles = []
    for (let i = 0; i < 30; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.015, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.7 })
      )
      const lat = -60 + Math.random() * 120
      const lon = Math.random() * 360
      const phi = (lat * Math.PI) / 180
      const theta = (lon * Math.PI) / 180
      const radius = 1.06 + Math.random() * 0.08
      particle.position.set(
        Math.cos(theta) * Math.cos(phi) * radius,
        Math.sin(phi) * radius,
        Math.sin(theta) * Math.cos(phi) * radius
      )
      particle.userData = {
        speed: 0.002 + Math.random() * 0.003,
        direction: Math.random() > 0.5 ? 1 : -1,
        lat: lat,
      }
      particles.push(particle)
      particleGroup.add(particle)
    }

    let frameId
    const animate = () => {
      earth.rotation.y += 0.0008
      windGroup.rotation.y += 0.002 * windIntensityRef.current
      circulationGroup.rotation.y += 0.0008
      monsoonGroup.rotation.y += 0.0008
      
      particles.forEach((particle) => {
        particle.userData.lat += particle.userData.direction * particle.userData.speed * windIntensityRef.current * 10
        if (particle.userData.lat > 60 || particle.userData.lat < -60) {
          particle.userData.direction *= -1
        }
        const phi = (particle.userData.lat * Math.PI) / 180
        const theta = particle.rotation.y + 0.002 * windIntensityRef.current
        particle.rotation.y += 0.002 * windIntensityRef.current
        const radius = 1.06 + Math.sin(Date.now() * 0.002 + particle.userData.lat) * 0.03
        particle.position.set(
          Math.cos(theta) * Math.cos(phi) * radius,
          Math.sin(phi) * radius,
          Math.sin(theta) * Math.cos(phi) * radius
        )
      })

      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    windIntensityRef.current = windIntensity
  }, [windIntensity])

  useEffect(() => {
    if (!sceneRef.current) return
    const { bandGroup, windGroup, terrainGroup, circulationGroup, itczGroup, monsoonGroup, particleGroup } = sceneRef.current

    windGroup.rotation.y = 0

    bandGroup.clear()
    windGroup.clear()
    terrainGroup.clear()
    circulationGroup.clear()
    itczGroup.clear()
    monsoonGroup.clear()
    particleGroup.visible = showParticles

    const bandShift = subsolarLat * 0.7
    const itczLat = subsolarLat * 0.8

    pressureBands.forEach((band) => {
      const lat = Math.max(-90, Math.min(90, band.baseLat + bandShift))
      const phi = (lat * Math.PI) / 180
      const radius = Math.cos(phi) * 1.02
      const y = Math.sin(phi) * 1.02

      const ringGeometry = new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 181 }, (_, i) => {
          const theta = (i / 180) * Math.PI * 2
          return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius)
        })
      )
      const ring = new THREE.Line(
        ringGeometry,
        new THREE.LineBasicMaterial({ color: band.color, transparent: true, opacity: 0.4 })
      )
      bandGroup.add(ring)

      const centerPhi = (lat * Math.PI) / 180
      const centerRadius = Math.cos(centerPhi) * 1.03
      const centerY = Math.sin(centerPhi) * 1.03
      
      const isHighPressure = band.name.includes('高压')
      const centerMarker = new THREE.Mesh(
        new THREE.SphereGeometry(isHighPressure ? 0.04 : 0.05, 16, 16),
        new THREE.MeshBasicMaterial({ 
          color: band.color, 
          transparent: true, 
          opacity: 0.7 
        })
      )
      centerMarker.position.set(centerRadius * 0.8, centerY, 0)
      bandGroup.add(centerMarker)
    })

    windBands.forEach((band) => {
      const startLat = Math.max(-90, Math.min(90, band.startLat + bandShift))
      const endLat = Math.max(-90, Math.min(90, band.endLat + bandShift))
      const midLat = (startLat + endLat) / 2
      const phi = (midLat * Math.PI) / 180
      const radius = Math.cos(phi) * 1.05
      const y = Math.sin(phi) * 1.05

      const arrowCount = 12
      for (let i = 0; i < arrowCount; i += 1) {
        const theta = (i / arrowCount) * Math.PI * 2
        const x = Math.cos(theta) * radius
        const z = Math.sin(theta) * radius
        const eastDir = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta))
        const latSign = midLat >= 0 ? -1 : 1
        const meridional = new THREE.Vector3(0, latSign, 0)
        const direction = eastDir
          .clone()
          .multiplyScalar(band.direction)
          .add(meridional.multiplyScalar(Math.abs(band.direction) * 0.4))
          .normalize()

        const arrowLength = 0.2 + Math.random() * 0.1
        const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(x, y, z), arrowLength, band.color)
        arrow.cone.material.transparent = true
        arrow.cone.material.opacity = 0.7
        arrow.cone.material.depthWrite = false
        arrow.line.material.transparent = true
        arrow.line.material.opacity = 0.55
        arrow.line.material.depthWrite = false
        windGroup.add(arrow)
      }
    })

    if (showCirculation) {
      const hadleyUpLat = itczLat
      const hadleyDownLat = 30 + bandShift

      const createCirculationCell = (upLat, downLat, color, clockwise = true) => {
        const points = []
        const segments = 30
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments
          let lat, radius, y
          
          if (t < 0.25) {
            lat = upLat + (downLat - upLat) * (t * 4) * (clockwise ? 1 : -1)
            const phi = (lat * Math.PI) / 180
            radius = Math.cos(phi) * 1.03
            y = Math.sin(phi) * 1.03
          } else if (t < 0.5) {
            const t2 = (t - 0.25) * 4
            lat = downLat * (clockwise ? 1 : -1)
            const phi = (lat * Math.PI) / 180
            const baseRadius = Math.cos(phi) * 1.03
            radius = baseRadius + t2 * 0.15
            const baseY = Math.sin(phi) * 1.03
            y = baseY + t2 * 0.4
          } else if (t < 0.75) {
            const t2 = (t - 0.5) * 4
            lat = downLat + (upLat - downLat) * t2 * (clockwise ? 1 : -1)
            const phi = (lat * Math.PI) / 180
            const baseRadius = Math.cos(phi) * 1.03
            radius = baseRadius + (1 - t2) * 0.15
            const baseY = Math.sin(phi) * 1.03
            y = baseY + (1 - t2) * 0.4
          } else {
            lat = upLat * (clockwise ? 1 : -1)
            const phi = (lat * Math.PI) / 180
            radius = Math.cos(phi) * 1.03
            y = Math.sin(phi) * 1.03
          }
          
          const theta = t * Math.PI * 2 * (clockwise ? 1 : -1)
          points.push(new THREE.Vector3(
            Math.cos(theta) * radius,
            y,
            Math.sin(theta) * radius
          ))
        }
        
        const curve = new THREE.CatmullRomCurve3(points)
        const curvePoints = curve.getPoints(50)
        const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints)
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })
        )
        return line
      }

      circulationGroup.add(createCirculationCell(hadleyUpLat, hadleyDownLat, 0x22c55e))
      circulationGroup.add(createCirculationCell(-hadleyUpLat, -hadleyDownLat, 0x22c55e))
      circulationGroup.add(createCirculationCell(-hadleyDownLat, hadleyDownLat, 0x3b82f6, false))
      circulationGroup.add(createCirculationCell(60 + bandShift * 0.5, 90, 0x8b5cf6))
      circulationGroup.add(createCirculationCell(-60 + bandShift * 0.5, -90, 0x8b5cf6))
    }

    if (showITCZ) {
      const itczPhi = (itczLat * Math.PI) / 180
      const itczRadius = Math.cos(itczPhi) * 1.04
      const itczY = Math.sin(itczPhi) * 1.04

      const itczRing = new THREE.Mesh(
        new THREE.RingGeometry(itczRadius - 0.05, itczRadius + 0.05, 64),
        new THREE.MeshBasicMaterial({ 
          color: 0xfbbf24, 
          transparent: true, 
          opacity: 0.3,
          side: THREE.DoubleSide 
        })
      )
      itczRing.rotation.x = Math.PI / 2
      itczRing.position.y = itczY
      itczGroup.add(itczRing)

      for (let i = 0; i < 8; i++) {
        const theta = (i / 8) * Math.PI * 2
        const cloud = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.6 })
        )
        cloud.position.set(
          Math.cos(theta) * (itczRadius + 0.02),
          itczY + 0.1 + Math.sin(Date.now() * 0.001 + i) * 0.03,
          Math.sin(theta) * (itczRadius + 0.02)
        )
        itczGroup.add(cloud)
      }
    }

    if (showMonsoon) {
      const isSummer = subsolarLat > 10
      const monsoonColor = isSummer ? 0x22c55e : 0x64748b

      const eastAsiaMonsoon = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.8, -0.1, 0.5),
          new THREE.Vector3(-0.6, 0.1, 0.6),
          new THREE.Vector3(-0.3, 0.2, 0.7),
        ]),
        new THREE.LineBasicMaterial({ color: monsoonColor, transparent: true, opacity: 0.6 })
      )
      monsoonGroup.add(eastAsiaMonsoon)

      const southAsiaMonsoon = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.5, -0.3, 0.8),
          new THREE.Vector3(-0.3, -0.1, 0.9),
          new THREE.Vector3(-0.1, 0.1, 0.8),
        ]),
        new THREE.LineBasicMaterial({ color: monsoonColor, transparent: true, opacity: 0.6 })
      )
      monsoonGroup.add(southAsiaMonsoon)
    }

    if (showTerrain) {
      const tibet = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xa8b5c2, roughness: 0.8, transparent: true, opacity: 0.8 })
      )
      tibet.position.set(0.2, 0.5, 0.86)
      terrainGroup.add(tibet)

      const andes = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x8b99a8, roughness: 0.85, transparent: true, opacity: 0.75 })
      )
      andes.position.set(-0.9, 0.15, 0.3)
      terrainGroup.add(andes)

      const rockies = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85, transparent: true, opacity: 0.7 })
      )
      rockies.position.set(-0.95, 0.35, -0.1)
      terrainGroup.add(rockies)

      const deflectLine1 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.1, 0.55, 1.05),
          new THREE.Vector3(0.2, 0.6, 0.85),
          new THREE.Vector3(0.5, 0.58, 0.7),
        ]),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
      )
      terrainGroup.add(deflectLine1)

      const deflectLine2 = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.15, 0.55, 1.05),
          new THREE.Vector3(-0.35, 0.52, 0.9),
        ]),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 })
      )
      terrainGroup.add(deflectLine2)
    }
  }, [subsolarLat, showTerrain, showMonsoon, showITCZ, showCirculation, showParticles])

  return <div ref={containerRef} className="three-container" aria-label="三圈环流三维仿真" />
}

function createEarthTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#1e3a8a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 18; i += 1) {
    const y = (canvas.height / 18) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
  for (let i = 0; i <= 36; i += 1) {
    const x = (canvas.width / 36) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  return new THREE.CanvasTexture(canvas)
}

function ThreeScene({ latitude, declination, hour, shadowLength, localSolarHour }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#f7f9ff')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 1.4, 3.6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 2.2
    controls.maxDistance = 7

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
    scene.add(sunLight)

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffd166 })
    )
    scene.add(sun)

    const earthTexture = createEarthTexture()
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({
        map: earthTexture ?? undefined,
        roughness: 0.6,
        metalness: 0.1,
      })
    )
    scene.add(earth)

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.03, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.18,
      })
    )
    scene.add(atmosphere)

    const terminator = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, dashSize: 0.08, gapSize: 0.05 })
    )
    scene.add(terminator)

    const stars = new THREE.Mesh(
      new THREE.SphereGeometry(18, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0xe2e8f0,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
      })
    )
    scene.add(stars)

    const axis = new THREE.AxesHelper(1.5)
    axis.material.transparent = true
    axis.material.opacity = 0.18
    scene.add(axis)

    const observerGroup = new THREE.Group()
    scene.add(observerGroup)

    const observerMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee })
    )
    observerGroup.add(observerMarker)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1.08, 64),
      new THREE.MeshStandardMaterial({ color: 0x1f2937, transparent: true, opacity: 0.15 })
    )
    ground.rotation.x = -Math.PI / 2
    observerGroup.add(ground)

    const horizon = new THREE.Mesh(
      new THREE.RingGeometry(0.98, 1.02, 64),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide })
    )
    horizon.rotation.x = -Math.PI / 2
    observerGroup.add(horizon)

    const sunPathGeometry = new THREE.BufferGeometry()
    const sunPathMaterial = new THREE.LineBasicMaterial({ color: 0xf59e0b })
    const sunPath = new THREE.Line(sunPathGeometry, sunPathMaterial)
    observerGroup.add(sunPath)

    const sunDirectionLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xf97316 })
    )
    observerGroup.add(sunDirectionLine)

    const shadowLine = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0x0f172a, dashSize: 0.04, gapSize: 0.02 })
    )
    observerGroup.add(shadowLine)

    const shadowPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.015, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0x111827 })
    )
    shadowPole.position.y = 0.15
    observerGroup.add(shadowPole)

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      earth,
      stars,
      sun,
      sunLight,
      observerGroup,
      observerMarker,
      sunPath,
      sunDirectionLine,
      shadowLine,
      terminator,
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    resize()
    window.addEventListener('resize', resize)

    const resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(container)

    let frameId
    const animate = () => {
      earth.rotation.y += 0.0015
      stars.rotation.y += 0.0004
      controls.update()
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) return
    const { sun, sunLight, observerGroup, observerMarker, sunPath, sunDirectionLine, shadowLine, terminator } =
      sceneRef.current

    const latRad = (latitude * Math.PI) / 180
    const decRad = (declination * Math.PI) / 180
    const hourAngle = (localSolarHour - 12) * 15 * (Math.PI / 180)

    const altitudeRad = Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
        Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngle)
    )
    const azimuthRad = Math.atan2(
      -Math.sin(hourAngle),
      Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(hourAngle)
    )

    const orbitRadius = 4
    const sunY = Math.sin(altitudeRad) * orbitRadius
    const sunHorizontal = Math.cos(altitudeRad) * orbitRadius
    const sunX = Math.sin(azimuthRad) * sunHorizontal
    const sunZ = Math.cos(azimuthRad) * sunHorizontal

    sun.position.set(sunX, sunY, sunZ)
    sunLight.position.copy(sun.position)

    const sunDirWorld = sun.position.clone().normalize()
    const terminatorPoints = []
    const basis1 = new THREE.Vector3(0, 1, 0)
    if (Math.abs(sunDirWorld.dot(basis1)) > 0.95) {
      basis1.set(1, 0, 0)
    }
    const basis2 = new THREE.Vector3().crossVectors(sunDirWorld, basis1).normalize()
    basis1.crossVectors(basis2, sunDirWorld).normalize()
    for (let i = 0; i <= 128; i += 1) {
      const theta = (i / 128) * Math.PI * 2
      const point = new THREE.Vector3()
        .addScaledVector(basis1, Math.cos(theta))
        .addScaledVector(basis2, Math.sin(theta))
        .multiplyScalar(1.01)
      terminatorPoints.push(point)
    }
    terminator.geometry.setFromPoints(terminatorPoints)
    terminator.computeLineDistances()

    const observerLat = latRad
    const observerX = Math.cos(observerLat) * 1.02
    const observerY = Math.sin(observerLat) * 1.02
    observerMarker.position.set(observerX, observerY, 0)

    const tangent = new THREE.Vector3(-Math.sin(observerLat), Math.cos(observerLat), 0).normalize()
    const normal = new THREE.Vector3(Math.cos(observerLat), Math.sin(observerLat), 0).normalize()
    const binormal = new THREE.Vector3(0, 0, 1)
    const matrix = new THREE.Matrix4().makeBasis(tangent, normal, binormal)
    observerGroup.setRotationFromMatrix(matrix)
    observerGroup.position.set(observerX, observerY, 0)

    const pathPoints = []
    for (let h = 0; h <= 24; h += 1) {
      const hourA = (h - localSolarHour) * 15 * (Math.PI / 180)
      const altA = Math.asin(
        Math.sin(latRad) * Math.sin(decRad) +
          Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourA)
      )
      const azA = Math.atan2(
        -Math.sin(hourA),
        Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(hourA)
      )
      const yA = Math.sin(altA)
      const horizontalA = Math.cos(altA)
      const xA = Math.sin(azA) * horizontalA
      const zA = Math.cos(azA) * horizontalA
      pathPoints.push(new THREE.Vector3(xA, yA, zA))
    }
    sunPath.geometry.setFromPoints(pathPoints)

    const sunDirLocal = new THREE.Vector3(
      Math.sin(azimuthRad) * Math.cos(altitudeRad),
      Math.sin(altitudeRad),
      Math.cos(azimuthRad) * Math.cos(altitudeRad)
    )
    const directionPoints = [new THREE.Vector3(0, 0, 0), sunDirLocal.clone().multiplyScalar(1.2)]
    sunDirectionLine.geometry.setFromPoints(directionPoints)

    const shadowDir = sunDirLocal.clone().multiplyScalar(-1).setY(0).normalize()
    const shadowEnd = shadowDir.clone().multiplyScalar(shadowLength)
    shadowLine.geometry.setFromPoints([new THREE.Vector3(0, 0.01, 0), shadowEnd])
    shadowLine.computeLineDistances()
  }, [latitude, declination, hour, localSolarHour, shadowLength])

  return <div ref={containerRef} className="three-container" aria-label="三维地球仿真" />
}

export default App
