import { useState } from 'react'
import { JourneyFooter, JourneyHeader, JourneyIcon } from './journey/JourneyUI'

function AuthPage({ onSubmit, onBack }) {
  const [identity, setIdentity] = useState('student')
  const [formData, setFormData] = useState({ account: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(previous => ({ ...previous, [field]: value }))
    setErrors(previous => { const next = { ...previous }; delete next[field]; delete next.form; return next })
  }
  const handleSubmit = async event => {
    event.preventDefault()
    if (isSubmitting) return
    const nextErrors = {}
    if (!formData.account.trim()) nextErrors.account = '请输入账号'
    if (!formData.password) nextErrors.password = '请输入密码'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setIsSubmitting(true)
    try {
      await onSubmit({ identity, account: formData.account.trim() })
    } catch (error) {
      setErrors({ form: error.message || '进入失败，请重试。' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return <div className="journey-page journey-auth">
    <JourneyHeader step={1} onBack={onBack} backLabel="返回首页" />
    <main className="journey-auth-layout">
      <section className="journey-auth-story">
        <div className="journey-eyebrow"><span /> EXPLORE WITH GEOLAB</div>
        <h1>看见地理，<br /><em>理解变化。</em></h1>
        <p>把课本里的抽象规律，变成可以观察、<br className="journey-desktop-break" />操作与推演的地理现场。</p>
        <div className="journey-earth" aria-hidden="true"><span className="journey-earth-orbit" /><img src="/picture/geosim-home-earth.png" alt="" /><span className="journey-earth-coordinate">30° N / 120° E</span><span className="journey-earth-caption">从一个问题，走进地球系统</span></div>
        <div className="journey-story-stats"><div><strong>16</strong><span>交互实验</span></div><div><strong>02</strong><span>教材模块</span></div><div><strong>AI</strong><span>随时伴学</span></div></div>
      </section>
      <section className="journey-login-card" aria-labelledby="journey-login-title">
        <div className="journey-card-kicker">你的学习旅程，从这里开始</div>
      <h2 id="journey-login-title">欢迎进入 GeoLab高中地理可验证仿真实验平台</h2>
        <p className="journey-login-description">选择身份，开启本次探索。</p>
        <fieldset className="journey-identity"><legend>体验身份</legend><div>{[['student', '学生', 'user'], ['teacher', '教师', 'teacher']].map(([id, label, icon]) => <button type="button" key={id} aria-pressed={identity === id} className={identity === id ? 'selected' : ''} onClick={() => setIdentity(id)}><JourneyIcon name={icon} size={19} />{label}{identity === id && <JourneyIcon name="check" size={15} />}</button>)}</div></fieldset>
        <form onSubmit={handleSubmit} className="journey-form" noValidate>
          {errors.form && <p role="alert" className="journey-error">{errors.form}</p>}
          <div className="journey-field"><label htmlFor="demo-account">账号</label><input id="demo-account" type="text" placeholder="输入你的账号" autoComplete="username" value={formData.account} onChange={e => handleInputChange('account', e.target.value)} aria-invalid={Boolean(errors.account)} aria-describedby={errors.account ? 'account-error' : undefined} required />{errors.account && <span className="journey-error" id="account-error" role="alert">{errors.account}</span>}</div>
          <div className="journey-field"><label htmlFor="demo-password">密码</label><div className="journey-password"><input id="demo-password" type={showPassword ? 'text' : 'password'} placeholder="输入你的密码" autoComplete="new-password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} required /><button type="button" aria-label={showPassword ? '隐藏密码' : '显示密码'} aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}><JourneyIcon name={showPassword ? 'eyeOff' : 'eye'} size={19} /></button></div>{errors.password && <span className="journey-error" id="password-error" role="alert">{errors.password}</span>}</div>
          <button type="submit" className="journey-primary journey-login-submit" disabled={isSubmitting}>{isSubmitting ? <><span className="journey-spinner" />正在进入…</> : <>继续，选择教材<JourneyIcon name="arrow" size={19} /></>}</button>
        </form>
        <p className="journey-demo-note"><span />体验模式 · 任意账号和密码均可进入<br /><small>信息仅用于本次体验，不会上传。</small></p>
      </section>
    </main>
    <JourneyFooter />
  </div>
}
export default AuthPage
