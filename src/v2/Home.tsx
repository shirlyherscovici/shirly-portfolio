import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion'
import { PERSON, PROJECTS, SHELL, type Project } from './data'
import { href, useCanHover, useFlight, useTone } from './store'
import { Contact } from './Contact'

/* ---------- colour helpers: mix in OKLab so blends stay clean (no muddy greys) ---------- */
function toLin(c: number) {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
function fromLin(c: number) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
  return Math.round(Math.max(0, Math.min(1, v)) * 255)
}
function toLab(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = toLin((n >> 16) & 255)
  const g = toLin((n >> 8) & 255)
  const b = toLin(n & 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
function fromLab([L, A, B]: number[]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  return `rgb(${fromLin(r)},${fromLin(g)},${fromLin(b)})`
}
function mix(a: string, b: string, t: number) {
  const A = toLab(a)
  const B = toLab(b)
  return fromLab(A.map((v, i) => v + (B[i] - v) * t))
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
/** Each project holds its colour; the switch happens quickly around the midpoint */
function along(p: number, key: 'bg' | 'fg') {
  const n = PROJECTS.length
  const c = Math.max(0, Math.min(n - 1, p))
  const i = Math.floor(c)
  const j = Math.min(n - 1, i + 1)
  return mix(PROJECTS[i].colors[key], PROJECTS[j].colors[key], smooth(0.3, 0.7, c - i))
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
/** Scroll distance (in viewport heights) the intro takes before the strip starts moving */
const INTRO = 0.7

/* ---------- Name: thin outline that fills with colour on load ---------- */
function NameBlock({ q }: { q: MotionValue<number> }) {
  const y = useTransform(q, [0, 1], ['0vh', '-28vh'])
  const opacity = useTransform(q, [0, 0.75], [1, 0])
  const fill = PROJECTS[0].colors.fg
  const lines = ['Shirly', 'Herscovici']
  return (
    <motion.div className="v2-name" style={{ y, opacity }}>
      <h1 className="v2-bigname">
        {lines.map((l, i) => (
          <span key={l} className="v2-bigname-line">
            <span className="v2-bigname-outline">{l}</span>
            <motion.span
              className="v2-bigname-fill"
              aria-hidden="true"
              style={{ color: fill }}
              initial={{ clipPath: 'inset(-20% 100% -30% 0%)' }}
              animate={{ clipPath: 'inset(-20% 0% -30% 0%)' }}
              transition={{ duration: 1.5, ease, delay: 0.3 + i * 0.3 }}
            >
              {l}
            </motion.span>
          </span>
        ))}
      </h1>
      <motion.p
        className="v2-label v2-name-role"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8, ease }}
      >
        {PERSON.role}
      </motion.p>
    </motion.div>
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

/** Neighbours are this much smaller than the frame you are on */
const SIDE = 0.68
const sizeAt = (d: number) => 1 - Math.min(1, Math.abs(d)) * (1 - SIDE)

/** Vertical centre of every frame, relative to the screen centre, for a strip position p.
 *  Frames are stacked one under another with a fixed gap, using their current (scaled) heights,
 *  so the strip never overlaps or opens holes while the sizes change. */
function strip(p: number, hs: number[], gap: number) {
  const centres: number[] = []
  let top = 0
  hs.forEach((h, k) => {
    const H = h * sizeAt(k - p)
    centres.push(top + H / 2)
    top += H + gap
  })
  const i = Math.max(0, Math.min(hs.length - 1, Math.floor(p)))
  const j = Math.min(hs.length - 1, i + 1)
  const focus = centres[i] + (centres[j] - centres[i]) * (p - i)
  return centres.map((c) => c - focus)
}

/* ---------- One frame of the film strip ---------- */
function Frame({
  project,
  index,
  p,
  q,
  hs,
  gap,
  drop,
  w,
  active,
  onOpen,
  onPick,
}: {
  project: Project
  index: number
  p: MotionValue<number>
  q: MotionValue<number>
  hs: number[]
  gap: number
  drop: number
  w: number
  active: boolean
  onOpen: (el: HTMLElement, project: Project) => void
  onPick: (i: number) => void
}) {
  const h = hs[index]
  // While the intro is on screen the whole strip sits lower, so the first cover peeks under the name
  const y = useTransform([p, q], ([v, qq]) => strip(v as number, hs, gap)[index] + (1 - (qq as number)) * drop)
  const scale = useTransform(p, (v) => sizeAt(index - v))
  const opacity = useTransform(p, (v) => 1 - Math.min(1, Math.abs(index - v)) * 0.5)
  const wordOpacity = useTransform([p, q], ([v, qq]) => (1 - Math.min(1, Math.abs(index - (v as number)) * 1.8)) * smooth(0.35, 0.9, qq as number))
  const wordY = useTransform(p, (v) => (index - v) * 40)

  return (
    <motion.div className="v2-frame" style={{ y, scale, opacity, width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 }} onClick={() => !active && onPick(index)}>
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
  const stripRef = useRef<HTMLDivElement>(null)
  const framesRef = useRef<HTMLDivElement>(null)
  const warpRef = useRef<SVGFEDisplacementMapElement>(null)
  const n = PROJECTS.length
  const span = INTRO + n - 1
  const [idx, setIdx] = useState(0)
  const [inIntro, setInIntro] = useState(true)

  const { scrollYProgress } = useScroll({ target: stripRef, offset: ['start start', 'end end'] })
  const s = useTransform(scrollYProgress, (t) => t * span)
  const q = useTransform(s, (v) => Math.min(1, v / INTRO))
  const raw = useTransform(s, (v) => Math.max(0, v - INTRO))
  const p = useSpring(raw, { stiffness: 120, damping: 24, mass: 0.6 })

  const bg = useTransform([q, p], ([qq, pp]) => ((qq as number) < 1 ? mix(SHELL.bg, PROJECTS[0].colors.bg, smooth(0, 1, qq as number)) : along(pp as number, 'bg')))
  const fg = useTransform([q, p], ([qq, pp]) => ((qq as number) < 1 ? mix(SHELL.fg, PROJECTS[0].colors.fg, smooth(0, 1, qq as number)) : along(pp as number, 'fg')))

  useMotionValueEvent(p, 'change', (v) => setIdx(Math.max(0, Math.min(n - 1, Math.round(v)))))
  useMotionValueEvent(q, 'change', (v) => setInIntro(v < 0.5))

  useEffect(() => {
    setTone(inIntro ? { bg: SHELL.bg, fg: SHELL.fg } : PROJECTS[idx].colors)
  }, [idx, inIntro, setTone])

  // The header repeats the name, so it stays hidden while the big name is on screen
  useEffect(() => {
    document.documentElement.classList.toggle('v2-intro', inIntro)
  }, [inIntro])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('v2-snap')
    return () => root.classList.remove('v2-snap', 'v2-intro')
  }, [])

  /* Scroll-speed distortion: the covers ripple and lean while the strip moves, and settle when it stops */
  const vel = useVelocity(p)
  const lean = useTransform(vel, (v) => `${Math.max(-5, Math.min(5, -v * 1.6))}deg`)
  useMotionValueEvent(vel, 'change', (v) => {
    const amt = Math.min(46, Math.abs(v) * (reduce ? 8 : 16))
    warpRef.current?.setAttribute('scale', amt.toFixed(1))
    if (framesRef.current) framesRef.current.style.filter = amt > 0.6 ? 'url(#v2-warp)' : ''
  })

  const scrollToIndex = (i: number) => {
    const top = (stripRef.current?.offsetTop ?? 0) + (INTRO + i) * vh
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // Arrow keys step through projects while the strip is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const st = stripRef.current
      if (!st) return
      const y = window.scrollY - st.offsetTop
      if (y > st.offsetHeight - vh * 0.5) return
      e.preventDefault()
      const from = q.get() < 1 ? -1 : idx
      scrollToIndex(Math.max(0, Math.min(n - 1, from + (e.key === 'ArrowDown' ? 1 : -1))))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // eslint-disable-line react-hooks/exhaustive-deps

  const open = (el: HTMLElement, project: Project) => {
    const r = el.getBoundingClientRect()
    fly({ slug: project.slug, src: project.cover.src, rect: { x: r.left, y: r.top, w: r.width, h: r.height }, bg: project.colors.bg })
  }

  const mobile = vw < 760
  // One column, one width: the active frame fills about half the screen height
  const w = mobile ? vw * 0.78 : Math.min(vw * 0.44, vh * 0.62 * 1.4, 680)
  const hs = PROJECTS.map(({ frame }) => w / Math.max(1.25, Math.min(1.78, frame.ratio)))
  const gap = mobile ? 28 : 48
  const drop = vh * (mobile ? 0.2 : 0.34)

  return (
    <motion.main className="v2-home" style={{ backgroundColor: bg, color: fg }}>
      <svg className="v2-svgdefs" aria-hidden="true" focusable="false">
        <filter id="v2-warp" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.002 0.014" numOctaves="1" seed="3" />
          <feDisplacementMap ref={warpRef} in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <section ref={stripRef} className="v2-strip" style={{ height: (span + 1) * vh }} aria-label="Selected work">
        <span className="v2-snapmark" style={{ top: 0 }} aria-hidden="true" />
        {PROJECTS.map((pr, i) => (
          <span key={pr.slug} className="v2-snapmark" style={{ top: (INTRO + i) * vh }} aria-hidden="true" />
        ))}
        <div className="v2-stage">
          <NameBlock q={q} />

          <motion.div ref={framesRef} className="v2-frames" style={{ skewY: lean }}>
            {PROJECTS.map((pr, i) => (
              <Frame key={pr.slug} project={pr} index={i} p={p} q={q} hs={hs} gap={gap} drop={drop} w={w} active={i === idx} onOpen={open} onPick={scrollToIndex} />
            ))}
          </motion.div>

          <nav className={`v2-index ${inIntro ? 'is-hidden' : ''}`} aria-label="Projects">
            {PROJECTS.map((pr, i) => (
              <button key={pr.slug} type="button" className={`v2-label ${i === idx ? 'on' : ''}`} onClick={() => scrollToIndex(i)} aria-current={i === idx}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span className="v2-index-name">{pr.name}</span>
              </button>
            ))}
          </nav>

          {!inIntro && (
            <motion.p key={idx} className="v2-label v2-stage-kind" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {PROJECTS[idx].kind}
            </motion.p>
          )}
        </div>
      </section>

      <Contact />
    </motion.main>
  )
}
