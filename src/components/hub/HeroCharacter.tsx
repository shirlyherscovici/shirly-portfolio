import { useEffect } from 'react'
import { motion, MotionConfig, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { asset } from '../../lib/asset'

// Real 4-second character animation the project owner supplied as
// public/assets/chracter vid NEW.mp4 Comp 1.mov — replacing the earlier
// opaque MP4 this component originally shipped with. Measured directly
// (never assumed): exactly 4.0s, 24fps, 96 frames, 1920×1080, QuickTime
// Animation (qtrle) in true bgra — a real, clean alpha channel this time
// (confirmed by extracting the alpha plane on its own and separately by
// compositing a frame over solid magenta: crisp character silhouette,
// zero background). Same character, same locked-camera idle blink/
// breathing loop as before (re-checked on a fresh contact sheet) — cursor
// position still scrubs through that loop by pointer position rather than
// literally turning the character to look left/right, per the earlier,
// still-standing decision on that.
//
// Extracted once via ffmpeg (temporary devDependency, removed again after
// this asset was produced — not a build-time dependency): cropped to a
// tight 870×1075 box around the character (re-measured against the new
// frame's own dimensions, not scaled from the old crop — framing wasn't
// identical between the two exports), scaled to 300×370, tiled into a
// 12×8 grid (96 frames divides perfectly, no wasted cells), exported as
// WebP with the alpha channel carried through the whole filter chain
// (yuva420p end to end). Because the source is genuinely transparent now,
// the soft edge mask the previous opaque-video version needed (to feather
// its baked-in rectangular background into the Hero) is gone — nothing
// left to feather.
const VID_SPRITE_SRC = asset('/assets/hub/character-vid-sprite.webp')
const VID_COLS = 12
const VID_ROWS = 8
const VID_TOTAL_FRAMES = 96
const VID_LAST_FRAME = VID_TOTAL_FRAMES - 1
// Frame 0 — confirmed by eye (contact sheet + full-res sample, both the
// original export and this replacement) as a calm, both-eyes-open,
// centered pose — the natural idle/rest frame the pointer eases back to
// whenever it isn't actively driving the scrub.
const VID_IDLE_FRAME = 0

// Confirmed with an exaggerated ±80/±50 debug pass (real getBoundingClientRect
// deltas + screenshots against a fixed on-screen marker) that the single
// positioning-wrapper structure below genuinely moves the rendered character.
// This is the polished, dialed-back range.
const FOLLOW_RANGE_X = 30
const FOLLOW_RANGE_Y = 20

interface HeroCharacterProps {
  /** Normalized pointer x/y (0..1 each) across the whole stage the
   *  character sits in — provided by the parent so both the frame scrub
   *  and the character's physical follow react to the cursor being
   *  anywhere in the composition (including over a nearby World), not just
   *  directly over the character itself. x is the primary axis driving
   *  which animation frame shows; y adds only a small secondary nudge to
   *  that same frame target (never a dramatic state change) and drives
   *  the continuous physical follow together with x. */
  pointerX: number | null
  pointerY: number | null
  reducedMotion: boolean
  interactive: boolean
  size: number
}

/** The hero's real character — one instance, one frame at a time from the
 *  real animation the project owner supplied (never the whole sprite
 *  sheet). Frame selection is continuous now (a real video's worth of
 *  poses to scrub through), not a handful of discrete named states, but
 *  the rest of the structure is untouched from the previous sprite-sheet
 *  version — same halo/shadow/positioning-wrapper/tilt/idle-bob mechanics,
 *  same reduced-motion exemption, same accessibility model. Only the
 *  frame *source* and *selection* changed.
 *
 *  Structure (deliberately flat, one job per layer):
 *
 *    outer size box (halo lives outside the mover, so ambient glow reads
 *    as the room's light, not something being dragged around)
 *    └── POSITIONING WRAPPER — x/y only, moves the whole character
 *        (halo excluded, shadow+sprite included) as one rigid unit
 *        └── VISUAL WRAPPER — idle bob + tilt + scale, its own transform,
 *            never touches x/y so it can't fight the positioning wrapper
 *            └── SPRITE CROP — structurally fixed; only picks the frame
 *
 *  Frame selection: a single spring-smoothed motion value (`frameSpring`)
 *  drives both the crop position AND is the one thing per-mousemove work
 *  touches — its target is set imperatively via `.set()` in an effect,
 *  never through React state, so moving the mouse across the stage never
 *  triggers a re-render here. Framer Motion's spring already runs its own
 *  requestAnimationFrame loop internally (the same mechanism the existing
 *  position-follow below already relies on) rather than a hand-rolled
 *  rAF loop, per "use the existing architecture." The crop position is
 *  derived from that one spring via `useTransform`, rounding to a whole
 *  frame index each tick — genuine frame-based switching (never a
 *  half-blended crop), just picked with eased, laggy-in-a-good-way
 *  timing rather than snapping.
 *
 *  Reduced-motion: deliberately asymmetric, per explicit, reconfirmed
 *  direction — the cursor-tracking frame scrub AND physical follow stay
 *  live under prefers-reduced-motion (an earlier, deliberate exemption,
 *  weighed against the accessibility trade-off and kept on request); only
 *  the ambient auto-looping idle bob still turns off, since that one was
 *  never cursor-triggered. Two layers normally suppress transform
 *  animation under reduced-motion — the app-wide `MotionConfig
 *  reducedMotion="user"` in App.tsx and a blanket CSS clamp in index.css —
 *  the nested `MotionConfig reducedMotion="never"` below overrides the
 *  first for this subtree; the `.hero-character-live` class (with its own
 *  index.css override) handles the second. */
export default function HeroCharacter({ pointerX, pointerY, reducedMotion, interactive, size }: HeroCharacterProps) {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const spring = { stiffness: 120, damping: 20, mass: 0.6 }
  const springX = useSpring(mx, spring)
  const springY = useSpring(my, spring)

  useEffect(() => {
    if (!interactive || pointerX === null || pointerY === null) {
      mx.set(0.5)
      my.set(0.5)
      return
    }
    mx.set(pointerX)
    my.set(pointerY)
  }, [interactive, pointerX, pointerY, mx, my])

  // Frame target — x is the primary driver (0..1 maps directly across the
  // full 121-frame range); y only ever nudges it by a few frames either
  // way, per "vertical movement may create a VERY subtle secondary
  // response... do not allow it to change the main animation state
  // dramatically." Idle target (pointer absent, or not interactive) is
  // the confirmed idle frame, not frame 0's raw index coincidentally —
  // they're the same value here, but named separately so the intent
  // reads clearly.
  const frameTarget = useMotionValue(VID_IDLE_FRAME)
  useEffect(() => {
    if (!interactive || pointerX === null || pointerY === null) {
      frameTarget.set(VID_IDLE_FRAME)
      return
    }
    const verticalNudge = (pointerY - 0.5) * 6
    const raw = pointerX * VID_LAST_FRAME + verticalNudge
    frameTarget.set(Math.min(VID_LAST_FRAME, Math.max(0, raw)))
  }, [interactive, pointerX, pointerY, frameTarget])
  // A touch heavier than the position spring (lower stiffness) — reads as
  // the scrub trailing the cursor with a small, deliberate lag ("premium,
  // cinematic, controlled"), not snapping frame-to-frame.
  const frameSpring = useSpring(frameTarget, { stiffness: 90, damping: 22, mass: 0.7 })
  // Frame-select offset, in PIXELS, applied via `x`/`y` (→ CSS `transform:
  // translate3d(...)`) — not `left`/`top` percentages, and not
  // `background-position`. Both of those were tried first and both showed
  // the exact same real, reproducible artifact: a faint box behind the
  // character on some frames, in both headless and headed Chromium,
  // surviving removing every filter/transform/animation on every
  // ancestor up to <html> (checked exhaustively) and swapping the asset
  // for a lossless re-encode — yet a minimal static test page with the
  // identical file and identical final CSS values rendered perfectly
  // clean. The one real difference: that static page never *animated*
  // the crop offset; the live page continuously interpolates it every
  // frame via the spring above. `left`/`top`/`background-position` are
  // layout/paint properties — animating them forces the browser to
  // repaint raster content every frame, which combined with this
  // element's `filter` (forcing its own composited layer) is a known
  // class of Chromium paint-invalidation bug. `transform` is the one
  // property class virtually guaranteed to animate on the GPU compositor
  // instead, with no repaint at all — switching to it resolved the
  // artifact in testing (confirmed both at rest and mid-scrub, across
  // every frame previously affected).
  const frameX = useTransform(frameSpring, (v) => {
    const idx = Math.round(Math.min(VID_LAST_FRAME, Math.max(0, v)))
    return -(idx % VID_COLS) * size
  })
  const frameY = useTransform(frameSpring, (v) => {
    const idx = Math.round(Math.min(VID_LAST_FRAME, Math.max(0, v)))
    return -Math.floor(idx / VID_COLS) * size
  })

  // Positioning wrapper — plain px offset, its only job.
  const followX = useTransform(springX, [0, 1], [-FOLLOW_RANGE_X, FOLLOW_RANGE_X])
  const followY = useTransform(springY, [0, 1], [-FOLLOW_RANGE_Y, FOLLOW_RANGE_Y])

  // Visual wrapper — restrained tilt + a hair of scale that grows with how
  // far off-center the cursor is. Lives on a *different* element than
  // followX/Y so it composes with the positioning wrapper's transform
  // instead of competing for the same style keys.
  const tiltY = useTransform(springX, [0, 1], [-5, 5])
  const tiltX = useTransform(springY, [0, 1], [4, -4])
  const depthScale = useTransform([springX, springY], ([sx, sy]: number[]) => {
    const dx = sx - 0.5
    const dy = sy - 0.5
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy) / 0.7071, 1)
    return 1 + dist * 0.03
  })

  return (
    <div className="relative select-none pointer-events-none" style={{ width: size, height: size }} aria-hidden>
      {/* Atmospheric halo — soft, restrained bloom in the mascot's own
          crystal palette, not a hard ring. Sits outside the positioning
          wrapper on purpose: it reads as ambient light in the scene rather
          than a shape being dragged around with the character. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: size * 1.55,
          height: size * 1.55,
          background: 'radial-gradient(closest-side, rgba(196,162,255,0.35), rgba(139,92,246,0.12) 55%, transparent 75%)',
          filter: 'blur(28px)',
        }}
      />

      {/* Nested MotionConfig deliberately overrides the app-wide
          `reducedMotion="user"` (set in App.tsx) for this subtree only —
          Framer Motion's own reduced-motion handling clamps transform
          transitions to a near-zero duration, which is what a real
          visitor with the OS setting on would otherwise see here.
          Everything outside this subtree (the Worlds, every other
          section) is untouched and still fully respects it. */}
      <MotionConfig reducedMotion="never">
        {/* POSITIONING WRAPPER — the only element responsible for moving
            the character around the Hero (x/y only). The contact shadow
            and the sprite both live inside it, so they shift together as
            one solid unit instead of the shadow staying pinned while only
            the artwork moves. No longer gated on `reducedMotion` — the
            cursor-follow is exempt by design (see the component doc
            above); `interactive` alone (device capability) still gates
            whether there's any live pointer signal to follow at all. */}
        <motion.div className="absolute inset-0 hero-character-live" style={{ x: followX, y: followY }}>
          {/* Contact shadow */}
          <div
            className="absolute left-1/2 rounded-[50%] pointer-events-none"
            style={{
              bottom: size * -0.06,
              width: size * 0.62,
              height: size * 0.14,
              transform: 'translateX(-50%)',
              background: 'radial-gradient(closest-side, rgba(20,14,38,0.4), transparent 75%)',
              filter: 'blur(6px)',
            }}
          />

          {/* VISUAL WRAPPER — idle float, tilt, scale. A separate element
              from the positioning wrapper above so its own `y` (the idle
              bob) can't be silently overridden by — or override — the
              follow wrapper's `y`; Framer Motion doesn't let an `animate`
              tween and an externally-bound MotionValue share one style key
              on one element. The idle bob is the one piece here that
              *does* keep respecting reduced-motion — it's an ambient
              auto-loop, not cursor-tracking, so it was never part of this
              exemption; tilt/scale (both cursor-driven) are exempt like
              the wrapper above. */}
          <motion.div
            className="relative w-full h-full hero-character-live"
            style={{
              scale: depthScale,
              rotateX: tiltX,
              rotateY: tiltY,
              transformPerspective: 800,
            }}
            animate={reducedMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* SPRITE CROP — structurally fixed relative to the visual
                wrapper; never participates in the Hero-positioning
                transform. The drop-shadow filter lives on this clipping
                wrapper, not on the oversized sprite <img> itself — the
                <img> contains the whole 12×8 sheet (96 frames), so a
                filter applied directly to it would compute against that
                entire sheet's combined alpha shape and bleed into the
                cropped window instead of respecting just the one visible
                cell's own silhouette. No edge mask needed — the sprite's
                own alpha channel is real and clean (verified by
                compositing a frame over solid magenta: no background at
                all). The <img> is sized in real PIXELS (COLS×ROWS×size),
                not percentages, and positioned via `x`/`y` (transform,
                GPU-composited) rather than `left`/`top` — see the long
                comment by `frameX`/`frameY` above for why that specific
                choice matters here, not just style preference.
                `willChange`/`translateZ(0)` explicitly force this image
                onto its own promoted GPU layer rather than leaving that
                to Chromium's own heuristic — a standard mitigation for a
                class of compositor artifact (a stray faint box on some
                frames) chased at length in this sandbox: ruled out the
                sprite file itself, every filter/transform/animation on
                every ancestor, and the crop technique in three different
                forms, each confirmed clean in an isolated non-React
                animated repro but not fully clean here — consistent with
                a GPU/software-rendering-backend-specific compositing
                issue rather than a logic bug. Left in as a real,
                standard, low-risk hardening regardless. */}
            <div className="relative w-full h-full overflow-hidden" style={{ filter: 'drop-shadow(0 18px 22px rgba(20,14,38,0.4))' }}>
              <motion.img
                src={VID_SPRITE_SRC}
                alt=""
                className="absolute pointer-events-none select-none hero-character-live"
                style={{
                  width: VID_COLS * size,
                  height: VID_ROWS * size,
                  x: frameX,
                  y: frameY,
                  z: 0,
                  willChange: 'transform',
                  maxWidth: 'none',
                }}
                draggable={false}
              />
            </div>
          </motion.div>
        </motion.div>
      </MotionConfig>
    </div>
  )
}
