import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { PERSON } from './data'

/** Spencer-style sign-off. The footer sits still under the page and is uncovered
 *  as the page scrolls away; meanwhile the giant word stretches from a squashed
 *  strip to its full height, and its letters hop when you touch them. */
export function Contact() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 })
  const scaleY = useTransform(p, [0, 1], [0.28, 1])
  const fade = useTransform(p, [0.55, 1], [0, 1])
  const word = 'Contact'

  return (
    <footer ref={ref} className="v2-contact" id="contact">
      <div className="v2-contact-fixed">
        <motion.a
          href={`mailto:${PERSON.email}`}
          className="v2-contact-word"
          style={{ scaleY }}
          data-cursor="Email"
          aria-label={`Email ${PERSON.email}`}
        >
          {word.split('').map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              whileHover={{ y: '-12%', rotate: i % 2 ? 5 : -5, color: '#ff8fb8' }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 14 }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.a>
        <motion.div className="v2-contact-links v2-label" style={{ opacity: fade }}>
          <a href={`mailto:${PERSON.email}`}>{PERSON.email}</a>
          <a href={PERSON.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={PERSON.cv} target="_blank" rel="noopener noreferrer">
            CV (PDF)
          </a>
        </motion.div>
        <motion.p className="v2-contact-small" style={{ opacity: fade }}>
          © {new Date().getFullYear()} {PERSON.name}
        </motion.p>
      </div>
    </footer>
  )
}
