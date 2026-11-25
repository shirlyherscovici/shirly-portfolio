/* Richer, project-specific interactions for the case studies:
 * a cinematic clip reel, a phone that tells the story while you scroll, a vault of real
 * objects, real-vs-film scenes, a playable quiz and an 80s grid floor. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion'
import { ease, type Img } from './blocks'

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
  const scale = useTransform(near, [0, 1], [0.84, 1])
  const bright = useTransform(near, [0, 1], ['brightness(0.45) saturate(0.6)', 'brightness(1) saturate(1)'])
  const cap = useTransform(near, [0.4, 1], [0, 1])
  return (
    <motion.figure className="cs-reel-card" style={{ scale }}>
      <motion.div className="cs-reel-media" style={{ filter: bright }}>
        <video ref={v} src={s.video} poster={s.poster} muted loop playsInline preload="none" aria-label={s.title} />
      </motion.div>
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
            <button type="button" className={`cs-reel-sound${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => setOn((v) => !v)}>
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
  const y = useTransform(p, [0, 1], [`${f.speed * 40}vh`, `${-f.speed * 40}vh`])
  const o = useTransform(p, [f.from - 0.08, f.from + 0.04], [0, 1])
  const r = useTransform(p, [0, 1], [f.rot - 6, f.rot + 6])
  return (
    <motion.img className="cs-phone-float" src={f.src} alt={f.alt} loading="lazy" style={{ left: f.x, top: f.y, width: f.w, y, opacity: o, rotate: r }} />
  )
}

export function PhoneStory({ steps, floats }: { steps: PhoneStep[]; floats: Floater[] }) {
  const box = useRef<HTMLDivElement>(null)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  const [at, setAt] = useState(0)
  useMotionValueEvent(p, 'change', (v) => setAt(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length * 0.999)))))
  const tilt = useTransform(p, [0, 0.5, 1], [-6, 0, 6])
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
      <div className="cs-rvf-list" role="tablist" aria-label="Scenes">
        {pairs.map((x, i) => (
          <button
            key={x.title}
            type="button"
            role="tab"
            aria-selected={i === at}
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
          <motion.div key={i} className="cs-tof-card" initial={{ opacity: 0, x: 60, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: -60, rotate: -2 }} transition={{ duration: 0.5, ease }}>
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

/* ======================================================================
 * Episodes (The Partner): one full-screen stage; as you scroll, each part
 * wipes in over the last one, its number slides past and a rail fills.
 * ==================================================================== */
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

function EpisodeLayer({ e, i, n, p, phone, setRef, onEnded }: { e: Episode; i: number; n: number; p: MotionValue<number>; phone: boolean; setRef: (el: HTMLVideoElement | null) => void; onEnded: () => void }) {
  const start = i / n
  // each layer opens as a widening band from the middle of the screen
  const open = useTransform(p, [start - 0.6 / n, start], [50, 0], { clamp: true })
  const clip = useTransform(open, (o) => (i === 0 ? 'inset(0% 0% 0% 0%)' : `inset(${o}% 0% ${o}% 0%)`))
  const scale = useTransform(p, [start - 0.6 / n, start + 1 / n], [1.2, 1])
  const textY = useTransform(p, [start - 0.3 / n, start + 0.2 / n, start + 0.85 / n], [80, 0, -40])
  const textO = useTransform(p, [start - 0.3 / n, start + 0.15 / n, start + 0.8 / n, start + 1 / n], i === n - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0])
  const tall = phone && !!e.srcMobile
  return (
    <motion.div className={`cs-ep-layer${phone ? ' is-phone' : ''}`} style={{ clipPath: clip, zIndex: i + 1 }}>
      <motion.video
        ref={setRef}
        src={tall ? e.srcMobile : e.src}
        poster={tall ? e.posterMobile : e.poster}
        muted
        playsInline
        preload={i === 0 ? 'metadata' : 'none'}
        aria-label={`The Partner, part ${e.num}`}
        onEnded={onEnded}
        style={{ scale: phone ? 1 : scale }}
      />
      <motion.div className="cs-ep-text" style={{ y: textY, opacity: textO }}>
        <span className="cs-ep-num" aria-hidden="true">{e.num}</span>
        <p className="cs-label">Part {e.num}</p>
        <p className="cs-ep-title">{e.title}</p>
      </motion.div>
    </motion.div>
  )
}

/* Episodes: the four parts in order, full screen. The part on screen plays
 * (with sound once the visitor turns it on); when it ends, the page moves on
 * to the next part. */
export function EpisodeScroll({ episodes }: { episodes: Episode[] }) {
  const n = episodes.length
  const box = useRef<HTMLDivElement>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const phone = usePhone()
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  const [at, setAt] = useState(0)
  useMotionValueEvent(p, 'change', (v) => setAt(Math.min(n - 1, Math.floor(v * n * 0.999))))
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [sound, setSound] = useState(false)
  const [t, setT] = useState(0)

  // on screen = the section covers the middle of the viewport, read from the scroll itself
  const { scrollYProgress: seen } = useScroll({ target: box, offset: ['start center', 'end center'] })
  useMotionValueEvent(seen, 'change', (v) => setInView(v > 0 && v < 1))
  useEffect(() => {
    const v = seen.get()
    setInView(v > 0 && v < 1)
  }, [seen])

  // only the part on screen plays; the others wait where they stopped
  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return
      v.muted = !sound
      if (i === at && inView && playing) {
        if (v.preload === 'none') v.preload = 'auto'
        v.play().catch(() => {
          // sound needs a tap on some browsers: fall back to muted
          v.muted = true
          setSound(false)
          v.play().catch(() => setPlaying(false))
        })
      } else v.pause()
    })
  }, [at, inView, playing, sound, phone])

  // progress of the part on screen
  useEffect(() => {
    const v = vids.current[at]
    if (!v) return
    const on = () => setT(v.duration ? v.currentTime / v.duration : 0)
    v.addEventListener('timeupdate', on)
    on()
    return () => v.removeEventListener('timeupdate', on)
  }, [at, phone])

  const goTo = (i: number) => {
    const el = box.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const run = el.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + run * ((i + 0.5) / n), behavior: 'smooth' })
  }

  const ended = (i: number) => {
    if (i !== at) return
    if (i < n - 1) {
      const next = vids.current[i + 1]
      if (next) next.currentTime = 0
      goTo(i + 1)
    } else setPlaying(false)
  }

  const toggle = () => {
    const v = vids.current[at]
    if (!playing && v && v.ended) v.currentTime = 0
    setPlaying((x) => !x)
  }

  return (
    <section ref={box} className="cs-ep" style={{ height: `${n * 100 + 60}vh` }}>
      <div className="cs-ep-stage">
        {episodes.map((e, i) => (
          <EpisodeLayer key={e.src} e={e} i={i} n={n} p={p} phone={phone} setRef={(el) => (vids.current[i] = el)} onEnded={() => ended(i)} />
        ))}
        <ol className="cs-ep-rail" aria-label="Parts">
          {episodes.map((e, i) => (
            <li key={e.num} className={i === at ? 'on' : i < at ? 'done' : ''}>
              <button type="button" onClick={() => goTo(i)} aria-current={i === at ? 'step' : undefined} aria-label={`Part ${e.num}`}>
                <span>{e.num}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="cs-ep-controls">
          <button type="button" className="cs-ep-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
          </button>
          <button type="button" className={`cs-ep-btn cs-ep-sound${sound ? ' is-on' : ''}`} onClick={() => setSound((s) => !s)} aria-pressed={sound}>
            <span className="cs-reel-eq" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {sound ? 'Sound on' : 'Sound off'}
          </button>
          <span className="cs-ep-time" aria-hidden="true">
            <span style={{ width: `${t * 100}%` }} />
          </span>
        </div>
      </div>
    </section>
  )
}

/* ======================================================================
 * Format morph: the wide cut narrows into the vertical cut as you scroll,
 * the same moment in both, so the reframing is visible.
 * ==================================================================== */
export function FormatMorph({ wide, tall, poster, tallPoster }: { wide: string; tall: string; poster: string; tallPoster: string }) {
  const box = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLVideoElement>(null)
  const b = useRef<HTMLVideoElement>(null)
  useInViewPlay(a)
  useInViewPlay(b)
  const { scrollYProgress: p } = useScroll({ target: box, offset: ['start start', 'end end'] })
  const [vw, setVw] = useState(() => window.innerWidth)
  const [vh, setVh] = useState(() => window.innerHeight)
  useEffect(() => {
    const r = () => (setVw(window.innerWidth), setVh(window.innerHeight))
    window.addEventListener('resize', r)
    return () => window.removeEventListener('resize', r)
  }, [])
  const h = Math.min(vh * 0.74, ((vw * 0.9) * 9) / 16)
  const width = useTransform(p, [0.15, 0.75], [(h * 16) / 9, (h * 9) / 16])
  const radius = useTransform(p, [0.15, 0.75], [6, 28])
  const tallO = useTransform(p, [0.45, 0.65], [0, 1])
  const wideLabel = useTransform(p, [0.3, 0.45], [1, 0])
  const tallLabel = useTransform(p, [0.55, 0.7], [0, 1])
  return (
    <section ref={box} className="cs-morph" style={{ height: '260vh' }}>
      <div className="cs-morph-stage">
        <motion.div className="cs-morph-frame" style={{ width, height: h, borderRadius: radius }}>
          <video ref={a} src={wide} poster={poster} muted loop playsInline preload="none" aria-label="Wide 16:9 cut" />
          <motion.video ref={b} src={tall} poster={tallPoster} muted loop playsInline preload="none" aria-label="Vertical 9:16 cut" style={{ opacity: tallO }} />
        </motion.div>
        <div className="cs-morph-labels">
          <motion.p className="cs-label" style={{ opacity: wideLabel }}>16:9 · web and TV</motion.p>
          <motion.p className="cs-label" style={{ opacity: tallLabel }}>9:16 · social and mobile</motion.p>
        </div>
      </div>
    </section>
  )
}

/* ======================================================================
 * Episode player: every part in full, with sound, one at a time
 * ==================================================================== */
export type Part = { src: string; poster: string; srcMobile?: string; posterMobile?: string; num: string; title: string; length: string }

export function EpisodePlayer({ parts, children }: { parts: Part[]; children: (p: Part, phone: boolean) => ReactNode }) {
  const [at, setAt] = useState(0)
  const phone = usePhone()
  return (
    <div className="cs-player">
      <div className="cs-wrap-wide">
        <div className="cs-player-tabs" role="tablist" aria-label="Parts">
          {parts.map((p, i) => (
            <button key={p.src} type="button" role="tab" aria-selected={i === at} className={i === at ? 'on' : ''} onClick={() => setAt(i)}>
              <img src={p.poster} alt="" loading="lazy" />
              <span className="cs-step">{p.num}</span>
              <span className="cs-player-title">{p.title}</span>
              <span className="cs-player-len">{p.length}</span>
            </button>
          ))}
        </div>
      </div>
      <div key={parts[at].src + phone}>{children(parts[at], phone)}</div>
    </div>
  )
}
