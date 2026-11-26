import { useEffect, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { PERSON, PROJECTS, type Project } from './data'
import { href, useTone } from './store'
import { Contact } from './Contact'
import { ScrollArrow } from './ScrollArrow'
import { asset } from '../lib/asset'

const ease = [0.22, 1, 0.36, 1] as const

/* Laid out like robin-noguier.com/about: a hello beside a big portrait, a running
 * band, At work, the numbers, the work, the people, the years, and a sign-off.
 * Every fact here comes from the projects on this site or from Shirly's own CV. */

const EXPERIENCE = [
  {
    years: '2021 – now',
    place: 'News 12 & N12',
    role: 'Graphic designer and After Effects artist',
    did: 'Animation in After Effects on tight production deadlines, social graphics and print, and realistic AI video for the news.',
  },
  {
    years: '2020 – 2021',
    place: 'Juno Media',
    role: 'Graphic designer, video editor and After Effects artist',
    did: 'Video editing, and 2D characters, environments and effects animated under tight deadlines.',
  },
  {
    years: '2018 – 2020',
    place: 'IDF Education and Youth Corps',
    role: 'Film unit director, editing and post team lead',
    did: 'Led an editing and VFX team; wrote, directed and edited promotional, educational and informational videos.',
  },
]

/** One line per project, in the order of the home page */
const LINES: Record<string, string> = {
  'pilot-rescue': 'From the brief to a prime-time AI film in four hours.',
  louvre: 'The Louvre jewel heist, which I wrote, directed and produced, rebuilt shot by shot with AI.',
  partner: 'A podcast story with no pictures, written, directed and animated in four parts.',
  amy: 'Concept and design language for N12’s Culture Gaps episode on Amy Winehouse.',
  'people-in-motion': 'Character animation, game UI and kinetic type in one playful world.',
  eighties: 'An AI film set in a teenage bedroom of the 1980s.',
  quiz: 'One AI illustration per question for N12’s Independence Day trivia.',
  'music-from-the-screen': 'Neon key art and a mobile voting flow for N12 and Galgalatz.',
}

const SKILLS = ['Motion graphics', 'Realistic AI visuals', 'AI film', '2D animation', 'Graphic and banner design', 'UI and web design', 'Video editing']
const TOOLS = ['After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator', 'Figma', 'ChatGPT', 'Flow', 'Claude', 'Magnific', 'HTML and CSS']

/** Numbers taken from the projects themselves */
const NUMBERS = [
  { n: 8, suffix: '+', label: 'years of design and motion' },
  { n: 4, suffix: ' h', label: 'from the brief to prime time, USA Pilot Rescue' },
  { n: 67418, suffix: '', label: 'views on the Amy Winehouse episode, up from 24,500' },
  { n: PROJECTS.length, suffix: '', label: 'selected projects on this site' },
]

const PINK = '#ff8fb8'
const FOREST = '#1f4a3d'
const CREAM = '#fff1e0'

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-8% 0px' },
  transition: { duration: 0.8, ease, delay },
})

const coverOf = (p: Project) => (p.cover.kind === 'image' ? p.cover.src : p.cover.poster)

/** Big portrait that leans toward the pointer */
function Portrait() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 120, damping: 16 })
  const ry = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 120, damping: 16 })
  const tx = useSpring(useTransform(mx, [-1, 1], [-10, 10]), { stiffness: 120, damping: 18 })
  useEffect(() => {
    const on = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1)
      my.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', on)
    return () => window.removeEventListener('pointermove', on)
  }, [mx, my])
  return (
    <motion.figure
      className="v2-ab-photo"
      initial={{ opacity: 0, y: 40, rotate: 4, clipPath: 'inset(14% 14% 14% 14% round 28px)' }}
      animate={{ opacity: 1, y: 0, rotate: -2, clipPath: 'inset(0% 0% 0% 0% round 28px)' }}
      transition={{ delay: 0.35, duration: 1.2, ease }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
    >
      <motion.img src={asset('/v2/about/shirly.webp')} alt="Shirly Herscovici" width={360} height={360} style={{ x: tx }} />
    </motion.figure>
  )
}

/** A running band of what I do */
function Band({ words }: { words: string[] }) {
  const run = [...words, ...words, ...words, ...words]
  return (
    <div className="v2-ab-band" style={{ background: PINK, color: FOREST }} role="img" aria-label={words.join(', ')}>
      <div className="v2-ab-band-track" aria-hidden="true">
        {run.map((w, i) => (
          <span key={i}>
            {w}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  )
}

/** A number that counts up once it scrolls into view */
function Count({ n, suffix }: { n: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, amount: 0.6 })
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!seen) return
    const c = animate(0, n, { duration: n > 100 ? 1.8 : 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [seen, n])
  return (
    <span ref={ref}>
      {v.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

/** The work list; a picture of the project follows the pointer over each row */
function WorkList() {
  const [hover, setHover] = useState<string | null>(null)
  const x = useSpring(0, { stiffness: 260, damping: 28 })
  const y = useSpring(0, { stiffness: 260, damping: 28 })
  // when the page scrolls under a still pointer, look again at what is under it
  useEffect(() => {
    const on = () => {
      const el = document.elementFromPoint(x.get(), y.get()) as HTMLElement | null
      setHover(el?.closest<HTMLElement>('.v2-ab-worklist [data-slug]')?.dataset.slug ?? null)
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [x, y])
  return (
    <div
      className="v2-ab-worklist"
      onPointerMove={(e) => {
        x.set(e.clientX)
        y.set(e.clientY)
        const slug = (e.target as HTMLElement).closest<HTMLElement>('[data-slug]')?.dataset.slug ?? null
        if (slug !== hover) setHover(slug)
      }}
      onPointerLeave={() => setHover(null)}
    >
      <ul className="v2-ab-work">
        {PROJECTS.map((p, i) => (
          <motion.li key={p.slug} {...rise(i * 0.04)}>
            <a href={href.project(p.slug)} style={{ ['--c' as string]: p.colors.bg }} data-slug={p.slug}>
              <span className="v2-ab-work-n v2-label">{String(i + 1).padStart(2, '0')}</span>
              <strong>{p.name}</strong>
              <span>{LINES[p.slug] ?? p.kind}</span>
              <span className="v2-label">{p.kind}</span>
            </a>
          </motion.li>
        ))}
      </ul>
      {createPortal(
      <motion.div className="v2-ab-peek" style={{ x, y }} aria-hidden="true">
        {PROJECTS.map((p) => (
          <motion.img
            key={p.slug}
            src={coverOf(p)}
            alt=""
            loading="lazy"
            initial={false}
            animate={hover === p.slug ? { opacity: 1, scale: 1, rotate: -3 } : { opacity: 0, scale: 0.85, rotate: 3 }}
            transition={{ duration: 0.35, ease }}
            style={p.cover.kind === 'image' && p.cover.pos ? { objectPosition: p.cover.pos } : undefined}
          />
        ))}
      </motion.div>,
      document.body,
      )}
    </div>
  )
}

function CopyEmail() {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="v2-ab-copy"
      onClick={() => {
        const ok = () => {
          setDone(true)
          window.setTimeout(() => setDone(false), 2200)
        }
        if (navigator.clipboard) navigator.clipboard.writeText(PERSON.email).then(ok, () => (window.location.href = `mailto:${PERSON.email}`))
        else window.location.href = `mailto:${PERSON.email}`
      }}
    >
      <motion.span key={done ? 'y' : 'n'} initial={{ y: '100%' }} animate={{ y: '0%' }} transition={{ duration: 0.35, ease }} aria-live="polite">
        {done ? 'Email copied ✓' : 'Copy email'}
      </motion.span>
    </button>
  )
}

export function About() {
  const { setTone } = useTone()
  useEffect(() => setTone({ bg: '#fbf8f3', fg: '#171717' }), [setTone])

  const words = ['Hey,', 'I’m', 'Shirly.']
  return (
    <main className="v2-aboutpage">
      <div className="v2-wrap v2-ab v2-ab-hero">
        <div className="v2-ab-hero-text">
          <h1 className="v2-about-hello">
            {words.map((w, i) => (
              <span key={i} className="v2-mask">
                <motion.span
                  className="v2-char"
                  initial={{ y: '105%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.9, ease, delay: 0.1 + i * 0.1 }}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="v2-ab-intro" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9, ease }}>
            I’m a motion and graphic designer from Israel, and I make realistic AI films for the news. I’ve been doing this for over 8 years.
          </motion.p>

          <motion.div className="v2-ab-social v2-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
            <a href={`mailto:${PERSON.email}`}>Email</a>
            <a href={PERSON.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn ↗
            </a>
            <a href={PERSON.cv} target="_blank" rel="noopener noreferrer">
              CV (PDF) ↗
            </a>
          </motion.div>

          <motion.div className="v2-ab-arrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }}>
            <ScrollArrow fill="#171717" ink="#fbf8f3" onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })} />
          </motion.div>
        </div>
        <Portrait />
      </div>

      <Band words={SKILLS} />

      <div className="v2-wrap v2-ab">
        <section className="v2-ab-sec v2-ab-split">
          <motion.h2 {...rise()}>At work</motion.h2>
          <div>
            <motion.p className="v2-ab-text v2-ab-lead" {...rise(0.05)}>
              Today I work at N12, designing visual identities, motion graphics, digital projects and promos. A lot of my
              work lately is realistic AI video for the news. When a story breaks and there’s no footage, I put it
              together from scratch. The USA Pilot Rescue film went from the first brief to prime time in four hours.
            </motion.p>
            <motion.p className="v2-ab-text" {...rise(0.1)}>
              Usually the producer comes to me with a request. I write a short script and build a storyboard in ChatGPT,
              create the first and last frame of every shot, write each shot as a JSON prompt, animate it in Flow and then
              edit it all together. On some films, like the Louvre, I’m also the writer, director and producer.
            </motion.p>
            <motion.p className="v2-ab-text" {...rise(0.15)}>
              I like jumping between worlds: graphic design, animation, interactive pieces, AI and a little front-end
              code. I’m always trying some new tool (lately it’s 3D), and I care a lot about the small details and how a
              piece feels to watch.
            </motion.p>
          </div>
        </section>

        <section className="v2-ab-sec">
          <ul className="v2-ab-nums">
            {NUMBERS.map((x, i) => (
              <motion.li key={x.label} {...rise(i * 0.08)}>
                <strong>
                  <Count n={x.n} suffix={x.suffix} />
                </strong>
                <span>{x.label}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="v2-ab-sec v2-ab-split">
          <motion.h2 {...rise()}>Selected work</motion.h2>
          <WorkList />
        </section>
      </div>

      <section className="v2-ab-block" style={{ background: FOREST, color: CREAM }}>
        <div className="v2-wrap v2-ab v2-ab-split">
          <motion.h2 {...rise()}>Eight years of making pictures move</motion.h2>
          <ul className="v2-ab-years">
            {EXPERIENCE.map((e, i) => (
              <motion.li key={e.place} {...rise(i * 0.08)}>
                <span className="v2-label">{e.years}</span>
                <strong>{e.place}</strong>
                <span className="v2-ab-years-role">{e.role}</span>
                <p>{e.did}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <div className="v2-wrap v2-ab">

        <section className="v2-ab-sec v2-ab-split">
          <motion.h2 {...rise()}>What I do</motion.h2>
          <div className="v2-ab-two">
            <div>
              <p className="v2-label v2-ab-sub">Skills</p>
              <ul className="v2-tags">
                {SKILLS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="v2-ab-tools">
              <p className="v2-label v2-ab-sub">Tools</p>
              <ul className="v2-tags">
                {TOOLS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <motion.p className="v2-ab-sign" {...rise()}>
          Have a story to tell? Let’s make it move.
        </motion.p>
        <motion.div className="v2-ab-signrow" {...rise(0.05)}>
          <p className="v2-ab-text">Write to me for a full-time role, a freelance project or just to say hello.</p>
          <CopyEmail />
        </motion.div>
      </div>
      <Contact />
    </main>
  )
}
