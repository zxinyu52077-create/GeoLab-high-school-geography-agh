import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JourneyFooter, JourneyHeader, JourneyIcon } from './JourneyUI'

const subjects = [
  { id: 'all', label: '全部实验', icon: 'book' },
  { id: 'earth', label: '地球与宇宙', icon: 'globe' },
  { id: 'air', label: '大气与天气', icon: 'air' },
  { id: 'land', label: '地表与地质', icon: 'land' },
  { id: 'water', label: '水与海洋', icon: 'water' },
]
const requiredSubjects = ['earth', 'earth', 'land', 'land', 'air', 'air', 'water', 'water', 'water']
const electiveSubjects = ['earth', 'air', 'air', 'land', 'land', 'land', 'water']
const pictures = {
  required: ['inner-planets-final.png', '/picture/planets/sun.png', 'required/strata-fossils.png', 'required/earth-cutaway.png', 'required/clouds.png', 'required/land-sea.png', 'required/river-basin.png', 'required/ocean-column.png', 'required/land-sea.png'],
  elective: ['required/earth-even-light.png', 'required/clouds.png', 'cold-front-scene-v1.jpg', 'tectonic-folds-v1.jpg', 'required/river-basin.png', 'volcano-hazard-scene-v1.jpg', 'required/land-sea.png'],
}

export default function ExperimentCatalog({ userInfo, textbook, onBack, onTeacherDashboard, experiments }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('all')
  const isRequired = textbook === 'required-01'
  const bookTitle = isRequired ? '必修一' : '选择性必修一'
  const rows = useMemo(() => experiments.map((experiment, i) => ({ ...experiment, subject: (isRequired ? requiredSubjects : electiveSubjects)[i], picture: pictures[isRequired ? 'required' : 'elective'][i], name: experiment.title.split('：').slice(1).join('：') || experiment.title })), [experiments, isRequired])
  const visible = useMemo(() => {
    const key = query.trim().toLocaleLowerCase()
    return rows.filter(row => (subject === 'all' || row.subject === subject) && (!key || `${row.name} ${row.subtitle} ${subjects.find(s => s.id === row.subject)?.label}`.toLocaleLowerCase().includes(key)))
  }, [rows, query, subject])

  return <div className="journey-page journey-catalog">
    <JourneyHeader step={3} onBack={onBack} backLabel="切换教材" userInfo={userInfo} />
    <main className="journey-catalog-main">
      <section className="journey-catalog-hero">
        <div><div className="journey-eyebrow"><span /> YOUR GEOGRAPHY LAB</div><h1>{bookTitle}<span>实验空间</span></h1><p>选一个问题，调节变量，让地理规律在眼前发生。</p><div className="journey-course-tag"><JourneyIcon name="book" size={15} />{isRequired ? '自然地理基础' : '自然地理原理与应用'}<span>·</span>{userInfo.identity === 'student' ? '学生探索' : '教师演示'}</div></div>
        <div className="journey-catalog-summary"><div><strong>{String(experiments.length).padStart(2, '0')}</strong><span>交互实验</span></div><div><strong>04</strong><span>探索主题</span></div><span className="journey-summary-orbit" aria-hidden="true"><JourneyIcon name="globe" size={82} /></span></div>
      </section>
      <section className="journey-directory" aria-labelledby="journey-directory-title">
        <div className="journey-directory-head"><div><h2 id="journey-directory-title">选择一个实验</h2><p>从观察到推理，找到自己的探索路径。</p></div><div className="journey-search"><JourneyIcon name="search" size={19} /><input type="search" aria-label="搜索实验" placeholder="搜索实验名称或知识点" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="清空搜索" onClick={() => setQuery('')}>×</button>}</div></div>
        <div className="journey-filter-row"><div className="journey-filters" role="group" aria-label="按地理主题筛选">{subjects.map(item => <button key={item.id} type="button" aria-pressed={subject === item.id} onClick={() => setSubject(item.id)}><JourneyIcon name={item.icon} size={16} />{item.label}</button>)}</div><span className="journey-result-count" role="status">{visible.length} / {experiments.length} 个实验</span></div>
        <div className="journey-experiments">{visible.map(experiment => <article className={`journey-experiment journey-experiment--${experiment.subject}`} key={experiment.path}>
          <div className={`journey-experiment-cover ${experiment.subject === 'earth' ? 'is-earth' : ''}`}><img src={experiment.picture.startsWith('/') ? experiment.picture : `/picture/experiments/${experiment.picture}`} alt="" loading="lazy" /><span className="journey-experiment-number">实验 {String(experiment.id).padStart(2, '0')}</span><span className="journey-experiment-subject"><JourneyIcon name={subjects.find(s => s.id === experiment.subject).icon} size={14} />{subjects.find(s => s.id === experiment.subject).label}</span></div>
          <div className="journey-experiment-content"><h3>{experiment.name}</h3><p>{experiment.subtitle}</p><div className="journey-experiment-bottom"><span>交互探究</span><button type="button" onClick={() => navigate(experiment.path)}>进入实验 →</button></div></div>
        </article>)}</div>
        {!visible.length && <div className="journey-empty"><span><JourneyIcon name="search" size={30} /></span><h3>没有找到相关实验</h3><p>试试“水循环”“地球”或切换主题。</p><button type="button" className="journey-quiet" onClick={() => { setQuery(''); setSubject('all') }}>查看全部实验<JourneyIcon name="arrow" size={17} /></button></div>}
      </section>
      <aside className="journey-companion"><span className="journey-companion-icon"><JourneyIcon name="spark" size={23} /></span><div><strong>遇到难题，让 GeoLab 帮你验证</strong><p>进入实验后，点击右下角的可验证实验台，提出问题并查看数据证据、核验结果与报告。</p></div>{onTeacherDashboard && <button type="button" className="journey-quiet" onClick={onTeacherDashboard}>教师工作台<JourneyIcon name="arrow" size={17} /></button>}</aside>
    </main>
    <JourneyFooter />
  </div>
}
