import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import HeroCharacter from './HeroCharacter'
import HeroWorlds from './HeroWorlds'
import { useCanHover } from '../../lib/useCanHover'
import type { ProjectId } from '../../types'

/** Character + stage size, tuned per viewport width so the character reads
 *  as the dominant centerpiece everywhere — not one fixed px number reused
 *  at every breakpoint. The character:stage ratio (~0.53) is kept roughly
 *  constant across the desktop/1280 tiers specifically so the four Worlds'
 *  existing hand-placed % positions (see HeroWorlds' WORLDS array) stay
 *  clear of the character's actual opaque sprite at every size — only the
 *  character's own soft halo is meant to bleed toward them. */
function useHeroSizes() {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1440))
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Sized to fit the Hero's own share of a one-desktop-viewport homepage
  // (Hero + all four project cards together, no scroll) alongside its text
  // column, rather than the character's own natural full size — the
  // character/design itself is unchanged, only the stage it's rendered at
  // is smaller than the earlier full-bleed hero treatment. Bumped again
  // (was 210/390, 180/330) — checked directly against the approved
  // mockup, where the character reads as the dominant focal point of the
  // whole page; this is the largest size that still leaves the four
  // project cards their own required tall proportions within the shared
  // one-screen vertical budget (see PortfolioHub's 52/48 hero/grid split).
  if (width >= 1440) return { character: 235, stage: 420 }
  // Covers the ~1024–1439 band (1280×800 included) — scaled down a touch
  // from the full desktop size to match the slightly tighter hero column.
  if (width >= 1024) return { character: 200, stage: 360 }
  // Below `lg` the layout stacks (copy above, stage centered below), so
  // the stage's width is no longer set by the 52% column — it scales with
  // the viewport itself, clamped to the ~220–260px range that fits a phone
  // without crowding it.
  const character = Math.round(Math.min(260, Math.max(220, width * 0.58)))
  return { character, stage: Math.round(character / 0.56) }
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
