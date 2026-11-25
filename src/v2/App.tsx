import { useEffect, useLayoutEffect, useRef } from 'react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { PROJECTS, SHELL, coverPos } from './data'
import { FlightProvider, ToneProvider, go, href, useFlight, useRoute, useTone } from './store'
import { Home } from './Home'
import { CaseStudy as ProjectPage } from './case/CaseStudy'
import { About } from './About'
import { Header } from './Living'
import { heroBox } from './geom'

const ease = [0.76, 0, 0.24, 1] as const

/** Opening a project from home: the hero colour wipes in from the left while the
 *  clicked cover flies to its place in the hero. A next-project hand-over has
 *  already played its move on the old page, so it only swaps pages. */
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
    }, flight.handoff ? 0 : 900)
    return () => window.clearTimeout(t)
  }, [flight])

  return (
    <AnimatePresence>
      {flight && !flight.handoff && (
        <motion.div key={flight.slug} className="v2-flight" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} aria-hidden="true">
          <motion.div
            className="v2-flight-bg"
            style={{ background: flight.bg }}
            initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{ duration: 0.85, ease }}
          />
          <motion.img
            src={flight.src}
            alt=""
            className="v2-flight-img"
            style={{ objectPosition: (() => { const p = PROJECTS.find((x) => x.slug === flight.slug); return p ? coverPos(p) : undefined })() }}
            initial={{ left: flight.rect.x, top: flight.rect.y, width: flight.rect.w, height: flight.rect.h }}
            animate={(() => {
              const t = heroBox()
              return { left: t.x, top: t.y, width: t.w, height: t.h }
            })()}
            transition={{ duration: 0.85, ease, delay: 0.05 }}
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

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
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
      <FlightLayer />
    </>
  )
}

export default function App() {
  return (
    /* Visitors who ask for less motion get it: framer drops transform and layout animations */
    <MotionConfig reducedMotion="user">
      <ToneProvider>
        <FlightProvider>
          <Shell />
        </FlightProvider>
      </ToneProvider>
    </MotionConfig>
  )
}
