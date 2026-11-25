import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { PERSON, PROJECTS } from './data'
import { href, useTone } from './store'
import { Contact } from './Contact'

const ease = [0.22, 1, 0.36, 1] as const

/* Laid out like robin-noguier.com/about: a hello, a short intro, then At work,
 * the work, the people I've worked with, the years, and a sign-off. Every fact
 * here comes from the projects on this site or from Shirly's own CV. */

const EXPERIENCE = [
  { years: '2021 – now', place: 'N12', role: 'Graphic designer and After Effects artist', where: 'Israel' },
  { years: '2020 – 2021', place: 'Juno Media', role: 'Graphic designer, video editor and After Effects artist', where: 'Israel' },
  { years: '2018 – 2020', place: 'IDF Education and Youth Corps', role: 'Film unit director, editing and post team lead', where: 'Israel' },
]

const CLIENTS = ['N12', 'Galgalatz', 'One a Day podcast', 'Juno Media', 'IDF Education and Youth Corps']

/** One line per project, in the order of the home page */
const LINES: Record<string, string> = {
  'pilot-rescue': 'From the brief to a prime-time AI film in four hours.',
  louvre: 'The Louvre jewel heist rebuilt shot by shot, cut for web and mobile.',
  partner: 'A podcast story with no pictures, animated with Flow in four parts.',
  amy: 'An editorial identity for N12’s Amy Winehouse and 27 Club special.',
  'people-in-motion': 'Character animation, game UI and kinetic type in one playful world.',
  eighties: 'An AI film set in a teenage bedroom of the 1980s.',
  quiz: 'One AI illustration per question for N12’s Independence Day trivia.',
  'music-from-the-screen': 'Neon key art and a mobile voting flow for N12 and Galgalatz.',
}

const SKILLS = ['Motion graphics', 'Realistic AI visuals', 'AI film', '2D animation', 'Graphic and banner design', 'UI and web design', 'Video editing']
const TOOLS = ['After Effects', 'Premiere Pro', 'Photoshop', 'Illustrator', 'Figma', 'ChatGPT', 'Flow', 'Claude', 'Magnific', 'HTML and CSS']

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-8% 0px' },
  transition: { duration: 0.8, ease, delay },
})

export function About() {
  const { setTone } = useTone()
  useEffect(() => setTone({ bg: '#fbf8f3', fg: '#171717' }), [setTone])

  const words = ['Shalom,', 'I’m', 'Shirly']
  return (
    <main className="v2-aboutpage">
      <div className="v2-wrap v2-ab">
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
          A motion designer from Israel. I make realistic AI films for the news, and the motion, graphics and
          interactive pieces around them.
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

        <motion.p className="v2-ab-big" {...rise()}>
          Most of my work is for N12, where a story can break in the morning and air as a film the same night.
        </motion.p>

        <section className="v2-ab-sec">
          <motion.h2 {...rise()}>At work</motion.h2>
          <motion.p className="v2-ab-text" {...rise(0.05)}>
            When there is no footage, I build it. The producer asks for an idea; I shape the images in ChatGPT, write a
            short script and a storyboard, generate every shot separately in Flow and edit them into one film,
            keeping the people, the places and the light consistent from shot to shot. The USA Pilot Rescue went from
            brief to prime time in four hours.
          </motion.p>
          <motion.p className="v2-ab-text" {...rise(0.1)}>
            Around the films I animate characters and game worlds, build editorial identities and design for the
            screen, from banners to a mobile voting flow. I love learning new tools, and I’m currently growing into 3D.
          </motion.p>
        </section>

        <section className="v2-ab-sec">
          <motion.h2 {...rise()}>Selected work</motion.h2>
          <ul className="v2-ab-work">
            {PROJECTS.map((p, i) => (
              <motion.li key={p.slug} {...rise(i * 0.04)}>
                <a href={href.project(p.slug)} style={{ ['--c' as string]: p.colors.bg }}>
                  <strong>{p.name}</strong>
                  <span>{LINES[p.slug] ?? p.kind}</span>
                  <span className="v2-label">{p.kind}</span>
                </a>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="v2-ab-sec">
          <motion.h2 {...rise()}>Worked with</motion.h2>
          <motion.ul className="v2-ab-clients" {...rise(0.05)}>
            {CLIENTS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </motion.ul>
        </section>

        <section className="v2-ab-sec">
          <motion.h2 {...rise()}>Eight years of making pictures move</motion.h2>
          <ul className="v2-ab-time">
            {EXPERIENCE.map((e, i) => (
              <motion.li key={e.place} {...rise(i * 0.06)}>
                <span className="v2-label">{e.years}</span>
                <span>
                  <strong>{e.place}</strong>
                  <br />
                  {e.role}
                </span>
                <span className="v2-ab-where">{e.where}</span>
              </motion.li>
            ))}
          </ul>
        </section>

        <section className="v2-ab-sec v2-ab-two">
          <div>
            <motion.h2 {...rise()}>What I do</motion.h2>
            <ul className="v2-tags">
              {SKILLS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <motion.h2 {...rise()}>Tools</motion.h2>
            <ul className="v2-tags">
              {TOOLS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>

        <motion.p className="v2-ab-sign" {...rise()}>
          Have a story to tell? Let’s make it move.
        </motion.p>
        <motion.p className="v2-ab-text" {...rise(0.05)}>
          Write to me for a full-time role, a freelance project or just to say hello.
        </motion.p>
      </div>
      <Contact />
    </main>
  )
}
