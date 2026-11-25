/* Richer, project-specific interactions for the case studies:
 * a cinematic clip reel, a phone that tells the story while you scroll, a vault of real
 * objects, real-vs-film scenes, a playable quiz and an 80s grid floor. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion'
import { ease, useLightbox, type Img } from './blocks'

/* Play a muted clip only while it is on screen */
function useInViewPlay(ref: React.RefObject<HTMLVideoElement>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (el.preload === 'none') el.preload = 'auto'
        el.play().catch(() => {})
      } else el.pause()
    }, { rootMargin: '0px 200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}

/* ======================================================================
 * Clip reel: a dark, letterboxed row of scenes that slides sideways as you
 * scroll down. The scene in the middle grows and lights up, like a streaming row.
 * ==================================================================== */
export type Scene = { video: string; poster: string; title: string; note?: string }

function ReelCard({ s, i, n, p }: { s: Scene; i: number; n: number; p: MotionValue<number> }) {
  const v = useRef<HTMLVideoElement>(null)
  useInViewPlay(v)
  const at = n > 1 ? i / (n - 1) : 0
  const near = useTransform(p, (x) => Math.max(0, 1 - Math.abs(x - at) * (n - 1)))
  const reduce = useReducedMotion()
  const scale = useTransform(near, [0, 1], [0.84, 1])
  // dim the cards off-centre with an overlay (opacity is cheap; a filter on video is not)
  const shade = useTransform(near, [0, 1], [0.55, 0])
  const cap = useTransform(near, [0.4, 1], [0, 1])
  return (
    <motion.figure className="cs-reel-card" style={reduce ? undefined : { scale }}>
      <div className="cs-reel-media">
        <video ref={v} src={s.video} poster={s.poster} muted loop playsInline preload="none" aria-label={s.title} />
        <motion.span className="cs-reel-shade" style={{ opacity: shade }} aria-hidden="true" />
      </div>
      <motion.figcaption style={{ opacity: cap }}>
        <span className="cs-label">Scene {String(i + 1).padStart(2, '0')}</span>
        <strong>{s.title}</strong>
        {s.note && <span className="cs-reel-note">{s.note}</span>}
      </motion.figcaption>
    </motion.figure>
  )
}

export function ClipReel({ scenes, title, sound }: { scenes: Scene[]; title?: string; sound?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)

  /* Sound: the clips are silent, so the button plays the film's own soundtrack
   * under the reel, and only while the reel is on screen */
  const audio = useRef<HTMLVideoElement>(null)
  const [on, setOn] = useState(false)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '-45% 0px -45% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    const a = audio.current
    if (!a) return
    if (on && inView) {
      a.volume = 0.8
      a.play().catch(() => setOn(false))
    } else a.pause()
  }, [on, inView])
  useLayoutEffect(() => {
    const m = () => setDist(Math.max(0, (track.current?.scrollWidth ?? 0) - window.innerWidth))
    m()
    const ro = new ResizeObserver(m)
    if (track.current) ro.observe(track.current)
    window.addEventListener('resize', m)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', m)
    }
  }, [])
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  const x = useTransform(p, (v) => -v * dist)
  const bar = useTransform(p, (v) => `${v * 100}%`)
  return (
    <section ref={box} className="cs-reel" style={{ height: `${Math.round((scenes.length * 0.5 + 1) * 100)}vh` }}>
      <div className="cs-reel-stage">
        {title && <p className="cs-label cs-reel-title">{title}</p>}
        {sound && (
          <>
            <video ref={audio} src={sound} preload="none" loop playsInline aria-hidden="true" tabIndex={-1} className="cs-reel-audio" />
            <button type="button" className={`cs-reel-sound${on ? ' is-on' : ''}`} onClick={() => setOn((v) => !v)}>
              <span className="cs-reel-eq" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              {on ? 'Sound on' : 'Sound off'}
            </button>
          </>
        )}
        <motion.div ref={track} className="cs-reel-track" style={{ x }}>
          {scenes.map((s, i) => (
            <ReelCard key={s.video} s={s} i={i} n={scenes.length} p={p} />
          ))}
        </motion.div>
        <div className="cs-reel-bar" aria-hidden="true">
          <motion.span style={{ width: bar }} />
        </div>
      </div>
    </section>
  )
}

/* ======================================================================
 * Phone story: the phone stays in the middle while the screens change with
 * the scroll; the campaign posts drift in around it at their own speeds.
 * ==================================================================== */
export type PhoneStep = { screen: string; alt: string; label: string; text: string }
export type Floater = { src: string; alt: string; x: string; y: string; w: string; rot: number; speed: number; from: number }

function Float({ f, p }: { f: Floater; p: MotionValue<number> }) {
  const reduce = useReducedMotion()
  const y = useTransform(p, [0, 1], [`${f.speed * 40}vh`, `${-f.speed * 40}vh`])
  const o = useTransform(p, [f.from - 0.08, f.from + 0.04], [0, 1])
  const r = useTransform(p, [0, 1], [f.rot - 6, f.rot + 6])
  return (
    <motion.img className="cs-phone-float" src={f.src} alt={f.alt} loading="lazy" style={reduce ? { left: f.x, top: f.y, width: f.w, opacity: o, rotate: f.rot } : { left: f.x, top: f.y, width: f.w, y, opacity: o, rotate: r }} />
  )
}

export function PhoneStory({ steps, floats }: { steps: PhoneStep[]; floats: Floater[] }) {
  const box = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  const [at, setAt] = useState(0)
  useMotionValueEvent(p, 'change', (v) => setAt(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length * 0.999)))))
  const reduce = useReducedMotion()
  const tilt = useTransform(p, [0, 0.5, 1], reduce ? [0, 0, 0] : [-6, 0, 6])
  return (
    <section ref={box} className="cs-phone-story" style={{ height: `${steps.length * 90 + 40}vh` }}>
      <div className="cs-phone-stage">
        {floats.map((f) => (
          <Float key={f.src} f={f} p={p} />
        ))}
        <motion.div className="cs-phone" style={{ rotate: tilt }}>
          <AnimatePresence initial={false}>
            <motion.img
              key={steps[at].screen}
              src={steps[at].screen}
              alt={steps[at].alt}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.97 }}
              transition={{ duration: 0.6, ease }}
            />
          </AnimatePresence>
        </motion.div>
        <ol className="cs-phone-steps">
          {steps.map((s, i) => (
            <li key={s.label} className={i === at ? 'on' : ''}>
              <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>
              <span className="cs-label">{s.label}</span>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ======================================================================
 * Real vs film: pick a scene, flip between the real photo and the frame
 * from the film.
 * ==================================================================== */
export type Pair = { title: string; real: Img; film: Img; note: string }

export function RealVsFilm({ pairs }: { pairs: Pair[] }) {
  const [at, setAt] = useState(0)
  const [film, setFilm] = useState(false)
  const s = pairs[at]
  return (
    <div className="cs-wrap-wide cs-rvf">
      <div className="cs-rvf-stage">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={(film ? s.film.src : s.real.src) + at}
            src={film ? s.film.src : s.real.src}
            alt={film ? s.film.alt : s.real.alt}
            className={film ? 'is-film' : 'is-real'}
            initial={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease }}
          />
        </AnimatePresence>
        <div className="cs-rvf-switch" role="group" aria-label="Show">
          <button type="button" aria-pressed={!film} onClick={() => setFilm(false)}>
            Real photo
          </button>
          <button type="button" aria-pressed={film} onClick={() => setFilm(true)}>
            In the film
          </button>
          <motion.span className="cs-rvf-knob" animate={{ x: film ? '100%' : '0%' }} transition={{ duration: 0.45, ease }} aria-hidden="true" />
        </div>
      </div>
      <div className="cs-rvf-list" role="group" aria-label="Scenes">
        {pairs.map((x, i) => (
          <button
            key={x.title}
            type="button"
            aria-current={i === at ? 'true' : undefined}
            className={i === at ? 'on' : ''}
            onClick={() => {
              setAt(i)
              setFilm(false)
            }}
          >
            <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>
            <span className="cs-rvf-title">{x.title}</span>
            <span className="cs-rvf-note">{x.note}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ======================================================================
 * Vault: the real pieces, each in its own lit case. Open one to see it large
 * and step through the rest.
 * ==================================================================== */
export type Piece = { src: string; name: string; detail: string }

export function Vault({ pieces }: { pieces: Piece[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open === null) return
    const back = document.activeElement as HTMLElement | null
    close.current?.focus()
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((o) => (o === null ? o : (o + 1) % pieces.length))
      if (e.key === 'ArrowLeft') setOpen((o) => (o === null ? o : (o - 1 + pieces.length) % pieces.length))
    }
    window.addEventListener('keydown', k)
    return () => {
      window.removeEventListener('keydown', k)
      html.style.overflow = prev
      back?.focus?.()
    }
  }, [open, pieces.length])
  const cur = open === null ? null : pieces[open]
  return (
    <div className="cs-wrap-wide">
      <div className="cs-vault">
        {pieces.map((p, i) => (
          <motion.button
            key={p.src}
            type="button"
            className="cs-vault-case"
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.8, ease, delay: (i % 4) * 0.07 }}
          >
            <span className="cs-vault-light" aria-hidden="true" />
            <img src={p.src} alt="" loading="lazy" />
            <span className="cs-vault-name">{p.name}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {cur && (
          <motion.div className="cs-vault-open" role="dialog" aria-modal="true" aria-label={cur.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.figure key={cur.src} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} onClick={(e) => e.stopPropagation()}>
              <img src={cur.src} alt={cur.name} />
              <figcaption>
                <span className="cs-label">
                  {String((open ?? 0) + 1).padStart(2, '0')} / {String(pieces.length).padStart(2, '0')}
                </span>
                <strong>{cur.name}</strong>
                <span>{cur.detail}</span>
              </figcaption>
            </motion.figure>
            <button type="button" className="cs-vault-nav is-prev" aria-label="Previous piece" onClick={(e) => (e.stopPropagation(), setOpen(((open ?? 0) - 1 + pieces.length) % pieces.length))}>
              ←
            </button>
            <button type="button" className="cs-vault-nav is-next" aria-label="Next piece" onClick={(e) => (e.stopPropagation(), setOpen(((open ?? 0) + 1) % pieces.length))}>
              →
            </button>
            <button ref={close} type="button" className="cs-lightbox-close" aria-label="Close">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ======================================================================
 * Truth or fake: the quiz's own game, played with its illustrations.
 * ==================================================================== */
export type Question = { img: string; alt: string; claim: string; truth: boolean; why: string }

export function TruthOrFake({ questions, playUrl }: { questions: Question[]; playUrl: string }) {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const done = i >= questions.length
  const q = questions[Math.min(i, questions.length - 1)]
  const answer = (v: boolean) => {
    if (pick !== null) return
    setPick(v)
    if (v === q.truth) setScore((s) => s + 1)
  }
  const next = () => {
    setPick(null)
    setI((x) => x + 1)
  }
  const again = () => {
    setI(0)
    setScore(0)
    setPick(null)
  }
  return (
    <div className="cs-wrap-wide cs-tof">
      <AnimatePresence mode="wait">
        {!done ? (
          <motion.div key={i} className="cs-tof-card" initial={{ opacity: 0, y: 24, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -16, rotate: -2 }} transition={{ duration: 0.5, ease }}>
            <div className="cs-tof-stamp">
              <img src={q.img} alt={q.alt} />
              <AnimatePresence>
                {pick !== null && (
                  <motion.span
                    className={`cs-tof-mark ${q.truth ? 'is-true' : 'is-fake'}`}
                    initial={{ opacity: 0, scale: 1.8, rotate: -24 }}
                    animate={{ opacity: 1, scale: 1, rotate: -12 }}
                    transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    {q.truth ? 'It happened' : 'Never happened'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="cs-tof-side">
              <p className="cs-label">
                Question {i + 1} / {questions.length} · Score {score}
              </p>
              <p className="cs-tof-claim">{q.claim}</p>
              {pick === null ? (
                <div className="cs-tof-btns">
                  <button type="button" onClick={() => answer(true)}>
                    It happened
                  </button>
                  <button type="button" onClick={() => answer(false)}>
                    Never happened
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
                  <p className={`cs-tof-verdict ${pick === q.truth ? 'is-right' : 'is-wrong'}`}>{pick === q.truth ? 'Right.' : 'Not quite.'}</p>
                  <p className="cs-tof-why">{q.why}</p>
                  <button type="button" className="cs-tof-next" onClick={next}>
                    {i + 1 < questions.length ? 'Next question →' : 'See my score →'}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="done" className="cs-tof-done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease }}>
            <p className="cs-label">Your score</p>
            <p className="cs-tof-score">
              {score} / {questions.length}
            </p>
            <div className="cs-tof-btns">
              <a href={playUrl} target="_blank" rel="noopener noreferrer">
                Play the full quiz on N12 ↗
              </a>
              <button type="button" onClick={again}>
                Play again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ======================================================================
 * 80s grid floor: a neon perspective grid that runs towards you as you scroll.
 * ==================================================================== */
export function RetroGrid({ children }: { children?: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start end', 'end start'] })
  const pos = useTransform(p, (v) => `0px ${v * 640}px`)
  const sun = useTransform(p, [0, 1], ['18%', '-12%'])
  return (
    <div ref={box} className="cs-retro" aria-hidden={children ? undefined : true}>
      <motion.span className="cs-retro-sun" style={{ y: sun }} />
      <div className="cs-retro-floor">
        <motion.span style={{ backgroundPosition: pos }} />
      </div>
      {children && <div className="cs-retro-inner">{children}</div>}
    </div>
  )
}

export type Episode = { src: string; poster: string; srcMobile?: string; posterMobile?: string; num: string; title: string }

/* Phones get the vertical cut where one exists */
function usePhone() {
  const q = '(max-width: 760px)'
  const [phone, setPhone] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setPhone(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return phone
}

/* ======================================================================
 * Series stage (The Partner): a series is watched, not scrolled. The parts
 * play one after another in a full-frame player with episode buttons; scrolling
 * on shrinks that same frame into the vertical cut made for phones.
 * ==================================================================== */
export function SeriesStage({ parts }: { parts: Episode[] }) {
  const n = parts.length
  const box = useRef<HTMLDivElement>(null)
  const wide = useRef<HTMLVideoElement>(null)
  const tall = useRef<HTMLVideoElement>(null)
  const phone = usePhone()
  const [at, setAt] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [sound, setSound] = useState(false)
  const [inView, setInView] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [t, setT] = useState(0)
  const part = parts[at]
  const hasTall = !!part.srcMobile

  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const r = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])

  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  const { scrollYProgress: seen } = useScroll({ target: box, offset: ['start center', 'end center'] })
  useMotionValueEvent(seen, 'change', (v) => setInView(v > 0 && v < 1))
  useEffect(() => {
    const v = seen.get()
    setInView(v > 0 && v < 1)
  }, [seen])
  const [warm, setWarm] = useState(false)
  useMotionValueEvent(p, 'change', (v) => {
    setNarrow(!phone && v > 0.55)
    setWarm(!phone && v > 0.4)
  })

  // full frame → the phone frame
  // the frame keeps its size and is clipped down (paint only, no layout per frame)
  const ph = Math.min(vp.h * 0.8, 760)
  const pw = (ph * 9) / 16
  const g = useTransform(p, [0.18, 0.75], [0, 1])
  const clip = useTransform(g, (v) => {
    const ty = ((vp.h - ph) / 2) * v
    const tx = ((vp.w - pw) / 2) * v
    return `inset(${ty}px ${tx}px ${ty}px ${tx}px round ${30 * v}px)`
  })
  // a part with no vertical cut shrinks whole into the phone, letterboxed
  const wideScale = useTransform(g, (v) => (hasTall ? 1 : 1 + (pw / vp.w - 1) * v))
  const tallO = useTransform(p, [0.5, 0.62], [0, 1])
  const fullUi = useTransform(p, [0.12, 0.3], [1, 0])
  const morphUi = useTransform(p, [0.3, 0.45], [0, 1])
  const wideLabel = useTransform(p, [0.3, 0.42, 0.5, 0.58], [0, 1, 1, 0])
  const tallLabel = useTransform(p, [0.6, 0.7], [0, 1])

  // which element carries the picture and the sound right now
  const useTall = phone ? hasTall : narrow && hasTall
  const active = () => (useTall ? tall.current : wide.current)

  useEffect(() => {
    const a = active()
    const other = useTall ? wide.current : tall.current
    if (other && a && !other.paused) {
      // hand over at the same moment of the story
      if (Math.abs(other.currentTime - a.currentTime) > 0.3) a.currentTime = other.currentTime
    }
    if (other) {
      other.muted = true
      if (!phone && hasTall && warm) {
        // near the hand-over, start the hidden cut silently at the same moment
        if (inView && playing) {
          if (other.paused && a && Math.abs(other.currentTime - a.currentTime) > 0.3) other.currentTime = a.currentTime
          other.play().catch(() => {})
        } else other.pause()
      } else other.pause()
    }
    if (!a) return
    a.muted = !sound
    if (inView && playing) {
      a.play().catch(() => {
        a.muted = true
        setSound(false)
        a.play().catch(() => setPlaying(false))
      })
    } else a.pause()
  }, [useTall, inView, playing, sound, at, phone, warm]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const a = active()
    if (!a) return
    const on = () => setT(a.duration ? a.currentTime / a.duration : 0)
    a.addEventListener('timeupdate', on)
    return () => a.removeEventListener('timeupdate', on)
  }, [useTall, at]) // eslint-disable-line react-hooks/exhaustive-deps

  const [titleOn, setTitleOn] = useState(true)
  useEffect(() => {
    setTitleOn(true)
    const t = window.setTimeout(() => setTitleOn(false), 2600)
    return () => window.clearTimeout(t)
  }, [at])
  const go = (i: number) => {
    setT(0)
    setAt(i)
    setPlaying(true)
  }
  const ended = (fromTall: boolean) => {
    if (fromTall !== useTall) return
    if (at < n - 1) go(at + 1)
    else setPlaying(false)
  }
  const toggle = () => {
    const a = active()
    if (!playing && a && a.ended) a.currentTime = 0
    setPlaying((x) => !x)
  }

  const controls = (
    <div className="cs-series-controls">
      <div className="cs-series-eps" role="group" aria-label="Parts">
        {parts.map((e, i) => (
          <button key={e.src} type="button" aria-current={i === at ? 'true' : undefined} aria-label={`Part ${e.num}, ${e.title}`} className={i === at ? 'on' : i < at ? 'done' : ''} onClick={() => go(i)}>
            <span className="cs-series-ep-num">{e.num}</span>
            <span className="cs-series-ep-len">{e.title}</span>
            <span className="cs-series-ep-bar" aria-hidden="true">
              <span style={{ width: i === at ? `${t * 100}%` : i < at ? '100%' : '0%' }} />
            </span>
          </button>
        ))}
      </div>
      <div className="cs-series-btns">
        <button type="button" className="cs-ep-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
        </button>
        <button type="button" className={`cs-ep-btn cs-ep-sound${sound ? ' is-on' : ''}`} onClick={() => setSound((s) => !s)}>
          <span className="cs-reel-eq" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {sound ? 'Sound on' : 'Sound off'}
        </button>
      </div>
    </div>
  )

  return (
    <section ref={box} className={`cs-series${phone ? ' is-phone' : ''}`} style={{ height: phone ? '100svh' : '280vh' }}>
      <div className="cs-series-stage">
        <motion.div className="cs-series-frame" style={phone ? undefined : { clipPath: clip }}>
          <motion.video
            key={part.src}
            ref={wide}
            src={part.src}
            poster={part.poster}
            muted
            playsInline
            preload={phone && hasTall ? 'none' : 'metadata'}
            aria-label={`The Partner, part ${part.num}`}
            onEnded={() => ended(false)}
            className={phone && !hasTall ? 'is-contained' : ''}
            style={phone ? undefined : { scale: wideScale }}
          />
          {hasTall && (
            <motion.video
              key={part.srcMobile}
              ref={tall}
              src={part.srcMobile}
              poster={part.posterMobile}
              muted
              playsInline
              preload={phone ? 'metadata' : 'none'}
              aria-label={`The Partner, part ${part.num}, vertical cut`}
              onEnded={() => ended(true)}
              style={phone ? { opacity: 1 } : { opacity: tallO, left: '50%', top: '50%', width: pw, height: ph, x: '-50%', y: '-50%' }}
            />
          )}
          <motion.div className={`cs-series-title${titleOn ? '' : ' is-gone'}`} style={phone ? undefined : { opacity: fullUi }}>
            <span className="cs-ep-num" aria-hidden="true">{part.num}</span>
            <p className="cs-label">Part {part.num} of {String(n).padStart(2, '0')}</p>
          </motion.div>
        </motion.div>
        {!phone && (
          <motion.div className="cs-series-labels" style={{ opacity: morphUi, position: 'absolute', left: 0, right: 0, top: `calc(50% + ${ph / 2 + 14}px)`, marginTop: 0 }}>
            <motion.p className="cs-label" style={{ opacity: wideLabel }}>16:9 · web and TV</motion.p>
            <motion.p className="cs-label" style={{ opacity: tallLabel }}>{hasTall ? '9:16 · the vertical cut for the feed' : 'This part was cut for web only'}</motion.p>
          </motion.div>
        )}
        {controls}
      </div>
    </section>
  )
}


/* ======================================================================
 * 80s: a CRT that changes channel as you scroll through the room.
 * Each shot is a channel; a burst of static sits between them.
 * ==================================================================== */
export type Channel = Img & { name: string }

export function ChannelSurf({ channels }: { channels: Channel[] }) {
  const n = channels.length
  const box = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState(0)
  const [flip, setFlip] = useState(0)
  const last = useRef(0)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  useMotionValueEvent(p, 'change', (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n)))
    if (i === last.current) return
    last.current = i
    setAt(i)
    setFlip((f) => f + 1)
  })
  const tune = (i: number) => {
    const el = box.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const run = el.offsetHeight - window.innerHeight
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: top + run * ((i + 0.5) / n), behavior: calm ? 'auto' : 'smooth' })
  }
  const ch = channels[at]
  return (
    <section ref={box} className="cs-tv" style={{ height: `${n * 45 + 100}vh` }}>
      <div className="cs-tv-stage">
        <div className="cs-tv-set">
          <div className="cs-tv-screen">
            {channels.map((c, i) => (
              <img key={c.src} src={c.src} alt={i === at ? c.alt : ''} aria-hidden={i === at ? undefined : true} loading="lazy" className={i === at ? 'on' : ''} />
            ))}
            <span key={flip} className="cs-tv-static" aria-hidden="true" />
            <span className="cs-tv-scan" aria-hidden="true" />
            <p className="cs-tv-osd" aria-live="polite">
              CH {String(at + 1).padStart(2, '0')}
              <span>{ch.name}</span>
            </p>
          </div>
          <div className="cs-tv-dial" role="group" aria-label="Channels">
            {channels.map((c, i) => (
              <button key={c.src} type="button" className={i === at ? 'on' : ''} onClick={() => tune(i)} aria-label={`Channel ${i + 1}: ${c.name}`}>
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
        <p className="cs-tv-hint" aria-hidden="true">Scroll to change channel</p>
      </div>
    </section>
  )
}

/* 80s: neon words that switch on one by one as the page scrolls past */
export function NeonMarquee({ words }: { words: string[] }) {
  const box = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [lit, setLit] = useState(reduce ? words.length : 0)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start 0.9', 'center 0.45'] })
  useMotionValueEvent(p, 'change', (v) => {
    if (!reduce) setLit(Math.round(Math.min(1, Math.max(0, v)) * words.length))
  })
  return (
    <div ref={box} className="cs-neon" role="img" aria-label={words.join(', ')}>
      {words.map((w, i) => (
        <span key={w} className={`cs-neon-word${i < lit ? ' on' : ''}${i % 2 ? ' is-alt' : ''}`} aria-hidden="true">
          {w}
        </span>
      ))}
    </div>
  )
}

/* ======================================================================
 * 80s research: the wall. The material gathered for the room flies in and
 * pins itself up as you scroll, like the posters over a teenage bed. Click any
 * piece to see it whole.
 * ==================================================================== */
/* ======================================================================
 * Moving rows of pictures: two rows that slide sideways in opposite
 * directions as you scroll. Click any picture to see it whole.
 * ==================================================================== */
function DriftRow({ items, dir, p, open }: { items: Img[]; dir: 1 | -1; p: MotionValue<number>; open: (m: Img) => void }) {
  const x = useTransform(p, [0, 1], dir === 1 ? ['-4%', '-18%'] : ['-18%', '-4%'])
  // the row repeats, so it never runs out while it slides
  const loop = [...items, ...items, ...items]
  return (
    <motion.div className="cs-drift-row" style={{ x }}>
      {loop.map((m, i) => {
        const copy = i >= items.length
        return (
          <button
            key={i}
            type="button"
            className="cs-drift-item"
            style={{ aspectRatio: m.ratio }}
            onClick={() => open(m)}
            aria-label={`Enlarge: ${m.alt}`}
            aria-hidden={copy || undefined}
            tabIndex={copy ? -1 : undefined}
          >
            <img src={m.src} alt="" loading="lazy" draggable={false} />
          </button>
        )
      })}
    </motion.div>
  )
}

export function DriftRows({ items }: { items: Img[] }) {
  const box = useRef<HTMLDivElement>(null)
  const open = useLightbox()
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start end', 'end start'] })
  const half = Math.ceil(items.length / 2)
  return (
    <div ref={box} className="cs-drift">
      <DriftRow items={items.slice(0, half)} dir={1} p={p} open={open} />
      <DriftRow items={items.slice(half)} dir={-1} p={p} open={open} />
    </div>
  )
}

/* A palette, each colour as a little stamp */
export function StampPalette({ colors }: { colors: { hex: string; name: string }[] }) {
  return (
    <div className="cs-anat-palette">
      {colors.map((c) => (
        <figure key={c.hex}>
          <span style={{ background: c.hex }} />
          <figcaption>
            <strong>{c.name}</strong> {c.hex}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

/* ======================================================================
 * Music from the Screen: the neon key art switches on, one tube at a time,
 * as you scroll. The picture is the real key art; each tube is the same
 * picture clipped to one object, lit on top of a dimmed copy.
 * ==================================================================== */
export type Tube = [number, number, number, number] // x0, y0, x1, y1 in %

export function NeonSign({ src, alt, tubes }: { src: string; alt: string; tubes: Tube[] }) {
  const box = useRef<HTMLDivElement>(null)
  const n = tubes.length
  const [on, setOn] = useState(0)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  useMotionValueEvent(p, 'change', (v) => setOn(Math.floor(Math.min(1, Math.max(0, (v - 0.06) / 0.78)) * (n + 0.999))))
  const all = on > n - 1
  return (
    <section ref={box} className="cs-sign" style={{ height: '240vh' }}>
      <div className="cs-sign-stage">
        <div className={`cs-sign-board${all ? ' is-lit' : ''}`}>
          <img className="cs-sign-base" src={src} alt={alt} />
          {tubes.map(([x0, y0, x1, y1], i) => (
            <img
              key={i}
              className={`cs-sign-tube${i < on ? ' on' : ''}`}
              src={src}
              alt=""
              aria-hidden="true"
              style={{ clipPath: `inset(${y0}% ${100 - x1}% ${100 - y1}% ${x0}%)`, ['--d' as string]: `${(i % 3) * 0.07}s` }}
            />
          ))}
        </div>
        <p className="cs-label cs-sign-count" aria-hidden="true">
          {all ? 'The sign is on' : `${String(Math.min(on, n)).padStart(2, '0')} / ${String(n).padStart(2, '0')} lit`}
        </p>
      </div>
    </section>
  )
}

/* ======================================================================
 * Music from the Screen: a playable copy of the voting flow. Tap a song and
 * it climbs one place; reaching the top sets off a little burst.
 * ==================================================================== */
export type Song = { film: string; song: string; artist: string }

export function VoteChart({ songs, art }: { songs: Song[]; art: string }) {
  const [order, setOrder] = useState(() => songs.map((_, i) => i))
  const [burst, setBurst] = useState(0)
  const [last, setLast] = useState<number | null>(null)
  const vote = (id: number) => {
    const k = order.indexOf(id)
    setLast(id)
    if (k <= 0) {
      setBurst((b) => b + 1)
      return
    }
    const next = [...order]
    ;[next[k - 1], next[k]] = [next[k], next[k - 1]]
    setOrder(next)
    if (k === 1) setBurst((b) => b + 1)
  }
  return (
    <div className="cs-wrap cs-vote">
      <div className="cs-vote-phone">
        <span className="cs-vote-logo" style={{ backgroundImage: `url(${art})` }} aria-hidden="true" />
        <p className="cs-vote-title">Your chart</p>
        <ol className="cs-vote-list">
          {order.map((id, k) => {
            const s = songs[id]
            return (
              <motion.li key={id} layout transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
                <button type="button" className={last === id ? 'is-last' : ''} onClick={() => vote(id)} aria-label={`Vote for ${s.song}, now number ${k + 1}`}>
                  <span className="cs-vote-num">{k + 1}</span>
                  <span className="cs-vote-txt">
                    <strong>{s.film}</strong>
                    <span>{s.song}</span>
                    <small>{s.artist}</small>
                  </span>
                  <span className="cs-vote-up" aria-hidden="true">
                    ▲
                  </span>
                </button>
              </motion.li>
            )
          })}
        </ol>
        <AnimatePresence>
          {burst > 0 && (
            <motion.span key={burst} className="cs-vote-burst" aria-hidden="true" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.1, delay: 0.5 }}>
              {Array.from({ length: 14 }, (_, i) => (
                <motion.i
                  key={i}
                  initial={{ x: 0, y: 0, scale: 0.4 }}
                  animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 90, y: Math.sin((i / 14) * Math.PI * 2) * 60, scale: 1 }}
                  transition={{ duration: 0.8, ease }}
                />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className="cs-vote-hint" aria-live="polite">
        {last === null ? 'Tap a song to vote it up the chart.' : `${songs[order[0]].song} is number one.`}
      </p>
    </div>
  )
}

/* ======================================================================
 * Music from the Screen: the chart posts as a countdown. A big number rolls
 * down while each post lands on top of the last one.
 * ==================================================================== */
export function Countdown({ posts }: { posts: (Img & { rank: string })[] }) {
  const box = useRef<HTMLDivElement>(null)
  const open = useLightbox()
  const n = posts.length
  const [at, setAt] = useState(0)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  useMotionValueEvent(p, 'change', (v) => setAt(Math.min(n - 1, Math.max(0, Math.floor(v * n * 0.999)))))
  return (
    <section ref={box} className="cs-count" style={{ height: `${n * 70 + 40}vh` }}>
      <div className="cs-count-stage">
        <div className="cs-count-num" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={at} initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.6, ease }}>
              {posts[at].rank}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="cs-count-deck">
          {posts.map((m, i) => (
            <motion.button
              key={m.src}
              type="button"
              className="cs-count-card"
              onClick={() => open(m)}
              aria-label={`Enlarge: ${m.alt}`}
              initial={false}
              animate={
                i < at
                  ? { y: `${(i - at) * 4}%`, scale: 1 - (at - i) * 0.06, opacity: 0.55, rotate: (i % 2 ? 3 : -3) }
                  : i === at
                    ? { y: '0%', scale: 1, opacity: 1, rotate: 0 }
                    : { y: '115%', scale: 1, opacity: 1, rotate: i % 2 ? 6 : -6 }
              }
              transition={{ duration: 0.8, ease }}
              style={{ zIndex: i }}
              tabIndex={i === at ? 0 : -1}
            >
              <img src={m.src} alt="" loading="lazy" draggable={false} />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
