import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { asset } from '../../lib/asset'
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
  // On a hover-capable pointer this collapses to zero height at rest (not
  // just invisible) so the glass capsule itself hugs the title alone until
  // hovered — reserving the full expanded height at idle, as a plain
  // opacity transition did, left every panel reading as an oversized,
  // mostly-empty glass box instead of a tight floating capsule.
  const revealClass = interactive
    ? 'max-h-0 opacity-0 overflow-hidden group-hover:max-h-32 group-hover:opacity-100 group-focus-visible:max-h-32 group-focus-visible:opacity-100 transition-all duration-300 ease-out'
    : 'opacity-100'

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
      className="group relative block w-full aspect-[3/4] sm:aspect-[3/4] lg:aspect-auto lg:h-full rounded-[28px] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={`Open case study — ${discipline}`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
    >
      <motion.div
        style={{ rotateX: interactive ? t.rotateX : 0, rotateY: interactive ? t.rotateY : 0, transformStyle: 'preserve-3d' }}
        className={`glass-cine glass-sheen relative w-full h-full rounded-[28px] overflow-hidden transition-shadow duration-300 ${glowClass}`}
      >
        {/* A faint tint only — .glass-cine's own translucent
            gradient/blur/border/sheen (defined once in index.css) IS the
            glass; this used to be a near-opaque 95%-alpha slab painted
            directly on top of it, which hid that translucency completely
            and made every card read as a flat solid panel with a picture
            dropped on it rather than actual glass. Kept thin enough here
            that the hero artwork underneath stays the dominant, legible
            visual — glass is a filter over the art, not a wall in front
            of it. */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b1730]/30 via-[#141222]/15 to-[#0a0914]/35" />

        {/* Ambient accent wash — one soft radial glow tinted to this card's
            own color, sitting behind everything. Restrained on purpose —
            the brief is explicit that the glow shouldn't compete with the
            hero visual or the glass itself. */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 78% 12%, ${accent}25, transparent 55%)` }} />

        {/* Hero visual — always visible at rest, per the brief ("the hero
            visual/character should be visible without requiring
            interaction"). Each project supplies its own real artwork, and
            is now the dominant thing the card shows — glass sits over it,
            not the other way around. */}
        <div className="absolute inset-0">{heroVisual}</div>

        {/* A soft bottom vignette only — just enough falloff to separate
            the glass panel below from a busy patch of artwork, not a wall
            of black. The panel itself (its own blur/tint/border below)
            carries the actual legibility now. */}
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />

        {/* Idle content — a single floating frosted-glass capsule holding
            the title (always visible) and, on hover/focus, the tagline +
            CTA. A distinct translucent panel of its own — separate blur/
            tint/border from the card shell around it — is what makes this
            read as "layered glass panels over the art" rather than one
            flat surface; the numbered badge that used to sit above it has
            been removed outright, per direction, with nothing put in its
            place. */}
        <div className="relative z-10 flex flex-col h-full p-3.5 sm:p-4 lg:p-3.5" style={{ transform: 'translateZ(28px)' }}>
          <div
            className="mt-auto rounded-2xl backdrop-blur-xl px-4 py-3.5 sm:px-4.5 sm:py-4"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
              border: '1px solid rgba(255,255,255,0.28)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 12px rgba(0,0,0,0.15), 0 8px 28px -8px rgba(0,0,0,0.55)',
            }}
          >
            <h3
              className="font-display font-extrabold leading-[1.05] text-lg sm:text-xl lg:text-lg xl:text-xl text-white tracking-tight"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}
            >
              {discipline}
            </h3>

            {/* Hover-reveal — collapsed to zero height at idle (see
                revealClass above), so the capsule around it stays a tight
                fit around just the title until hovered. Lives inside the
                same glass capsule as the title now, rather than a separate
                boxed background. */}
            <div className={`${revealClass}`}>
              {tagLines.map((line) => (
                <p key={line} className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/85 leading-snug" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  {line}
                </p>
              ))}
              <span
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wide border backdrop-blur-sm"
                style={{ color: accent, borderColor: `${accent}66`, background: `${accent}22` }}
              >
                Explore Case Study <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.button>
  )
}

/* ---------------------------------------------------------------------- */
/* Per-project hero visuals — each reuses its own real, existing artwork  */
/* ---------------------------------------------------------------------- */

/** 01 — Galgalatz — the real campaign key art itself, full-bleed and
 *  prominent, exactly as designed — not composited into a phone mockup.
 *  The phone-frame treatment (kept in the case-study modal, untouched)
 *  was a UI chrome choice for THIS card only; showing the actual artwork
 *  directly is what makes it the card's visual hero, with the glass
 *  panels above layered over it rather than over a device frame around
 *  it. */
function GalgalatzHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={asset('/assets/galgalatz/banner-cover.jpg')}
        alt="The real Galgalatz × N12 campaign key art — neon 'Music From The Screen Chart' artwork with a popcorn bucket, clapperboard and film reel"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
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

/** 03 — AI / Navigator — a real extracted frame from the actual film
 *  (main-film.mp4, t=39s: a symmetric, dramatically red-lit troop-transport
 *  interior) instead of the generic illustrated poster card that stood in
 *  for it before — plus the real pilot cutout, exactly the assets already
 *  used for this project elsewhere on the homepage. This is the one place
 *  the cinematic-AI imagery belongs — kept clearly apart from the Motion
 *  card above. */
function AiHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={asset('/assets/navigator/main-film-frame.jpg')}
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
