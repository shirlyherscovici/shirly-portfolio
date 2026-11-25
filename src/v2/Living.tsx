import { useEffect, useState } from 'react'
import { PERSON } from './data'
import { href, useTone, type Route } from './store'

/* ---------- Header ---------- */
export function Header({ route }: { route: Route }) {
  const { fg, bg } = useTone()
  // off the home page, once the hero is passed the header gets a bar in the page colour so it never sits on content
  const [solid, setSolid] = useState(false)
  const home = route.page === 'home'
  useEffect(() => {
    if (home) {
      setSolid(false)
      return
    }
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.9)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [home])
  return (
    <header className={solid ? 'v2-header is-solid' : 'v2-header'} style={{ color: fg, ['--hbg' as string]: bg }}>
      {route.page === 'home' ? (
        <div className="v2-brand">
          <h1 className="v2-label">
            <a href={href.home} className="v2-link">
              {PERSON.name}
            </a>
          </h1>
          <p className="v2-brand-role">{PERSON.role}</p>
        </div>
      ) : (
        <a href={href.home} className="v2-label v2-link" data-cursor="Home">
          <span aria-hidden="true">←</span> Back home
        </a>
      )}
      <nav className="v2-nav">
        <a href={href.about} className="v2-label v2-link">
          About
        </a>
        <a href={PERSON.cv} target="_blank" rel="noopener noreferrer" className="v2-label v2-link" aria-label="CV, PDF, opens in a new tab">
          CV
        </a>
        <a href={`mailto:${PERSON.email}`} className="v2-label v2-link" aria-label={`Contact, email ${PERSON.email}`}>
          Contact
        </a>
      </nav>
    </header>
  )
}
