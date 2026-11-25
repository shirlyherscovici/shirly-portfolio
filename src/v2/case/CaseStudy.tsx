/* Project case-study page. Keeps the hero geometry and the two transitions of the
 * previous page (home → project left wipe, next-project hand-over); the body of each
 * project is its own art-directed component in pages.tsx. */
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { PERSON, PROJECTS, type Project } from '../data'
import { href, useFlight, useTone } from '../store'
import { Credits, LightboxProvider } from './blocks'
import { CASES } from './pages'
import './case.css'

const wipe = [0.76, 0, 0.24, 1] as const

function Title({ word, filled, delay }: { word: string; filled: boolean; delay: number }) {
  return (
    <>
      <span className="v2-title-outline" aria-hidden="true">
        {word}
      </span>
      <motion.span
        className="v2-title-fill"
        initial={filled ? false : { clipPath: 'inset(-20% 100% -30% 0%)' }}
        animate={{ clipPath: 'inset(-20% 0% -30% 0%)' }}
        transition={{ duration: 1.3, ease: wipe, delay }}
      >
        {word}
      </motion.span>
    </>
  )
}

export function CaseStudy({ project }: { project: Project }) {
  const { setTone } = useTone()
  const { flight, fly, land } = useFlight()
  const reduce = useReducedMotion()
  const [via] = useState<'home' | 'next' | null>(() => (flight?.slug === project.slug ? (flight.handoff ? 'next' : 'home') : null))
  const i = PROJECTS.findIndex((p) => p.slug === project.slug)
  const next = PROJECTS[(i + 1) % PROJECTS.length]
  const hero = project.hero
  const c = CASES[project.slug]
  const nextRef = useRef<HTMLElement>(null)
  const [act, setAct] = useState<{ bg: string; fg: string } | null>(null)
  const heroVid = useRef<HTMLVideoElement>(null)
  /* Only tell the header about a tone when it actually changes, not on every scroll tick */
  const lastTone = useRef('')
  const toneTo = (t: { bg: string; fg: string }) => {
    const k = t.bg + t.fg
    if (k === lastTone.current) return
    lastTone.current = k
    setTone(t)
  }

  /* The hero clip stops decoding once the story covers it */
  useEffect(() => {
    const el = heroVid.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!via) return
    const t = window.setTimeout(land, 80)
    return () => window.clearTimeout(t)
  }, [via, land])

  const { scrollY } = useScroll()
  const vh = window.innerHeight
  const mediaY = useTransform(scrollY, [0, vh], [0, reduce ? 0 : -vh * 0.14])

  /* ---------- Next project hand-over ---------- */
  const [going, setGoing] = useState(false)
  const { scrollYProgress: near } = useScroll({ target: nextRef, offset: ['start end', 'end end'] })
  const nextFilter = useTransform(near, [0.35, 1], ['grayscale(1)', 'grayscale(0)'])

  /* The page colour follows the act in the middle of the screen; the header follows too */
  useEffect(() => {
    const apply = () => {
      if (going) return
      const acts = document.querySelectorAll<HTMLElement>('.cs [data-act]')
      let cur: HTMLElement | null = null
      for (const a of acts) if (a.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = a
      const tone = cur ? { bg: cur.dataset.bg!, fg: cur.dataset.fg! } : c.acts
      setAct((p) => (p && p.bg === tone.bg && p.fg === tone.fg ? p : tone))
      const nr = nextRef.current?.getBoundingClientRect()
      const top = nr?.top ?? Infinity
      // The next project fills the screen: hand over to it
      if (nr && nr.top <= 2 && nr.bottom <= window.innerHeight + 2) {
        setGoing(true)
        return
      }
      if (top < 60) toneTo(next.colors)
      else if (window.scrollY > window.innerHeight * 0.92) toneTo(tone)
      else toneTo(hero)
    }
    apply()
    window.addEventListener('scroll', apply, { passive: true })
    window.addEventListener('resize', apply)
    return () => {
      window.removeEventListener('scroll', apply)
      window.removeEventListener('resize', apply)
    }
  }, [hero, next, going, setTone, c]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!going) return
    const stop = (e: Event) => e.preventDefault()
    const keys = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) e.preventDefault()
    }
    window.addEventListener('wheel', stop, { passive: false })
    window.addEventListener('touchmove', stop, { passive: false })
    window.addEventListener('keydown', keys)
    window.scrollTo(0, document.documentElement.scrollHeight)
    setTone(next.hero)
    const here = window.location.hash
    const t = window.setTimeout(() => {
      // The visitor pressed Back while the wipe was running: stay where they went
      if (window.location.hash !== here) return
      fly({ slug: next.slug, src: next.cover.src, rect: { x: 0, y: 0, w: 0, h: 0 }, bg: next.hero.bg, handoff: true })
    }, 1250)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('keydown', keys)
    }
  }, [going]) // eslint-disable-line react-hooks/exhaustive-deps

  const mobile = window.innerWidth < 760
  const lean = mobile
    ? { x: '6vw', rotateX: 4, rotateY: -12, rotateZ: -5, skewX: -4, scale: 0.92 }
    : { x: '20vw', rotateX: 8, rotateY: -24, rotateZ: -7, skewX: -8, scale: 0.9 }
  const flat = { x: '0vw', rotateX: 0, rotateY: 0, rotateZ: 0, skewX: 0, scale: 1 }
  const tone = act ?? c.acts

  return (
    <LightboxProvider>
      <div className={`cs v2-project cs-${c.theme}`}>
        {/* ---------- Hero (same box as the home wipe lands on) ---------- */}
        <section className="v2-hero" style={{ background: hero.bg, color: hero.fg }}>
          <motion.div className="v2-hero-media" style={{ y: mediaY }}>
            {c.heroVideo ? (
              <video ref={heroVid} src={c.heroVideo} poster={project.cover.src} autoPlay muted loop playsInline aria-label={project.cover.alt} />
            ) : (
              <motion.img
                src={project.cover.src}
                alt={project.cover.alt}
                initial={via ? false : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
                transition={{ duration: 1.1, ease: wipe }}
              />
            )}
          </motion.div>
          <h1 className="v2-hero-title">
            <Title word={project.word} filled={via === 'next'} delay={via === 'home' ? 0.75 : 0.35} />
          </h1>
          <p className="v2-label v2-hero-kind">{project.kind}</p>
          <button
            type="button"
            className="v2-scrollcue"
            aria-label="Scroll to project"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: reduce ? 'auto' : 'smooth' })}
            style={{ borderColor: hero.fg }}
          >
            <motion.span style={{ background: hero.fg }} animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} />
          </button>
        </section>

        {/* ---------- The story; its background follows the act on screen ---------- */}
        <article className="cs-body" style={{ background: tone.bg, color: tone.fg }}>
          {c.body}
          <Credits items={c.credits} email={PERSON.email} />
          <p className="cs-allwork">
            <a href={href.home} className="v2-label v2-link">
              <span aria-hidden="true">←</span> All work
            </a>
          </p>
        </article>

        {/* ---------- Next project ---------- */}
        <section ref={nextRef} className="v2-next" style={{ background: next.colors.bg }} onClick={() => setGoing(true)} aria-label={`Next project: ${next.name}`}>
          <motion.div
            className="v2-next-wipe"
            style={{ background: next.hero.bg }}
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={going ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.6, ease: wipe }}
          />
          <motion.p className="v2-label v2-next-label" style={{ color: next.colors.fg }} animate={{ opacity: going ? 0 : 1 }}>
            Next project
          </motion.p>
          <div className="v2-next-stage">
            <motion.div
              className="v2-hero-media"
              style={{ filter: going ? 'grayscale(0)' : nextFilter }}
              initial={lean}
              animate={going ? flat : lean}
              transition={{ duration: 0.9, ease: wipe, delay: 0.25 }}
            >
              <img src={next.cover.src} alt="" loading="lazy" />
            </motion.div>
          </div>
          <motion.h2
            className="v2-hero-title"
            initial={{ color: next.colors.fg }}
            animate={{ color: going ? next.hero.fg : next.colors.fg }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <span className="v2-title-fill v2-title-solid">{next.word}</span>
          </motion.h2>
        </section>
      </div>
    </LightboxProvider>
  )
}
