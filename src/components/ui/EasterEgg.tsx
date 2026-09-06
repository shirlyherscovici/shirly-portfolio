import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

// The Konami code — as close to a universal gaming-culture handshake as
// exists. A recruiter who knows it types it once, out of habit, half-
// expecting nothing; the ones who don't just never see this at all. That
// asymmetry is the whole point: it rewards curiosity without ever
// demanding it, and never shows up as a hint or a prompt anywhere in the
// UI (no "psst, try the Konami code" — a real easter egg doesn't announce
// itself).
const KONAMI: string[] = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

/** One tasteful, self-dismissing toast — no minigame, no navigation, no
 *  persistent UI change, nothing that competes with the actual work for
 *  more than a few seconds. Reuses the exact glass/gradient language
 *  already established for the homepage's own pills and badges (the
 *  purple→magenta CTA gradient, the same glow-purple shadow token) rather
 *  than inventing a new visual style for one moment. Global (mounted once
 *  in App, not per-section) so it works the same whether the visitor is
 *  looking at the Hero or has a case study open. */
export default function EasterEgg() {
  const [visible, setVisible] = useState(false)
  const progressRef = useRef(0)
  const dismissTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      const expected = KONAMI[progressRef.current]
      if (key === expected) {
        progressRef.current += 1
        if (progressRef.current === KONAMI.length) {
          progressRef.current = 0
          setVisible(true)
          clearTimeout(dismissTimer.current)
          dismissTimer.current = setTimeout(() => setVisible(false), 4200)
        }
      } else {
        // Restart the match from scratch — but a wrong key that happens to
        // equal the FIRST expected key (e.g. mistyping U,U,U) should still
        // count as starting over, not stall the sequence entirely.
        progressRef.current = key === KONAMI[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      clearTimeout(dismissTimer.current)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          // Position set inline, not via Tailwind's `fixed`/`bottom-6`/etc.
          // classes — `.glass-cine` (a plain CSS class, not a Tailwind
          // utility) sets its own `position: relative`, and with equal
          // selector specificity, source order decided the winner: it was
          // silently beating the `fixed` utility, so the toast rendered
          // in normal flow instead of pinned to the viewport (caught by
          // testing the actual rendered position, not just presence in
          // the DOM — the toast existed but was never visible on screen).
          // Inline styles always win regardless of class order, so the
          // fix is to set position here instead of fighting the cascade.
          style={{ position: 'fixed', bottom: 24, left: '50%', x: '-50%', zIndex: 200 }}
          className="flex items-center gap-3 pl-3 pr-5 py-3 rounded-full glass-cine glass-sheen shadow-glow-purple"
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#c4a2ff] via-[#8b5cf6] to-[#5b21b6] shrink-0">
            <Trophy size={16} className="text-white" />
          </span>
          <span className="text-left">
            <span className="block font-display font-bold text-xs uppercase tracking-wide text-white">Achievement Unlocked</span>
            <span className="block text-[11px] text-cine-sub">Konami Master — you know the code.</span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
