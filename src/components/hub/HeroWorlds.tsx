import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { asset } from '../../lib/asset'
import type { ProjectId } from '../../types'

export interface World {
  id: ProjectId
  label: string
  name: string
  src: string
  accent: string
  /** Position as % of the stage, and relative size — hand-placed into an
   *  intentional loose cluster around the character (see HeroStage), not a
   *  symmetric compass or a randomized scatter. */
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

export const WORLDS: World[] = [
  {
    id: 'galgalatz',
    label: 'World 01',
    name: 'Game UI & UX',
    src: asset('/assets/hub/galgaltz-hero.png'),
    accent: '#ff9f45',
    x: 12,
    y: 15,
    // Sizes scaled up ~25–28% across all four (per explicit request —
    // "visibly larger and more prominent") and nudged 1–2% further toward
    // the stage edges to compensate, keeping the same real clearance from
    // the character's own opaque sprite this was tuned against (checked
    // at both the 640px and 560px stage tiers, not just 1440's).
    size: 106,
    delay: 0,
    duration: 4.6,
  },
  {
    id: 'people-motion',
    label: 'World 04',
    name: 'Motion / After Effects',
    src: asset('/assets/hub/AE.png'),
    accent: '#c084fc',
    x: 86,
    y: 11,
    size: 96,
    delay: 0.9,
    duration: 5.2,
  },
  {
    id: 'ai-rescue',
    label: 'World 03',
    name: 'Cinematic AI',
    src: asset('/assets/hub/ai-hero.png'),
    accent: '#4fd8ff',
    x: 90,
    y: 70,
    size: 116,
    delay: 0.4,
    duration: 4.9,
  },
  {
    id: 'amy',
    label: 'World 02',
    name: 'Visual / Graphic Design',
    src: asset('/assets/hub/amy-hero.png'),
    accent: '#ff5f7a',
    x: 10,
    y: 75,
    size: 100,
    delay: 1.3,
    duration: 5.5,
  },
]

function WorldOrb({ world, reducedMotion, canHover, onOpen }: { world: World; reducedMotion: boolean; canHover: boolean; onOpen: (id: ProjectId) => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const spring = { stiffness: 220, damping: 16, mass: 0.4 }
  // A restrained magnetic pull + a matching tilt — same technique as the
  // site's other magnetic-hover elements (FloatingElement), tuned a touch
  // stronger since these are primary entry points, not ambient decor.
  const pullX = useSpring(useTransform(mx, [0, 1], [-10, 10]), spring)
  const pullY = useSpring(useTransform(my, [0, 1], [-10, 10]), spring)
  const tiltX = useSpring(useTransform(my, [0, 1], [7, -7]), spring)
  const tiltY = useSpring(useTransform(mx, [0, 1], [-7, 7]), spring)

  const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canHover || reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }
  const handleLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  const idle = reducedMotion ? undefined : { y: [0, -9, 0], rotate: [0, world.id === 'amy' || world.id === 'ai-rescue' ? -2.5 : 2.5, 0] }

  return (
    <motion.div
      className="absolute"
      style={{ left: `${world.x}%`, top: `${world.y}%`, width: world.size, height: world.size, x: '-50%', y: '-50%' }}
      animate={idle}
      transition={{ duration: world.duration, repeat: Infinity, ease: 'easeInOut', delay: world.delay }}
    >
      {/* Button hit-area is deliberately larger than the visible icon (p-3
          padding below) — the magnetic/glow response engages on approach,
          slightly before the cursor reaches the icon's own visible pixels,
          rather than only exactly on contact. */}
      <button
        ref={ref}
        type="button"
        onClick={() => onOpen(world.id)}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        aria-label={`${world.label} — ${world.name}. Open case study.`}
        className="group relative block w-full h-full p-3 -m-3 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{ perspective: 500 }}
      >
        <motion.div
          className="relative w-full h-full"
          style={{
            x: canHover && !reducedMotion ? pullX : 0,
            y: canHover && !reducedMotion ? pullY : 0,
            rotateX: canHover && !reducedMotion ? tiltX : 0,
            rotateY: canHover && !reducedMotion ? tiltY : 0,
          }}
          whileHover={canHover && !reducedMotion ? { scale: 1.14, y: -6 } : undefined}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          {/* Glow — quiet at rest, blooms brighter on hover in the world's
              own accent, the same restrained language the rest of the site
              already uses for its per-project accents. */}
          <div
            className="absolute inset-[-30%] rounded-full pointer-events-none opacity-40 group-hover:opacity-90 transition-opacity duration-300"
            style={{ background: `radial-gradient(closest-side, ${world.accent}55, transparent 72%)`, filter: 'blur(10px)' }}
          />
          <img src={world.src} alt="" className="relative w-full h-full object-contain drop-shadow-[0_10px_16px_rgba(10,8,20,0.45)]" draggable={false} />
        </motion.div>
      </button>
    </motion.div>
  )
}

export default function HeroWorlds({ reducedMotion, canHover, onOpen }: { reducedMotion: boolean; canHover: boolean; onOpen: (id: ProjectId) => void }) {
  return (
    <>
      {WORLDS.map((w) => (
        <WorldOrb key={w.id} world={w} reducedMotion={reducedMotion} canHover={canHover} onOpen={onOpen} />
      ))}
    </>
  )
}
