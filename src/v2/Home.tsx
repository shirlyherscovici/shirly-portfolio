import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
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
const soft = [0.22, 1, 0.36, 1] as const
/** Length of the opening roll, in seconds */
const BOOT = 2.4
let booted = false
const firstLine = (s: string) => s.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? s

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

/** Where frame `index` sits. While the opening roll runs (roll != 0) the strip loops,
 *  so every project runs past from below before it lands on the first one. */
function place(p: number, roll: number, hs: number[], gap: number, index: number) {
  if (roll === 0) return { y: strip(p, hs, gap)[index], d: index - p, looped: false }
  const n = hs.length
  const v = p + roll + n
  const c = strip(v, [...hs, ...hs, ...hs], gap)
  let k = index + n
  for (const cand of [index, index + 2 * n]) if (Math.abs(c[cand]) < Math.abs(c[k])) k = cand
  return { y: c[k], d: k - v, looped: k !== index + n }
}

/* ---------- One window of the strip: the image sits behind and the window slides over it.
 *  The picture also pans slowly all the time, so there is always some movement revealing it. ---------- */
function Frame({
  project,
  index,
  p,
  roll,
  hs,
  gap,
  w,
  active,
  onOpen,
  onPick,
}: {
  project: Project
  index: number
  p: MotionValue<number>
  roll: MotionValue<number>
  hs: number[]
  gap: number
  w: number
  active: boolean
  onOpen: (el: HTMLElement, project: Project) => void
  onPick: (i: number) => void
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const h = hs[index]
  /* Light sweep: a bright diagonal band that follows the pointer across the picture
   * (like After Effects' Light Sweep), only while hovering the active frame */
  const u = useMotionValue(0.5)
  const su = useSpring(u, { stiffness: 140, damping: 22 })
  const sweepPos = useTransform(su, (v) => `${((1.25 - v) / 1.5) * 100}% 0%`)
  const [hover, setHover] = useState(false)
  const at = (a: unknown, b: unknown) => place(a as number, b as number, hs, gap, index)
  const y = useTransform([p, roll], ([a, b]) => at(a, b).y)
  const scale = useTransform([p, roll], ([a, b]) => sizeAt(at(a, b).d))
  // Counter-move the picture so it reads as fixed behind the moving window
  const imgY = useTransform([p, roll], ([a, b]) => -Math.max(-1.3, Math.min(1.3, at(a, b).d)) * 0.12 * h)
  // Neighbours go black and white; while the film rolls in, frames come up out of the dark instead
  const filter = useTransform([p, roll], ([a, b]) => {
    const r = Math.min(1, Math.abs(b as number))
    const d = Math.min(1, Math.abs(at(a, b).d))
    return `grayscale(${d * (1 - r)}) brightness(${1 - 0.6 * d * r})`
  })
  const opacity = useTransform([p, roll], ([a, b]) => {
    const { d, looped } = at(a, b)
    return (1 - Math.min(1, Math.abs(d)) * 0.3) * (looped ? Math.min(1, Math.abs(b as number) * 2) : 1)
  })

  return (
    <motion.div className="v2-frame" style={{ y, scale, opacity, width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2 }}>
      {/* The window's edges keep sliding, so a little more of the picture is always being revealed */}
      <motion.a
        ref={ref}
        href={href.project(project.slug)}
        className="v2-window"
        tabIndex={active ? 0 : -1}
        aria-label={`${project.name}, open project`}
        draggable={false}
        initial={{ clipPath: 'inset(0% 0% 5% 0%)' }}
        animate={{ clipPath: ['inset(0% 0% 5% 0%)', 'inset(5% 0% 0% 0%)'] }}
        transition={{ duration: 5 + index * 0.7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        onPointerMove={(e) => {
          const r = ref.current?.getBoundingClientRect()
          if (r) u.set((e.clientX - r.left) / r.width)
        }}
        onPointerEnter={(e) => {
          const r = ref.current?.getBoundingClientRect()
          if (r) u.jump((e.clientX - r.left) / r.width < 0.5 ? -0.2 : 1.2)
          setHover(true)
        }}
        onPointerLeave={() => setHover(false)}
        onClick={(e) => {
          e.preventDefault()
          if (active) onOpen(ref.current!, project)
          else onPick(index)
        }}
      >
        <motion.div
          className="v2-window-pan"
          animate={{ x: ['-4%', '4%'], y: ['2.5%', '-2.5%'] }}
          transition={{ duration: 6 + index, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          <motion.img src={project.cover.src} alt={project.cover.alt} style={{ y: imgY, filter }} draggable={false} />
        </motion.div>
        <motion.span
          className="v2-sweep"
          style={{ backgroundPosition: sweepPos }}
          animate={{ opacity: hover && active ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          aria-hidden="true"
        />
      </motion.a>
    </motion.div>
  )
}

/* ---------- Small preview card: the project's video (or a second image), framed in the
 *  project's colour. It flips over each time you move to another project. ---------- */
function Peek({ project, frame }: { project: Project; frame: MotionValue<string> }) {
  if (!project.loop && !project.peek) return null
  return (
    <div className="v2-peek-wrap">
      <motion.a
        href={href.project(project.slug)}
        className="v2-peek"
        tabIndex={-1}
        aria-hidden="true"
        style={{ borderColor: frame }}
        initial={{ rotateY: -90 }}
        animate={{ rotateY: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ rotateY: 90, transition: { duration: 0.3, ease: [0.55, 0, 1, 0.45] } }}
      >
        {project.loop ? <video src={project.loop} autoPlay muted loop playsInline /> : <img src={project.peek} alt="" />}
      </motion.a>
    </div>
  )
}

export function Home() {
  const { setTone } = useTone()
  const { fly } = useFlight()
  const { w: vw, h: vh } = useViewport()
  const stripRef = useRef<HTMLDivElement>(null)
  const n = PROJECTS.length
  const [idx, setIdx] = useState(0)
  /* Opening (first visit): dark room, small name top left, the film rolls up through every
   * project while the side band fills like a progress bar; then the project colour wipes in
   * from the left and the strip leans into its angle. */
  const [boot, setBoot] = useState(!booted)
  const ready = true
  const roll = useMotionValue(booted ? 0 : -n)
  useEffect(() => {
    if (!boot) return
    document.documentElement.classList.add('v2-booting')
    const c = animate(roll, 0, { duration: BOOT, ease: [0.33, 0, 0.12, 1] })
    const t = window.setTimeout(() => {
      booted = true
      setBoot(false)
      document.documentElement.classList.remove('v2-booting')
    }, BOOT * 1000 + 150)
    return () => {
      c.stop()
      window.clearTimeout(t)
      document.documentElement.classList.remove('v2-booting')
    }
  }, [boot, roll])

  const { scrollYProgress } = useScroll({ target: stripRef, offset: ['start start', 'end end'] })
  const raw = useTransform(scrollYProgress, (t) => t * (n - 1))
  const p = useSpring(raw, { stiffness: 110, damping: 24, mass: 0.6 })
  const bg = useTransform(p, (v) => along(v, 'bg'))
  const fg = useTransform(p, (v) => along(v, 'fg'))

  useMotionValueEvent(p, 'change', (v) => setIdx(Math.max(0, Math.min(n - 1, Math.round(v)))))

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('v2-snap')
    return () => root.classList.remove('v2-snap')
  }, [])



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
  const canHover = useCanHover()
  const w = mobile ? vw * 0.7 : Math.min(vw * 0.4, vh * 0.66 * 1.4, 700)
  const hs = PROJECTS.map(({ frame }) => w / Math.max(1.25, Math.min(1.78, frame.ratio)))
  const gap = mobile ? 26 : 64
  const project = PROJECTS[idx]

  /* List mode: bring the pointer to the right edge and the project list opens,
   * the room goes dark and the strip lies back in perspective at the centre. */
  const [list, setList] = useState(false)
  useEffect(() => {
    if (mobile || !canHover) {
      setList(false)
      return
    }
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth
      if (x > 0.86) setList(true)
      else if (x < 0.55) setList(false)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [mobile, canHover])
  useEffect(() => setTone(list ? { bg: SHELL.bg, fg: SHELL.fg } : PROJECTS[idx].colors), [list, idx, setTone])

  // Home: leaning film strip. List: the same strip stands straight at the centre of the screen.
  const tilt = boot
    ? { rotateX: 22, rotateY: 0, rotateZ: 0, skewX: 0, x: '0vw', scale: 1 }
    : mobile
    ? { rotateX: 4, rotateY: -12, rotateZ: -5, skewX: -4 }
    : list
      ? { rotateX: 28, rotateY: 0, rotateZ: 0, skewX: 0, x: '-20.5vw', scale: 1.15 }
      : { rotateX: 6, rotateY: -22, rotateZ: -7, skewX: -6, x: '0vw', scale: 1 }
  const turn = { duration: 0.9, ease }

  // A little lean toward the pointer
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const leanY = useSpring(useTransform(mx, (v) => v * 5), { stiffness: 60, damping: 18 })
  const leanX = useSpring(useTransform(my, (v) => -v * 4), { stiffness: 60, damping: 18 })
  useEffect(() => {
    if (!canHover) return
    // In list mode the strip lies straight back, so the lean is switched off there
    if (list) {
      mx.set(0)
      my.set(0)
      return
    }
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5)
      my.set(e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [canHover, list, mx, my])

  const fade = { opacity: list ? 0 : 1, transition: { duration: 0.4 } }
  const openAt = (i: number) => {
    const win = document.querySelectorAll<HTMLElement>('.v2-window')[i]
    if (win) open(win, PROJECTS[i])
  }

  return (
    <motion.main className="v2-home" style={{ backgroundColor: bg, color: fg }}>

      <section ref={stripRef} className="v2-strip" style={{ height: n * vh }} aria-label="Selected work">
        {PROJECTS.map((pr, i) => (
          <span key={pr.slug} className="v2-snapmark" style={{ top: i * vh }} aria-hidden="true" />
        ))}
        <div className={`v2-stage ${list ? 'is-list' : ''}`}>
          <motion.div className="v2-dim" initial={false} animate={{ opacity: list ? 1 : 0 }} transition={{ duration: 0.6 }} aria-hidden="true" />

          <div className="v2-plane-wrap">
            <motion.div
              className="v2-plane"
              initial={{ opacity: 0, ...tilt }}
              animate={{ opacity: 1, ...tilt }}
              transition={{
                opacity: { duration: 0.6 },
                rotateX: turn,
                rotateY: turn,
                rotateZ: turn,
                skewX: turn,
                x: { duration: 0.9, ease },
                scale: { duration: 0.9, ease },
              }}
            >
              {/* A slow, constant drift so the strip never feels frozen */}
              <motion.div
                className="v2-plane-drift"
                style={{ rotateY: leanY, rotateX: leanX }}
                animate={{ y: [0, -22, 0], x: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                {PROJECTS.map((pr, i) => (
                  <Frame key={pr.slug} project={pr} index={i} p={p} roll={roll} hs={hs} gap={gap} w={w} active={i === idx} onOpen={open} onPick={scrollToIndex} />
                ))}
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="v2-info"
            initial={false}
            animate={{ clipPath: list ? 'inset(-20% 100% -20% -10%)' : 'inset(-20% -10% -20% -10%)' }}
            transition={{ duration: 0.9, ease }}
          >
            <AnimatePresence mode="wait">
              {ready && (
                <motion.div key={project.slug} className="v2-info-inner" exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}>
                  <h2 className="v2-info-word">
                    <span className="v2-mask">
                      <motion.a
                        href={href.project(project.slug)}
                        className="v2-char"
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
                    onClick={(e) => {
                      e.preventDefault()
                      openAt(idx)
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
          </motion.div>

          <motion.div className="v2-peek-slot" initial={false} animate={fade}>
            <AnimatePresence mode="wait">{!boot && !mobile && <Peek key={project.slug} project={project} frame={fg} />}</AnimatePresence>
          </motion.div>

          {/* Colour band down the side, in the same colour as the project text */}
          <motion.span
            className="v2-sideband"
            style={{ backgroundColor: boot ? PROJECTS[0].colors.bg : fg }}
            initial={{ scaleY: boot ? 0 : 1 }}
            animate={{ scaleY: 1, ...fade }}
            transition={{ scaleY: { duration: BOOT, ease: [0.33, 0, 0.12, 1] } }}
            aria-hidden="true"
          />

          <AnimatePresence>
            {boot && (
              <motion.div
                className="v2-boot"
                initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                exit={{ clipPath: 'inset(0% 0% 0% 100%)' }}
                transition={{ duration: 0.9, ease }}
                aria-hidden="true"
              >
                <div className="v2-boot-name">
                  <motion.p
                    style={{ color: PROJECTS[0].colors.bg }}
                    initial={{ clipPath: 'inset(-20% 100% -30% 0%)' }}
                    animate={{ clipPath: 'inset(-20% 0% -30% 0%)' }}
                    transition={{ duration: 1.2, ease, delay: 0.2 }}
                  >
                    {PERSON.name}
                  </motion.p>
                  <motion.p className="v2-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}>
                    {PERSON.role}
                  </motion.p>
                </div>
                <motion.p
                  className="v2-boot-toast"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: soft }}
                >
                  Loading selected work…
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="v2-pills" aria-label="Projects">
            {PROJECTS.map((pr, i) => (
              <button
                key={pr.slug}
                type="button"
                className={i === idx ? 'on' : ''}
                onPointerEnter={() => {
                  if (list && i !== idx) scrollToIndex(i)
                }}
                onClick={() => (list && i === idx ? openAt(i) : scrollToIndex(i))}
                aria-label={pr.name}
                aria-current={i === idx}
              >
                <span className="v2-pill-name">{pr.word}</span>
                <span className="v2-pill" style={i === idx ? { background: pr.colors.fg, borderColor: pr.colors.fg } : undefined} />
              </button>
            ))}
          </nav>
        </div>
      </section>

      <Contact />
    </motion.main>
  )
}
