import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { asset } from '../../lib/asset'

const motionAsset = (name: string) => asset(`/assets/motion/${name}`)

const FULL_FILM_SRC = motionAsset('aca-anashim.mp4')
const HERO_HIGHLIGHT_SRC = motionAsset('gameplay_highlight_final.mp4')
const FULL_FILM_POSTER_SRC = motionAsset('people-motion-hero-poster.jpg')

const MOTION_SKILLS = [
  {
    number: '01',
    title: 'Character Animation',
    icon: 'icons/character-animation.svg',
    clip: 'clips/03-character-animation.mp4',
    caption: 'Expressive character movement integrated into animated environments.',
  },
  {
    number: '02',
    title: 'UI & Game Animation',
    icon: 'icons/ui-game-animation.svg',
    clip: 'clips/02-ui-game-animation.mp4',
    caption: 'Animated interfaces, game systems and responsive graphic elements.',
  },
  {
    number: '03',
    title: 'Kinetic Type & Transitions',
    icon: 'icons/transitions-compositing.svg',
    clip: 'clips/people-kinetic-typography.mp4',
    caption: 'Animated typography, scene transitions and visual continuity across changing worlds.',
  },
] as const

function SectionHeading({ id, eyebrow, children, note }: { id: string; eyebrow?: string; children: React.ReactNode; note: string }) {
  return (
    <header>
      {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7444ff]">{eyebrow}</p>}
      <h2 id={id} className="mt-2 font-serif text-3xl leading-[0.98] tracking-[-0.045em] text-[#171428] sm:text-4xl">{children}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5e5a72]">{note}</p>
    </header>
  )
}

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

function toggleMediaFullscreen(container: HTMLElement | null, video: HTMLVideoElement | null) {
  if (!container || !video) return
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {})
    return
  }

  const webkitVideo = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void }
  const fallback = () => webkitVideo.webkitEnterFullscreen?.()
  if (container.requestFullscreen) {
    container.requestFullscreen().catch(fallback)
  } else {
    fallback()
  }
}

function HeroHighlight({ reduceMotion }: { reduceMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(!reduceMotion)
  const [muted, setMuted] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reduceMotion) {
      video.pause()
      setPlaying(false)
      return
    }
    video.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [reduceMotion])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => setPlaying(false))
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <video
        ref={videoRef}
        src={HERO_HIGHLIGHT_SRC}
        autoPlay={!reduceMotion}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlayback}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        className="block h-full w-full cursor-pointer object-cover"
      >
        Your browser does not support this video.
      </video>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          togglePlayback()
        }}
        aria-label={playing ? 'Pause highlight' : 'Play highlight'}
        aria-pressed={playing}
        className={`absolute z-10 grid place-items-center border border-white/65 bg-[#7444ff]/85 text-white shadow-[0_8px_20px_rgba(50,25,120,0.25)] backdrop-blur-sm transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7444ff] ${playing ? 'bottom-3 right-[5.5rem] h-9 w-9 rounded-full opacity-80 hover:opacity-100' : 'left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full'}`}
      >
        {playing ? <Pause size={15} fill="currentColor" /> : <Play size={22} fill="currentColor" className="translate-x-0.5" />}
      </button>
      <div className="absolute bottom-3 right-3 z-10 flex gap-2">
        <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute highlight' : 'Mute highlight'} aria-pressed={!muted} className="grid h-9 w-9 place-items-center rounded-full border border-white/65 bg-[#7444ff]/85 text-white shadow-[0_8px_20px_rgba(50,25,120,0.25)] backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7444ff]">
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button type="button" onClick={() => toggleMediaFullscreen(containerRef.current, videoRef.current)} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} aria-pressed={fullscreen} className="grid h-9 w-9 place-items-center rounded-full border border-white/65 bg-[#7444ff]/85 text-white shadow-[0_8px_20px_rgba(50,25,120,0.25)] backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7444ff]">
          {fullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
        </button>
      </div>
    </div>
  )
}

function MotionPreview({ id, src, title, onRequestPlay, registerVideo }: {
  id: string
  src: string
  title: string
  onRequestPlay: (id: string) => void
  registerVideo: (id: string, video: HTMLVideoElement | null) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', updateFullscreen)
    return () => document.removeEventListener('fullscreenchange', updateFullscreen)
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      onRequestPlay(id)
      video.play().catch(() => setPlaying(false))
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div ref={containerRef} className="relative aspect-video overflow-hidden rounded-2xl border border-[#786c9c]/15 bg-[#171428]">
      <video
        ref={(video) => {
          videoRef.current = video
          registerVideo(id, video)
        }}
        src={motionAsset(src)}
        aria-label={`${title} moving preview`}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlayback}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        className="block h-full w-full cursor-pointer object-cover"
      />
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        aria-pressed={playing}
        className={`absolute z-10 grid place-items-center border border-white/65 bg-[#7444ff]/85 text-white shadow-[0_8px_20px_rgba(50,25,120,0.25)] backdrop-blur-sm transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7444ff] ${playing ? 'bottom-3 right-[5.5rem] h-8 w-8 rounded-full opacity-80 hover:opacity-100' : 'left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full'}`}
      >
        {playing ? <Pause size={13} fill="currentColor" /> : <Play size={20} fill="currentColor" className="translate-x-0.5" />}
      </button>
      <div className="absolute bottom-3 right-3 z-10 flex gap-2">
        <button type="button" onClick={toggleMute} aria-label={muted ? `Unmute ${title}` : `Mute ${title}`} aria-pressed={!muted} className="grid h-8 w-8 place-items-center rounded-full border border-white/65 bg-[#7444ff]/85 text-white shadow-[0_8px_20px_rgba(50,25,120,0.25)] backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7444ff]">
          {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
        </button>
        <button type="button" onClick={() => toggleMediaFullscreen(containerRef.current, videoRef.current)} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} aria-pressed={fullscreen} className="grid h-8 w-8 place-items-center rounded-full border border-white/65 bg-[#7444ff]/85 text-white shadow-[0_8px_20px_rgba(50,25,120,0.25)] backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#7444ff]">
          {fullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
        </button>
      </div>
    </div>
  )
}

export default function PeopleMotionCaseStudy({ onClose, onNavigate }: { onClose: () => void; onNavigate?: (project: 'galgalatz' | 'ai-rescue') => void; dark?: boolean }) {
  const reduceMotion = usePrefersReducedMotion()
  const skillVideos = useRef<Record<string, HTMLVideoElement | null>>({})

  const registerSkillVideo = useCallback((id: string, video: HTMLVideoElement | null) => {
    skillVideos.current[id] = video
  }, [])

  const requestSkillPlayback = useCallback((id: string) => {
    Object.entries(skillVideos.current).forEach(([otherId, video]) => {
      if (otherId !== id) video?.pause()
    })
  }, [])

  const pauseAllSkillPreviews = useCallback(() => {
    Object.values(skillVideos.current).forEach((video) => video?.pause())
  }, [])

  return (
    <article className="overflow-hidden rounded-[28px] bg-white/45 text-[#171428] backdrop-blur-[2px] sm:rounded-[32px]">
      <h1 id="modal-motion-title" className="sr-only">People in Motion</h1>

      <div className="space-y-10 px-5 py-7 sm:space-y-14 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {/* 1. Hero */}
        <section aria-labelledby="motion-hero-title" className="grid items-center gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7444ff]">Motion Design Project</p>
            <h2 id="motion-hero-title" className="mt-3 font-serif text-[clamp(2.8rem,5vw,5.2rem)] leading-[0.9] tracking-[-0.06em] text-[#171428]">People in Motion</h2>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#514a68]">Motion Design · After Effects · 2D Animation · Visual Storytelling</p>
            <p className="mt-5 text-sm leading-relaxed text-[#5e5a72] sm:text-[15px]">A character-led motion piece combining animation, game-inspired UI, kinetic typography and transitions across changing visual worlds.</p>
          </div>
          <div className="aspect-video overflow-hidden rounded-[22px] border border-white/80 bg-[#171428] shadow-[0_20px_55px_rgba(64,43,120,0.16)]">
            <HeroHighlight reduceMotion={reduceMotion} />
          </div>
        </section>

        {/* 2. Motion Skills */}
        <section aria-labelledby="motion-skills" className="border-t border-[#756b95]/15 pt-9 sm:pt-11">
          <SectionHeading id="motion-skills" note="Three motion disciplines demonstrated through real moments from the film.">Motion Skills</SectionHeading>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {MOTION_SKILLS.map((skill) => (
              <article key={skill.number} className="min-w-0 rounded-[22px] border border-white/80 bg-white/55 p-3 shadow-[0_14px_35px_rgba(64,43,120,0.07)] sm:p-4">
                <MotionPreview
                  id={skill.number}
                  src={skill.clip}
                  title={skill.title}
                  onRequestPlay={requestSkillPlayback}
                  registerVideo={registerSkillVideo}
                />
                <div className="mt-4 flex items-start gap-3">
                  <img src={motionAsset(skill.icon)} alt="" aria-hidden className="h-9 w-9 shrink-0 object-contain" />
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.17em] text-[#7444ff]">{skill.number}</p>
                    <h3 className="mt-1 font-serif text-2xl leading-none tracking-[-0.04em] text-[#171428]">{skill.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#5e5a72]">{skill.caption}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. Watch the Full Film */}
        <section aria-labelledby="motion-film" className="border-t border-[#756b95]/15 pt-9 sm:pt-11">
          <SectionHeading id="motion-film" eyebrow="Watch the Full Film" note="Experience the complete motion piece and the journey across its characters, interfaces and game-inspired scenes.">People in Motion</SectionHeading>
          <div className="mt-6 aspect-video overflow-hidden rounded-[22px] border border-white/80 bg-[#171428] shadow-[0_20px_55px_rgba(64,43,120,0.16)]">
            <video
              src={FULL_FILM_SRC}
              poster={FULL_FILM_POSTER_SRC}
              controls
              playsInline
              preload="metadata"
              onPlay={pauseAllSkillPreviews}
              className="h-full w-full object-contain"
            >
              Your browser does not support this video.
            </video>
          </div>
        </section>
      </div>

      {/* 5. Existing previous / next project navigation */}
      <footer className="flex items-center justify-between gap-4 border-t border-[#756b95]/15 bg-white/30 px-5 py-5 sm:px-8">
        <button type="button" onClick={() => onNavigate ? onNavigate('galgalatz') : onClose()} className="inline-flex items-center gap-2 text-xs font-semibold text-[#3f3853] transition-colors hover:text-[#7444ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7444ff]">
          <ArrowLeft size={17} /> Previous Project
        </button>
        <p className="text-center text-[10px] uppercase tracking-[0.16em] text-[#756f85]"><span className="mb-1 block text-[9px]">Selected Work</span><span className="font-serif text-xl normal-case tracking-normal text-[#171428]">People in Motion</span></p>
        <button type="button" onClick={() => onNavigate ? onNavigate('ai-rescue') : onClose()} className="inline-flex items-center gap-2 text-xs font-semibold text-[#3f3853] transition-colors hover:text-[#7444ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7444ff]">
          Next Project <ArrowRight size={17} />
        </button>
      </footer>
    </article>
  )
}

/** The focused showcase needs no decorative breakouts beyond the existing shared modal shell. */
export function PeopleMotionBreakout() {
  return null
}
