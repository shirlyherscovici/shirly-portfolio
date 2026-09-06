import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { asset } from '../../lib/asset'
import { PROJECT_NUMBER } from '../../lib/projectMeta'
import { useCanHover } from '../../lib/useCanHover'
import type { ProjectId } from '../../types'

/* ---------------------------------------------------------------------- */
/* Shared mechanics                                                       */
/* ---------------------------------------------------------------------- */

const tilt = { stiffness: 260, damping: 22 }

/** Subtle cursor-parallax tilt — unchanged mechanism from before this pass
 *  (reused, not reinvented; the redesign brief explicitly asks to keep
 *  using the existing Framer Motion setup rather than introduce anything
 *  new). Skipped entirely on touch devices by the caller (there's no
 *  cursor to track), and its rotation is zeroed under reduced-motion. */
function useTiltRef() {
  const ref = useRef<HTMLButtonElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), tilt)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-5, 5]), tilt)
  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }
  const onMouseLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }
  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave }
}

/** Sequences a card's own arrival as the visitor scrolls to it, plus a
 *  one-shot spark of a dormant neon rim beneath it, tinted to that card's
 *  accent. Unchanged from before this pass — purely the entrance choreography,
 *  orthogonal to the card redesign itself. */
export function CardArrival({ index, accent, children }: { index: number; accent: string; children: React.ReactNode }) {
  const prefersReduced = useReducedMotion()
  const delay = prefersReduced ? 0 : index * 0.09

  // Three discrete states driven by real state + a plain timer (never a
  // single unbranched `animate` keyframe array) — this project's global
  // reducedMotion config previously got a keyframe-array version reliably
  // stuck mid-animation instead of resolving to rest.
  const [phase, setPhase] = useState<'idle' | 'spark' | 'settled'>('idle')
  useEffect(() => {
    if (phase !== 'spark') return
    const t = setTimeout(() => setPhase('settled'), 420)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <motion.div
      className="relative h-full w-full"
      initial={prefersReduced ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      onViewportEnter={() => setTimeout(() => setPhase('spark'), delay * 1000)}
    >
      <motion.div
        aria-hidden
        className="absolute -inset-x-2 -bottom-4 h-10 rounded-full pointer-events-none -z-10"
        style={{ background: `radial-gradient(closest-side, ${accent}66, transparent 75%)`, filter: 'blur(18px)' }}
        animate={
          phase === 'idle'
            ? { opacity: 0, scale: 0.85 }
            : phase === 'spark'
              ? { opacity: 1, scale: 1.1 }
              : { opacity: 0.3, scale: 1 }
        }
        transition={{ duration: phase === 'spark' ? 0.35 : 0.75, ease: 'easeOut' }}
      />
      {children}
    </motion.div>
  )
}

/* ---------------------------------------------------------------------- */
/* WorldCard — the one shared shell all four disciplines render through   */
/* ---------------------------------------------------------------------- */

interface WorldCardProps {
  id: ProjectId
  discipline: string
  /** Short hover-reveal lines — kept to 2–3, per the brief's "fast visual
   *  scanning" idle state and elegant, not-verbose reveal. */
  tagLines: string[]
  /** Hex accent driving the number badge, border glow tint and CTA color —
   *  each card gets its own identity within one shared system. */
  accent: string
  /** One of the site's existing pre-tuned glow shadows (glow-purple/-cyan/
   *  -magenta/-gold) — reused rather than inventing a fifth. */
  glowClass: string
  onClick: () => void
  hidden: boolean
  /** The project's own real artwork — unique per card, everything else
   *  (glass, number, title, reveal, CTA, motion) is the shared system. */
  heroVisual: React.ReactNode
}

function WorldCard({ id, discipline, tagLines, accent, glowClass, onClick, hidden, heroVisual }: WorldCardProps) {
  const canHover = useCanHover()
  const prefersReduced = useReducedMotion()
  const t = useTiltRef()
  const interactive = canHover && !prefersReduced

  // The hover-reveal block must not hide project information from anyone
  // who can't hover (touch devices, and — per the brief's own
  // accessibility section — nobody should need hover at all to get the
  // information). On a real hover-capable pointer it's an opacity+
  // translateY reveal on `:hover`/`:focus-visible`; everywhere else
  // (touch, or reduced-motion where the same class would just leave it
  // permanently hidden with no hover to reveal it) it renders open by
  // default.
  const revealClass = interactive
    ? 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-all duration-300 ease-out'
    : 'opacity-100 translate-y-0'

  return (
    <motion.button
      ref={t.ref}
      type="button"
      onClick={onClick}
      onMouseMove={interactive ? t.onMouseMove : undefined}
      onMouseLeave={interactive ? t.onMouseLeave : undefined}
      whileHover={hidden || !interactive ? undefined : { scale: 1.04 }}
      whileTap={hidden ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      style={{ perspective: 1000, pointerEvents: hidden ? 'none' : 'auto', touchAction: 'manipulation' }}
      className="group relative block w-full aspect-[3/4] sm:aspect-[3/4] rounded-[28px] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={`Open case study ${PROJECT_NUMBER[id]} — ${discipline}`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
    >
      <motion.div
        style={{ rotateX: interactive ? t.rotateX : 0, rotateY: interactive ? t.rotateY : 0, transformStyle: 'preserve-3d' }}
        className={`glass-cine glass-sheen relative w-full h-full rounded-[28px] overflow-hidden transition-shadow duration-300 ${glowClass}`}
      >
        {/* .glass-cine's own background is real translucency (a
            backdrop-blur sampling whatever sits behind the element) —
            correct for its original job of sitting over the dark cosmic
            hero/modal chrome, but on this grid the page behind it is the
            light pearl background in light mode, so that same
            translucency read as a washed-out flat lavender instead of
            "premium hardware glass" (caught in review). A rich, mostly-
            opaque dark base underneath guarantees these cards look like
            dark glass regardless of the site's light/dark toggle — the
            unified "same universe" identity the brief asks for — while
            .glass-cine's border/blur/sheen/shadow on the element above it
            still do their job on top. */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b1730]/95 via-[#141222]/95 to-[#0a0914]/95" />

        {/* Ambient accent wash — one soft radial glow tinted to this card's
            own color, sitting behind everything. Restrained on purpose —
            the brief is explicit that the glow shouldn't compete with the
            hero visual or the glass itself. */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 78% 12%, ${accent}30, transparent 55%)` }} />

        {/* Hero visual — always visible at rest, per the brief ("the hero
            visual/character should be visible without requiring
            interaction"). Each project supplies its own real artwork. */}
        <div className="absolute inset-0">{heroVisual}</div>

        {/* A permanent bottom scrim, under the text column only — not the
            whole card, so the hero visual keeps its own natural
            lighting/contrast above it. Guarantees the idle title AND the
            hover-reveal panel always sit on a legible, intentional dark
            gradient instead of directly on whatever the hero art happens
            to render at that exact spot (caught in review: the reveal
            panel visually collided with the Galgalatz phone's own nav-bar
            icons with no scrim behind it). */}
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

        {/* Idle content — number + discipline title, always visible; this
            alone is what a fast HR scan needs to read all four
            disciplines instantly. */}
        <div className="relative z-10 flex flex-col h-full p-5 sm:p-6" style={{ transform: 'translateZ(28px)' }}>
          <span
            className="block font-display font-black leading-none text-3xl sm:text-4xl"
            style={{ color: accent, textShadow: `0 0 22px ${accent}99` }}
          >
            {PROJECT_NUMBER[id]}
          </span>
          <h3
            className="mt-2 font-display font-extrabold leading-[1.05] text-xl sm:text-2xl text-white tracking-tight"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}
          >
            {discipline}
          </h3>

          {/* Hover-reveal — hidden at idle (see revealClass above),
              opacity + a small translateY per the brief, not a large
              animation. Sits on the bottom scrim above, no longer needs
              its own separate boxed background to stay legible. */}
          <div className={`mt-auto ${revealClass}`}>
            {tagLines.map((line) => (
              <p key={line} className="text-[11px] font-semibold uppercase tracking-wide text-white/85 leading-snug" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {line}
              </p>
            ))}
            <span
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-display font-bold uppercase tracking-wide border"
              style={{ color: accent, borderColor: `${accent}55`, background: `${accent}1a` }}
            >
              Explore Case Study <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.button>
  )
}

/* ---------------------------------------------------------------------- */
/* Per-project hero visuals — each reuses its own real, existing artwork  */
/* ---------------------------------------------------------------------- */

/** 01 — Galgalatz — the real glass display case + the real pre-composited
 *  phone frame (same technique/asset as the case study itself, so nothing
 *  can drift out of alignment: no separate compositing step here at all). */
function GalgalatzHero() {
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <div className="absolute left-[2%] bottom-[6%] w-[42%] opacity-90">
        <img src={asset('/assets/galgalatz/neon-box-tight.png')} alt="" aria-hidden className="w-full h-auto object-contain drop-shadow-2xl" />
      </div>
      <motion.div
        className="absolute right-[4%] bottom-[2%] w-[58%]"
        style={{ aspectRatio: '941 / 1672', perspective: 1200 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-[1.04]" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-8deg) rotateX(3deg)' }}>
          <img
            src={asset('/assets/galgalatz/1_galgaltz_front.png')}
            alt="Phone showing the Galgalatz key art — the neon 'Music From The Screen' campaign, next to its real 3D glass display case"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none drop-shadow-2xl"
            draggable={false}
          />
        </div>
      </motion.div>
    </div>
  )
}

/** 02 — Motion / After Effects — the real "ACA ANASHIM" motion-piece
 *  poster (the People-in-Motion project's own asset — deliberately NOT
 *  the AI/Navigator visual, a distinct real frame). Left architected as a
 *  single named constant precisely so this can be swapped for the exact
 *  final After Effects frame later without touching anything else. */
const MOTION_HERO_SRC = asset('/assets/motion/aca-anashim-poster.jpg')

function MotionHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={MOTION_HERO_SRC}
        alt="A still from the After Effects 'People in Motion' playable ad — a desert scene with client logos rising on light beams"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
    </div>
  )
}

/** 03 — AI / Navigator — the real cinematic-AI poster + the real pilot
 *  cutout, exactly the assets already used for this project elsewhere on
 *  the homepage. This is the one place the cinematic-AI imagery belongs —
 *  kept clearly apart from the Motion card above. */
function AiHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={asset('/assets/navigator/poster-ai-homepage-card.png')}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/35" />
      <motion.img
        src={asset('/assets/navigator/pilot-cutout-tight.png')}
        alt=""
        aria-hidden
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[2%] bottom-0 h-[68%] w-auto max-w-none object-contain transition-transform duration-500 group-hover:-translate-y-1"
        style={{ filter: 'contrast(1.15) brightness(1.08) drop-shadow(0 12px 20px rgba(0,0,0,0.65)) drop-shadow(0 2px 6px rgba(0,0,0,0.8))' }}
      />
    </div>
  )
}

/** 04 — Amy / Graphic Design — Amy's own real character render, the same
 *  supplied artwork used everywhere else this project appears (it already
 *  has the swallow, vinyl record and a music note baked into the source
 *  image itself — no separate floating decoration needed on top of it). */
function AmyHero() {
  return (
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <img
        src={asset('/assets/amy/amy-figure-birds-gems.png')}
        alt="AMY — Amy Winehouse tribute character emerging from a gift box, with a golden swallow, roses and a vinyl record"
        className="w-[92%] h-auto max-h-[96%] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105"
      />
    </div>
  )
}

/* ---------------------------------------------------------------------- */
/* Exports — one per discipline, each just WorldCard + its own hero       */
/* ---------------------------------------------------------------------- */

export function GalgalatzModule({ onClick, hidden = false }: { onClick: () => void; hidden?: boolean }) {
  return (
    <WorldCard
      id="galgalatz"
      discipline="UI / UX"
      tagLines={['Game Interfaces', 'Interactive UX', 'N12 × Galgalatz']}
      accent="#8b5cf6"
      glowClass="group-hover:shadow-glow-purple"
      onClick={onClick}
      hidden={hidden}
      heroVisual={<GalgalatzHero />}
    />
  )
}

export function MotionModule({ onClick, hidden = false }: { onClick: () => void; hidden?: boolean }) {
  return (
    <WorldCard
      id="people-motion"
      discipline="MOTION"
      tagLines={['Motion Design', 'After Effects', 'Cinematic Motion']}
      accent="#ffb454"
      glowClass="group-hover:shadow-glow-gold"
      onClick={onClick}
      hidden={hidden}
      heroVisual={<MotionHero />}
    />
  )
}

export function AiModule({ onClick, hidden = false }: { onClick: () => void; hidden?: boolean }) {
  return (
    <WorldCard
      id="ai-rescue"
      discipline="AI"
      tagLines={['Generative AI', 'AI Visuals', 'Cinematic AI']}
      accent="#4fd8ff"
      glowClass="group-hover:shadow-glow-cyan"
      onClick={onClick}
      hidden={hidden}
      heroVisual={<AiHero />}
    />
  )
}

export function AmyModule({ onClick, hidden = false }: { onClick: () => void; hidden?: boolean }) {
  return (
    <WorldCard
      id="amy"
      discipline="GRAPHIC DESIGN"
      tagLines={['Visual Systems', 'Art Direction', 'Character Design']}
      accent="#ff5fa0"
      glowClass="group-hover:shadow-glow-magenta"
      onClick={onClick}
      hidden={hidden}
      heroVisual={<AmyHero />}
    />
  )
}
