import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Play, Pause, Crosshair, Zap, Eye, Users2, Captions } from 'lucide-react'
import CaseStudyHeader from './CaseStudyHeader'
import VideoControlBar, { toggleFullscreen } from '../ui/VideoControlBar'
import { asset } from '../../lib/asset'
import { PROJECT_NUMBER } from '../../lib/projectMeta'

const VIDEO_SRC = asset('/assets/navigator/main-film.mp4')
const AIRPLANE_SRC = asset('/assets/navigator/c13-airplane-tight.png')
const PILOT_SRC = asset('/assets/navigator/pilot-cutout-tight.png')
// A real extracted frame from THIS exact video (main-film.mp4, t=39s — a
// symmetric, dramatically red-lit troop-transport interior; the same frame
// already used for the homepage card) — replaces the earlier
// poster-ai-homepage.png, a separate illustrated/generated scene (an
// astronaut on a mountain) that never actually appeared anywhere in the
// film, so pressing Play used to visibly cut to different footage than
// the poster promised. The old poster's own baked-in "03 / Generate
// Fiction & Compelling" chrome is effectively unused now — the real
// heading above this panel already carries that same identity.
const VIDEO_POSTER_SRC = asset('/assets/navigator/main-film-frame.jpg')

/** Caps the video panel's rendered width so a 16:9 box never exceeds 52% of
 *  the viewport's height — applied via an explicit calc() (not an
 *  inline-block shrink-wrap) so it can't create a circular width
 *  dependency between a `w-full` child and a shrink-to-fit parent. Shared
 *  with the wrapper below so the tactical map / badge, positioned relative
 *  to that wrapper, always align to the video's true edges. */
const VIDEO_MAX_WIDTH = { maxWidth: 'calc(52vh * 16 / 9)' }

/* ------------------------------------ Subtitles ------------------------------------ */

/** English transcript, timestamp-synced to the broadcast video. Trimmed to
 *  short, punchy lines (the full narration lives in
 *  /public/assets/navigator/captions-en.vtt, also attached natively below
 *  for screen readers / the browser's own CC menu) — long sentences were
 *  wrapping to 4–6 lines in the compact video frame and visually colliding
 *  with the CC/mute controls above. */
const CUES: { start: number; end: number; text: string }[] = [
  { start: 0, end: 9.9, text: 'F-15E navigator shot down overnight over Iran — parachuted safely and signaled headquarters.' },
  { start: 9.9, end: 17.17, text: 'Central command launched an exceptionally complex, daring rescue operation.' },
  { start: 17.17, end: 24.24, text: 'The injured Colonel moved through steep terrain, evading Iranian forces.' },
  { start: 24.24, end: 30.3, text: 'Air support circled overhead, striking to keep the enemy at bay.' },
  { start: 30.3, end: 38.38, text: 'Elite rescue units reached him, guiding him to an improvised extraction point.' },
  { start: 38.38, end: 44.44, text: 'Two Hercules aircraft waited — but mechanical issues grounded them after boarding.' },
  { start: 44.44, end: 50.5, text: 'Three replacement aircraft launched, retrieved all forces, and took off safely.' },
  { start: 50.5, end: 58, text: 'The disabled aircraft were destroyed on-site to keep them from enemy hands.' },
]

function SubtitleOverlay({ time, visible }: { time: number; visible: boolean }) {
  const prefersReduced = useReducedMotion()
  if (!visible) return null
  const cue = CUES.find((c) => time >= c.start && time < c.end)
  if (!cue) return null
  return (
    <div className="absolute inset-x-0 bottom-16 sm:bottom-20 flex justify-center px-4 sm:px-10 pointer-events-none">
      {/* Keyed by the cue's own start time, so each new line — driven by
          the real broadcast timeline, not a decorative loop — gets a small
          fade-in instead of a hard, no-transition swap. This is the single
          most "real project content" data point in the case study (actual
          timestamped mission dialogue), so it's the moment worth giving a
          considered beat, rather than the tactical map's own radar sweep,
          which loops unconditionally with no tie to the narrative at all.
          Deliberately NOT wrapped in AnimatePresence/exit — cues change
          every few seconds, and this project already hit a confirmed bug
          where AnimatePresence's exit-completion tracking can stall
          indefinitely under this environment's reduced-motion handling
          (the same root cause behind an earlier CRITICAL modal-close bug).
          A plain keyed mount avoids that dependency entirely: the outgoing
          line just unmounts instantly (a clean cut, not a fade-out) while
          the incoming one fades in. `initial={false}` under reduced motion
          — not a static {opacity:0} `initial` object — for the same reason
          already fixed twice elsewhere in this project: an object initial
          still gives Framer a state to reconcile against `animate`, and
          under reduced motion that reconciliation left elements stuck at
          their initial (invisible) value instead of resolving to visible. */}
      <motion.p
        key={cue.start}
        initial={prefersReduced ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReduced ? { duration: 0 } : { duration: 0.15 }}
        className="max-w-md sm:max-w-lg text-center text-[10px] sm:text-xs font-semibold text-white leading-snug bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-lg line-clamp-2"
      >
        {cue.text}
      </motion.p>
    </div>
  )
}

/* -------------------------------- Tactical map panel -------------------------------- */

function TacticalMap({ compact = false, time = 0 }: { compact?: boolean; time?: number }) {
  // The one "living" reaction in this case study tied to real data: the
  // radar blip intensifies while the broadcast is narrating an actual
  // mission beat (reusing the same CUES the subtitles already sync to),
  // and settles back between them — the tactical HUD answering to the
  // real timeline instead of looping identically regardless of what's
  // happening in the footage. A plain CSS transition (not Framer) drives
  // the change: it's a simple two-state interpolation that already
  // participates in this project's existing global reduced-motion CSS
  // override, no extra gating needed.
  const activeCue = CUES.find((c) => time >= c.start && time < c.end)
  return (
    <div
      className={`rounded-xl bg-black/60 backdrop-blur-md border border-cine-cyan/30 shadow-cine-lg ${compact ? 'px-2.5 py-2 w-[124px]' : 'px-3.5 py-3 w-[168px]'}`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Crosshair size={compact ? 9 : 11} className="text-cine-cyan" />
        <span className={`font-bold uppercase tracking-widest text-cine-cyan ${compact ? 'text-[7px]' : 'text-[8.5px]'}`}>Landing Coords</span>
      </div>
      <div className="relative w-full aspect-square rounded-lg bg-[#0a1a1f] overflow-hidden border border-cine-cyan/20">
        <div
          className="absolute inset-0 opacity-50"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(79,216,255,0.15) 0 1px, transparent 1px 12px), repeating-linear-gradient(90deg, rgba(79,216,255,0.15) 0 1px, transparent 1px 12px)' }}
        />
        <motion.div
          className="absolute inset-0 origin-center radar-sweep"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cine-magenta transition-all duration-500"
          style={{
            width: activeCue ? 8 : 6,
            height: activeCue ? 8 : 6,
            boxShadow: activeCue ? '0 0 10px 3px rgba(255,95,160,0.75)' : '0 0 4px 1px rgba(255,95,160,0.45)',
          }}
        />
      </div>
      {!compact && (
        <p className="mt-2 text-[8.5px] font-mono text-cine-sub leading-snug">
          34.02°N 118.45°W
          <br />
          ALT 1,240FT · HDG 074°
        </p>
      )}
    </div>
  )
}

/* ------------------------------------ Video panel ------------------------------------ */

/** Presentational only — every ref/state it needs lives in the parent
 *  (AiRescueCaseStudy) so the CTA button can render OUTSIDE this
 *  component, below the wrapper that TacticalMap anchors itself to,
 *  instead of inside it (which grew that wrapper taller
 *  and dragged those breakout elements down with it — see the export
 *  below for where the CTA now lives). */
function VideoPanel({
  wrapperRef,
  videoRef,
  playing,
  setPlaying,
  togglePlay,
  time,
  setTime,
}: {
  wrapperRef: React.RefObject<HTMLDivElement>
  videoRef: React.RefObject<HTMLVideoElement>
  playing: boolean
  setPlaying: (p: boolean) => void
  togglePlay: () => void
  time: number
  setTime: (t: number) => void
}) {
  const trackRef = useRef<HTMLTrackElement>(null)
  const [ccOn, setCcOn] = useState(true)

  // The native <track> below exists for accessibility (screen readers, the
  // browser's own CC menu) — but left at its default mode, browsers also
  // burn its cues directly onto the video, stacking a second, un-styled
  // copy of the captions on top of our own SubtitleOverlay. Forcing it to
  // 'hidden' keeps the cues available without double-rendering them.
  useEffect(() => {
    const t = trackRef.current?.track
    if (t) t.mode = 'hidden'
  }, [])

  return (
    <div ref={wrapperRef} style={VIDEO_MAX_WIDTH} className="relative mx-auto w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-cine-lg bg-black">
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        poster={VIDEO_POSTER_SRC}
        playsInline
        // Was "auto" — eagerly downloaded the whole ~14MB file the
        // instant this modal opened, whether or not the visitor ever
        // pressed play (caught in a performance audit). "metadata" only
        // fetches duration/dimensions; the real download now starts on
        // an actual play action, same as the People-in-Motion case
        // study's video already does.
        preload="metadata"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
        onDoubleClick={() => toggleFullscreen(wrapperRef.current)}
        className="absolute inset-0 w-full h-full object-contain bg-black cursor-pointer"
      >
        <track ref={trackRef} kind="subtitles" src={asset('/assets/navigator/captions-en.vtt')} srcLang="en" label="English" />
      </video>

      {!playing && <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/50 pointer-events-none" />}

      <SubtitleOverlay time={time} visible={ccOn && playing} />

      {/* Real transport controls (mute, speed, fullscreen) — a bare
          play/pause was the only way to interact with the video before.
          fullscreenRef points at THIS wrapper (video + every overlay), not
          the bare <video> — fullscreening the video element alone strips
          out every sibling control, leaving no way to pause without
          backing out of fullscreen first. */}
      <VideoControlBar videoRef={videoRef} fullscreenRef={wrapperRef} className="absolute top-3 left-3 z-10" />

      <button
        type="button"
        onClick={() => setCcOn((c) => !c)}
        aria-label={ccOn ? 'Turn off English captions' : 'Turn on English captions'}
        aria-pressed={ccOn}
        className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-md border text-[9px] font-bold tracking-wide transition-colors ${
          ccOn ? 'bg-cine-cyan/20 border-cine-cyan/60 text-cine-cyan' : 'bg-black/50 border-white/20 text-white/60 hover:text-white'
        }`}
      >
        <Captions size={12} /> CC
      </button>

      {/* Small centered play/pause affordance — click-anywhere-on-video
          already works (see the video's own onClick above), this is just
          the visible hint. The big "Watch Prime-Time Broadcast" CTA used
          to sit here, overlapping the picture — moved below the video
          entirely (rendered by the parent, outside this component) both
          because a control floating ON TOP of a <video> is exactly the
          kind of overlay that native/fullscreen video rendering can
          swallow clicks for in some browsers, and because it was covering
          the footage. */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Watch the prime-time broadcast"
          className="absolute inset-0 z-[5] flex items-center justify-center group"
        >
          <span className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-transform group-hover:scale-110">
            <Play size={20} className="fill-current translate-x-0.5" />
          </span>
        </button>
      )}
    </div>
  )
}

/* --------------------------------------- Info cards --------------------------------------- */

const INFO_CARDS = [
  { icon: Zap, title: 'Rapid Broadcast Delivery', body: 'Conceived, directed & delivered under live news deadline pressure.' },
  { icon: Eye, title: 'Tactical Visual Accuracy', body: 'Strict adherence to real-world geographic and military assets (F-15E, rocky terrain).' },
  { icon: Users2, title: 'Scene & Character Control', body: 'Maintained visual coherence & pilot anonymity across 20+ generated scenes.' },
]

/* ------------------------------------------ Export ------------------------------------------ */

export default function AiRescueCaseStudy({ onClose }: { onClose: () => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  // Lifted out of VideoPanel (previously local there) so the tactical map
  // below — a sibling, not a child, of the video — can also read the real
  // playback position and react to it. See TacticalMap's own comment.
  const [time, setTime] = useState(0)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play().catch(() => {})
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="relative">
      <CaseStudyHeader
        id="modal-ai-title"
        stageLabel={PROJECT_NUMBER['ai-rescue']}
        title="AI CINEMATIC PIPELINE: PILOT RESCUE"
        supportLabel="Prime-Time News Broadcast (High-Pressure Delivery)"
        theme="dark"
        onClose={onClose}
        showBreadcrumb={false}
        meta={[
          { label: 'Role', value: 'AI Director, Prompt Engineer, Compositor' },
          { label: 'Tech Stack', value: 'Midjourney · Runway Gen-2 · Luma AI' },
        ]}
      />

      <div className="relative px-5 sm:px-8 pb-6 pt-2">
        {/* Background atmosphere — the panel read as visually empty behind
            the video. Two large, very soft blurred glows (cyan + magenta,
            this case study's own accent pair) sitting behind everything,
            plus a faint dot-grid texture reading as "generative/AI lab"
            rather than a flat black void. */}
        <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none -z-10" aria-hidden>
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-cine-cyan/20 blur-[90px]" />
          <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full bg-cine-magenta/15 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: 'radial-gradient(rgba(79,216,255,0.6) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          />
        </div>

        {/* Shares VIDEO_MAX_WIDTH with the video panel itself (rather than
            an inline-block shrink-wrap, which created a circular width
            dependency and collapsed the video to 0px) so the tactical map
            & badge — deliberately positioned outside the video — always
            align to its true edges. */}
        <div className="flex justify-center">
          <div style={VIDEO_MAX_WIDTH} className="relative w-full">
            <VideoPanel wrapperRef={wrapperRef} videoRef={videoRef} playing={playing} setPlaying={setPlaying} togglePlay={togglePlay} time={time} setTime={setTime} />

            {/* Tactical map — OFF the video surface entirely (not an inset
                overlay on top of the footage), breaking the video's own
                bottom-left corner instead so it reads as an adjacent HUD
                panel rather than something competing with the picture. */}
            <div className="absolute -bottom-8 sm:-bottom-10 left-2 sm:left-4 z-20 hidden sm:block">
              <TacticalMap compact time={time} />
            </div>
          </div>
        </div>

        {/* CTA lives here, OUTSIDE the video wrapper above — not a video
            overlay (was, and got reported as "the button on the video
            doesn't work" — a control floating on top of a <video> is
            exactly the kind of overlay native/fullscreen video rendering
            can swallow clicks for). Plain in-flow button, always
            clickable regardless of the video's own fullscreen state. */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={togglePlay}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-bold text-xs sm:text-sm tracking-wide uppercase bg-gradient-to-b from-white to-[#e7e2f5] text-[#28223f] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.45)] transition-transform hover:scale-[1.04]"
          >
            <span className="w-6 h-6 rounded-full bg-[#28223f]/10 flex items-center justify-center group-hover:bg-[#28223f]/15 transition-colors">
              {playing ? <Pause size={11} className="fill-current" /> : <Play size={11} className="fill-current" />}
            </span>
            {playing ? 'Pause Broadcast' : 'Watch Prime-Time Broadcast'}
          </button>
        </div>

        {/* Tactical map — mobile only (the breakout desktop version lives
            beside the video itself, hidden below sm:). */}
        <div className="sm:hidden mt-4 flex justify-center">
          <TacticalMap time={time} />
        </div>

        <div className="grid sm:grid-cols-3 gap-3.5 mt-8 sm:mt-7">
          {INFO_CARDS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl glass-cine-soft p-4">
              <Icon size={16} className="text-cine-cyan mb-2" />
              <p className="font-display font-bold text-sm text-white">{title}</p>
              <p className="text-[11px] text-cine-sub mt-1 leading-snug">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The C-130 and the pilot, both breaking the modal's own frame — rendered
 *  via ProjectModal's `breakout` slot (outside the scroll container's
 *  clipping), both z-40 so the close button (z-[100]) always wins. */
export function AiRescueBreakout() {
  return (
    <>
      {/* Anchored at the panel's own top-right corner, breaking the frame
          boundary exactly as the mockup shows. A previous tuning pass
          pulled this down/right from the very corner, reasoning the rest
          position and drift range both cleared the close button's hit
          area — true for the *click* target (z-[100] pointer-events, this
          image is pointer-events-none regardless), but a visual check
          (screenshotting this exact region, not just comparing bounding
          boxes — the image's own bounding box is much bigger than the
          aircraft's actual silhouette within it) found the fuselage
          itself still visually crossing right behind the button at rest.
          Pushed down further still (top-14→top-24 at lg) and pulled
          in from the edge (-right-14→-right-8) so the visible aircraft,
          not just its bounding box, clears the button with real margin.
          The offset at each breakpoint stays capped to that breakpoint's
          own ProjectModal wrapper padding (p-3/p-6/p-10) so the plane's
          top edge can never be pushed past the actual viewport edge and
          clipped, regardless of how tall the modal itself renders. A
          single continuous easeInOut loop (no held pauses between
          keyframes) drifts it along a wide diagonal for constant,
          non-stuttering motion — it never fully stops, and only ever
          drifts further from the button (left/down), never toward it.
          Sits at z-30, one level below CaseStudyHeader's z-40 AND below
          the close button's z-[100], so it can never functionally block
          it either way. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ x: [0, -22, 0], y: [0, 14, 0], rotate: [-4, -9, -4], opacity: 1 }}
        transition={{
          x: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 0.6 },
        }}
        className="absolute top-16 sm:top-20 lg:top-24 -right-4 sm:-right-6 lg:-right-8 z-30 w-44 sm:w-56 lg:w-72 pointer-events-none drop-shadow-2xl"
      >
        <img
          src={AIRPLANE_SRC}
          alt="A C-130 Hercules transport aircraft, breaking out of the case-study frame's top-right corner"
          className="w-full h-auto object-contain"
        />
      </motion.div>

      {/* Pilot — fully opaque, foregrounded (z-20, comfortably below the
          header's z-40 joystick badge and the z-[100] close button), and
          anchored to the LEFT side at a height that clears the info cards
          further down so he never masks their text. Enlarged and pulled
          closer to the video — the gap between them read as an empty,
          missing spot rather than a deliberate breakout. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, x: -16, y: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.35 }}
        className="absolute top-[36%] -left-3 sm:-left-6 z-20 w-40 sm:w-56 opacity-100 hidden sm:block"
        style={{ filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.55)) drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}
      >
        <img src={PILOT_SRC} alt="The rescued F-15E navigator, breaking out of the case-study frame" className="w-full h-auto object-contain opacity-100" />
      </motion.div>
    </>
  )
}
