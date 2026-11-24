import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { PROJECTS, themeFor, type Block, type Project } from './data'
import { href, usePalette, useTone } from './store'
import { Media } from './Media'
import { Contact } from './Contact'

const ease = [0.22, 1, 0.36, 1] as const

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

function BlockView({ block, accent }: { block: Block; accent: string }) {
  if (block.type === 'full') return <Reveal><Media item={block.media} /></Reveal>
  if (block.type === 'pair')
    return (
      <div className="v2-grid-2">
        {block.media.map((m, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <Media item={m} />
          </Reveal>
        ))}
      </div>
    )
  if (block.type === 'row')
    return (
      <div className="v2-grid-3">
        {block.media.map((m, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <Media item={m} />
          </Reveal>
        ))}
      </div>
    )
  return (
    <Reveal>
      <div className="v2-split" aria-label={block.label}>
        <div>
          <p className="v2-label">AI did</p>
          <p>{block.ai}</p>
        </div>
        <div style={{ background: accent }}>
          <p className="v2-label">I did</p>
          <p>{block.me}</p>
        </div>
      </div>
    </Reveal>
  )
}

export function ProjectPage({ project }: { project: Project }) {
  const { palette } = usePalette()
  const { setTone } = useTone()
  const reduce = useReducedMotion()
  const theme = themeFor(project, palette)
  const i = PROJECTS.findIndex((p) => p.slug === project.slug)
  const next = PROJECTS[(i + 1) % PROJECTS.length]
  const nextTheme = themeFor(next, palette)
  const heroRef = useRef<HTMLElement>(null)

  const { scrollY } = useScroll()
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const mediaY = useTransform(scrollY, [0, vh], [0, reduce ? 0 : -vh * 0.18])
  const mediaScale = useTransform(scrollY, [0, vh], [1, reduce ? 1 : 0.92])
  const wordY = useTransform(scrollY, [0, vh], [0, reduce ? 0 : vh * 0.12])

  // Header/badges switch to ink once the white curtain covers the hero
  useEffect(() => {
    const ink = { bg: '#fbf8f3', fg: '#171717' }
    const apply = () => setTone(window.scrollY > window.innerHeight * 0.92 ? ink : theme)
    apply()
    window.addEventListener('scroll', apply, { passive: true })
    return () => window.removeEventListener('scroll', apply)
  }, [theme.bg, theme.fg]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="v2-project">
      <section ref={heroRef} className="v2-hero" style={{ background: theme.bg, color: theme.fg }}>
        <motion.div className="v2-hero-media" style={{ y: mediaY, scale: mediaScale }}>
          <motion.div initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease }}>
            <Media item={project.cover} eager />
          </motion.div>
        </motion.div>
        <motion.h1 className="v2-hero-word" style={{ y: wordY }}>
          {project.word.split('').map((ch, k) => (
            <span key={k} className="v2-mask">
              <motion.span
                className="v2-char"
                initial={reduce ? false : { y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.8, ease, delay: 0.15 + k * 0.04 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </motion.h1>
        <button
          type="button"
          className="v2-scrollcue"
          aria-label="Scroll to project"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: reduce ? 'auto' : 'smooth' })}
          style={{ borderColor: theme.fg }}
        >
          <motion.span
            style={{ background: theme.fg }}
            animate={reduce ? undefined : { y: [-6, 6, -6] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
        </button>
      </section>

      <article className="v2-curtain">
        <div className="v2-wrap">
          <Reveal className="v2-about">
            <p className="v2-label">About the project</p>
            <h2 className="v2-h2">{project.headline}</h2>
            <p className="v2-lede">{project.intro}</p>
            {project.link && (
              <a className="v2-btn" href={project.link.href} target="_blank" rel="noopener noreferrer" data-cursor="Open" style={{ background: theme.bg, color: theme.fg }}>
                {project.link.label} <span aria-hidden="true">↗</span>
              </a>
            )}
          </Reveal>

          <Reveal className="v2-meta">
            {project.meta.map((m) => (
              <div key={m.label}>
                <p className="v2-label">{m.label}</p>
                <p>{m.value}</p>
              </div>
            ))}
          </Reveal>

          {project.chapters.map((c, k) => (
            <section key={c.title} className="v2-chapter">
              <Reveal className="v2-chapter-head">
                <span className="v2-num" style={{ color: project.colors.dark }}>
                  {String(k + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="v2-h3">{c.title}</h3>
                  <p className="v2-sub">{c.subtitle}</p>
                </div>
                <p className="v2-text">{c.text}</p>
              </Reveal>
              <div className="v2-blocks">
                {c.blocks.map((b, j) => (
                  <BlockView key={j} block={b} accent={project.colors.bg} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <a href={href.project(next.slug)} className="v2-next" data-cursor="Next" style={{ background: nextTheme.bg, color: nextTheme.fg }}>
          <span className="v2-label">Next project</span>
          <span className="v2-next-word">{next.word}</span>
          <span className="v2-label">{next.name}</span>
        </a>

        <Contact />
      </article>
    </div>
  )
}
