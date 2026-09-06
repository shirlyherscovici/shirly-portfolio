import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
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

/** One metric/label chip in the bottom glass row. `value` is the bold
 *  headline figure — omit it for a project whose real case study doesn't
 *  have a clean number to show (that project gets three label-only
 *  chips instead, matching the mockup's own AI card, which does the
 *  same). Every value that IS shown here is a real number pulled
 *  directly from that project's own case-study content, never invented
 *  for this card. */
interface Metric {
  value?: string
  label: string
}

interface WorldCardProps {
  id: ProjectId
  discipline: string
  /** Short caption under the title — what the discipline covers, in a
   *  couple of words each line. */
  caption: string
  metrics: Metric[]
  /** One short, true sentence about the work — not a claim, just what the
   *  card's own case study actually covers. */
  description: string
  /** Hex accent driving the border glow tint and metric-value color —
   *  each card gets its own identity within one shared system. */
  accent: string
  /** One of the site's existing pre-tuned glow shadows (glow-purple/-cyan/
   *  -magenta/-gold) — reused rather than inventing a fifth. */
  glowClass: string
  onClick: () => void
  hidden: boolean
  /** The project's own real artwork — unique per card, everything else
   *  (glass, title, metrics, description, motion) is the shared system. */
  heroVisual: React.ReactNode
}

function WorldCard({ id, discipline, caption, metrics, description, accent, glowClass, onClick, hidden, heroVisual }: WorldCardProps) {
  const canHover = useCanHover()
  const prefersReduced = useReducedMotion()
  const t = useTiltRef()
  const interactive = canHover && !prefersReduced

  return (
    <motion.button
      ref={t.ref}
      type="button"
      onClick={onClick}
      onMouseMove={interactive ? t.onMouseMove : undefined}
      onMouseLeave={interactive ? t.onMouseLeave : undefined}
      whileHover={hidden || !interactive ? undefined : { scale: 1.025 }}
      whileTap={hidden ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      animate={{ opacity: hidden ? 0 : 1 }}
      style={{ perspective: 1000, pointerEvents: hidden ? 'none' : 'auto', touchAction: 'manipulation' }}
      className="group relative block w-full aspect-[3/4] sm:aspect-[3/4] lg:aspect-auto lg:h-full rounded-[26px] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={`Open case study — ${discipline}`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
    >
      <motion.div
        style={{ rotateX: interactive ? t.rotateX : 0, rotateY: interactive ? t.rotateY : 0, transformStyle: 'preserve-3d' }}
        className={`glass-cine glass-sheen relative w-full h-full rounded-[26px] overflow-hidden transition-shadow duration-300 ${glowClass}`}
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

        {/* Hero visual — fills the FULL card (not just an upper zone), so
            it keeps reading as one continuous scene behind everything
            below, including the info panel — matching the mockup's own
            "artwork sits behind the glass" composition rather than
            artwork-on-top / plain-panel-below as two stacked blocks. */}
        <div className="absolute inset-0">{heroVisual}</div>

        {/* Info panel — a real glass layer of its own (blur + translucent
            tint + a bright top edge), floored to the card's bottom third,
            not a solid opaque box: the artwork keeps showing through it,
            per direction ("no opaque black rectangles"). Title + caption
            sit directly on this glass; the metric row below gets a
            second, distinctly brighter glass layer of its own — that
            layering (glass over art, then glass over glass for the
            metrics) is what the brief's "layered translucent information
            panels" asks for, matching the mockup's own card composition.
            No numbered badge above it — removed outright per explicit
            direction, nothing put in its place. */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-4 py-3.5 sm:px-4.5 sm:py-4 backdrop-blur-md"
          style={{
            background: 'linear-gradient(180deg, rgba(10,8,20,0.05) 0%, rgba(10,8,20,0.55) 28%, rgba(8,7,16,0.82) 100%)',
            borderTop: '1px solid rgba(255,255,255,0.16)',
          }}
        >
          <div>
            <h3
              className="font-display font-extrabold leading-[1.05] text-lg sm:text-xl lg:text-lg xl:text-xl text-white tracking-tight"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.9)' }}
            >
              {discipline}
            </h3>
            <p className="mt-1 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wide text-white/55 leading-snug">{caption}</p>
          </div>

          {/* Metric row — 2–3 glass capsules, each its own brighter
              translucent layer over the panel above. `value` is a real
              figure from that project's own case study where one exists;
              a project without a clean number gets label-only chips
              instead (matching the mockup's own AI card, which does the
              same). */}
          <div className="flex items-stretch gap-1.5 sm:gap-2">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="flex-1 min-w-0 rounded-xl px-1.5 py-1.5 sm:px-2 sm:py-2 text-center backdrop-blur-md"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {m.value && (
                  <p className="font-display font-black text-[13px] sm:text-sm leading-none tabular-nums" style={{ color: accent }}>
                    {m.value}
                  </p>
                )}
                <p className={`text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wide leading-tight ${m.value ? 'mt-1 text-white/65' : 'text-white/85'}`}>{m.label}</p>
              </div>
            ))}
          </div>

          <div className="hidden sm:flex items-end justify-between gap-3">
            <p className="text-[10.5px] leading-snug text-white/60 max-w-[85%]">{description}</p>
            <span
              aria-hidden
              className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full border transition-colors group-hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <ArrowRight size={12} className="text-white" />
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
 *  phone frame, exactly as reference-checked against the approved mockup:
 *  that composition (a physical display case beside a phone showing the
 *  campaign key art on its screen) IS the intended artwork for this card,
 *  not a generic stand-in — so the phone stays, just noticeably larger and
 *  more central than before. Same two source assets used in the case
 *  study itself, nothing invented. */
function GalgalatzHero() {
  return (
    // The shared info panel below is a real translucent glass layer sized
    // to its own content, not a fixed zone, but in practice it covers
    // roughly the bottom 45% of the card — these objects are bottom-
    // anchored well clear of that (bottom-[48%]/[46%], not bottom-0),
    // otherwise they render underneath the panel instead of above it,
    // invisible despite `absolute inset-0` on this whole wrapper (which
    // is intentional: the artwork still needs to reach the card's full
    // height for the photographic cards' own bottom fade to read
    // correctly through the glass).
    <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b1730] via-[#141222] to-[#0a0914]" />
      <div className="absolute left-[-3%] bottom-[48%] w-[34%] opacity-95">
        <img src={asset('/assets/galgalatz/neon-box-tight.png')} alt="" aria-hidden className="w-full h-auto object-contain drop-shadow-2xl" />
      </div>
      <motion.div
        className="absolute right-[-3%] bottom-[46%] w-[58%]"
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
      caption="Game Interfaces & Interactive UX"
      // Real figures, straight from this project's own case study (its
      // Impact/Engagement/Visuals summary row) — not invented for the card.
      metrics={[
        { value: '+8.5K', label: 'Voters' },
        { value: '700%', label: 'Mobile Boost' },
        { value: '100%', label: 'Custom Craft' },
      ]}
      description="Designing intuitive game UI and interactive voting for a live N12 broadcast."
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
      caption="Cinematic Motion & After Effects"
      // This project's own case study doesn't surface one clean number —
      // label-only chips instead, same treatment as the mockup's own AI
      // card where a number isn't the point either.
      metrics={[{ label: 'Motion Design' }, { label: 'After Effects' }, { label: 'Cinematic Motion' }]}
      description="Bringing stories to life through cinematic motion, VFX and captivating animation."
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
      caption="Generative AI & Visual Systems"
      metrics={[{ label: 'Generative AI' }, { label: 'AI Visuals' }, { label: 'Cinematic AI' }]}
      description="Exploring AI tools and generative workflows to create new visual worlds."
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
      caption="Visual Systems & Art Direction"
      // Real figures from this project's own "Campaign Impact" row in its
      // case study — not invented for the card.
      metrics={[
        { value: '+60K', label: 'Engaged Users' },
        { value: '+2.3M', label: 'Impressions' },
        { value: '+85%', label: 'Positive Feedback' },
      ]}
      description="Crafting bold visual identities, campaigns and key art with strong visual language."
      accent="#ff5fa0"
      glowClass="group-hover:shadow-glow-magenta"
      onClick={onClick}
      hidden={hidden}
      heroVisual={<AmyHero />}
    />
  )
}
