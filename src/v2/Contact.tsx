import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { PERSON } from './data'

/** Spencer-style sign-off: a giant word that grows to full width as you
 *  scroll into it, with letters that hop when you touch them. */
export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 0.45, 1])
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 120, 0])
  const word = 'CONTACT'

  return (
    <footer ref={ref} className="v2-contact" id="contact">
      <motion.a href={`mailto:${PERSON.email}`} className="v2-contact-word" style={{ scale, y }} data-cursor="Email" aria-label={`Email ${PERSON.email}`}>
        {word.split('').map((ch, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            whileHover={reduce ? undefined : { y: '-14%', rotate: i % 2 ? 4 : -4, color: '#ff8fb8' }}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 14 }}
          >
            {ch}
          </motion.span>
        ))}
      </motion.a>
      <div className="v2-contact-links v2-label">
        <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
        <a href={PERSON.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href={PERSON.cv} target="_blank" rel="noopener noreferrer">
          CV (PDF)
        </a>
      </div>
      <p className="v2-contact-small">© {new Date().getFullYear()} {PERSON.name}</p>
    </footer>
  )
}
