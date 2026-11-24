import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PROJECTS, SHELL } from './data'
import { FlightProvider, ToneProvider, go, href, useFlight, useRoute, useTone } from './store'
import { Home } from './Home'
import { ProjectPage } from './ProjectPage'
import { About } from './About'
import { Cursor, FaceBadge, Header } from './Living'

const ease = [0.76, 0, 0.24, 1] as const

/** Where the cover sits on a project page hero (mirrors .v2-hero CSS) */
function heroTarget() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const w = vw < 760 ? vw * 0.84 : Math.min(vw * 0.52, 760)
  const h = (w * 10) / 16
  const font = Math.max(64, Math.min(vw * 0.13, 200))
  const gap = Math.max(12, Math.min(vh * 0.03, 28))
  const total = 40 + h + gap + font * 0.95
  return { x: (vw - w) / 2, y: (vh - total) / 2 + 40, w, h }
}

/** Shared-image transition: the clicked cover flies into the project hero
 *  while the project's colour floods the screen. */
function FlightLayer() {
  const { flight } = useFlight()
  const navigated = useRef<string | null>(null)
  useEffect(() => {
    if (!flight) {
      navigated.current = null
      return
    }
    const t = window.setTimeout(() => {
      navigated.current = flight.slug
      go(href.project(flight.slug))
    }, 720)
    return () => window.clearTimeout(t)
  }, [flight])

  return (
    <AnimatePresence>
      {flight && (
        <motion.div key={flight.slug} className="v2-flight" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} aria-hidden="true">
          <motion.div
            className="v2-flight-bg"
            style={{ background: flight.bg }}
            initial={{ clipPath: `inset(${flight.rect.y}px ${window.innerWidth - flight.rect.x - flight.rect.w}px ${window.innerHeight - flight.rect.y - flight.rect.h}px ${flight.rect.x}px)` }}
            animate={{ clipPath: 'inset(0px 0px 0px 0px)' }}
            transition={{ duration: 0.7, ease }}
          />
          <motion.img
            src={flight.src}
            alt=""
            className="v2-flight-img"
            initial={{ left: flight.rect.x, top: flight.rect.y, width: flight.rect.w, height: flight.rect.h }}
            animate={(() => {
              const t = heroTarget()
              return { left: t.x, top: t.y, width: t.w, height: t.h }
            })()}
            transition={{ duration: 0.7, ease }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Shell() {
  const route = useRoute()
  const reduce = useReducedMotion()
  const { bg } = useTone()
  const { flight } = useFlight()
  const key = route.page === 'project' ? `p-${route.slug}` : route.page

  useEffect(() => {
    window.scrollTo(0, 0)
    const proj = route.page === 'project' ? PROJECTS.find((p) => p.slug === route.slug) : null
    document.title = proj ? `${proj.name} | Shirly Herscovici` : route.page === 'about' ? 'About | Shirly Herscovici' : 'Shirly Herscovici | Motion, AI & graphic designer'
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.style.background = bg
  }, [bg])

  let page: React.ReactNode
  if (route.page === 'project') {
    const proj = PROJECTS.find((p) => p.slug === route.slug)
    page = proj ? <ProjectPage project={proj} /> : <Home />
  } else if (route.page === 'about') {
    page = <About />
  } else {
    page = <Home />
  }

  const viaFlight = !!flight
  return (
    <>
      <Header route={route} />
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={reduce || viaFlight ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce || viaFlight ? undefined : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: route.page === 'home' ? SHELL.bg : undefined }}
        >
          {page}
        </motion.div>
      </AnimatePresence>
      <FaceBadge />
      <Cursor />
      <FlightLayer />
    </>
  )
}

export default function App() {
  return (
    <ToneProvider>
      <FlightProvider>
        <Shell />
      </FlightProvider>
    </ToneProvider>
  )
}
