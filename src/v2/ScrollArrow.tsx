import { motion } from 'framer-motion'

/** Robin Noguier's round "scroll down" button: a filled circle with an arrow that keeps nudging down */
export function ScrollArrow({ fill, ink, className = '', onClick, label = 'Scroll down' }: { fill: string; ink: string; className?: string; onClick: () => void; label?: string }) {
  return (
    <button type="button" className={`v2-arrow ${className}`} aria-label={label} onClick={onClick} style={{ background: fill, color: ink }}>
      <motion.svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" animate={{ y: [-3, 4, -3] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
        <path d="M12 4v15M5.5 12.5 12 19l6.5-6.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </button>
  )
}
