import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { asset } from '../../lib/asset'
import { useCanHover } from '../../lib/useCanHover'
import { PROJECT_NUMBER } from '../../lib/projectMeta'
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
  /** Hex accent — no longer used inside WorldCard itself (the number,
   *  metric values and glass border/glow are all fixed colors now, per
   *  explicit spec), kept only because CardArrival (the wrapper each
   *  export below renders this inside) still uses it for its own
   *  per-card rim-spark entrance effect. */
  accent: string
  onClick: () => void
  hidden: boolean
  /** The project's own real artwork — unique per card, everything else
   *  (glass, title, metrics, description, motion) is the shared system. */
  heroVisual: React.ReactNode
}

function WorldCard({ id, discipline, caption, metrics, description, accent, onClick, hidden, heroVisual }: WorldCardProps) {
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
      // aspect-[9/14] + min-h-[520px] below `lg` — the requested
      // mockup-matched tall ratio/height floor, where the page scrolls
      // naturally and a fixed floor is safe. At `lg`+ that same floor was
      // taller than the one-screen hero+grid budget (confirmed directly —
      // cards got clipped and the page picked up ~90px of forced scroll,
      // "only fits at 50% zoom" on a real laptop), so `lg:h-full` reverts
      // to filling the grid row's own height exactly — self-scaling to
      // whatever that row resolves to on any laptop screen, rather than a
      // second fixed guess that could just as easily overflow a shorter
      // panel. The glass styling itself (.project-card-glass) is
      // untouched at every size.
      className="group relative block w-full aspect-[9/14] min-h-[480px] lg:aspect-auto lg:min-h-0 lg:h-full rounded-[26px] text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      aria-label={`Open case study — ${discipline}`}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
    >
      <motion.div
        style={{ rotateX: interactive ? t.rotateX : 0, rotateY: interactive ? t.rotateY : 0, transformStyle: 'preserve-3d' }}
        className="project-card-glass relative flex flex-col w-full h-full rounded-[26px] overflow-hidden p-3.5 sm:p-4 gap-2.5 sm:gap-3"
      >
        {/* Header — number, title, caption. The number badge (bright
            purple, #8b5cf6, per explicit spec) is back after an earlier
            round explicitly removed it from these cards ("do not replace
            it with anything") — reintroduced deliberately this round per
            an equally explicit, specific instruction (exact color +
            position given), not an oversight. */}
        <div className="shrink-0">
          <span className="block font-display font-black leading-none text-2xl sm:text-3xl" style={{ color: '#8b5cf6' }}>
            {PROJECT_NUMBER[id]}
          </span>
          <h3
            className="mt-1.5 font-display font-extrabold leading-[1.05] text-lg sm:text-xl text-white tracking-tight uppercase"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
          >
            {discipline}
          </h3>
          <p className="mt-1 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wide text-white/55 leading-snug">{caption}</p>
        </div>

        {/* Media — the project's own real artwork, boxed and bordered
            rather than full-bleed behind the text (previous treatment) —
            grows to fill whatever space the header/metrics/footer around
            it don't need. */}
        <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-white/[0.08]">
          {heroVisual}
        </div>

        {/* Metrics — ONE unified glass pill (not three separate chips),
            split into equal columns by thin internal dividers. `value` is
            a real figure from that project's own case study where one
            exists; a project without a clean number gets label-only
            columns instead (matching the AI card). */}
        <div
          className="shrink-0 grid rounded-xl overflow-hidden"
          style={{ background: 'rgba(10, 8, 22, 0.6)', gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
        >
          {metrics.map((m, i) => (
            <div key={m.label} className={`px-1.5 py-2 sm:py-2.5 text-center ${i > 0 ? 'border-l border-white/[0.06]' : ''}`}>
              {m.value && (
                <p className="font-display font-black text-[13px] sm:text-sm leading-none tabular-nums" style={{ color: '#a78bfa' }}>
                  {m.value}
                </p>
              )}
              <p className={`text-[7.5px] sm:text-[8px] font-bold uppercase tracking-wide leading-tight ${m.value ? 'mt-1 text-white/60' : 'text-white/80'}`}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Footer — left-aligned description, right-aligned circular
            arrow button (36×36). */}
        <div className="shrink-0 hidden sm:flex items-center justify-between gap-3">
          <p className="text-[10.5px] leading-snug text-white/60 max-w-[80%]">{description}</p>
          <span
            aria-hidden
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full border transition-colors group-hover:bg-white/10"
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <ArrowRight size={14} className="text-white" />
          </span>
        </div>

        {/* Glass frame overlay — a real transparent PNG (bright rounded-
            rect border + soft diagonal sheen, alpha-transparent through
            its own center, confirmed by sampling its actual pixel alpha
            values before using it) laid over the WHOLE card, on top of
            every zone. object-fit:fill so it always matches this card's
            own box exactly regardless of viewport/breakpoint, rather than
            cropping (object-cover) or leaving letterboxed gaps
            (object-contain) — the source image's own 2.25:1 aspect has no
            natural match to a 9:14 card. pointer-events-none so it never
            intercepts clicks meant for the card underneath it. */}
        <img
          src={asset('/assets/hub/glass.png')}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ objectFit: 'fill' }}
          draggable={false}
        />
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
    // Homepage-only poster swap (explicit request) — the earlier glass-
    // display-case + phone composite is replaced with the new dedicated
    // poster render. The case study modal (GalgalatzCaseStudy.tsx) keeps
    // its own original display-case/phone treatment untouched — this
    // component only ever renders on the homepage card.
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={asset('/assets/galgalatz/poster_galgalts.jpg')}
        alt="Galgalatz × N12 key art on a 3D neon display frame"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      {/* A small fanned stack of real chart-ranking thumbnails — the
          project's own actual leaderboard assets (rank-01/02, the real #1
          and #2 chart entries, plus the full 31–50 leaderboard sheet),
          not invented decoration. Sits top-left of the media box, so it
          reads as a quiet supporting detail — "this card is a real chart
          countdown" — without competing with the poster as the card's
          main visual. */}
      <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex" aria-hidden>
        {[
          { src: asset('/assets/galgalatz/rank-01.png'), rotate: -8, z: 3 },
          { src: asset('/assets/galgalatz/rank-02.png'), rotate: 3, z: 2 },
          { src: asset('/assets/galgalatz/rank-31-50.jpg'), rotate: 13, z: 1 },
        ].map((r, i) => (
          <div
            key={r.src}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border shadow-lg"
            style={{
              marginLeft: i === 0 ? 0 : -14,
              transform: `rotate(${r.rotate}deg)`,
              zIndex: r.z,
              borderColor: 'rgba(255,255,255,0.35)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
          >
            <img src={r.src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** 02 — Motion / After Effects — the new dedicated homepage poster
 *  (explicit request). The case study modal (PeopleMotionCaseStudy.tsx)
 *  keeps its own real "ACA ANASHIM" campaign footage untouched — this
 *  component only ever renders on the homepage card. */
const MOTION_HERO_SRC = asset('/assets/motion/poster.jpg')

function MotionHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={MOTION_HERO_SRC}
        alt="Motion & animation poster art"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
    </div>
  )
}

/** 03 — AI / Navigator — the new dedicated homepage poster (explicit
 *  request). The earlier pilot-cutout overlay is dropped here — it's the
 *  same figure already present in this new poster art, and layering it
 *  again on top duplicated it. The case study modal
 *  (AiRescueCaseStudy.tsx) keeps its own real broadcast footage and
 *  pilot-cutout breakout untouched — this component only ever renders on
 *  the homepage card. */
function AiHero() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={asset('/assets/navigator/poster_navigator.jpg')}
        alt="AI / generative visuals poster art"
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
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
      onClick={onClick}
      hidden={hidden}
      heroVisual={<AmyHero />}
    />
  )
}
