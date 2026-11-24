import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from 'framer-motion'
import { PERSON } from './data'
import { href, useTone, useCanHover, type Route } from './store'

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

/* ---------- Cursor follower (desktop only) ---------- */
export function Cursor() {
  const canHover = useCanHover()
  const reduce = useReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 })
  const [label, setLabel] = useState<string | null>(null)
  const [down, setDown] = useState(false)
  const { fg, bg } = useTone()

  useEffect(() => {
    if (!canHover) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = (e.target as HTMLElement | null)?.closest('[data-cursor]') as HTMLElement | null
      setLabel(t ? t.dataset.cursor || null : null)
    }
    const d = () => setDown(true)
    const u = () => setDown(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', d)
    window.addEventListener('pointerup', u)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', d)
      window.removeEventListener('pointerup', u)
    }
  }, [canHover, x, y])

  if (!canHover) return null
  const size = label ? 84 : 14
  return (
    <motion.div className="v2-cursor" style={{ x: sx, y: sy }} aria-hidden="true">
      <motion.div
        className="v2-cursor-dot"
        animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ background: fg, color: bg }}
      >
        <AnimatePresence>
          {label && (
            <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ---------- Living face badge: eyes follow you, blinks, smiles on hover ---------- */
export function FaceBadge() {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduce = useReducedMotion()
  const px = useSpring(0, { stiffness: 200, damping: 20 })
  const py = useSpring(0, { stiffness: 200, damping: 20 })
  const [blink, setBlink] = useState(false)
  const [hover, setHover] = useState(false)
  const { fg, bg } = useTone()

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy) || 1
      const k = Math.min(1, d / 220) * 3.2
      px.set((dx / d) * k)
      py.set((dy / d) * k)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [px, py])

  useEffect(() => {
    if (reduce) return
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 140)
        loop()
      }, 2200 + Math.random() * 2800)
    }
    loop()
    return () => window.clearTimeout(t)
  }, [reduce])

  return (
    <a
      ref={ref}
      href={`mailto:${PERSON.email}`}
      className="v2-face"
      aria-label={`Email ${PERSON.name}`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{ background: fg, color: bg }}
    >
      <motion.svg viewBox="0 0 40 40" width="100%" height="100%" animate={{ rotate: hover ? -8 : 0 }} aria-hidden="true">
        {[14, 26].map((cx) => (
          <g key={cx}>
            <motion.ellipse cx={cx} cy={17} rx={4.6} ry={5.2} initial={{ ry: 5.2 }} animate={{ ry: blink ? 0.6 : 5.2 }} transition={{ duration: 0.08 }} fill="currentColor" />
            {!blink && <motion.circle cx={cx} cy={17} r={2.2} style={{ x: px, y: py }} fill={fg} />}
          </g>
        ))}
        <motion.path
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          d="M14 28 Q20 30 26 28"
          initial={{ d: "M14 28 Q20 30 26 28" }}
          animate={{ d: hover ? 'M12 26 Q20 34 28 26' : 'M14 28 Q20 30 26 28' }}
        />
      </motion.svg>
      <AnimatePresence>
        {hover && (
          <motion.span
            className="v2-bubble v2-label"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            style={{ background: fg, color: bg }}
          >
            Say hi!
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  )
}
