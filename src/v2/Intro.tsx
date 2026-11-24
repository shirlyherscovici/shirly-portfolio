import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PERSON } from './data'

const LINES = [
  'Loading pixels. Coffee is already loaded.',
  'Fast, precise and calm under deadline.',
  'Motion, AI, graphics. One person.',
]

/** Robin-style opening: dark screen, outlined name that fills in, a chat
 *  bubble with a few lines in my voice, then the colour world opens. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [line, setLine] = useState(0)

  useEffect(() => {
    const a = window.setTimeout(() => setLine(1), 1100)
    const b = window.setTimeout(() => setLine(2), 2200)
    const c = window.setTimeout(onDone, 3300)
    return () => [a, b, c].forEach(window.clearTimeout)
  }, [onDone])

  return (
    <motion.div
      className="v2-intro"
      initial={{ opacity: 1 }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      onClick={onDone}
      role="presentation"
    >
      <div className="v2-intro-name">
        <span className="v2-intro-outline">{PERSON.name}</span>
        <motion.span
          className="v2-intro-fill"
          aria-hidden="true"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1], delay: 0.3 }}
        >
          {PERSON.name}
        </motion.span>
        <motion.p className="v2-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          {PERSON.role}
        </motion.p>
      </div>
      <div className="v2-intro-chat" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={line}
            className="v2-intro-bubble"
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            {LINES[line]}
          </motion.p>
        </AnimatePresence>
      </div>
      <button type="button" className="v2-intro-skip v2-label" onClick={onDone}>
        Skip
      </button>
    </motion.div>
  )
}
