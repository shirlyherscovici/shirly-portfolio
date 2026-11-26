import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const BASE = import.meta.env.BASE_URL
export const REEL = { src: `${BASE}v2/reel/showreel.mp4`, poster: `${BASE}v2/reel/poster.webp` }
const ease = [0.76, 0, 0.24, 1] as const

/** The showreel, full screen with sound. Opens from the Play showreel button on the home page;
 *  Esc, the close button or a click outside the picture closes it. */
export function ReelPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (!open) return
    const back = document.activeElement as HTMLElement | null
    close.current?.focus()
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // stop the home page's arrow-key project stepping while the reel is up
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') e.stopPropagation()
    }
    window.addEventListener('keydown', k, true)
    window.addEventListener('hashchange', onClose)
    return () => {
      window.removeEventListener('keydown', k, true)
      window.removeEventListener('hashchange', onClose)
      html.style.overflow = prev
      back?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="v2-reel"
          role="dialog"
          aria-modal="true"
          aria-label="Showreel"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.8, ease }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.video
            ref={video}
            src={REEL.src}
            poster={REEL.poster}
            controls
            autoPlay
            playsInline
            onEnded={onClose}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
          <button ref={close} type="button" className="v2-reel-close" aria-label="Close showreel" onClick={onClose}>
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
