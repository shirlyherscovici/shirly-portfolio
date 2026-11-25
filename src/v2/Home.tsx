import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { PROJECTS, type Project } from './data'
import { href, useFlight, useTone } from './store'
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
const soft = [0.22, 1, 0.36, 1] as const
const firstLine = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s

/* ---------- Opening: the name fills with colour, then lifts away to the work (first visit only) ---------- */
let introSeen = false
function Loader({ onDone }: { onDone: () => void }) {
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    const t = window.setTimeout(() => done.current(), 2300)
    return () => window.clearTimeout(t)
  }, [])
  const lines = ['Shirly', 'Herscovici']
  return (
    <motion.div className="v2-loader" initial={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.9, ease }} aria-hidden="true">
      <div className="v2-bigname">
        {lines.map((l, i) => (
          <span key={l} className="v2-bigname-line">
            <span className="v2-bigname-outline">{l}</span>
            <motion.span
              className="v2-bigname-fill"
              style={{ color: PROJECTS[0].colors.fg }}
              initial={{ clipPath: 'inset(-20% 100% -30% 0%)' }}
              animate={{ clipPath: 'inset(-20% 0% -30% 0%)' }}
              transition={{ duration: 1.3, ease, delay: 0.2 + i * 0.3 }}
            >
              {l}
            </motion.span>
          </span>
        ))}
      </div>
    </motion.div>
  )
}

/* ---------- Strip geometry ---------- */
/** Neighbours are this much smaller than the frame you are on */
const SIDE = 0.86
const sizeAt = (d: number) => 1 - Math.min(1, Math.abs(d)) * (1 - SIDE)

/** Vertical centre of every frame relative to the strip centre, for strip position p.
 *  Frames are stacked with a fixed gap using their current (scaled) heights. */
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

/* ---------- One window of the strip: the image sits behind and the window slides over it ---------- */
function Frame({
  project,
  index,
  p,
  hs,
  gap,
  w,
  tint,
  active,
  onOpen,
  onPick,
}: {
  project: Project
  index: number
  p: MotionValue<number>
  hs: number[]
  gap: number
  w: number
  tint: MotionValue<string>
  active: boolean
  onOpen: (el: HTMLElement, project: Project) => void
  onPick: (i: number) => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const h = hs[index]
  const y = useTransform(p, (v) => strip(v, hs, gap)[index])
  const scale = useTransform(p, (v) => sizeAt(index - v))
  // Counter-move the picture so it reads as fixed behind the moving window
  const imgY = useTransform(p, (v) => -Math.max(-1.3, Math.min(1.3, index - v)) * 0.14 * h)
  const veil = useTransform(p, (v) => Math.min(1, Math.abs(index - v)) * 0.55)

  return (
    <motion.div className="v2-frame" style={{ y, scale, width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 }}>
      <a
        ref={ref}
        href={href.project(project.slug)}
        className="v2-window"
        data-cursor={active ? 'View' : undefined}
        tabIndex={active ? 0 : -1}
        aria-label={`${project.name}, open project`}
        draggable={false}
        onClick={(e) => {
          e.preventDefault()
          if (active) onOpen(ref.current!, project)
          else onPick(index)
        }}
      >
        <motion.img src={project.cover.src} alt={project.cover.alt} style={{ y: imgY }} draggable={false} />
        <motion.span className="v2-veil" style={{ backgroundColor: tint, opacity: veil }} aria-hidden="true" />
      </a>
    </motion.div>
  )
}

/* ---------- Small preview card: the project's video, or a second image ---------- */
function Peek({ project }: { project: Project }) {
  if (!project.loop && !project.peek) return null
  return (
    <motion.a
      href={href.project(project.slug)}
      className="v2-peek"
      data-cursor="View"
      tabIndex={-1}
      aria-hidden="true"
      initial={{ opacity: 0, y: 30, rotate: -3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: soft }}
    >
      {project.loop ? <video src={project.loop} autoPlay muted loop playsInline /> : <img src={project.peek} alt="" />}
    </motion.a>
  )
}

export function Home() {
  const reduce = useReducedMotion()
  const { setTone } = useTone()
  const { fly } = useFlight()
  const { w: vw, h: vh } = useViewport()
  const stripRef = useRef<HTMLDivElement>(null)
  const n = PROJECTS.length
  const [idx, setIdx] = useState(0)
  const [loading, setLoading] = useState(!introSeen)
  const [ready, setReady] = useState(introSeen)

  const { scrollYProgress } = useScroll({ target: stripRef, offset: ['start start', 'end end'] })
  const raw = useTransform(scrollYProgress, (t) => t * (n - 1))
  const p = useSpring(raw, { stiffness: 110, damping: 24, mass: 0.6 })
  const bg = useTransform(p, (v) => along(v, 'bg'))
  const fg = useTransform(p, (v) => along(v, 'fg'))

  useMotionValueEvent(p, 'change', (v) => setIdx(Math.max(0, Math.min(n - 1, Math.round(v)))))
  useEffect(() => setTone(PROJECTS[idx].colors), [idx, setTone])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('v2-snap')
    return () => root.classList.remove('v2-snap')
  }, [])

  const finishIntro = () => {
    introSeen = true
    setLoading(false)
    window.setTimeout(() => setReady(true), 350)
  }

  const scrollToIndex = (i: number) => {
    const top = (stripRef.current?.offsetTop ?? 0) + i * vh
    window.scrollTo({ top, behavior: 'smooth' })
  }

  // Arrow keys step through projects while the strip is on screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const st = stripRef.current
      if (!st) return
      if (window.scrollY - st.offsetTop > st.offsetHeight - vh * 0.5) return
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
  const w = mobile ? vw * 0.7 : Math.min(vw * 0.4, vh * 0.66 * 1.4, 700)
  const hs = PROJECTS.map(({ frame }) => w / Math.max(1.25, Math.min(1.78, frame.ratio)))
  const gap = mobile ? 26 : 64
  // The strip enters straight, then leans into its angle
  const tilt = mobile ? { rotateZ: -4, skewX: -4 } : { rotateZ: -6, skewX: -7 }
  const project = PROJECTS[idx]

  return (
    <motion.main className="v2-home" style={{ backgroundColor: bg, color: fg }}>
      <AnimatePresence>{loading && <Loader onDone={finishIntro} />}</AnimatePresence>

      <section ref={stripRef} className="v2-strip" style={{ height: n * vh }} aria-label="Selected work">
        {PROJECTS.map((pr, i) => (
          <span key={pr.slug} className="v2-snapmark" style={{ top: i * vh }} aria-hidden="true" />
        ))}
        <div className="v2-stage">
          <div className="v2-plane-wrap">
            <motion.div
              className="v2-plane"
              initial={{ y: '70vh', opacity: 0, rotateZ: 0, skewX: 0 }}
              animate={ready ? { y: 0, opacity: 1, ...tilt } : undefined}
              transition={{
                y: { duration: 1.1, ease: soft },
                opacity: { duration: 0.5 },
                rotateZ: { duration: 1.1, ease, delay: 1.0 },
                skewX: { duration: 1.1, ease, delay: 1.0 },
              }}
            >
              {/* A slow, constant drift so the strip never feels frozen */}
              <motion.div
                className="v2-plane-drift"
                animate={reduce ? undefined : { y: [0, -14, 0], x: [0, 6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              >
                {PROJECTS.map((pr, i) => (
                  <Frame key={pr.slug} project={pr} index={i} p={p} hs={hs} gap={gap} w={w} tint={bg} active={i === idx} onOpen={open} onPick={scrollToIndex} />
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="v2-info">
            <AnimatePresence mode="wait">
              {ready && (
                <motion.div key={project.slug} className="v2-info-inner" exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}>
                  <h2 className="v2-info-word">
                    <span className="v2-mask">
                      <motion.a
                        href={href.project(project.slug)}
                        className="v2-char"
                        data-cursor="View"
                        initial={{ y: '105%' }}
                        animate={{ y: '0%' }}
                        transition={{ duration: 0.7, ease: soft }}
                      >
                        {project.word}
                      </motion.a>
                    </span>
                  </h2>
                  <motion.p className="v2-info-line" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: soft, delay: 0.12 }}>
                    {firstLine(project.intro)}
                  </motion.p>
                  <motion.a
                    href={href.project(project.slug)}
                    className="v2-label v2-info-cta"
                    data-cursor="Open"
                    onClick={(e) => {
                      e.preventDefault()
                      const win = document.querySelectorAll<HTMLElement>('.v2-window')[idx]
                      if (win) open(win, project)
                    }}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: soft, delay: 0.22 }}
                  >
                    Open case study <span aria-hidden="true">→</span>
                  </motion.a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">{ready && !mobile && <Peek key={project.slug} project={project} />}</AnimatePresence>

          <nav className="v2-pills" aria-label="Projects">
            {PROJECTS.map((pr, i) => (
              <button key={pr.slug} type="button" className={i === idx ? 'on' : ''} onClick={() => scrollToIndex(i)} aria-label={pr.name} aria-current={i === idx}>
                <span />
              </button>
            ))}
          </nav>
        </div>
      </section>

      <Contact />
    </motion.main>
  )
}
