import { useLayoutEffect } from 'react'

export function JourneyIcon({ name, size = 20, ...props }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    back: <><path d="M19 12H5m6-6-6 6 6 6" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></>,
    book: <><path d="M12 5v16M3 4c3-1 6-1 9 1 3-2 6-2 9-1v15c-3-1-6-1-9 1-3-2-6-2-9-1Z" /></>,
    teacher: <><path d="M9 3h12v13h-5M4 20v-4a4 4 0 0 1 8 0v4M14 7h3m-3 4h3" /><circle cx="8" cy="7" r="3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18M10 5a11 11 0 0 1 12 7 16 16 0 0 1-3 4M6 6a16 16 0 0 0-4 6s3.5 7 10 7c2 0 4-.7 5.5-1.7" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" /></>,
    air: <><path d="M3 8h13a3 3 0 1 0-3-3M3 12h17M3 16h10a3 3 0 1 1-3 3" /></>,
    land: <><path d="m2 20 7-14 6 10 3-6 4 10ZM6 12l3 2 3-2" /></>,
    water: <><path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13ZM8 16a4 4 0 0 0 4 3" /></>,
    spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.globe}</svg>
}

export function JourneyHeader({ step, onBack, backLabel = '返回', userInfo }) {
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])
  return <header className="journey-header">
      <div className="journey-brand"><img src="/picture/GEOSIMlogo.png" alt="" /><div><strong>GeoLab</strong><small>高中地理可验证仿真实验平台</small></div></div>
    <nav className="journey-progress" aria-label="学习入口流程"><ol>{['登录账号', '选择教材', '探索实验'].map((label, i) => <li key={label} className={i + 1 === step ? 'current' : i + 1 < step ? 'done' : ''} aria-current={i + 1 === step ? 'step' : undefined}><span>{i + 1 < step ? <JourneyIcon name="check" size={13} /> : String(i + 1).padStart(2, '0')}</span><b>{label}</b></li>)}</ol></nav>
    <div className="journey-header-actions">{userInfo && <span className="journey-user" title={userInfo.name}><span>{userInfo.name?.slice(0, 1)?.toUpperCase() || 'G'}</span><b>{userInfo.name}</b></span>}<button type="button" className="journey-quiet" onClick={onBack}><JourneyIcon name="back" size={16} /><span>{backLabel}</span></button></div>
  </header>
}

export function JourneyFooter() {
  return <footer className="journey-footer"><span>GeoLab · 让地理规律被看见并可验证</span><span>观察 / 推演 / 核验</span></footer>
}
