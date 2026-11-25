import { PERSON } from './data'
import { href, useTone, type Route } from './store'

/* ---------- Header ---------- */
export function Header({ route }: { route: Route }) {
  const { fg } = useTone()
  return (
    <header className="v2-header" style={{ color: fg }}>
      {route.page === 'home' ? (
        <a href={href.home} className="v2-label v2-link">
          {PERSON.name}
        </a>
      ) : (
        <a href={href.home} className="v2-label v2-link" data-cursor="Home">
          <span aria-hidden="true">←</span> Back home
        </a>
      )}
      <nav className="v2-nav">
        <a href={href.about} className="v2-label v2-link">
          About
        </a>
        <a href={PERSON.cv} target="_blank" rel="noopener noreferrer" className="v2-label v2-link">
          CV
        </a>
      </nav>
    </header>
  )
}
