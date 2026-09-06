import { motion, useReducedMotion } from 'framer-motion'
import { Users, TrendingUp, Heart, PenTool, Palette, ExternalLink, ChevronLeft } from 'lucide-react'
import CaseStudyHeader from './CaseStudyHeader'
import StatStrip from '../ui/StatStrip'
import FloatingElement from '../ui/FloatingElement'
import { MusicNote, TreasureChest, VinylRecord } from '../ui/decor'
import AmyRosterGrid from './AmyRosterGrid'
import AmyBeforeAfterPhone from './AmyBeforeAfterPhone'
import { useCountUp } from '../../lib/useCountUp'
import { asset } from '../../lib/asset'
import { PROJECT_NUMBER } from '../../lib/projectMeta'

const ASSETS = {
  figure: asset('/assets/amy/amy-figure-birds-gems.png'),
}

/* -------------------------- Hero figure composition -------------------------- */

function AmyHeroFigure({ dark }: { dark: boolean }) {
  return (
    <div className="relative h-full overflow-visible">
      {/* h-full, not its own aspect-ratio — this zone's actual proportions
          are now set by the artboard stage's own aspect-ratio (measured
          from the mockup card), not by this component in isolation. */}
      <div
        className={`relative h-full rounded-[24px] overflow-visible border shadow-pearl-sm flex items-end justify-center px-1 pt-6 ${
          dark ? 'bg-gradient-to-b from-[#2b1f26] to-[#170f14] border-white/10' : 'bg-gradient-to-b from-[#fdf3e8] to-[#f6ded7] border-white'
        }`}
      >
        {/* Real character render — the box, roses, golden swallow, vinyl
            record and music note are all baked into the source artwork.
            Enlarged and allowed to spill past the panel's own edges. */}
        <img
          src={ASSETS.figure}
          alt="AMY — Amy Winehouse tribute character emerging from a gift box, with a golden swallow, roses and a vinyl record"
          className="w-[132%] max-w-none h-full max-h-[124%] object-contain drop-shadow-xl relative z-10"
        />
      </div>
      {/* No separate floating swallow/vinyl/coin here anymore — checked
          the actual source artwork (amy-figure-birds-gems.png) directly
          and it already has the swallow, the vinyl record, AND a music
          note baked in at bottom-left. The earlier floating GoldCoin and
          VinylRecord elements were rendering a second copy of things the
          image already shows, which the mockup doesn't do — it has
          exactly one of each. */}
    </div>
  )
}

/* -------------------------------- Metric badges -------------------------------- */

function ChestBadge({ dark }: { dark: boolean }) {
  const growth = useCountUp('+74%')
  return (
    <div
      // Light mode used to sit on `glass-pearl-soft` — a translucent
      // WHITE glass. Fine with the old dark-red number, but white text
      // (per explicit request, for both this number and the pie badge's)
      // would have gone straight to unreadable on it. A rich crimson
      // gradient (matching the "Amy" gift-box red already used for the
      // View Live Project button) replaces it in both modes, so white
      // text has real contrast either way.
      className="relative flex-1 rounded-2xl border p-3.5 text-center overflow-hidden bg-gradient-to-br from-[#c9576b] to-[#7a1a26] border-pearl-gold/40"
      style={{ boxShadow: '0 10px 24px -8px rgba(176,42,58,0.28), 0 2px 6px rgba(35,31,44,0.08)' }}
    >
      {/* 3D treasure chest stands in for the old text badge — a synthetic
          pop-art ornament (no real "bonus reward" asset exists yet: a
          3d-treasure-chest.png was requested but isn't in the project, so
          this SVG stays in place with the requested crimson glow until a
          real render is provided), gold/red to match the gift box & roses. */}
      <TreasureChest size={80} className="mx-auto" style={{ filter: 'drop-shadow(0px 8px 16px rgba(208,44,58,0.35))' }} />
      {/* Sized down from text-5xl/6xl — at that size "+74%" was clipping
          against the badge's own edges in the wide-shell layout. White
          (was dark red) now that the badge itself carries the color. */}
      <p
        className="font-display font-black text-4xl sm:text-5xl text-white leading-none tabular-nums mt-2"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.35), 0 0 24px rgba(0,0,0,0.2)' }}
      >
        {growth}
      </p>
      <p className="mt-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-white">Active User Growth</p>
    </div>
  )
}

/** A real, slow-spinning vinyl record — `disk.png`, already a supplied
 *  asset and already imported into `decor.tsx` as `VinylRecord`, but
 *  previously unused anywhere in the rendered Amy module or case study
 *  (the figure has its own baked-in vinyl, so a second copy layered on
 *  top of her would just duplicate it — this one lives beside the badges
 *  instead, its own small moment). A real 33⅓rpm turntable reads as
 *  ~1.8s/rotation; deliberately much slower (7s) so it reads as ambience
 *  — "the campaign this case study is about is a music tribute" — rather
 *  than a literal turntable-speed gimmick. */
function SpinningVinyl({ className = '' }: { className?: string }) {
  const prefersReduced = useReducedMotion()
  if (prefersReduced) {
    return (
      <div className={className} aria-hidden>
        <VinylRecord size={40} className="opacity-90 drop-shadow-lg" />
      </div>
    )
  }
  return (
    <motion.div aria-hidden className={className} animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}>
      <VinylRecord size={40} className="opacity-90 drop-shadow-lg" />
    </motion.div>
  )
}

function RingBadge({ dark }: { dark: boolean }) {
  const pct = useCountUp('+40%')
  return (
    <div
      // Matches ChestBadge's badge treatment — see its comment on why
      // light mode moved off `glass-pearl-soft` (a white glass, no
      // contrast for white text) to this crimson gradient.
      className="relative flex-1 rounded-2xl border p-3.5 text-center overflow-hidden bg-gradient-to-br from-[#c9576b] to-[#7a1a26] border-pearl-gold/40"
      style={{ boxShadow: '0 10px 24px -8px rgba(176,42,58,0.28), 0 2px 6px rgba(35,31,44,0.08)' }}
    >
      {/* Real rendered 3D ring badge (gold / crimson / black), replacing
          the earlier hand-built CSS conic-gradient donut — the percentage
          sits in the ring's own transparent center hole (the ring art
          itself is centered in its square canvas, confirmed directly).
          Sized to read as the same visual weight as the chest icon next
          to it (a graphic-design "these two badges are a matched pair"
          balance), not dramatically bigger. */}
      <div className="relative mx-auto mt-0 w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
        <img src={asset('/assets/amy/pie.png')} alt="" className="absolute inset-0 w-full h-full object-contain drop-shadow-lg" />
        {/* The hole in the ring art has real room (~55% of the canvas),
            but "+40%" at the old size still read as touching its inner
            edge — a fixed max-width, well inside the hole, guarantees
            breathing room on every side regardless of exact string
            length. White (was dark red) to match ChestBadge's number. */}
        <p
          className="relative font-display font-black text-xl sm:text-2xl text-white leading-none tabular-nums max-w-[60%] mx-auto"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4), 0 0 20px rgba(0,0,0,0.25)' }}
        >
          {pct}
        </p>
      </div>
      <p className="mt-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-white">Increased Engagement</p>
    </div>
  )
}

/* --------------------------- Phone + roster composition --------------------------- */

/** The new front-facing phone render (replaces the old photographed/tilted
 *  one) with the "27 Club" flip grid composited into its actual screen
 *  bounds, and a 3D tilt applied here in CSS rather than baked into a
 *  photo. Shared between the desktop artboard (one absolutely-positioned
 *  zone among three) and the mobile layout below (stands alone, full
 *  width) so the same device-framing technique — and the same asset — is
 *  used at every size. */
function PhoneRosterZone() {
  return (
    <div className="relative w-full" style={{ aspectRatio: '941 / 1672', perspective: 1400 }}>
      {/* Frame and screen content live in ONE 3D-tilted parent — since the
          new render is front-facing (un-tilted, clean axis-aligned screen
          rectangle, measured directly against this asset: ~10–90% width,
          ~9.7–89.5% height), they never need separate per-layer alignment;
          whatever tilt is applied here, both move together as one rigid
          surface. */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d', rotateY: 8, rotateX: 3 }}
        whileHover={{ rotateY: 4, rotateX: 1.5, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <img
          src={asset('/assets/amy/amy-phones-front.png')}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          draggable={false}
        />
        <div
          className="absolute overflow-y-auto no-scrollbar rounded-[10px]"
          // The roster cards inside AmyRosterGrid weren't responding to
          // clicks at all — found via direct hit-test diagnostics
          // (elementFromPoint at a real rendered card's own on-screen
          // center was resolving to this DIV, the cards' shared
          // grandparent, never the card itself or anything inside it, so
          // every click silently fell through). Root cause: this
          // `overflow-y-auto` scroll box sits directly inside the phone
          // frame's `preserve-3d` + rotateY/rotateX-tilted parent (see the
          // motion.div above) — Chromium was resolving pointer hit-tests
          // for its own descendants against the wrong projected
          // coordinates once several DOM levels deep in that shared 3D
          // space. `translateZ(1px)` promotes this box onto its own
          // compositor layer, which corrects the hit-test math without
          // touching the phone's own visual tilt (this box still inherits
          // it) or anything about the flip-card interaction itself.
          style={{ left: '10%', top: '9.7%', width: '80%', height: '79.8%', touchAction: 'pan-y', transform: 'translateZ(1px)' }}
        >
          <AmyRosterGrid />
          {/* A bottom fade signals "there's more below" if the grid's own
              natural height ever exceeds this window — `no-scrollbar`
              above hides the native scrollbar, so without this the fact
              that it scrolls at all wouldn't be visible. Sticky so it
              stays pinned to the visible bottom edge regardless of scroll
              position. */}
          <div className="sticky bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  )
}

/* ---------------------------------- Export ---------------------------------- */

export default function AmyCaseStudy({ onClose, dark = false }: { onClose: () => void; dark?: boolean }) {
  const engaged = useCountUp('+60K')
  const impressions = useCountUp('+2.3M')
  const feedback = useCountUp('+85%')

  return (
    // Warm, semi-transparent pink-tinted glass in light mode; a deep
    // near-black plum in dark mode (same red/gold accent family, just
    // inverted) — the site-wide dark-mode toggle reaches this case study
    // too, per explicit request, not just the homepage shell. (The
    // internal sections below keep their own px-5 sm:px-8 rhythm rather
    // than an outer p-8, since CaseStudyHeader already manages its own
    // edge padding and doubling both would blow out the spacing.)
    <div className={`backdrop-blur-xl rounded-[32px] border shadow-2xl ${dark ? 'bg-[#160f16]/70 border-white/10' : 'bg-[#EFE3DD]/40 border-white/80'}`}>
      <CaseStudyHeader
        id="modal-amy-title"
        stageLabel={PROJECT_NUMBER.amy}
        title="Graphic Design"
        supportLabel="Character Design & 3D Pop-Art Figure"
        theme={dark ? 'dark' : 'light'}
        onClose={onClose}
        arcadeChrome
        variant="minimal"
        meta={[
          { label: 'Role', value: 'Art Direction, Visual Design' },
          { label: 'Tech', value: 'Midjourney · 3D Printing Pipeline · Illustrator' },
        ]}
      />

      {/* Campaign Impact + My Role — moved from the footer to the TOP,
          collapsed into one row, per explicit request: the metrics were
          only visible after scrolling past the whole artboard below, and
          they're the numbers that matter most to a reviewer, not an
          afterthought. The "Play Case Study" CTA that used to close the
          modal here was redundant with the close button and dropped. */}
      <div className={`px-5 sm:px-8 pb-3 flex flex-wrap items-center gap-x-6 gap-y-2.5 border-b mb-3 ${dark ? 'border-white/10' : 'border-pearl-ink/10'}`}>
        <div className="flex items-center gap-2">
          <img src={asset('/assets/amy/arrow-amy.png')} alt="" className="w-6 h-6 object-contain shrink-0" />
          <span className={`text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap ${dark ? 'text-white/90' : 'text-pearl-ink'}`}>Campaign Impact</span>
        </div>
        <StatStrip
          theme="light"
          labelOnDark={dark}
          stats={[
            { icon: <Users size={13} />, value: engaged, label: 'Engaged Users' },
            { icon: <TrendingUp size={13} />, value: impressions, label: 'Impressions' },
            { icon: <Heart size={13} />, value: feedback, label: 'Positive Feedback' },
          ]}
        />
        <div className={`w-px h-6 hidden sm:block ${dark ? 'bg-white/15' : 'bg-pearl-ink/15'}`} />
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-[0.14em] whitespace-nowrap ${dark ? 'text-white/90' : 'text-pearl-ink'}`}>My Role</span>
          <div className={`flex items-center gap-3 ${dark ? 'text-white/90' : 'text-pearl-ink'}`}>
            <span className="flex items-center gap-1">
              <PenTool size={14} />
              <span className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-white/80' : 'text-pearl-ink/80'}`}>Art Direction</span>
            </span>
            <span className="flex items-center gap-1">
              <Palette size={14} />
              <span className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-white/80' : 'text-pearl-ink/80'}`}>Visual Design</span>
            </span>
            <span className="flex items-center gap-1">
              <img src={asset('/assets/amy/arrow-amy.png')} alt="" className="w-3.5 h-3.5 object-contain" />
              <span className={`text-[10px] font-bold uppercase tracking-wide ${dark ? 'text-white/80' : 'text-pearl-ink/80'}`}>Campaign Strategy</span>
            </span>
          </div>
        </div>

        {/* Link to the real, live N12 project — restyled as a solid red
            "gaming block" (same gradient/bevel language as the arcade
            close button and the joystick badge) so it actually reads as
            a real button, not a faint pill easy to miss. */}
        <motion.a
          href="https://special.n12.co.il/AmyWinehouse"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="ml-auto flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-wide text-white px-3.5 py-2 rounded-lg bg-gradient-to-b from-[#d34f4f] to-[#8f1f2d] border border-white/20 shadow-[0_3px_0_#5e1319,0_6px_14px_-2px_rgba(143,31,45,0.55)] transition-shadow"
        >
          View Live Project <ExternalLink size={12} />
        </motion.a>
      </div>

      {/* Mobile layout (below sm:) — the desktop artboard below is one
          fixed-ratio scene with three zones pinned by percentage, which
          scales down as a whole: at a real mobile width that shrank the
          entire composition to under 200px tall, past the point of
          legibility (badge labels clipping mid-word, the phone/roster
          reduced to unreadable dots). Below sm:, the same four pieces
          instead stack vertically, each given its own real height rather
          than a shrunk sliver of a shared one — same components, same
          assets, just laid out for a narrow column instead of a wide
          stage. */}
      <div className="sm:hidden px-5 pb-5 flex flex-col gap-4">
        <div className="h-[230px]">
          <AmyHeroFigure dark={dark} />
        </div>
        <div className="relative flex gap-3">
          <ChestBadge dark={dark} />
          <RingBadge dark={dark} />
          <SpinningVinyl className="absolute -top-3 -right-2 z-10" />
        </div>
        <div className="h-[200px]">
          <AmyBeforeAfterPhone dark={dark} />
        </div>
        <div className="mx-auto w-full max-w-[240px]">
          <PhoneRosterZone />
        </div>
      </div>

      {/* Desktop/tablet layout (sm: and up) — fixed-aspect artboard, not a
          generic responsive grid: the approved mockup is one art-directed
          scene (card measured at 1478x872px, ~1.695:1), and Amy/badges+
          before-after/phone are positioned as absolute zones within it at
          the mockup's own proportions (phone screen bounds were
          pixel-sampled directly from the reference file: ~72-100% width,
          ~9-95% height of the card), rather than left to CSS Grid's own
          column-sizing logic. */}
      <div className="hidden sm:block px-5 sm:px-8 pb-5">
        <div className="relative w-full" style={{ aspectRatio: '1478 / 780' }}>
          <div className="absolute inset-y-0 left-0" style={{ width: '37%' }}>
            <AmyHeroFigure dark={dark} />
          </div>

          <div className="absolute inset-y-0 flex flex-col gap-2.5 sm:gap-3" style={{ left: '40%', width: '31%' }}>
            <div className="relative flex gap-2.5 sm:gap-3.5">
              <ChestBadge dark={dark} />
              <RingBadge dark={dark} />
              <SpinningVinyl className="absolute -top-3 -right-2 z-10" />
            </div>
            <div className="flex-1 min-h-0">
              <AmyBeforeAfterPhone dark={dark} />
            </div>
          </div>

          <div className="absolute inset-y-0 flex flex-col items-center justify-center" style={{ left: '73%', right: '-1%' }}>
            <PhoneRosterZone />
          </div>
        </div>
      </div>
    </div>
  )
}

/** A music note, a gold coin and a heart-coin breaking the modal's RIGHT
 *  edge near the phone — rendered via ProjectModal's `breakout` slot,
 *  which sits outside the scroll container's clipping. There is
 *  deliberately nothing on the left edge: the mockup file was checked
 *  directly, and the only thing breaking the left side is the swallow
 *  already baked into the figure artwork (see AmyHeroFigure) — a
 *  separate floating swallow/coin/heart there would just be a second
 *  copy of decoration the mockup doesn't have. Positions here are
 *  pixel-measured from the reference file (music note ~17%, star coin
 *  ~40%, heart coin ~75% down the card), not evenly-spaced guesses. */
export function AmyCaseStudyBreakout() {
  return (
    <>
      {/* A second music note, breaking the LEFT edge near the figure's own
          baked-in note (bottom-left of the box/roses) — requested so the
          note reads as escaping the frame rather than sitting flat inside
          the artwork, the same treatment the right-edge decor already
          gets. */}
      {/* magnetic — hovering any of these pulls it gently toward the
          cursor with a small perk-up scale, matching the homepage's own
          magnetic-coin mechanic. */}
      {/* The two coins that used to float here (a gold coin, a heart-coin)
          replaced with music notes — per explicit request, and it also
          just fits the actual subject better: this is a music-tribute
          campaign, not a rewards/currency one. `breathe` layers a slow,
          out-of-phase scale pulse onto the existing bob so they read as
          alive rather than mechanically bobbing in place. */}
      <FloatingElement delay={0.7} distance={9} magnetic breathe className="absolute top-[80%] -left-7 sm:-left-10 z-30 hidden sm:block">
        <MusicNote size={38} />
      </FloatingElement>
      <FloatingElement delay={0.5} distance={9} magnetic breathe className="absolute top-[15%] -right-7 sm:-right-10 z-30 hidden sm:block">
        <MusicNote size={42} />
      </FloatingElement>
      <FloatingElement delay={0.9} distance={10} magnetic breathe className="absolute top-[38%] -right-10 sm:-right-14 z-30 hidden sm:block">
        <MusicNote size={40} />
      </FloatingElement>
      <FloatingElement delay={1.2} distance={9} magnetic breathe className="absolute top-[73%] -right-10 sm:-right-14 z-30 hidden sm:block">
        <MusicNote size={36} />
      </FloatingElement>

      {/* "This is interactive, play with it" cue — enlarged again and
          given a bigger, more obvious bounce (was still easy to miss). */}
      <motion.div
        aria-hidden
        animate={{ x: [0, -16, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[54%] -right-12 sm:-right-16 z-30 hidden sm:flex flex-col items-center gap-1.5"
      >
        <span
          className="flex items-center justify-center w-14 h-14 rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, #c9576b, #8f1f2d)', boxShadow: '0 4px 0 #5e1319, 0 10px 22px -2px rgba(143,31,45,0.65)' }}
        >
          <ChevronLeft size={30} strokeWidth={3.5} />
        </span>
        <span className="text-[9px] font-display font-black uppercase tracking-widest text-pearl-red bg-white px-2 py-1 rounded-full shadow-md">
          Play
        </span>
      </motion.div>
    </>
  )
}
