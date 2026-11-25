import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, useMotionValueEvent, animate } from 'framer-motion'
import { DARK, PERSON, PROJECTS, type Block, type MediaItem, type Project } from './data'
import { href, useFlight, useTone } from './store'
import { Media } from './Media'

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 48, clipPath: 'inset(8% 0 0 0)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Horizontal, draggable gallery */
function Gallery({ media }: { media: MediaItem[] }) {
  const track = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const [limit, setLimit] = useState(0)
  useEffect(() => {
    const on = () => setLimit(Math.max(0, (track.current?.scrollWidth ?? 0) - (wrap.current?.clientWidth ?? 0)))
    on()
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return (
    <div ref={wrap} className="v2-gallery" data-cursor="Drag">
      <motion.div ref={track} className="v2-gallery-track" drag="x" dragConstraints={{ left: -limit, right: 0 }} dragElastic={0.08}>
        {media.map((m, i) => (
          <div key={i} className="v2-gallery-item">
            <Media item={m} />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/** Before / after slider */
function Compare({ before, after }: { before: MediaItem; after: MediaItem }) {
  const box = useRef<HTMLDivElement>(null)
  const pos = useMotionValue(50)
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`)
  const left = useTransform(pos, (v) => `${v}%`)
  const set = (clientX: number) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    pos.set(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)))
  }
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const c = animate(pos, [50, 30, 70, 50], { duration: 2.4, delay: 0.6, ease: 'easeInOut' })
    return () => c.stop()
  }, [pos, reduce])
  return (
    <div
      ref={box}
      className="v2-compare"
      data-cursor="Drag"
      onPointerDown={(e) => {
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        set(e.clientX)
      }}
      onPointerMove={(e) => e.buttons && set(e.clientX)}
      role="slider"
      aria-label="Before and after"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={50}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') pos.set(Math.max(0, pos.get() - 5))
        if (e.key === 'ArrowRight') pos.set(Math.min(100, pos.get() + 5))
      }}
    >
      <Media item={after} />
      <motion.div className="v2-compare-before" style={{ clipPath: clip }}>
        <Media item={before} />
      </motion.div>
      <motion.span className="v2-compare-handle" style={{ left }} aria-hidden="true" />
      <span className="v2-compare-tag v2-label" style={{ left: 14 }}>
        Before
      </span>
      <span className="v2-compare-tag v2-label" style={{ right: 14 }}>
        After
      </span>
    </div>
  )
}

/** A dark framed panel, the way each piece of work is presented on the page */
function Panel({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <Reveal className={`v2-panel ${wide ? 'is-wide' : ''}`}>
      {children}
    </Reveal>
  )
}

function BlockView({ block, project }: { block: Block; project: Project }) {
  switch (block.type) {
    case 'full':
      return (
        <Panel wide>
          <Media item={block.media} />
        </Panel>
      )
    case 'pair':
      return (
        <Panel>
          <div className="v2-grid-2">
            {block.media.map((m, i) => (
              <Media key={i} item={m} />
            ))}
          </div>
        </Panel>
      )
    case 'row':
      // A row of videos: every clip gets a panel of its own, with its caption underneath
      if (block.media.every((m) => m.kind === 'video'))
        return (
          <>
            {block.media.map((m, i) => (
              <Panel key={i} wide>
                <Media item={m} />
              </Panel>
            ))}
          </>
        )
      return (
        <Panel>
          <div className="v2-grid-3">
            {block.media.map((m, i) => (
              <Media key={i} item={m} />
            ))}
          </div>
        </Panel>
      )
    case 'gallery':
      return (
        <Reveal>
          <Gallery media={block.media} />
        </Reveal>
      )
    case 'compare':
      return (
        <Panel>
          <div className="v2-compare-wrap">
            <Compare before={block.before} after={block.after} />
          </div>
        </Panel>
      )
    case 'split':
      return (
        <Reveal>
          <div className="v2-split" aria-label={block.label}>
            <div>
              <p className="v2-label">AI</p>
              <p>{block.ai}</p>
            </div>
            <div style={{ background: project.colors.bg, color: project.colors.fg }}>
              <p className="v2-label">Me</p>
              <p>{block.me}</p>
            </div>
          </div>
        </Reveal>
      )
  }
}

/** Big project word: an outline that fills with colour from the left */
function Title({ word, filled, delay, className = '' }: { word: string; filled: boolean; delay: number; className?: string }) {
  return (
    <>
      <span className="v2-title-outline" aria-hidden="true">
        {word}
      </span>
      <motion.span
        className={`v2-title-fill ${className}`}
        initial={filled ? false : { clipPath: 'inset(-20% 100% -30% 0%)' }}
        animate={{ clipPath: 'inset(-20% 0% -30% 0%)' }}
        transition={{ duration: 1.3, ease: wipe, delay }}
      >
        {word}
      </motion.span>
    </>
  )
}

const wipe = [0.76, 0, 0.24, 1] as const

export function ProjectPage({ project }: { project: Project }) {
  const { setTone } = useTone()
  const { flight, fly, land } = useFlight()
  const reduce = useReducedMotion()
  // How we got here: from the home strip, handed over by the previous project, or directly
  const [via] = useState<'home' | 'next' | null>(() => (flight?.slug === project.slug ? (flight.handoff ? 'next' : 'home') : null))
  const i = PROJECTS.findIndex((p) => p.slug === project.slug)
  const next = PROJECTS[(i + 1) % PROJECTS.length]
  const hero = project.hero
  const nextRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!via) return
    const t = window.setTimeout(land, 80)
    return () => window.clearTimeout(t)
  }, [via, land])

  // Hero picture drifts up a little as the dark page slides over it
  const { scrollY } = useScroll()
  const vh = window.innerHeight
  const mediaY = useTransform(scrollY, [0, vh], [0, -vh * 0.14])

  /* ---------- Next project ---------- */
  const [going, setGoing] = useState(false)
  const { scrollYProgress: near } = useScroll({ target: nextRef, offset: ['start end', 'end end'] })
  // The next picture is black and white while it comes up, and takes its colour once it has arrived
  const nextFilter = useTransform(near, [0.35, 1], ['grayscale(1)', 'grayscale(0)'])
  useMotionValueEvent(near, 'change', (v) => {
    if (v > 0.985 && !going) setGoing(true)
  })

  // Header colour follows whatever section is under it
  useEffect(() => {
    const apply = () => {
      if (going) return
      const top = nextRef.current?.getBoundingClientRect().top ?? Infinity
      if (top < 60) setTone(next.colors)
      else if (window.scrollY > window.innerHeight * 0.92) setTone(DARK)
      else setTone(hero)
    }
    apply()
    window.addEventListener('scroll', apply, { passive: true })
    return () => window.removeEventListener('scroll', apply)
  }, [hero, next, going, setTone])

  /* Reaching the end hands over to the next project: its hero colour wipes down from the
   * top, the picture straightens into the hero spot, then the pages swap underneath. */
  useEffect(() => {
    if (!going) return
    const stop = (e: Event) => e.preventDefault()
    const keys = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) e.preventDefault()
    }
    window.addEventListener('wheel', stop, { passive: false })
    window.addEventListener('touchmove', stop, { passive: false })
    window.addEventListener('keydown', keys)
    window.scrollTo(0, document.documentElement.scrollHeight)
    setTone(next.hero)
    const t = window.setTimeout(
      () => fly({ slug: next.slug, src: next.cover.src, rect: { x: 0, y: 0, w: 0, h: 0 }, bg: next.hero.bg, handoff: true }),
      1250,
    )
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('keydown', keys)
    }
  }, [going]) // eslint-disable-line react-hooks/exhaustive-deps

  const mobile = window.innerWidth < 760
  const lean = mobile
    ? { x: '6vw', rotateX: 4, rotateY: -12, rotateZ: -5, skewX: -4, scale: 0.92 }
    : { x: '20vw', rotateX: 8, rotateY: -24, rotateZ: -7, skewX: -8, scale: 0.9 }
  const flat = { x: '0vw', rotateX: 0, rotateY: 0, rotateZ: 0, skewX: 0, scale: 1 }

  const footer = [...project.credits, { label: 'Type', value: project.kind }]

  return (
    <div className="v2-project">
      {/* ---------- Hero ---------- */}
      <section className="v2-hero" style={{ background: hero.bg, color: hero.fg }}>
        <motion.div className="v2-hero-media" style={{ y: mediaY }}>
          <motion.img
            src={project.cover.src}
            alt={project.cover.alt}
            initial={via ? false : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
            transition={{ duration: 1.1, ease: wipe }}
          />
        </motion.div>
        <h1 className="v2-hero-title">
          <Title word={project.word} filled={via === 'next'} delay={via === 'home' ? 0.75 : 0.35} />
        </h1>
        <p className="v2-label v2-hero-kind">{project.kind}</p>
        <button
          type="button"
          className="v2-scrollcue"
          aria-label="Scroll to project"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: reduce ? 'auto' : 'smooth' })}
          style={{ borderColor: hero.fg }}
        >
          <motion.span style={{ background: hero.fg }} animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} />
        </button>
      </section>

      {/* ---------- The dark room with the work ---------- */}
      <article className="v2-curtain">
        <div className="v2-wrap v2-intro">
          <Reveal className="v2-intro-main">
            <p className="v2-label">About the project</p>
            <h2 className="v2-intro-h">{project.name}</h2>
            <p className="v2-intro-p">{project.intro}</p>
            {project.link && (
              <a className="v2-btn" href={project.link.href} target="_blank" rel="noopener noreferrer" style={{ background: project.colors.bg, color: project.colors.fg }}>
                {project.link.label} <span aria-hidden="true">↗</span>
              </a>
            )}
          </Reveal>
          <Reveal className="v2-intro-meta" delay={0.1}>
            {project.credits.map((m) => (
              <div key={m.label}>
                <p className="v2-label">{m.label}</p>
                <p>{m.value}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {project.chapters.map((c, k) => (
          <section key={c.title} className="v2-chapter">
            <Reveal className="v2-wrap v2-chapter-head">
              <span className="v2-label">{String(k + 1).padStart(2, '0')}</span>
              <h2 className="v2-chapter-title">{c.title}</h2>
              {c.text && <p className="v2-chapter-text">{c.text}</p>}
            </Reveal>
            <div className="v2-wrap-wide v2-blocks">
              {c.blocks.map((b, j) => (
                <BlockView key={j} block={b} project={project} />
              ))}
            </div>
          </section>
        ))}

        <div className="v2-wrap v2-credits">
          {footer.map((m) => (
            <div key={m.label}>
              <p className="v2-label">{m.label}</p>
              <p>{m.value}</p>
            </div>
          ))}
          <div>
            <p className="v2-label">Contact</p>
            <p>
              <a href={`mailto:${PERSON.email}`} className="v2-link">
                {PERSON.email}
              </a>
            </p>
          </div>
        </div>
      </article>

      {/* ---------- Next project: arrives as it sits on the home strip, then becomes its own hero ---------- */}
      <section
        ref={nextRef}
        className="v2-next"
        style={{ background: next.colors.bg }}
        onClick={() => setGoing(true)}
        aria-label={`Next project: ${next.name}`}
      >
        <motion.div
          className="v2-next-wipe"
          style={{ background: next.hero.bg }}
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={going ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.6, ease: wipe }}
        />
        <motion.p className="v2-label v2-next-label" style={{ color: next.colors.fg }} animate={{ opacity: going ? 0 : 1 }}>
          Next project
        </motion.p>
        <div className="v2-next-stage">
          <motion.div
            className="v2-hero-media"
            style={{ filter: going ? 'grayscale(0)' : nextFilter }}
            initial={lean}
            animate={going ? flat : lean}
            transition={{ duration: 0.9, ease: wipe, delay: 0.25 }}
          >
            <img src={next.cover.src} alt="" loading="lazy" />
          </motion.div>
        </div>
        <motion.h2
          className="v2-hero-title"
          initial={{ color: next.colors.fg }}
          animate={{ color: going ? next.hero.fg : next.colors.fg }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <span className="v2-title-fill v2-title-solid">{next.word}</span>
        </motion.h2>
      </section>
    </div>
  )
}
