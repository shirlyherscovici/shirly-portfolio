import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { PERSON, PROJECTS, SHELL, type Project } from './data'
import { go, href, useCanHover, useFlight, useTone } from './store'
import { Contact } from './Contact'

/* ---------- colour helpers ---------- */
function hex(c: string) {
  const n = parseInt(c.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(a: string, b: string, t: number) {
  const A = hex(a)
  const B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}
/** Colour at a continuous position along the project list */
function along(p: number, key: 'bg' | 'fg') {
  const n = PROJECTS.length
  const c = Math.max(0, Math.min(n - 1, p))
  const i = Math.floor(c)
  const j = Math.min(n - 1, i + 1)
  return mix(PROJECTS[i].colors[key], PROJECTS[j].colors[key], c - i)
}

function useViewport() {
  const [s, setS] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setS({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return s
}

const ease = [0.76, 0, 0.24, 1] as const

/* ---------- Name hero: outline that fills with the projects' colours ---------- */
function NameHero({ fg }: { fg: MotionValue<string> }) {
  const reduce = useReducedMotion()
  // One vivid stop per project, in strip order
  const gradient = 'linear-gradient(90deg, #ff7eb6, #3fae7a, #d9c39a, #e5323f)'
  const lines = ['Shirly', 'Herscovici']
  return (
    <section className="v2-namehero" aria-label="Intro">
      <h1 className="v2-bigname">
        {lines.map((l, i) => (
          <span key={l} className="v2-bigname-line">
            <span className="v2-bigname-outline">{l}</span>
            <motion.span
              className="v2-bigname-fill"
              aria-hidden="true"
              style={{ backgroundImage: gradient }}
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1.6, ease, delay: 0.25 + i * 0.35 }}
            >
              {l}
            </motion.span>
          </span>
        ))}
      </h1>
      <motion.div
        className="v2-namehero-foot"
        style={{ color: fg }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8, ease }}
      >
        <p className="v2-label">{PERSON.role}</p>
        <p className="v2-label v2-scrollhint">
          Selected work <span aria-hidden="true">↓</span>
        </p>
      </motion.div>
    </section>
  )
}

/* ---------- Tilt + light card for the active project ---------- */
function DepthCard({ project, active, onOpen }: { project: Project; active: boolean; onOpen: (el: HTMLElement) => void }) {
  const canHover = useCanHover()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 160, damping: 18 })
  const sy = useSpring(my, { stiffness: 160, damping: 18 })
  const live = canHover && !reduce && active
  const rotY = useTransform(sx, [0, 1], live ? [-7, 7] : [0, 0])
  const rotX = useTransform(sy, [0, 1], live ? [6, -6] : [0, 0])
  const imgX = useTransform(sx, [0, 1], live ? ['3%', '-3%'] : ['0%', '0%'])
  const imgY = useTransform(sy, [0, 1], live ? ['3%', '-3%'] : ['0%', '0%'])
  const glare = useTransform([sx, sy], ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.28), transparent 55%)`)
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      ref={ref}
      className="v2-card"
      style={{ rotateX: rotX, rotateY: rotY }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        mx.set((e.clientX - r.left) / r.width)
        my.set((e.clientY - r.top) / r.height)
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false)
        mx.set(0.5)
        my.set(0.5)
      }}
      animate={{ scale: live && hover ? 1.025 : 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <a
        href={href.project(project.slug)}
        className="v2-card-link"
        data-cursor={active ? 'View' : undefined}
        tabIndex={active ? 0 : -1}
        aria-label={`${project.name}, open project`}
        onClick={(e) => {
          e.preventDefault()
          onOpen(ref.current!)
        }}
        draggable={false}
      >
        <motion.img src={project.cover.src} alt={project.cover.alt} style={{ x: imgX, y: imgY, scale: 1.1 }} draggable={false} />
        {active && project.loop && <motion.video className="v2-card-loop" src={project.loop} autoPlay muted loop playsInline aria-hidden="true" style={{ x: imgX, y: imgY, scale: 1.1 }} />}
        {live && <motion.span className="v2-card-glare" style={{ backgroundImage: glare }} aria-hidden="true" />}
      </a>
    </motion.div>
  )
}

/* ---------- One frame of the film strip ---------- */
function Frame({
  project,
  index,
  p,
  step,
  w,
  h,
  active,
  onOpen,
  onPick,
}: {
  project: Project
  index: number
  p: MotionValue<number>
  step: number
  w: number
  h: number
  active: boolean
  onOpen: (el: HTMLElement, project: Project) => void
  onPick: (i: number) => void
}) {
  const d = useTransform(p, (v) => index - v)
  const y = useTransform(d, (v) => v * step)
  const scale = useTransform(d, (v) => 1 - Math.min(1, Math.abs(v)) * 0.22)
  const opacity = useTransform(d, (v) => 1 - Math.min(1, Math.abs(v)) * 0.55)
  const wordOpacity = useTransform(d, (v) => 1 - Math.min(1, Math.abs(v) * 1.6))
  const wordY = useTransform(d, (v) => v * 60)

  return (
    <motion.div className="v2-frame" style={{ y, scale, opacity, width: w, marginLeft: -w / 2, marginTop: -h / 2 }} onClick={() => !active && onPick(index)}>
      <div className="v2-frame-media" style={{ height: h }}>
        <DepthCard project={project} active={active} onOpen={(el) => onOpen(el, project)} />
      </div>
      <motion.a
        href={href.project(project.slug)}
        className="v2-frame-word"
        style={{ opacity: wordOpacity, y: wordY, color: project.colors.fg }}
        data-cursor="View"
        tabIndex={-1}
        aria-hidden={!active}
        onClick={(e) => {
          e.preventDefault()
          const el = (e.currentTarget.previousElementSibling as HTMLElement) ?? e.currentTarget
          onOpen(el, project)
        }}
      >
        {project.word}
      </motion.a>
    </motion.div>
  )
}

export function Home() {
  const reduce = useReducedMotion()
  const { setTone } = useTone()
  const { fly } = useFlight()
  const { w: vw, h: vh } = useViewport()
  const heroRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const n = PROJECTS.length
  const [idx, setIdx] = useState(0)
  const [inHero, setInHero] = useState(true)

  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const { scrollYProgress: stripP } = useScroll({ target: stripRef, offset: ['start start', 'end end'] })
  const raw = useTransform(stripP, (t) => t * (n - 1))
  const p = useSpring(raw, { stiffness: 120, damping: 24, mass: 0.6 })

  const bg = useTransform([heroP, p], ([h, pp]) => ((h as number) < 1 ? mix(SHELL.bg, PROJECTS[0].colors.bg, h as number) : along(pp as number, 'bg')))
  const fg = useTransform([heroP, p], ([h, pp]) => ((h as number) < 1 ? mix(SHELL.fg, PROJECTS[0].colors.fg, h as number) : along(pp as number, 'fg')))

  useMotionValueEvent(p, 'change', (v) => setIdx(Math.max(0, Math.min(n - 1, Math.round(v)))))
  useMotionValueEvent(heroP, 'change', (v) => setInHero(v < 0.5))

  useEffect(() => {
    setTone(inHero ? { bg: SHELL.bg, fg: SHELL.fg } : PROJECTS[idx].colors)
  }, [idx, inHero, setTone])

  useEffect(() => {
    document.documentElement.classList.add('v2-snap')
    return () => document.documentElement.classList.remove('v2-snap')
  }, [])

  const scrollToIndex = (i: number) => {
    const top = (stripRef.current?.offsetTop ?? 0) + i * vh
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // Arrow keys step through projects while the strip is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const s = stripRef.current
      if (!s) return
      const y = window.scrollY - s.offsetTop
      if (y < -vh * 0.5 || y > s.offsetHeight - vh * 0.5) return
      e.preventDefault()
      scrollToIndex(Math.max(0, Math.min(n - 1, idx + (e.key === 'ArrowDown' ? 1 : -1))))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const open = (el: HTMLElement, project: Project) => {
    const r = el.getBoundingClientRect()
    fly({ slug: project.slug, src: project.cover.src, rect: { x: r.left, y: r.top, w: r.width, h: r.height }, bg: project.colors.bg })
  }

  const mobile = vw < 760
  const w = mobile ? vw * 0.8 : Math.min(vw * 0.46, 660)
  const h = (w * 10) / 16
  const step = h + (mobile ? 90 : 130)

  return (
    <motion.main className="v2-home" style={{ backgroundColor: bg, color: fg }}>
      <div ref={heroRef}>
        <NameHero fg={fg} />
      </div>

      <section ref={stripRef} className="v2-strip" style={{ height: n * vh }} aria-label="Selected work">
        {PROJECTS.map((pr, i) => (
          <span key={pr.slug} className="v2-snapmark" style={{ top: i * vh }} aria-hidden="true" />
        ))}
        <div className="v2-stage">
          {PROJECTS.map((pr, i) => (
            <Frame key={pr.slug} project={pr} index={i} p={p} step={step} w={w} h={h} active={i === idx} onOpen={open} onPick={scrollToIndex} />
          ))}

          <nav className="v2-index" aria-label="Projects">
            {PROJECTS.map((pr, i) => (
              <button key={pr.slug} type="button" className={`v2-label ${i === idx ? 'on' : ''}`} onClick={() => scrollToIndex(i)} aria-current={i === idx}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span className="v2-index-name">{pr.name}</span>
              </button>
            ))}
          </nav>

          <motion.p key={idx} className="v2-label v2-stage-kind" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {PROJECTS[idx].kind}
          </motion.p>
        </div>
      </section>

      <Contact />
    </motion.main>
  )
}
