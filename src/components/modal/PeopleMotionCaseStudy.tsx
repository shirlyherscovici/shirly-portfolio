import { useRef, useState } from 'react'
import { Play, Pause, Smartphone, Layers, Scissors, UserCircle2, Layers3 } from 'lucide-react'
import CaseStudyHeader from './CaseStudyHeader'
import FloatingElement from '../ui/FloatingElement'
import VideoControlBar, { toggleFullscreen } from '../ui/VideoControlBar'
import { GoldCoin, HeartIcon, MusicNote } from '../ui/decor'
import ComputerMonitorFrame from '../ui/ComputerMonitorFrame'
import { asset } from '../../lib/asset'
import { PROJECT_NUMBER } from '../../lib/projectMeta'

const VIDEO_SRC = asset('/assets/motion/aca-anashim.mp4')
const POSTER_SRC = asset('/assets/motion/aca-anashim-poster.jpg')

const SPECS = [
  { icon: Smartphone, label: 'Responsive Format: Mobile 9:16 & Desktop 16:9' },
  { icon: Layers, label: 'Spine2D & Rigging Pipeline' },
  { icon: Scissors, label: 'Sprite Sheet Optimization' },
]

/* ------------------------------------- Export ------------------------------------- */

export default function PeopleMotionCaseStudy({ onClose, dark = false }: { onClose: () => void; dark?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)

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
    <div>
      <CaseStudyHeader
        id="modal-motion-title"
        stageLabel={PROJECT_NUMBER['people-motion']}
        title="People In Motion"
        supportLabel="Playable Ad Concept & Game UI Motion"
        theme={dark ? 'dark' : 'light'}
        onClose={onClose}
        showBreadcrumb={false}
        meta={[
          { label: 'Role', value: 'Script, Director & Lead Motion Designer', icon: UserCircle2 },
          { label: 'Tech Stack', value: 'AE · Illustrator · Rigging', icon: Layers3 },
        ]}
      />

      <div className="relative px-5 sm:px-8 pb-6">
        {/* Background atmosphere — matches the treatment AI Rescue got:
            the panel otherwise reads as visually empty behind the video.
            Warm gold/rose glows (this case study's own palette) instead
            of AI Rescue's cyan/magenta, plus the same faint dot texture. */}
        <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none -z-10" aria-hidden>
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-pearl-gold/20 blur-[90px]" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-pearl-red/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: 'radial-gradient(rgba(176,42,58,0.5) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          />
        </div>

        <div className="relative">
          <div style={{ maxWidth: 'calc(52vh * 16 / 9)' }} className="relative mx-auto w-full">
            <ComputerMonitorFrame ref={screenRef}>
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                playsInline
                preload="metadata"
                onEnded={() => setPlaying(false)}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {!playing && <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/40" />}

              {/* Glass play button overlay — the one control that starts or
                  stops playback, matching the light pearl palette. Also
                  the double-click-to-fullscreen target: it fully covers
                  the video (absolute inset-0), so it's what actually
                  receives the pointer events in that area, not the
                  <video> underneath it. */}
              <button
                type="button"
                onClick={togglePlay}
                onDoubleClick={() => toggleFullscreen(screenRef.current)}
                aria-label={playing ? 'Pause the After Effects reel' : 'Play the After Effects reel'}
                className="group absolute inset-0 flex items-center justify-center"
              >
                <span
                  className={`flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-pearl-lg transition-all group-hover:scale-110 group-hover:bg-white/30 ${
                    playing ? 'w-12 h-12 opacity-0 group-hover:opacity-100' : 'w-16 h-16 sm:w-20 sm:h-20'
                  }`}
                >
                  {playing ? (
                    <Pause size={20} className="text-white fill-current" />
                  ) : (
                    <Play size={24} className="text-white fill-current translate-x-0.5" />
                  )}
                </span>
              </button>

              {/* Real transport controls (mute, speed, fullscreen) — a bare
                  play/pause was the only way to interact with the video
                  before. z-20 + rendered after the full-cover play button
                  above, so these buttons' own bounds win the click instead
                  of also triggering play/pause underneath them. */}
              <VideoControlBar videoRef={videoRef} fullscreenRef={screenRef} className="absolute top-3 left-3 z-20" />
            </ComputerMonitorFrame>
          </div>

          {/* A timeline ruler + a few keyframe diamonds — After Effects'
              own visual language, in this case study's established gold/
              red rather than a new accent color, replacing what was a
              plain empty gap between the screen and the CTA below it. A
              first attempt at this lived in the absolutely-positioned
              background layer above at `top-[14%]`, which turned out to
              sit directly behind the video monitor's own opaque frame —
              invisible regardless of contrast (caught in review, by
              actually looking at a screenshot of that exact region, not
              just trusting the position math). A real in-flow element
              here instead guarantees it renders in the one gap that's
              always genuinely visible background, whatever the video's
              own responsive size. */}
          <div className="relative mt-4 h-3 mx-auto" style={{ maxWidth: 'calc(52vh * 16 / 9)' }} aria-hidden>
            <div className="absolute inset-x-[4%] top-1/2 h-px bg-pearl-gold/35" />
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="absolute top-1/2 w-px h-2.5 -translate-y-1/2 bg-pearl-gold/30" style={{ left: `${6 + i * 5.9}%` }} />
            ))}
            {[
              { left: '18%', color: '#b8863b' },
              { left: '46%', color: '#b02a3a' },
              { left: '74%', color: '#b8863b' },
            ].map((k, i) => (
              <span
                key={i}
                className="absolute top-1/2 w-2 h-2"
                style={{ left: k.left, backgroundColor: k.color, transform: 'translate(-50%, -50%) rotate(45deg)', boxShadow: `0 0 6px ${k.color}` }}
              />
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            {/* Light lavender/white glass pill with dark text — matches the
                mockup's "Watch Playable Demo" CTA exactly (same family as
                AI Rescue's button), not the gold gradient this used to be. */}
            <button
              type="button"
              onClick={togglePlay}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-bold text-xs sm:text-sm tracking-wide uppercase bg-gradient-to-b from-white to-[#e7e2f5] text-[#28223f] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.04]"
            >
              {playing ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
              {playing ? 'Pause Reel' : 'Watch Playable Demo'} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2.5 justify-center">
          {SPECS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10.5px] font-semibold ${
                dark ? 'bg-black/30 backdrop-blur-md border border-white/10 text-white' : 'glass-pearl-soft text-pearl-ink'
              }`}
            >
              <Icon size={13} className="text-pearl-red" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Gold coins and a music note breaking the whole MODAL's left/right edges
 *  — rendered via ProjectModal's `breakout` slot, outside the scroll
 *  container's clipping. */
export function PeopleMotionBreakout() {
  return (
    <>
      <FloatingElement delay={0.2} distance={10} magnetic breathe className="absolute top-[14%] -left-9 sm:-left-14 z-30 hidden sm:block">
        <MusicNote size={44} color="#b8863b" />
      </FloatingElement>
      <FloatingElement delay={1.1} distance={8} magnetic breathe className="absolute top-[44%] -left-8 sm:-left-14 z-30 hidden sm:block">
        <GoldCoin size={52} />
      </FloatingElement>
      <FloatingElement delay={0.8} distance={9} magnetic breathe className="absolute top-[74%] -left-9 sm:-left-14 z-30 hidden sm:block">
        <HeartIcon size={46} color="#c23b3b" />
      </FloatingElement>
      <FloatingElement delay={0.6} distance={9} magnetic breathe className="absolute top-[10%] -right-9 sm:-right-14 z-30 hidden sm:block">
        <GoldCoin size={40} />
      </FloatingElement>
      <FloatingElement delay={1.5} distance={10} magnetic breathe className="absolute top-[50%] -right-8 sm:-right-14 z-30 hidden sm:block">
        <HeartIcon size={40} color="#c23b3b" />
      </FloatingElement>
      <FloatingElement delay={0.4} distance={8} magnetic breathe className="absolute top-[80%] -right-9 sm:-right-14 z-30 hidden sm:block">
        <GoldCoin size={48} />
      </FloatingElement>
    </>
  )
}
