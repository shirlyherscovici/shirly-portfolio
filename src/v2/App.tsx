import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PROJECTS } from './data'
import { PaletteProvider, ToneProvider, useRoute, useTone } from './store'
import { Intro } from './Intro'
import { Home } from './Home'
import { ProjectPage } from './ProjectPage'
import { About } from './About'
import { Cursor, FaceBadge, Header, PaletteButton } from './Living'

function seenIntro() {
  try {
    return sessionStorage.getItem('sh-intro') === '1'
  } catch {
    return false
  }
}

function Shell() {
  const route = useRoute()
  const reduce = useReducedMotion()
  const { bg } = useTone()
  const [intro, setIntro] = useState(() => !seenIntro() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const homeIndex = useRef(0)

  const endIntro = useCallback(() => {
    setIntro(false)
    try {
      sessionStorage.setItem('sh-intro', '1')
    } catch {
      /* storage unavailable */
    }
  }, [])

  const key = route.page === 'project' ? `p-${route.slug}` : route.page

  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.classList.toggle('v2-lock', route.page === 'home')
    const proj = route.page === 'project' ? PROJECTS.find((p) => p.slug === route.slug) : null
    document.title = proj ? `${proj.name} | Shirly Herscovici` : route.page === 'about' ? 'About | Shirly Herscovici' : 'Shirly Herscovici | Motion, AI & graphic designer'
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.style.background = bg
  }, [bg])

  let page: React.ReactNode
  if (route.page === 'project') {
    const proj = PROJECTS.find((p) => p.slug === route.slug)
    page = proj ? <ProjectPage project={proj} /> : <Home start={0} />
    if (proj) homeIndex.current = PROJECTS.indexOf(proj)
  } else if (route.page === 'about') {
    page = <About />
  } else {
    page = <Home start={homeIndex.current} onIndex={(i) => (homeIndex.current = i)} />
  }

  return (
    <>
      <Header route={route} />
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {page}
        </motion.div>
      </AnimatePresence>
      <FaceBadge />
      <PaletteButton />
      <Cursor />
      <AnimatePresence>{intro && <Intro onDone={endIntro} />}</AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <PaletteProvider>
      <ToneProvider>
        <Shell />
      </ToneProvider>
    </PaletteProvider>
  )
}
