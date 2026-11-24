import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PERSON, PROJECTS } from './data'
import { href, useTone } from './store'
import { Contact } from './Contact'

const ease = [0.22, 1, 0.36, 1] as const

const EXPERIENCE = [
  { years: '2021 – now', place: 'N12', role: 'Graphic designer and After Effects artist' },
  { years: '2020 – 2021', place: 'Juno Media', role: 'Graphic designer, video editor and After Effects artist' },
  { years: '2018 – 2020', place: 'IDF Education and Youth Corps', role: 'Film unit director, editing and post team lead' },
]

const SKILLS = ['Motion graphics', '2D animation', 'AI visual production', 'Graphic and banner design', 'UI and web design', 'Video editing']
const TOOLS = ['After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator', 'Figma', 'HTML and CSS', 'AI image and video tools']

export function About() {
  const { setTone } = useTone()
  const reduce = useReducedMotion()
  useEffect(() => setTone({ bg: '#fbf8f3', fg: '#171717' }), [setTone])

  const words = ['Hi,', "I'm", 'Shirly.']
  return (
    <main className="v2-aboutpage">
      <div className="v2-wrap">
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
        <motion.p className="v2-lede v2-about-lede" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9, ease }}>
          I'm a designer who moves between motion, animation, AI and graphic design, and I build the
          interactive pieces too. For years I've worked on fast, high-stakes visuals, where a piece has to be right
          and on time. I love learning new tools, and I'm currently growing into 3D.
        </motion.p>

        <div className="v2-about-cols">
          <section>
            <p className="v2-label">Experience</p>
            <ul className="v2-list">
              {EXPERIENCE.map((e) => (
                <li key={e.place}>
                  <span className="v2-list-years">{e.years}</span>
                  <span>
                    <strong>{e.place}</strong>
                    <br />
                    {e.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <p className="v2-label">What I do</p>
            <ul className="v2-tags">
              {SKILLS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="v2-label" style={{ marginTop: 32 }}>
              Tools
            </p>
            <ul className="v2-tags">
              {TOOLS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="v2-about-work">
          <p className="v2-label">Selected work</p>
          <ul>
            {PROJECTS.map((p) => (
              <li key={p.slug}>
                <a href={href.project(p.slug)} data-cursor="View" style={{ ['--c' as string]: p.colors.bg }}>
                  <span className="v2-about-work-word">{p.word}</span>
                  <span className="v2-label">{p.kind}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <p className="v2-label" style={{ marginTop: 40 }}>
          <a className="v2-link" href={PERSON.cv} target="_blank" rel="noopener noreferrer">
            Download CV (PDF) ↗
          </a>
        </p>
      </div>
      <Contact />
    </main>
  )
}
