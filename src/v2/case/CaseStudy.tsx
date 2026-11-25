/* Project case-study page. Keeps the hero geometry and the two transitions of the
 * previous page (home → project left wipe, next-project hand-over); the body of each
 * project is its own art-directed component in pages.tsx. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { PERSON, PROJECTS, coverPos, type Project } from '../data'
import { href, useFlight, useTone } from '../store'
import { heroBox } from '../geom'
import { Credits, LightboxProvider } from './blocks'
import { CASES } from './pages'
import './case.css'

const wipe = [0.76, 0, 0.24, 1] as const

/* The letters rise one by one out of a mask, each with a slight tilt that settles */
function Title({ word, filled, delay }: { word: string; filled: boolean; delay: number }) {
  return (
    <span className="cs-title-mask">
      {Array.from(word).map((ch, k) => (
        <motion.span
          key={k}
          className="cs-title-ch"
          initial={filled ? false : { y: '115%', rotate: 9 }}
          animate={{ y: '0%', rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay + k * 0.03 }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
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

  /* A new page always opens at its top, even if the old one was still leaving when the route changed */
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

  /* As you start scrolling, the cover grows out of its box until it fills the whole hero */
  const [geo, setGeo] = useState(() => ({ box: heroBox(), vw: window.innerWidth, vh: window.innerHeight }))
  useEffect(() => {
    // a phone's address bar showing or hiding only nudges the height: ignore that, or the clip jumps mid-scroll
    const on = () =>
      setGeo((g) =>
        g.vw === window.innerWidth && Math.abs(g.vh - window.innerHeight) < 120 ? g : { box: heroBox(), vw: window.innerWidth, vh: window.innerHeight },
      )
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  const grow = useTransform(scrollY, [0, geo.vh * 0.7], [0, 1], { clamp: true })
  const heroClip = useTransform(grow, (g) => {
    const { box, vw: w, vh: h } = geo
    const k = 1 - g
    return `inset(${box.y * k}px ${(w - box.x - box.w) * k}px ${(h - box.y - box.h) * k}px ${box.x * k}px round ${4 * k}px)`
  })
  const s0 = Math.max(geo.box.w / geo.vw, geo.box.h / geo.vh)
  const heroScale = useTransform(grow, (g) => s0 + (1 - s0) * g)
  const heroText = useTransform(grow, [0.35, 0.8], [1, 0])
  /* A cover whose focus is at the top (a logo, a title) is lowered so its top sits in the box,
   * then eases back as the picture grows to fill the screen */
  const topFocus = /(^|\s)0%$/.test(coverPos(project) ?? '')
  // on a portrait screen the cover is shown whole (contain, centred), so its visible height is the screen width × its own shape
  const [coverShape, setCoverShape] = useState(1)
  const portrait = geo.vh > geo.vw
  const shownH = portrait ? Math.min(geo.vh, geo.vw * coverShape) : geo.vh
  const heroShift = useTransform(grow, (g) => (topFocus && !c.heroVideo ? Math.max(0, (shownH * s0 - geo.box.h) / 2) * (1 - g) : 0))

  /* ---------- Next project hand-over ---------- */
  const [going, setGoing] = useState(false)
  const { scrollYProgress: near } = useScroll({ target: nextRef, offset: ['start end', 'end end'] })
  const nextFilter = useTransform(near, [0.35, 1], ['grayscale(1)', 'grayscale(0)'])

  /* The page colour follows the act in the middle of the screen; the header follows too */
  const dwell = useRef(0)
  useEffect(() => {
    // the acts never change while the page is open: find them once
    const acts = Array.from(document.querySelectorAll<HTMLElement>('.cs [data-act]'))
    let raf = 0
    const apply = () => {
      raf = 0
      if (going) return
      let cur: HTMLElement | null = null
      for (const a of acts) if (a.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = a
      const tone = cur ? { bg: cur.dataset.bg!, fg: cur.dataset.fg! } : c.acts
      setAct((p) => (p && p.bg === tone.bg && p.fg === tone.fg ? p : tone))
      const nr = nextRef.current?.getBoundingClientRect()
      const top = nr?.top ?? Infinity
      // The next project fills the screen: hand over to it once the visitor rests there,
      // so a single flick on a phone doesn't navigate by accident
      if (nr && nr.top <= 2 && nr.bottom <= window.innerHeight + 2) {
        if (!dwell.current) dwell.current = window.setTimeout(() => setGoing(true), 420)
        return
      }
      if (dwell.current) {
        window.clearTimeout(dwell.current)
        dwell.current = 0
      }
      if (top < 60) toneTo(next.colors)
      else if (window.scrollY > window.innerHeight * 0.92) toneTo(tone)
      else toneTo(hero)
    }
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    apply()
    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(dwell.current)
      dwell.current = 0
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
    }
  }, [hero, next, going, setTone, c]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!going) return
    // scrolling back up during the wipe cancels it
    const back = () => {
      setGoing(false)
      window.scrollBy(0, -window.innerHeight * 0.35)
    }
    let ty = 0
    const tStart = (e: TouchEvent) => {
      ty = e.touches[0]?.clientY ?? 0
    }
    const stop = (e: Event) => {
      e.preventDefault()
      if (e instanceof WheelEvent && e.deltaY < -12) back()
      else if (e instanceof TouchEvent && (e.touches[0]?.clientY ?? 0) - ty > 40) back()
    }
    window.addEventListener('touchstart', tStart, { passive: true })
    const keys = (e: KeyboardEvent) => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(e.key)) {
        e.preventDefault()
        back()
      } else if (['ArrowDown', 'PageDown', 'End', ' '].includes(e.key)) e.preventDefault()
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
      window.removeEventListener('touchstart', tStart)
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
        <div className="cs-hero-wrap">
        <section className="v2-hero" style={{ background: hero.bg, color: hero.fg, ['--halo' as string]: hero.over ? hero.fg : hero.bg, ['--over' as string]: hero.over ?? hero.fg }}>
          <motion.div className="cs-hero-full" style={{ clipPath: heroClip }}>
            <motion.div className={`cs-hero-img${topFocus ? ' is-top' : ''}`} style={{ scale: heroScale, y: heroShift }}>
            {c.heroVideo ? (
              <video ref={heroVid} src={c.heroVideo} poster={project.cover.src} autoPlay muted loop playsInline aria-label={project.cover.alt} />
            ) : (
              <motion.img
                src={project.cover.src}
                alt={project.cover.alt}
                style={{ objectPosition: coverPos(project) }}
                onLoad={(e) => e.currentTarget.naturalWidth && setCoverShape(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
                initial={via ? false : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
                transition={{ duration: 1.1, ease: wipe }}
              />
            )}
            </motion.div>
          </motion.div>
          {/* Solid under the cover, outline over it: the title reads filled on the
              background and hollow where it crosses the picture */}
          <motion.h1 className="v2-hero-title cs-title-under" style={{ opacity: heroText }} aria-label={project.word}>
            <Title word={project.word} filled={via === 'next'} delay={via === 'home' ? 0.75 : 0.35} />
          </motion.h1>
          {/* the outline copy is clipped to the cover itself, so it only ever shows over the picture */}
          <motion.div className="cs-title-over-wrap" style={{ clipPath: heroClip }} aria-hidden="true">
            <motion.p className="v2-hero-title cs-title-over" style={{ opacity: heroText }}>
              <Title word={project.word} filled={via === 'next'} delay={via === 'home' ? 0.75 : 0.35} />
            </motion.p>
          </motion.div>
          <motion.p className="v2-label v2-hero-kind" style={{ opacity: heroText }}>
            {project.kind}
          </motion.p>
          <button
            type="button"
            className="v2-scrollcue"
            aria-label="Scroll to project"
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.75, behavior: reduce ? 'auto' : 'smooth' })}
            style={{ borderColor: hero.fg }}
          >
            <motion.span style={{ background: hero.fg }} animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} />
          </button>
        </section>
        </div>

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
              <img src={next.cover.src} alt="" loading="lazy" style={{ objectPosition: coverPos(next) }} />
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
