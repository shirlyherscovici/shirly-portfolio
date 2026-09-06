import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { PROJECT_NUMBER } from '../../lib/projectMeta'

/** Same four projects, same reading order, same accent colors already
 *  established everywhere else (the diorama's WAYPOINT_ACCENT, each
 *  homepage card's own NumberBadge) — reused here rather than inventing a
 *  fifth palette for this one moment. */
const WORLDS: { n: string; label: string; accent: string }[] = [
  { n: PROJECT_NUMBER.galgalatz, label: 'Game UI & UX', accent: '#ff5fa0' },
  { n: PROJECT_NUMBER['people-motion'], label: 'Playable Motion', accent: '#ff9f45' },
  { n: PROJECT_NUMBER['ai-rescue'], label: 'Cinematic AI', accent: '#4fd8ff' },
  { n: PROJECT_NUMBER.amy, label: 'Visual Systems', accent: '#ff5f7a' },
]

/** The bridge between the diorama and the project grid — previously a
 *  single 1px gradient line, which is decoration, not an experience. This
 *  is a real, if short, scroll-driven scene: a tall section with a
 *  `sticky` inner stage, so scrolling through its own height plays a
 *  contained sequence (camera aperture closing, a bright portal opening at
 *  the world's center, the four projects announcing themselves as
 *  destinations) rather than just revealing content as it passes by like
 *  everything else on the page. It hands off directly into the grid the
 *  instant it finishes — there's no dead pause, and `#work`/`#top` nav
 *  links still jump straight past it for anyone who doesn't want to
 *  scroll through it at all. */
export default function CinematicTransition() {
  const prefersReduced = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const smooth = useTransform(scrollYProgress, (v) => v)

  // Aperture bars: closed at the midpoint of this section's own scroll
  // traversal, open at both ends — the world "focuses" as you arrive,
  // then "releases" you straight into the grid.
  const barHeight = useTransform(smooth, [0, 0.42, 0.58, 1], ['0vh', '15vh', '15vh', '0vh'])
  const portalScale = useTransform(smooth, [0, 0.45, 0.75, 1], [0.35, 1, 1.15, 1.3])
  const portalOpacity = useTransform(smooth, [0, 0.15, 0.8, 1], [0, 0.9, 0.9, 0])
  const worldsOpacity = useTransform(smooth, [0.3, 0.45, 0.78, 0.92], [0, 1, 1, 0])
  const worldsY = useTransform(smooth, [0.3, 0.5], [26, 0])
  const kickerOpacity = useTransform(smooth, [0.25, 0.4, 0.8, 0.9], [0, 1, 1, 0])

  return (
    <section
      ref={sectionRef}
      // Under reduced motion nothing here animates as you scroll through
      // it — a static portal + four-worlds moment, not a sequence — so
      // the section itself collapses to a short, single, non-sticky beat
      // instead of asking that visitor to scroll past 100+vh of a scene
      // that never changes.
      className={`relative z-10 ${prefersReduced ? 'h-[42vh]' : 'h-[55vh] sm:h-[95vh] lg:h-[135vh]'}`}
      aria-hidden
    >
      <div
        className={`w-full overflow-hidden flex items-center justify-center ${prefersReduced ? 'h-[42vh]' : 'sticky top-0 h-screen'}`}
      >
        {/* The portal — a bright core plus a soft outer bloom, the exact
            purple/cyan accent family already established by the diorama's
            own ambient glow and ground rings, so this reads as the SAME
            light source continuing forward, not a new effect. */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '58vmin',
            height: '58vmin',
            scale: prefersReduced ? 1 : portalScale,
            opacity: prefersReduced ? 0.55 : portalOpacity,
            background: 'radial-gradient(closest-side, rgba(139,92,246,0.55), rgba(79,216,255,0.18) 55%, transparent 78%)',
            filter: 'blur(20px)',
          }}
        />

        {/* The four worlds, announcing themselves at the aperture's most
            closed point — same numbers, same labels, same colors the
            grid below is about to show, so this reads as a preview of a
            real destination, not an abstract loading flourish. */}
        <div className="relative z-10 flex flex-col items-center gap-5 px-4">
          <motion.p
            style={{ opacity: prefersReduced ? 0.85 : kickerOpacity }}
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-white/60"
          >
            Four Worlds. One Journey.
          </motion.p>
          <motion.div
            style={{ opacity: prefersReduced ? 0.85 : worldsOpacity, y: prefersReduced ? 0 : worldsY }}
            className="flex items-center gap-6 sm:gap-10"
          >
            {WORLDS.map((w) => (
              <div key={w.n} className="flex flex-col items-center gap-1.5">
                <span
                  className="font-display font-black text-3xl sm:text-5xl leading-none"
                  style={{ color: w.accent, textShadow: `0 0 24px ${w.accent}88, 0 0 50px ${w.accent}44` }}
                >
                  {w.n}
                </span>
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white/55 whitespace-nowrap">{w.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Cinematic aperture bars — a real camera-shutter read (closing
            in, then releasing) rather than a static letterbox crop. Plain
            divs bound directly to a scroll-driven MotionValue, no
            keyframe array, no `initial`/`animate` reconciliation — the
            established safe pattern for anything that must resolve
            correctly regardless of motion preference. */}
        <motion.div
          aria-hidden
          className="absolute top-0 inset-x-0 bg-[#05060a] pointer-events-none z-20"
          style={{ height: prefersReduced ? '0vh' : barHeight }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 inset-x-0 bg-[#05060a] pointer-events-none z-20"
          style={{ height: prefersReduced ? '0vh' : barHeight }}
        />
      </div>
    </section>
  )
}
