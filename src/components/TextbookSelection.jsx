import { useState } from 'react'
import Required01Cover from '../assets/必修一教材封面.png'
import Elective01Cover from '../assets/选修一教材封面.png'
import { JourneyFooter, JourneyHeader, JourneyIcon } from './journey/JourneyUI'

const textbooks = [
  { id: 'required-01', title: '必修一', subtitle: '自然地理基础', description: '从地球的宇宙环境到大气、水与海洋，建立自然地理的基础认识。', cover: Required01Cover, topics: ['宇宙环境', '地球圈层', '大气运动', '水与海洋'], experiments: 9, number: '01', label: '建立基础', detail: '观察现象，建立概念与过程联系' },
  { id: 'elective-01', title: '选择性必修一', subtitle: '自然地理原理与应用', description: '深入地球运动、天气系统和地貌演化，在变量与证据中训练综合推理。', cover: Elective01Cover, topics: ['地球运动', '天气系统', '地貌演化', '海洋环流'], experiments: 7, number: '02', label: '深入推演', detail: '控制变量，追踪因果与空间关系' },
]

function TextbookSelection({ userInfo, onConfirm, onBack, onTeacherDashboard }) {
  const [selectedBook, setSelectedBook] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const selected = textbooks.find(book => book.id === selectedBook)
  const handleConfirm = () => {
    if (!selectedBook || isConfirming) return
    setIsConfirming(true)
    onConfirm(selectedBook)
  }
  return <div className="journey-page journey-textbooks">
    <JourneyHeader step={2} onBack={onBack} backLabel="返回登录" userInfo={userInfo} />
    <main className="journey-textbook-main">
      <div className="journey-page-heading"><div><div className="journey-eyebrow"><span /> CHOOSE YOUR COURSE</div><h1>选择你的学习起点</h1><p>你好，<strong className="journey-greeting-name">{userInfo.name}</strong>。选一本教材，从感兴趣的地理问题开始。</p></div><span className="journey-total"><JourneyIcon name="book" size={18} />2 本教材 · 16 个实验</span></div>
      <section className="journey-books" aria-label="选择教材">{textbooks.map(book => <article key={book.id} className={`journey-book ${selectedBook === book.id ? 'selected' : ''}`}><button type="button" className="journey-book-select" aria-pressed={selectedBook === book.id} aria-label={`选择教材：${book.title}`} onClick={() => setSelectedBook(book.id)}>
        <span className="journey-book-top"><span>COURSE {book.number}</span><span className="journey-selection-check">{selectedBook === book.id && <JourneyIcon name="check" size={17} />}</span></span>
        <span className="journey-book-body"><span className="journey-cover-stage"><img src={book.cover} alt={`${book.title}教材封面`} /></span><span className="journey-book-copy"><span className="journey-book-label">{book.label}</span><strong className="journey-book-title">{book.title}</strong><span className="journey-book-subtitle">{book.subtitle}</span><span className="journey-book-description">{book.description}</span></span></span>
        <span className="journey-book-topics">{book.topics.map(topic => <span key={topic}>{topic}</span>)}</span>
        <span className="journey-book-bottom"><span><b>{book.experiments}</b> 个交互实验</span><small>{book.detail}</small></span>
      </button></article>)}</section>
      <section className="journey-confirm-bar" aria-label="确认教材"><div className="journey-confirm-copy"><span className="journey-confirm-icon"><JourneyIcon name={selected ? 'check' : 'book'} /></span><div><strong>{selected ? `已选择 · ${selected.title}` : '先选择一本教材'}</strong><p>{selected ? `${selected.experiments} 个实验已准备好，下一步选择实验。` : '点击上方教材卡片，再进入实验目录。'}</p></div></div><div className="journey-confirm-actions">{onTeacherDashboard && <button type="button" className="journey-quiet" onClick={onTeacherDashboard}><JourneyIcon name="teacher" size={18} />教师工作台</button>}<button type="button" className="journey-primary" disabled={!selectedBook || isConfirming} onClick={handleConfirm}>{isConfirming ? <><span className="journey-spinner" />正在打开…</> : <>进入实验目录<JourneyIcon name="arrow" size={18} /></>}</button></div></section>
      <p className="journey-switch-hint">进入目录后，可以随时切换教材。</p>
    </main>
    <JourneyFooter />
  </div>
}
export default TextbookSelection
