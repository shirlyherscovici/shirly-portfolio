import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion, useMotionValue, animate } from 'framer-motion'
import { PROJECTS, SHELL, type Block, type MediaItem, type Project } from './data'
import { href, useFlight, useTone } from './store'
import { Media } from './Media'
import { Contact } from './Contact'

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
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

function BlockView({ block, project }: { block: Block; project: Project }) {
  switch (block.type) {
    case 'full':
      return (
        <Reveal>
          <Media item={block.media} />
        </Reveal>
      )
    case 'pair':
      return (
        <div className="v2-grid-2">
          {block.media.map((m, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <Media item={m} />
            </Reveal>
          ))}
        </div>
      )
    case 'row':
      return (
        <div className="v2-grid-3">
          {block.media.map((m, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <Media item={m} />
            </Reveal>
          ))}
        </div>
      )
    case 'gallery':
      return (
        <Reveal>
          <Gallery media={block.media} />
        </Reveal>
      )
    case 'compare':
      return (
        <Reveal className="v2-compare-wrap">
          <Compare before={block.before} after={block.after} />
        </Reveal>
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

export function ProjectPage({ project }: { project: Project }) {
  const { setTone } = useTone()
  const { flight, land } = useFlight()
  const reduce = useReducedMotion()
  const [arrived] = useState(() => flight?.slug === project.slug)
  const i = PROJECTS.findIndex((p) => p.slug === project.slug)
  const next = PROJECTS[(i + 1) % PROJECTS.length]
  const { bg, fg } = project.colors

  useEffect(() => {
    if (!arrived) return
    const t = window.setTimeout(land, 80)
    return () => window.clearTimeout(t)
  }, [arrived, land])

  const { scrollY } = useScroll()
  const vh = window.innerHeight
  const mediaY = useTransform(scrollY, [0, vh], [0, reduce ? 0 : -vh * 0.18])
  const mediaScale = useTransform(scrollY, [0, vh], [1, reduce ? 1 : 0.92])
  const wordY = useTransform(scrollY, [0, vh], [0, reduce ? 0 : vh * 0.12])

  useEffect(() => {
    const ink = { bg: SHELL.paper, fg: SHELL.ink }
    const apply = () => setTone(window.scrollY > window.innerHeight * 0.92 ? ink : { bg, fg })
    apply()
    window.addEventListener('scroll', apply, { passive: true })
    return () => window.removeEventListener('scroll', apply)
  }, [bg, fg, setTone])

  const skip = arrived

  return (
    <div className="v2-project">
      <section className="v2-hero" style={{ background: bg, color: fg }}>
        <motion.div className="v2-hero-media" style={{ y: mediaY, scale: mediaScale }}>
          <motion.div initial={skip ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
            <Media item={project.cover} eager />
          </motion.div>
        </motion.div>
        <motion.h1 className="v2-hero-word" style={{ y: wordY }}>
          {project.word.split('').map((ch, k) => (
            <span key={k} className="v2-mask">
              <motion.span
                className="v2-char"
                initial={{ y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, ease, delay: (arrived ? 0.35 : 0.15) + k * 0.04 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </motion.h1>
        <p className="v2-label v2-hero-kind">{project.kind}</p>
        <button
          type="button"
          className="v2-scrollcue"
          aria-label="Scroll to project"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: reduce ? 'auto' : 'smooth' })}
          style={{ borderColor: fg }}
        >
          <motion.span style={{ background: fg }} animate={reduce ? undefined : { y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} />
        </button>
      </section>

      <article className="v2-curtain">
        <div className="v2-wrap">
          <Reveal className="v2-about">
            <p className="v2-label">About the project</p>
            <p className="v2-intro-text">{project.intro}</p>
            {project.link && (
              <a className="v2-btn" href={project.link.href} target="_blank" rel="noopener noreferrer" data-cursor="Open" style={{ background: bg, color: fg }}>
                {project.link.label} <span aria-hidden="true">↗</span>
              </a>
            )}
          </Reveal>

          <Reveal className="v2-meta">
            {project.credits.map((m) => (
              <div key={m.label}>
                <p className="v2-label">{m.label}</p>
                <p>{m.value}</p>
              </div>
            ))}
          </Reveal>

          {project.chapters.map((c, k) => (
            <section key={c.title} className="v2-chapter">
              <Reveal className="v2-chapter-head">
                <span className="v2-num">{String(k + 1).padStart(2, '0')}</span>
                <h2 className="v2-h3">{c.title}</h2>
                {c.text && <p className="v2-text">{c.text}</p>}
              </Reveal>
              <div className="v2-blocks">
                {c.blocks.map((b, j) => (
                  <BlockView key={j} block={b} project={project} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <a href={href.project(next.slug)} className="v2-next" data-cursor="Next" style={{ background: next.colors.bg, color: next.colors.fg }}>
          <span className="v2-label">Next project</span>
          <span className="v2-next-media">
            <img src={next.cover.src} alt="" loading="lazy" />
          </span>
          <span className="v2-next-word">{next.word}</span>
        </a>

        <Contact />
      </article>
    </div>
  )
}
