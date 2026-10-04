import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { asset } from '../../lib/asset'

const navigatorAsset = (name: string) => asset(`/assets/navigator/${name}`)

const MAIN_FILM_SRC = navigatorAsset('main-film.mp4')
const MAIN_FILM_POSTER_SRC = navigatorAsset('main-film-frame.jpg')
const CAPTIONS_SRC = navigatorAsset('captions-en.vtt')

const FRAME_TO_MOTION = [
  {
    number: '01',
    label: 'Pilot / Survival',
    still: navigatorAsset('stills/Pilot_crawling_transmitting_202604051655.jpeg'),
    motion: navigatorAsset('motion/002.mp4'),
    caption: 'Directed character, environment and cinematic mood.',
  },
  {
    number: '02',
    label: 'Command Center',
    still: navigatorAsset('stills/2.jpeg'),
    motion: navigatorAsset('motion/0023.mp4'),
    caption: 'Controlled environment, information and visual continuity.',
  },
  {
    number: '03',
    label: 'Rescue / Extraction',
    still: navigatorAsset('stills/7.jpeg'),
    motion: navigatorAsset('motion/007.mp4'),
    caption: 'Consistent people, aircraft and environment across the sequence.',
  },
] as const

const PIPELINE_STAGES = [
  { number: '01', title: 'News Brief', copy: 'Turning a developing story into a visual sequence.' },
  { number: '02', title: 'Frame Direction', copy: 'Defining the shot, character, environment and mood.' },
  { number: '03', title: 'AI Motion', copy: 'Bringing the selected frame into motion.' },
  { number: '04', title: 'Final Compositing', copy: 'Refining continuity, movement and the final broadcast sequence.' },
] as const

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ))

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reduced
}

function requestMediaFullscreen(container: HTMLElement | null, video: HTMLVideoElement | null) {
  if (!container || !video) return
  const webkitVideo = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
  if (container.requestFullscreen) {
    container.requestFullscreen().catch(() => webkitVideo.webkitEnterFullscreen?.())
  } else {
    webkitVideo.webkitEnterFullscreen?.()
  }
}

/** Retains the real key frame above the video until its first valid frame is
 * available. If the MP4 fails, the key frame remains visible. */
function MotionVideo({
  src,
  poster,
  label,
  shouldPlay,
  muted,
  onVideoRef,
  onPlaybackChange,
  onReadyChange,
  onFailure,
}: {
  src: string
  poster: string
  label: string
  shouldPlay: boolean
  muted: boolean
  onVideoRef: (video: HTMLVideoElement | null) => void
  onPlaybackChange: (playing: boolean) => void
  onReadyChange: (ready: boolean) => void
  onFailure: () => void
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  const markReady = () => {
    if (failed) return
    setReady(true)
    onReadyChange(true)
  }

  // A cached MP4 can already have a decoded frame by the time React wires
  // the media events. Treat that as ready too, so its key-frame fallback is
  // never left on top of an otherwise playable video.
  useEffect(() => {
    const video = videoRef.current
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markReady()
    // This runs for every selected source; media events remain the primary
    // readiness signal for uncached video.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!shouldPlay || !ready || failed) {
      video.pause()
      return
    }
    video.play().catch(() => {
      onPlaybackChange(false)
    })
    return () => video.pause()
  }, [failed, onPlaybackChange, ready, shouldPlay, src])

  const setVideo = (video: HTMLVideoElement | null) => {
    videoRef.current = video
    onVideoRef(video)
  }

  return (
    <div className="absolute inset-0">
      <img src={poster} alt="" aria-hidden className={`absolute inset-0 block h-full w-full object-contain transition-opacity duration-200 ${ready && !failed ? 'opacity-0' : 'opacity-100'}`} />
      <video
        ref={setVideo}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onLoadedData={markReady}
        onCanPlay={markReady}
        onError={() => {
          setFailed(true)
          setReady(false)
          onReadyChange(false)
          onPlaybackChange(false)
          onFailure()
        }}
        onPlay={() => onPlaybackChange(true)}
        onPause={() => onPlaybackChange(false)}
        className={`absolute inset-0 block h-full w-full object-contain transition-opacity duration-200 ${ready && !failed ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

function HeroFilm({ reduceMotion }: { reduceMotion: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (reduceMotion) videoRef.current?.pause()
  }, [reduceMotion])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => setPlaying(false))
    else video.pause()
  }

  return (
    <section aria-labelledby="ai-hero-title" className="relative aspect-video min-h-[31rem] overflow-hidden rounded-[24px] border border-white/15 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.5)] sm:min-h-0">
      <video ref={videoRef} src={MAIN_FILM_SRC} poster={MAIN_FILM_POSTER_SRC} playsInline preload="metadata" onClick={togglePlayback} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} className="absolute inset-0 block h-full w-full cursor-pointer object-cover">
        Your browser does not support this video.
      </video>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,16,.96)_0%,rgba(7,11,16,.83)_29%,rgba(7,11,16,.34)_53%,rgba(7,11,16,.04)_77%),linear-gradient(0deg,rgba(7,11,16,.52)_0%,transparent_44%)]" />
      <div className="relative z-10 flex h-full max-w-[650px] flex-col justify-end px-6 py-7 sm:px-10 sm:py-10 lg:px-14 lg:py-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e7b76d]">AI / Visual Storytelling</p>
        <h1 id="ai-hero-title" className="mt-4 font-serif text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.9] tracking-[-0.055em] text-[#fffaf0]">AI Cinematic Pipeline:<br />Pilot Rescue</h1>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e3dbcf]">AI Direction · Script · Frame Design · Compositing</p>
        <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed text-[#ded6cb] sm:text-[16px]">A prime-time N12 visual story created under a live-news deadline, combining AI-generated imagery with directed frame design, continuity control and motion compositing.</p>
      </div>
      <button type="button" onClick={togglePlayback} aria-label={playing ? 'Pause final result' : 'Play final result'} aria-pressed={playing} className={`absolute z-20 grid place-items-center rounded-full border border-white/40 bg-black/45 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7b76d] ${playing ? 'bottom-5 right-5 h-11 w-11' : 'left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2'}`}>
        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={25} fill="currentColor" className="translate-x-0.5" />}
      </button>
    </section>
  )
}

function SectionHeading({ id, title, note }: { id: string; title: string; note: string }) {
  return (
    <header>
      <h2 id={id} className="font-serif text-[clamp(2rem,3vw,2.55rem)] leading-[0.96] tracking-[-0.045em] text-[#fffaf0]">{title}</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#cfc6ba] sm:text-[16px]">{note}</p>
    </header>
  )
}

function FrameMotionShowcase({ reduceMotion }: { reduceMotion: boolean }) {
  const [activeExampleId, setActiveExampleId] = useState('01')
  const [mode, setMode] = useState<'keyframe' | 'motion'>('keyframe')
  const [videoReady, setVideoReady] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [failed, setFailed] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const activeExample = FRAME_TO_MOTION.find((item) => item.number === activeExampleId) ?? FRAME_TO_MOTION[0]

  const resetToKeyFrame = (number: string) => {
    videoRef.current?.pause()
    setActiveExampleId(number)
    setMode('keyframe')
    setVideoReady(false)
    setVideoPlaying(false)
    setMuted(true)
    setFailed(false)
  }

  const watchMotion = () => {
    setVideoReady(false)
    setVideoPlaying(false)
    setMuted(true)
    setFailed(false)
    setMode('motion')
  }

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => setVideoPlaying(false))
    else video.pause()
  }

  const toggleSound = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const retryMotion = () => {
    setFailed(false)
    setVideoReady(false)
    setRetryKey((value) => value + 1)
  }

  return (
    <>
      <div role="group" aria-label="Frame to motion examples" className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {FRAME_TO_MOTION.map((example) => {
          const active = example.number === activeExampleId
          return <button key={example.number} type="button" aria-pressed={active} onClick={() => resetToKeyFrame(example.number)} className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7b76d] ${active ? 'border-[#e7b76d] bg-[#e7b76d]/15 text-[#fff5e3]' : 'border-white/15 text-[#aaa397] hover:border-white/30 hover:text-[#e8dfd1]'}`}>
            {example.number} {example.label}
          </button>
        })}
      </div>

      <div ref={stageRef} className="relative mt-5 aspect-video overflow-hidden rounded-[22px] border border-white/15 bg-[#0a0e13] shadow-[0_24px_65px_rgba(0,0,0,0.38)]">
        <AnimatePresence initial={false}>
          <motion.div key={`${activeExample.number}-${mode}-${retryKey}`} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }} className="absolute inset-0">
            {mode === 'keyframe' ? (
              <img src={activeExample.still} alt={`${activeExample.label} key frame`} className="block h-full w-full object-contain" />
            ) : (
              <MotionVideo
                src={activeExample.motion}
                poster={activeExample.still}
                label={`${activeExample.label} motion sequence`}
                shouldPlay
                muted={muted}
                onVideoRef={(video) => { videoRef.current = video }}
                onPlaybackChange={setVideoPlaying}
                onReadyChange={setVideoReady}
                onFailure={() => setFailed(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f1e9dc] backdrop-blur-sm">
          {mode === 'keyframe' ? 'Key Frame' : videoPlaying ? 'Motion Playing' : 'Motion Paused'}
        </div>

        {mode === 'keyframe' && (
          <button type="button" onClick={watchMotion} aria-label={`Watch ${activeExample.label} frame come alive`} className="absolute left-1/2 top-1/2 z-30 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/40 bg-black/55 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7b76d]">
            <Play size={15} fill="currentColor" /> Watch This Frame Come Alive
          </button>
        )}

        {mode === 'motion' && (
          <div className="absolute bottom-4 right-4 z-30 flex flex-wrap justify-end gap-2">
            {failed ? (
              <button type="button" onClick={retryMotion} aria-label={`Retry ${activeExample.label} motion`} className="rounded-full border border-white/40 bg-black/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e7b76d]">Retry Motion</button>
            ) : (
              <button type="button" onClick={togglePlayback} aria-label={videoPlaying ? `Pause ${activeExample.label} motion` : `Play ${activeExample.label} motion`} aria-pressed={videoPlaying} className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e7b76d]">
                {videoPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />} {videoPlaying ? 'Pause' : 'Play'}
              </button>
            )}
            <button type="button" onClick={toggleSound} aria-label={muted ? `Unmute ${activeExample.label} motion` : `Mute ${activeExample.label} motion`} aria-pressed={!muted} className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e7b76d]">
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />} Sound
            </button>
            <button type="button" onClick={() => requestMediaFullscreen(stageRef.current, videoRef.current)} aria-label={`Enter ${activeExample.label} motion fullscreen`} className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-black/55 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e7b76d]">
              <Maximize size={13} /> Fullscreen
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-[#cfc6ba]">{activeExample.caption}</p>
      <span className="sr-only">Motion video ready: {videoReady ? 'yes' : 'no'}</span>
    </>
  )
}

export default function AiRescueCaseStudy({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (project: 'people-motion' | 'amy') => void }) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <article className="overflow-hidden rounded-[28px] border border-white/[0.11] bg-[rgba(7,11,16,0.92)] text-[#fffaf0] shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-[24px] sm:rounded-[32px]">
      <h1 id="modal-ai-title" className="sr-only">AI Cinematic Pipeline: Pilot Rescue</h1>
      <div className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_36%_at_86%_2%,rgba(178,120,47,0.14),transparent_68%),radial-gradient(ellipse_62%_42%_at_6%_45%,rgba(112,84,168,0.12),transparent_70%)]" />
        <div className="relative space-y-14 px-5 py-5 sm:space-y-20 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          {/* 1. Hero */}
          <HeroFilm reduceMotion={reduceMotion} />

          {/* 2. Static pipeline */}
          <section aria-labelledby="ai-pipeline-title" className="border-t border-white/10 pt-10 sm:pt-14">
            <SectionHeading id="ai-pipeline-title" title="From News Brief to Broadcast" note="A simple four-step workflow from developing story to final broadcast." />
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PIPELINE_STAGES.map((stage, index) => (
                <li key={stage.number} className="relative border-t border-white/15 pt-4 lg:pr-4">
                  {index < PIPELINE_STAGES.length - 1 && <ArrowRight aria-hidden size={15} className="absolute -right-2 top-4 hidden text-[#e7b76d]/75 lg:block" />}
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#e7b76d]">{stage.number}</p>
                  <h3 className="mt-2 text-xs font-bold uppercase tracking-[0.13em] text-[#fffaf0]">{stage.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#cfc6ba]">{stage.copy}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* 3. The only interactive section */}
          <section aria-labelledby="ai-frame-motion-title" className="border-t border-white/10 pt-10 sm:pt-14">
            <SectionHeading id="ai-frame-motion-title" title="From Frame to Motion" note="Select a shot, then watch the directed key frame come to life." />
            <FrameMotionShowcase reduceMotion={reduceMotion} />
          </section>

          {/* 4. Final Broadcast */}
          <section aria-labelledby="ai-final-broadcast-title" className="border-t border-white/10 pb-4 pt-12 sm:pb-8 sm:pt-16">
            <SectionHeading id="ai-final-broadcast-title" title="Final Broadcast" note="The complete N12 visual piece — combining AI-generated frames, motion and compositing into one final sequence." />
            <div className="mt-8 aspect-video overflow-hidden rounded-[24px] border border-white/15 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.46)]">
              <video src={MAIN_FILM_SRC} poster={MAIN_FILM_POSTER_SRC} controls playsInline preload="metadata" className="block h-full w-full object-contain">
                <track kind="captions" src={CAPTIONS_SRC} srcLang="en" label="English" default />
                Your browser does not support this video.
              </video>
            </div>
          </section>
        </div>
      </div>

      {/* 5. Existing Previous / Next Project navigation */}
      <footer className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/20 px-5 py-5 sm:px-8">
        <button type="button" onClick={() => onNavigate ? onNavigate('people-motion') : onClose()} className="inline-flex items-center gap-2 text-xs font-semibold text-[#d8d1c7] transition-colors hover:text-[#e7b76d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7b76d]"><ArrowLeft size={17} /> Previous Project</button>
        <p className="text-center text-[10px] uppercase tracking-[0.16em] text-[#bcb4aa]"><span className="mb-1 block text-[9px]">Selected Work</span><span className="font-serif text-xl normal-case tracking-normal text-[#fffaf0]">AI Cinematic Pipeline</span></p>
        <button type="button" onClick={() => onNavigate ? onNavigate('amy') : onClose()} className="inline-flex items-center gap-2 text-xs font-semibold text-[#d8d1c7] transition-colors hover:text-[#e7b76d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7b76d]">Next Project <ArrowRight size={17} /></button>
      </footer>
    </article>
  )
}

export function AiRescueBreakout() {
  return null
}
