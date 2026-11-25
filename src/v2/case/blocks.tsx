/* Case-study building blocks. Everything renders inside `.cs` and is styled by case.css only. */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'

export const ease = [0.22, 1, 0.36, 1] as const
const elastic = { type: 'spring', stiffness: 260, damping: 18 } as const

/* ---------- Media types ---------- */
export type Img = { src: string; alt: string; caption?: string; label?: string; ratio?: string; contain?: boolean }
export type Clip = { video: string; poster: string; alt: string; caption?: string; label?: string; ratio?: string }
export type Item = Img | Clip
const isClip = (m: Item): m is Clip => 'video' in m

/* ---------- Lightbox ---------- */
const LightboxC = createContext<(m: Img | null) => void>(() => {})
/** Open any picture in the lightbox */
export const useLightbox = () => useContext(LightboxC)
export function LightboxProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Img | null>(null)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    // Focus the close button, and hand focus back to the picture that opened it
    const back = document.activeElement as HTMLElement | null
    close.current?.focus()
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      // the close button is the only control inside: keep Tab from leaving the dialog
      if (e.key === 'Tab') {
        e.preventDefault()
        close.current?.focus()
      }
    }
    // leaving the page closes it too
    const shut = () => setOpen(null)
    window.addEventListener('keydown', k)
    window.addEventListener('hashchange', shut)
    return () => {
      window.removeEventListener('keydown', k)
      window.removeEventListener('hashchange', shut)
      html.style.overflow = prev
      back?.focus?.()
    }
  }, [open])
  return (
    <LightboxC.Provider value={setOpen}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            className="cs-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={open.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.img src={open.src} alt={open.alt} initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.96 }} transition={{ duration: 0.5, ease }} />
            <button ref={close} type="button" className="cs-lightbox-close" aria-label="Close image">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxC.Provider>
  )
}

/* ---------- Reveal ---------- */
export function Reveal({ children, className = '', delay = 0, style }: { children: ReactNode; className?: string; delay?: number; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/* ---------- Act: a stretch of the page with its own colours (the page background follows it) ---------- */
export function Act({ bg, fg, accent, children, id }: { bg: string; fg: string; accent?: string; children: ReactNode; id?: string }) {
  return (
    <section className="cs-act" id={id} data-act="" data-bg={bg} data-fg={fg} style={{ ['--accent' as string]: accent ?? fg }}>
      {children}
    </section>
  )
}

/* ---------- Titles ---------- */
/** Words grow up from their baseline one after another (Spencer Gabor's title pop) */
export function PopWords({ text, as = 'h2', className = '' }: { text: string; as?: 'h2' | 'h3' | 'p'; className?: string }) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag className={className} initial="off" whileInView="on" viewport={{ once: true, margin: '0px 0px -10% 0px' }} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          className="cs-word"
          aria-hidden="true"
          variants={
            reduce
              ? { off: { opacity: 0 }, on: { opacity: 1, transition: { duration: 0.5, delay: i * 0.05 } } }
              : { off: { scaleY: 0, y: '0.25ch' }, on: { scaleY: 1, y: 0, transition: { ...elastic, delay: i * 0.08 } } }
          }
        >
          {w}
          {' '}
        </motion.span>
      ))}
    </Tag>
  )
}

export function Chapter({ num, title, note, children }: { num: string; title: string; note?: string; children?: ReactNode }) {
  return (
    <div className="cs-wrap cs-chapter">
      <Reveal className="cs-chapter-num">
        <span className="cs-label">{num}</span>
      </Reveal>
      <PopWords text={title} className="cs-chapter-title" />
      {note && (
        <Reveal className="cs-chapter-note" delay={0.1}>
          <p>{note}</p>
        </Reveal>
      )}
      {children}
    </div>
  )
}

/* ---------- Media ---------- */
function ClipView({ m, eager = false }: { m: Clip; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 })
    io.observe(v)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} src={m.video} poster={m.poster} muted loop playsInline preload={eager ? 'auto' : 'none'} aria-label={m.alt} />
}

/** One image or silent clip, with a centred caption underneath. Images open in the lightbox. */
export function Visual({
  m,
  bleed = false,
  parallax = false,
  frame = false,
  className = '',
}: {
  m: Item
  bleed?: boolean
  parallax?: boolean
  frame?: boolean
  className?: string
}) {
  const open = useContext(LightboxC)
  const box = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: box, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], parallax && !reduce ? ['-8%', '8%'] : ['0%', '0%'])
  const style = { aspectRatio: m.ratio ?? '16 / 9' }
  return (
    <motion.figure
      className={`cs-visual ${bleed ? 'is-bleed' : ''} ${frame ? 'is-frame' : ''} ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, ease }}
    >
      {/* One entrance for every picture on the site: the frame opens from the middle while the picture settles from a slight zoom */}
      <motion.div
        ref={box}
        className={`cs-visual-box ${!isClip(m) && m.contain ? 'is-contain' : ''}`}
        style={style}
        initial={{ clipPath: 'inset(12% 8% 12% 8%)' }}
        whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 1.2, ease }}
      >
        <motion.div
          className={`cs-visual-pan ${parallax ? 'is-parallax' : ''}`}
          style={{ y }}
          initial={{ scale: 1.14 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 1.4, ease }}
        >
          {isClip(m) ? (
            <ClipView m={m} />
          ) : (
            <button type="button" className="cs-zoom" onClick={() => open(m)} aria-label={`Enlarge: ${m.alt}`}>
              <img src={m.src} alt={m.alt} loading="lazy" decoding="async" />
            </button>
          )}
        </motion.div>
      </motion.div>
      {(m.label || m.caption) && (
        <figcaption>
          {m.label && <strong>{m.label}</strong>}
          {m.label && m.caption && ' — '}
          {m.caption}
        </figcaption>
      )}
    </motion.figure>
  )
}

/** 2 / 3 / 4 / 5 items in a row; `steps` numbers them like a flow */
export function Grid({ items, cols, steps = false, wide = false }: { items: Item[]; cols: number; steps?: boolean; wide?: boolean }) {
  return (
    <div className={`${wide ? 'cs-wrap-wide' : 'cs-wrap'} cs-grid`} style={{ ['--cols' as string]: cols, ['--tcols' as string]: cols === 4 ? 2 : Math.min(cols, cols === 5 ? 5 : 3) }}>
      {items.map((m, i) => (
        <div key={i} className="cs-grid-cell">
          {steps && <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>}
          <Visual m={m} />
        </div>
      ))}
    </div>
  )
}

/* ---------- Stack: overlapping tilted pictures that lean with scroll speed and fan out on hover ---------- */
export function Stack({ items, caption }: { items: Img[]; caption?: string }) {
  const reduce = useReducedMotion()
  const open = useContext(LightboxC)
  const { scrollY } = useScroll()
  const vel = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 30 })
  const lean = useTransform(vel, [-3000, 3000], reduce ? [0, 0] : [-6, 6])
  const base = [-5, 3, -2, 6, -4, 2]
  return (
    <Reveal className="cs-wrap cs-stack-wrap">
      <div className="cs-stack" style={{ ['--n' as string]: items.length }}>
        {items.map((m, i) => (
          <StackItem key={m.src} m={m} i={i} base={base[i % base.length]} lean={lean} onOpen={open} />
        ))}
      </div>
      {caption && <p className="cs-caption">{caption}</p>}
    </Reveal>
  )
}
function StackItem({ m, i, base, lean, onOpen }: { m: Img; i: number; base: number; lean: ReturnType<typeof useTransform<number, number>>; onOpen: (m: Img) => void }) {
  const rotate = useTransform(lean, (v) => base + v * (i % 2 ? 1 : -1))
  return (
    <motion.button
      type="button"
      className="cs-stack-item"
      onClick={() => onOpen(m)}
      aria-label={`Enlarge: ${m.alt}`}
      style={{ rotate, zIndex: i, ['--i' as string]: i }}
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...elastic, delay: 0.1 + i * 0.08 }}
    >
      <img src={m.src} alt={m.alt} loading="lazy" style={m.ratio ? { aspectRatio: m.ratio } : undefined} />
    </motion.button>
  )
}

/* ---------- Two rows that slide in opposite directions as you scroll ---------- */
export function ScrollRows({ items, caption }: { items: Img[]; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const a = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['4%', '-22%'])
  const b = useTransform(scrollYProgress, [0, 1], reduce ? ['-12%', '-12%'] : ['-26%', '0%'])
  const half = Math.ceil(items.length / 2)
  const rows = [items.slice(0, half), items.slice(half).length ? items.slice(half) : items]
  const open = useContext(LightboxC)
  return (
    <div ref={ref} className="cs-rows">
      {rows.map((row, r) => (
        <motion.div key={r} className="cs-row" style={{ x: r ? b : a }}>
          {[...row, ...row].map((m, i) => (
            <button key={i} type="button" className="cs-row-item" onClick={() => open(m)} aria-label={`Enlarge: ${m.alt}`} tabIndex={i >= row.length ? -1 : 0}>
              <img src={m.src} alt={i >= row.length ? '' : m.alt} loading="lazy" style={m.ratio ? { aspectRatio: m.ratio } : undefined} />
            </button>
          ))}
        </motion.div>
      ))}
      {caption && <p className="cs-caption">{caption}</p>}
    </div>
  )
}

/* ---------- Text pieces ---------- */
export function Intro({
  title,
  lead,
  text,
  meta,
  link,
  linkStyle,
}: {
  title: string
  lead?: string
  text: string
  meta: { label: string; value: string }[]
  link?: { label: string; href: string }
  linkStyle?: CSSProperties
}) {
  return (
    <div className="cs-wrap cs-intro">
      <div>
        <Reveal>
          <p className="cs-label">About the project</p>
        </Reveal>
        <PopWords text={title} className="cs-intro-title" />
        <Reveal delay={0.15}>
          {lead && <p className="cs-intro-lead">{lead}</p>}
          <p className="cs-intro-text">{text}</p>
          {link && (
            <a className="cs-btn" href={link.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          )}
        </Reveal>
      </div>
      <Reveal className="cs-meta" delay={0.2}>
        {meta.map((m) => (
          <div key={m.label}>
            <p className="cs-label">{m.label}</p>
            <p>{m.value}</p>
          </div>
        ))}
      </Reveal>
    </div>
  )
}

export function Statement({ text, small }: { text: string; small?: string }) {
  return (
    <div className="cs-wrap cs-statement">
      {small && (
        <Reveal>
          <p className="cs-label">{small}</p>
        </Reveal>
      )}
      <PopWords text={text} as="p" className="cs-statement-text" />
    </div>
  )
}

/** Short numbered columns (e.g. challenge → idea → execution → outcome) */
export function Steps({ items }: { items: { k: string; v: string }[] }) {
  return (
    <div className="cs-wrap cs-steps" style={{ ['--cols' as string]: items.length }}>
      {items.map((s, i) => (
        <Reveal key={s.k} delay={i * 0.08} className="cs-steps-item">
          <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>
          <p className="cs-label">{s.k}</p>
          <p>{s.v}</p>
        </Reveal>
      ))}
    </div>
  )
}

/** Steps joined by a line that fills as you scroll past */
export function Pipeline({ items }: { items: { k: string; v: string }[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 40%'] })
  const fill = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <div ref={ref} className="cs-wrap cs-pipeline" style={{ ['--cols' as string]: items.length }}>
      <span className="cs-pipeline-line" aria-hidden="true">
        <motion.span style={{ width: fill }} />
      </span>
      {items.map((s, i) => (
        <PipelineStep key={s.k} i={i} n={items.length} s={s} p={scrollYProgress} />
      ))}
    </div>
  )
}
function PipelineStep({ i, n, s, p }: { i: number; n: number; s: { k: string; v: string }; p: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const at = i / Math.max(1, n - 1)
  const opacity = useTransform(p, [at - 0.25, at], [0.3, 1])
  return (
    <motion.div className="cs-pipeline-step" style={{ opacity }}>
      <span className="cs-pipeline-dot" aria-hidden="true" />
      <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>
      <p className="cs-pipeline-k">{s.k}</p>
      <p>{s.v}</p>
    </motion.div>
  )
}

export function Palette({ colors }: { colors: string[] }) {
  return (
    <div className="cs-palette">
      {colors.map((c, i) => (
        <motion.div
          key={c}
          className="cs-swatch"
          style={{ background: c }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ ...elastic, delay: i * 0.06 }}
          whileHover={{ flexGrow: 2.2 }}
        >
          <span>{c.toUpperCase()}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ---------- Before / after ---------- */
export function Compare({ before, after, labels = ['Before', 'After'] }: { before: Img; after: Img; labels?: [string, string] }) {
  const box = useRef<HTMLDivElement>(null)
  const pos = useMotionValue(50)
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const [now, setNow] = useState(50)
  useEffect(() => pos.on('change', (v) => setNow(Math.round(v))), [pos])
  const set = (x: number) => {
    const r = box.current?.getBoundingClientRect()
    if (r) pos.set(Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100)))
  }
  const played = useRef(false)
  const intro = useRef<ReturnType<typeof animate> | null>(null)
  useEffect(() => () => intro.current?.stop(), [])
  return (
    <motion.div
      ref={box}
      className="cs-compare"
      style={{ aspectRatio: after.ratio ?? '1 / 1' }}
      onViewportEnter={() => {
        if (played.current) return
        played.current = true
        intro.current = animate(pos, [50, 22, 78, 50], { duration: 2.4, ease: 'easeInOut', delay: 0.3 })
      }}
      onPointerDown={(e) => {
        intro.current?.stop()
        ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
        set(e.clientX)
      }}
      onPointerMove={(e) => e.buttons && set(e.clientX)}
      role="slider"
      tabIndex={0}
      aria-label={`${labels[0]} and ${labels[1]}: ${after.alt}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={now}
      onKeyDown={(e) => {
        intro.current?.stop()
        if (e.key === 'Home') pos.set(0)
        if (e.key === 'End') pos.set(100)
        if (e.key === 'ArrowLeft') pos.set(Math.max(0, pos.get() - 5))
        if (e.key === 'ArrowRight') pos.set(Math.min(100, pos.get() + 5))
      }}
    >
      <img src={after.src} alt={after.alt} loading="lazy" draggable={false} />
      <motion.div className="cs-compare-before" style={{ clipPath: clip }}>
        <img src={before.src} alt={before.alt} loading="lazy" draggable={false} />
      </motion.div>
      <motion.span className="cs-compare-handle" style={{ left }} aria-hidden="true" />
      <span className="cs-compare-tag" style={{ left: 12 }}>
        {labels[0]}
      </span>
      <span className="cs-compare-tag" style={{ right: 12 }}>
        {labels[1]}
      </span>
    </motion.div>
  )
}

/** A wall of cards: each shows the finished treatment and flips to the archive photo on hover or tap */
export function FlipWall({ pairs }: { pairs: { before: Img; after: Img }[] }) {
  return (
    <div className="cs-wrap-wide cs-flipwall">
      {pairs.map((p, i) => (
        <FlipCard key={p.after.src} p={p} i={i} />
      ))}
    </div>
  )
}
function FlipCard({ p, i }: { p: { before: Img; after: Img }; i: number }) {
  const [shown, setShown] = useState(false)
  /* Load and decode the original well before the wall reaches the screen,
   * so the flip shows it at once instead of waiting for it to arrive */
  const card = useRef<HTMLButtonElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = card.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        setNear(true)
        io.disconnect()
        const pre = new Image()
        pre.src = p.before.src
        pre.decode?.().catch(() => {})
      },
      { rootMargin: '900px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [p.before.src])
  return (
    <motion.button
      ref={card}
      type="button"
      className={`cs-flip ${shown ? 'is-before' : ''}`}
      aria-pressed={shown}
      aria-label={`Show the ${shown ? 'finished treatment' : 'original photo'}: ${p.after.alt}`}
      onClick={() => setShown((s) => !s)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setShown(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setShown(false)}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease, delay: (i % 5) * 0.06 }}
    >
      <img src={p.after.src} alt="" loading="lazy" />
      <span className="cs-flip-before">
        <img src={p.before.src} alt="" loading={near ? 'eager' : 'lazy'} decoding="sync" />
      </span>
      <span className="cs-flip-tag">{shown ? 'Original' : 'Final'}</span>
    </motion.button>
  )
}

/* ---------- Frame to motion: pick a shot, the key frame comes to life ---------- */
export function FrameToMotion({ shots }: { shots: { label: string; still: string; motion: string; caption: string }[] }) {
  const [at, setAt] = useState(0)
  const [live, setLive] = useState(false)
  const v = useRef<HTMLVideoElement>(null)
  const pick = useCallback((i: number) => {
    if (i === at) return
    setLive(false)
    setAt(i)
  }, [at])
  const s = shots[at]
  return (
    <div className="cs-wrap-wide cs-f2m">
      <div className="cs-f2m-stage">
        <video
          key={s.motion}
          ref={v}
          src={s.motion}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onPlaying={() => setLive(true)}
          aria-label={`${s.label} in motion`}
        />
        <motion.img key={s.still} src={s.still} alt={`${s.label} key frame`} initial={{ opacity: 1 }} animate={{ opacity: live ? 0 : 1 }} transition={{ duration: 1.2, ease }} />
        <span className="cs-f2m-state cs-label">{live ? 'Motion' : 'Key frame'}</span>
      </div>
      <div className="cs-f2m-tabs" role="tablist" aria-label="Shots">
        {shots.map((x, i) => (
          <button key={x.label} type="button" role="tab" aria-selected={i === at} className={i === at ? 'on' : ''} onClick={() => pick(i)}>
            <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>
            <span className="cs-f2m-label">{x.label}</span>
            <span className="cs-f2m-cap">{x.caption}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Film: the finished piece, large, with its own controls ---------- */
export function Film({ src, poster, captions, alt, vertical = false, tag }: { src: string; poster: string; captions?: string; alt: string; vertical?: boolean; tag?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const v = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [t, setT] = useState(0)
  const toggle = () => {
    const el = v.current
    if (!el) return
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }
  return (
    <Reveal className="cs-wrap-wide">
      <div ref={wrap} className={`cs-film ${vertical ? 'is-vertical' : ''} ${playing ? 'is-playing' : ''}`}>
        <video
          ref={v}
          src={src}
          poster={poster}
          playsInline
          preload="none"
          muted={muted}
          aria-label={alt}
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setT(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
        >
          {captions && <track kind="captions" src={captions} srcLang="en" label="English" default />}
        </video>
        {tag && <span className="cs-film-tag cs-label">{tag}</span>}
        <button type="button" className="cs-film-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play film'}>
          <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
        </button>
        <div className="cs-film-bar">
          <span className="cs-film-progress" aria-hidden="true">
            <span style={{ width: `${t * 100}%` }} />
          </span>
          <button type="button" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
            {muted ? 'Sound off' : 'Sound on'}
          </button>
          <button
            type="button"
            onClick={() => {
              const el = wrap.current
              if (!el) return
              if (document.fullscreenElement) document.exitFullscreen()
              else if (el.requestFullscreen) el.requestFullscreen()
              else (v.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null)?.webkitEnterFullscreen?.()
            }}
          >
            Fullscreen
          </button>
        </div>
      </div>
    </Reveal>
  )
}

/* ---------- Placed: the real source material beside the frame it was composited into ---------- */
export function Placed({ sources, result, caption }: { sources: Img[]; result: Img; caption: string }) {
  return (
    <div className="cs-wrap-wide cs-placed">
      <div className={`cs-placed-src n${sources.length}`}>
        {sources.map((m, i) => (
          <Reveal key={m.src} delay={i * 0.08} className="cs-placed-card">
            <img src={m.src} alt={m.alt} loading="lazy" />
          </Reveal>
        ))}
        <span className="cs-label cs-placed-tag">Source</span>
      </div>
      <span className="cs-placed-arrow" aria-hidden="true">→</span>
      <div className="cs-placed-result">
        <Visual m={{ ...result, label: 'In the room', caption }} />
      </div>
    </div>
  )
}

/* ---------- Credits ---------- */
export function Credits({ items, email }: { items: { label: string; value: string }[]; email: string }) {
  return (
    <div className="cs-wrap cs-credits">
      {items.map((m) => (
        <div key={m.label}>
          <p className="cs-label">{m.label}</p>
          <p>{m.value}</p>
        </div>
      ))}
      <div>
        <p className="cs-label">Contact</p>
        <p>
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      </div>
    </div>
  )
}

export const Gap = ({ size = 'm' }: { size?: 's' | 'm' | 'l' }) => <div className={`cs-gap cs-gap-${size}`} aria-hidden="true" />
