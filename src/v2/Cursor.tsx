import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useCanHover } from './store'

/** A small label that follows the pointer and says what a click will do:
 *  Open a project, View a picture, Vote for a song. Only on devices with a real pointer. */
const RULES: [string, string][] = [
  ['.v2-window, .v2-peek, .v2-about-work a, .v2-ab-work a', 'Open'],
  ['.cs-vote-list button', 'Vote'],
  ['.cs-zoom, .cs-drift-item, .cs-count-card, .cs-pin button, button[aria-label^="Enlarge"]', 'View'],
]

function labelFor(el: Element | null): string | null {
  if (!el) return null
  const own = el.closest('[data-cursor]')?.getAttribute('data-cursor')
  if (own) return own
  for (const [sel, label] of RULES) if (el.closest(sel)) return label
  return null
}

export function Cursor() {
  const canHover = useCanHover()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 })
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    if (!canHover) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setLabel(labelFor(e.target as Element))
    }
    const leave = () => setLabel(null)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [canHover, x, y])
  if (!canHover) return null
  return (
    <motion.div className="v2-cursor" style={{ x: sx, y: sy }} aria-hidden="true">
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 520, damping: 30 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
