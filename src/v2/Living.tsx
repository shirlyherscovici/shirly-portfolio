import { useEffect, useState } from 'react'
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
