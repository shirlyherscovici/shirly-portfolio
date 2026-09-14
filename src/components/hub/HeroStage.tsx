import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import HeroCharacter from './HeroCharacter'
import HeroWorlds from './HeroWorlds'
import { useCanHover } from '../../lib/useCanHover'
import { asset } from '../../lib/asset'
import type { ProjectId } from '../../types'

// A real sci-fi landing-pad render (transparent PNG, 2.25:1) — sits behind
// the character's feet so it reads as something the character is standing
// on, not floating in empty space (explicit request). Positioned as a %
// of the stage rather than the character's own box, since the character
// itself is a plain absolutely-centered sprite with no exposed "feet
// coordinate" to hook into — tuned by eye against the character's actual
// rendered stance (checked via screenshot, not just left at a guess).
const PLATFORM_SRC = asset('/assets/hub/platform.png')

// Character:stage ratio — was 0.56, then 0.7, now 0.85 (explicit direction,
// re-checked against mockup.png: Amy's absolute on-screen height there is
// roughly a third of the full viewport height, well beyond what 0.7 was
// producing). Kept as one constant (not a magic number repeated at both
// breakpoints below) since the platform position, contact shadow and the
// four Worlds' own hand-placed % clearance all implicitly depend on it.
const CHARACTER_RATIO = 0.85

/** Character + stage size, tuned per viewport so the character reads as
 *  the dominant centerpiece everywhere — not one fixed px number reused
 *  at every breakpoint. The character:stage ratio (CHARACTER_RATIO) is
 *  kept roughly constant so the four Worlds' existing hand-placed %
 *  positions (see HeroWorlds' WORLDS array) stay clear of the character's
 *  actual opaque sprite at every size — only the character's own soft
 *  halo is meant to bleed toward them. */
function useHeroSizes() {
  const [size, setSize] = useState(computeHeroSizes)
  useEffect(() => {
    const onResize = () => setSize(computeHeroSizes())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

function computeHeroSizes() {
  if (typeof window === 'undefined') return { character: 210, stage: 375 }
  const width = window.innerWidth
  const height = window.innerHeight

  if (width >= 1024) {
    // Desktop/laptop: the stage's height budget is derived from the REAL
    // viewport height, not a fixed per-width-breakpoint guess — "1024px+
    // wide" alone spans everything from a 768px-tall laptop panel to a
    // 1440px-tall external monitor, and a stage size tuned for the tall
    // case (420px) silently overflowed the hero row's own share of a
    // 768px-tall screen, forcing the whole one-screen composition below
    // the fold (caught via a real laptop report — "only fits at 50%
    // zoom" — a plain width breakpoint can't see viewport height at all).
    // PortfolioHub gives the hero row 52% of (100vh - 56px header); this
    // mirrors that same math (minus ~40px breathing room for the row's
    // own padding/gap) so the stage is guaranteed to fit whatever that
    // share actually resolves to, on any laptop height, not just the
    // ones that happened to get tested.
    const heroBudget = (height - 56) * 0.52 - 40
    const stage = Math.round(Math.min(420, Math.max(260, heroBudget)))
    return { character: Math.round(stage * CHARACTER_RATIO), stage }
  }
  // Below `lg` the layout stacks (copy above, stage centered below), so
  // the stage's width is no longer set by the 52% column — it scales with
  // the viewport itself, clamped to a range that fits a phone without
  // crowding it, scaled up by the same factor CHARACTER_RATIO moved by
  // (0.56 → 0.85) so mobile grows in step with desktop instead of hitting
  // its old, now comparatively tiny, cap.
  const character = Math.round(Math.min(395, Math.max(330, width * 0.58 * (CHARACTER_RATIO / 0.56))))
  return { character, stage: Math.round(character / CHARACTER_RATIO) }
}

/** The hero's right-side composition: one character, four Worlds arranged
 *  intentionally around it. Owns the shared state — the pointer's
 *  normalized x/y position across the whole stage — that drives the
 *  character's facing/excited frame and its physical follow/depth response
 *  (see HeroCharacter for the split); each World's own hover response is
 *  local to itself (see HeroWorlds). Touch/no-hover devices fall back to
 *  the same composition at rest for everything (centered character, worlds
 *  in the same spots, no pointer-follow — there's no real pointer to
 *  follow there regardless). prefers-reduced-motion is *not* symmetric,
 *  per explicit direction: the Worlds' own idle drift/magnetic hover still
 *  fully respects it, but the character's cursor-follow deliberately
 *  doesn't (see HeroCharacter's doc comment for why) — `pointerX`/`pointerY`
 *  here are tracked whenever a real pointer device is present, independent
 *  of that OS setting. */
export default function HeroStage({ onOpen }: { onOpen: (id: ProjectId) => void }) {
  const prefersReduced = useReducedMotion()
  const canHover = useCanHover()
  // The character's own cursor-follow is deliberately exempt from
  // prefers-reduced-motion (explicit direction — see HeroCharacter's doc
  // comment for the accessibility trade-off this was weighed against), so
  // pointer *tracking* here is gated on device capability alone; the
  // Worlds still get the OS-respecting value below, untouched.
  const characterInteractive = canHover
  const { character: characterSize, stage: stageSize } = useHeroSizes()

  const stageRef = useRef<HTMLDivElement>(null)
  const [pointerX, setPointerX] = useState<number | null>(null)
  const [pointerY, setPointerY] = useState<number | null>(null)

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!characterInteractive) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    setPointerX(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)))
    setPointerY(Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)))
  }
  const handleLeave = () => {
    if (!characterInteractive) return
    setPointerX(null)
    setPointerY(null)
  }

  return (
    <div
      ref={stageRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full aspect-square"
      style={{ maxWidth: stageSize }}
    >
      {/* Platform — behind the character (earlier in DOM order, no
          explicit z-index needed since both are plain absolute children
          of this same stack). pointer-events-none: it's set dressing, not
          a World icon — clicks must pass through to whatever's beneath.
          Deliberately wider than the stage box itself (was 96%, capped to
          the stage's own width) — mockup.png's platform reads as a big,
          wide turntable Amy stands on, not a disc sized to match her own
          footprint; letting it overflow the (otherwise-square) stage
          horizontally is what gets that same "she's standing on something
          much bigger than her" read without inflating the stage box
          itself (which would eat into the text column's own room). The
          hero section's own horizontal padding still has enough margin on
          both sides at every breakpoint this was checked against for the
          overflow not to visibly clip. */}
      <img
        src={PLATFORM_SRC}
        alt=""
        aria-hidden
        className="absolute left-1/2 pointer-events-none select-none"
        style={{ top: '80%', width: '150%', transform: 'translate(-50%, -50%)' }}
        draggable={false}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <HeroCharacter
          pointerX={pointerX}
          pointerY={pointerY}
          reducedMotion={!!prefersReduced}
          interactive={characterInteractive}
          size={characterSize}
        />
      </div>
      <HeroWorlds reducedMotion={!!prefersReduced} canHover={canHover} onOpen={onOpen} />
    </div>
  )
}
