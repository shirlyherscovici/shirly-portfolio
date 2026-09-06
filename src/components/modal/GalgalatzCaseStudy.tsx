import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CaseStudyHeader from './CaseStudyHeader'
import FloatingElement from '../ui/FloatingElement'
import { GoldCoin, MusicNote } from '../ui/decor'
import { asset } from '../../lib/asset'
import { PROJECT_NUMBER } from '../../lib/projectMeta'

const ASSETS = {
  neonBox: asset('/assets/galgalatz/neon-box-tight.png'),
}

// Each of these is a real, already-composited phone mockup — the actual
// screen artwork placed inside the real phone frame by the designer, at
// the frame's own native canvas size (941×1672, matching
// glaglatz-phones-front.png exactly). No separate compositing needed on
// this end: the 3D tilt below is applied to the whole flat image, frame
// and screen moving together as one surface, so nothing can drift out of
// alignment the way the old hand-measured overlay could.
const FRAMES = [
  {
    key: 'key-art',
    label: 'Key Art',
    sub: '3D Neon Logo',
    src: asset('/assets/galgalatz/1_galgaltz_front.png'),
    alt: 'Galgalatz app splash screen — the neon "Music From The Screen" key art',
  },
  {
    key: 'star-born',
    label: 'Victory Story',
    sub: 'A Star Is Born (#1)',
    src: asset('/assets/galgalatz/3_galgaltz_front.png'),
    alt: 'Chart position #1 — A Star Is Born, "Shallow"',
  },
  {
    key: 'titanic',
    label: 'Victory Story',
    sub: 'Titanic (#2)',
    src: asset('/assets/galgalatz/4_galgaltz_front.png'),
    alt: 'Chart position #2 — Titanic, "My Heart Will Go On"',
  },
  {
    key: 'rocky',
    label: 'Victory Story',
    sub: 'Rocky III (#3)',
    src: asset('/assets/galgalatz/5_galgaltz_front.png'),
    alt: 'Chart position #3 — Rocky III, "Eye of the Tiger"',
  },
  {
    key: 'top50',
    label: 'Full Top 50',
    sub: 'Leaderboard',
    src: asset('/assets/galgalatz/2_galgaltz_front.png'),
    alt: 'Full leaderboard, chart positions 31–50',
  },
] as const

/* ------------------------------- Glass display case ------------------------------- */

function GlassDisplayCase({ highlighted }: { highlighted: boolean }) {
  const prefersReduced = useReducedMotion()
  return (
    <div className="relative h-full">
      {/* h-full, not its own vh-based height — this zone's proportions are
          now set by the parent artboard stage's fixed aspect ratio
          (measured from the mockup), not by this component sizing itself
          independently of the phone next to it. */}
      <motion.div
        animate={{
          // Both states carry the same two drop-shadow() functions — the
          // "off" state's second one is fully transparent/zero-blur rather
          // than omitted. Animating between a one-function and a
          // two-function filter value produces an unparseable
          // intermediate keyframe ("Invalid keyframe value for property
          // filter"), since the browser can't interpolate a filter list
          // against a different-length one.
          filter: highlighted
            ? 'drop-shadow(0 0 26px rgba(255,95,160,0.55)) drop-shadow(0 0 46px rgba(79,216,255,0.35))'
            : 'drop-shadow(0 0 18px rgba(79,216,255,0.18)) drop-shadow(0 0 0px rgba(79,216,255,0))',
          // A real neon tube flickers irregularly — a couple of quick
          // sub-frame dips, then a long stable stretch — not a metronomic
          // pulse. Clustering the dips in the first ~12% of a long (7s)
          // cycle, then holding steady for the rest, approximates that
          // without a true random generator. Kept on its own per-property
          // transition (below) so it runs independently of the
          // `highlighted` crossfade above, which fires on its own 0.4s
          // beat whenever a different filmstrip frame is selected.
          opacity: prefersReduced ? 1 : [1, 0.93, 1, 0.97, 1, 1, 1, 1],
        }}
        transition={{
          filter: { duration: 0.4 },
          opacity: prefersReduced ? { duration: 0 } : { duration: 7, times: [0, 0.03, 0.06, 0.09, 0.12, 0.4, 0.7, 1], repeat: Infinity, ease: 'easeInOut' },
        }}
        className="relative flex items-center justify-center h-full"
      >
        {/* Real 3D glass display case render — neon "Music From The Screen"
            key art, popcorn, film strip & clapperboard already baked in. */}
        <img
          src={ASSETS.neonBox}
          alt="Galgalatz × N12 — 3D glass display case with the neon 'Music From The Screen' key art, popcorn, film strip and clapperboard"
          className="w-full h-full object-contain"
        />
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest text-cine-cyan bg-black/50 px-2 py-1 rounded-full border border-cine-cyan/30">
          3D Display Case
        </span>
      </motion.div>
      {/* No floating note pinned to the case itself anymore — checked the
          mockup directly, and nothing sits immediately beside the
          cabinet. The two coins that actually appear near it live in the
          gap between cabinet and phone, positioned by the parent stage
          (see the "2 coins in the gap" comment below). */}
    </div>
  )
}

/* ------------------------------------ Phone ------------------------------------ */

/** The real phone mockup, already fully composited (frame + screen
 *  artwork) by the designer — see FRAMES above. This just crossfades
 *  between the 5 flat images and keeps the same "tuning channels"
 *  scanline beat the old synthetic screens had. No separate frame layer,
 *  no clip-path, no corner calibration: it's one flat image, so whatever
 *  3D tilt the parent applies to it, frame and screen tilt together,
 *  pixel-locked, by construction. */
function PhoneShot({ frame }: { frame: (typeof FRAMES)[number] }) {
  const prefersReduced = useReducedMotion()
  return (
    <div className="relative w-full h-full">
      <motion.img
        key={frame.key}
        src={frame.src}
        alt={frame.alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />
      {/* A bright scanline sweeps down as the frame changes — this is a
          radio station's own voting chart, so switching frames should feel
          like tuning between channels, not a slideshow crossfade. Keyed by
          `frame` so it replays on every switch; skipped entirely under
          reduced motion rather than reduced to a static remnant, since a
          motionless "scanline" would just look like a stray bar. */}
      {!prefersReduced && (
        <motion.div
          key={`scan-${frame.key}`}
          aria-hidden
          initial={{ top: '-15%', opacity: 0.9 }}
          animate={{ top: '115%', opacity: 0 }}
          transition={{ duration: 0.32, ease: 'easeIn' }}
          className="absolute inset-x-[13%] h-[8%] pointer-events-none z-20"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.35) 45%, rgba(79,216,255,0.25) 55%, transparent)' }}
        />
      )}
    </div>
  )
}

/* -------------------------------------- Film strip -------------------------------------- */

/** A row of 35mm-style film-strip sprocket holes. */
function SprocketRow() {
  return (
    <div className="flex justify-between px-3 shrink-0" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-[2px] bg-black/50 border border-white/15" />
      ))}
    </div>
  )
}

function FilmStrip({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <div className="relative rounded-2xl bg-black/40 backdrop-blur-xl border-2 border-white/20 shadow-cine-lg py-2.5 overflow-hidden">
      {/* Transparent 35mm film-strip border — perforation rows top & bottom */}
      <SprocketRow />
      {/* Grid, not a horizontal-scroll row — in the wide shell's two-column
          layout this strip lives in a narrower side column, where 6 items
          in one scrolling row would just hide most of them off-screen.
          A 2-column grid keeps every chapter visible without scrolling. */}
      <div className="my-2.5 px-3">
        <div className="grid grid-cols-2 gap-2.5">
          {FRAMES.map((f, i) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onSelect(i)}
              className={`relative w-full rounded-xl overflow-hidden border-2 transition-all text-left ${
                active === i
                  ? 'border-cine-cyan shadow-glow-cyan scale-[1.06] ring-2 ring-cine-cyan/40 ring-offset-2 ring-offset-black/60'
                  : 'border-white/15 hover:border-white/40 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={f.src} alt="" aria-hidden className="w-full aspect-[4/3] object-contain bg-black/30" />
              <div className={`absolute inset-0 transition-opacity ${active === i ? 'bg-gradient-to-t from-black/75 to-transparent' : 'bg-gradient-to-t from-black/90 to-black/20'}`} />
              <div className="absolute bottom-1 left-1.5 right-1.5">
                <p className={`text-[8.5px] font-bold leading-tight ${active === i ? 'text-cine-cyan' : 'text-white'}`}>{f.label}</p>
                <p className="text-[7.5px] text-white/60 leading-tight truncate">{f.sub}</p>
              </div>
              <span className="absolute top-1 left-1.5 text-[7px] font-mono text-white/50">{String(i + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>
      <SprocketRow />
    </div>
  )
}

/* ---------------------------------------- Export ---------------------------------------- */

export default function GalgalatzCaseStudy({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(0)

  return (
    <div className="relative">
      <CaseStudyHeader
        id="modal-galgalatz-title"
        stageLabel={PROJECT_NUMBER.galgalatz}
        title="Game UI UX Prototyping"
        supportLabel="Production Voting Flow & 3D Neon Integration"
        theme="dark"
        onClose={onClose}
        variant="inline-meta"
        meta={[
          { label: 'Role', value: 'Lead Graphic & UI/UX Designer' },
          { label: 'Crafted', value: 'Early 2022' },
          { label: 'Branding', value: 'N12 × Galgalatz Fusion' },
        ]}
      />

      {/* The joystick badge for this case study is rendered once, by
          ProjectModal (joystickBadgeSrc prop) — this used to ALSO render
          its own lucide-icon joystick here, so the real asset badge was
          stacking on top of a leftover placeholder instead of replacing
          it. Removed. */}

      {/* UX storytelling strip — moved ABOVE the cabinet/phone scene and
          given real visual weight (was small text sitting right against
          the phone's own edge below, easy to miss and hard to read there).
          This is the fast, recruiter-scannable problem → idea → build →
          result summary — important enough that it shouldn't be an
          afterthought under the visuals. */}
      <div className="px-5 sm:px-8 pb-4">
        <div className="rounded-2xl glass-cine-soft px-4 py-3 flex flex-wrap items-baseline gap-x-3 gap-y-1.5 text-[12px] sm:text-[13px]">
          {[
            { k: 'Challenge', v: 'A cluttered, low-engagement voting flow.' },
            { k: 'UX Idea', v: 'Guide users discover → listen → vote.' },
            { k: 'Execution', v: 'iPhone-first voting UI, real content.' },
            { k: 'Outcome', v: '+8.5K voters, +700% mobile boost.' },
          ].map((s, i, arr) => (
            <span key={s.k} className="flex items-baseline gap-2">
              <span>
                <span className="font-display font-bold uppercase tracking-wide text-cine-cyan">{s.k}</span>{' '}
                <span className="text-white/90 font-medium">{s.v}</span>
              </span>
              {i < arr.length - 1 && <span className="text-cine-cyan/40">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 sm:px-8 pb-6">
        {/* The modal now opens at the shared wide shell width (not a
            narrow portrait panel) so the page never needs to scroll to see
            the whole case study — the cabinet/phone scene and the film
            strip sit side by side on a real desktop viewport instead of
            stacking the strip below a scene that would otherwise stretch
            to the full wide width. Below lg, there's no room for two
            columns, so it falls back to the original stacked layout. */}
        {/* lg:items-stretch (the default — no items-start override
            anymore) so both columns share ONE height: the film strip
            column's own natural content height. The artboard below then
            sizes itself from THAT height (h-full + aspect-ratio, width
            computed from height) instead of being width-capped — cabinet
            and phone grow to fill whatever height the film strip needs,
            landing them all visually aligned instead of the scene sitting
            shorter than the strip beside it. */}
        <div className="lg:grid lg:grid-cols-[1.3fr_1fr] lg:gap-6">
        <div className="lg:h-full lg:flex lg:flex-col">
        {/* Fixed-aspect artboard (not flex-driven sizing) — cabinet and
            phone zones positioned at percentages pixel-measured directly
            from the reference file (cabinet's neon glow bounds ~9-49% of
            the card width; the phone's own screen color bounds ~63-92%),
            converted to this scene's own coordinate space. Aspect ratio
            765/680 approximates the measured cabinet+phone scene's own
            bounding box within the card (excluding header/filmstrip/
            metrics, which stay in normal flow above/below). Height-driven
            on lg (h-full of the stretched row, width computed from the
            aspect ratio) so it grows to match the film strip column's own
            height instead of stopping at a fixed max-width. Still
            width-driven below lg, where there's no second column to
            match. */}
        <div className="relative w-full max-w-[520px] mx-auto lg:mx-0 lg:w-auto lg:max-w-none lg:h-full" style={{ aspectRatio: '765 / 680' }}>
          <div className="absolute inset-y-0 left-0" style={{ width: '50%' }}>
            <GlassDisplayCase highlighted={active === 0} />
          </div>

          {/* Two coins in the cabinet-phone gap — nudged left to stay in
              the (now narrower) gap after the phone was enlarged to reach
              the cabinet's own full height. */}
          <FloatingElement delay={0.3} distance={8} magnetic className="absolute z-20" style={{ left: '51%', top: '22%' }}>
            <GoldCoin size={34} />
          </FloatingElement>
          <FloatingElement delay={0.9} distance={9} magnetic className="absolute z-20" style={{ left: '55%', top: '51%' }}>
            <GoldCoin size={40} />
          </FloatingElement>

          {/* Widened from 69%→60% (left) and given the cabinet's own full
              inset-y-0 span (was top/bottom 4%) — the phone's aspect-ratio
              is fixed, so it only grows by growing WIDTH; this now reaches
              close to the cabinet's own full height instead of visibly
              stopping short of it. */}
          <div className="absolute" style={{ left: '60%', right: '0%', top: '0%', bottom: '0%' }}>
            {/* Plain block wrapper, NOT flex — a flex row + an
                aspect-ratio child with width:100% was resolving the
                child to roughly half the intended size (a real
                flexbox+aspect-ratio sizing interaction, confirmed via
                DOM measurement: 112px rendered vs 221px available). */}
            <div className="relative h-full" style={{ perspective: 1400 }}>
              {/* The new front-facing phone render replaces the old
                  photographed/tilted one — it's a clean, un-tilted asset,
                  and the 5 screen mockups are already fully composited onto
                  it at its own native canvas size (941×1672), so there's no
                  separate frame + content overlay to keep aligned anymore:
                  it's one flat image, and the 3D tilt below is applied to
                  that whole image at once. Frame and screen can't drift
                  apart because they were never separate layers to begin
                  with. */}
              <motion.div
                className="relative w-full"
                style={{ aspectRatio: '941 / 1672', transformStyle: 'preserve-3d', rotateY: -9, rotateX: 3 }}
                whileHover={{ rotateY: -5, rotateX: 1.5, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              >
                <PhoneShot frame={FRAMES[active]} />
              </motion.div>

              {/* Screen nav arrows — cycle through the same FRAMES the
                  filmstrip below controls, so the phone can be browsed
                  directly without reaching for the thumbnails. */}
              <button
                type="button"
                onClick={() => setActive((n) => (n - 1 + FRAMES.length) % FRAMES.length)}
                aria-label="Previous screen"
                className="absolute top-[42%] -left-5 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-black/80 hover:scale-110 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setActive((n) => (n + 1) % FRAMES.length)}
                aria-label="Next screen"
                className="absolute top-[42%] -right-5 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center text-white hover:bg-black/80 hover:scale-110 transition-all"
              >
                <ChevronRight size={16} />
              </button>
              <p className="text-center mt-2.5 text-[10px] font-semibold uppercase tracking-wide opacity-60">N12 × Galgalatz — Production Voting</p>
            </div>
          </div>
        </div>
        </div>

        <div className="mt-5 lg:mt-0">
          <p className="text-[11px] font-display font-bold uppercase tracking-[0.18em] text-cine-cyan mb-1.5">Campaign Chapters <span className="text-cine-sub font-semibold tracking-wide">— Tap to explore</span></p>
          <FilmStrip active={active} onSelect={setActive} />
        </div>
        </div>
      </div>

      {/* Mockup's bottom bar is plain "LABEL: value" text triplets in one
          bordered pill — not the icon+big-number StatStrip used elsewhere.
          Matched exactly (down to reusing the same label/value type scale
          as the header's own inline meta line) rather than the generic
          stat-block component. */}
      <div className="px-5 sm:px-8 py-4 border-t border-white/10">
        <div className="rounded-2xl glass-cine-soft px-4 py-3.5 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-[11px] sm:text-xs text-cine-sub">
          {[
            { label: 'Impact', value: '+8.5K Voters' },
            { label: 'Engagement', value: '700% Mobile Boost' },
            { label: 'Visuals', value: '100% Custom Craft' },
          ].map((m) => (
            <p key={m.label}>
              <span className="font-bold text-white">{m.label}:</span> {m.value}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Gold coins and music notes breaking the whole MODAL's left/right edges
 *  — rendered via ProjectModal's `breakout` slot, outside the scroll
 *  container's clipping, matching the same outer-frame prop language used
 *  on the other three case studies. */
/** Checked the mockup file directly: nothing breaks the LEFT edge at
 *  all (the cabinet's own side has no floating objects) — every
 *  floating object sits in the gap between the cabinet and phone, or
 *  breaks the phone's own right edge. The two coins in the gap are
 *  positioned inside the artboard stage itself (see the stage JSX
 *  above), not here; this breakout is just the two notes that spill
 *  past the phone's right edge, at their pixel-measured heights
 *  (~26% and ~51% down the card). */
export function GalgalatzBreakout() {
  return (
    <>
      <FloatingElement delay={0.5} distance={9} magnetic className="absolute top-[24%] -right-8 sm:-right-12 z-30 hidden sm:block">
        <MusicNote size={36} />
      </FloatingElement>
      <FloatingElement delay={1.2} distance={9} magnetic className="absolute top-[49%] -right-7 sm:-right-11 z-30 hidden sm:block">
        <MusicNote size={30} />
      </FloatingElement>
    </>
  )
}
