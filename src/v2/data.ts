import { asset } from '../lib/asset'

const v2 = (p: string) => asset(`/v2/${p}`)

export type MediaItem =
  | { kind: 'image'; src: string; alt: string; caption?: string; fit?: 'cover' | 'contain'; ratio?: string; /** focal point when cropped, e.g. '50% 0%' */ pos?: string }
  | { kind: 'video'; src: string; poster: string; alt: string; caption?: string; captions?: string; ratio?: string }

/** Reusable case-study modules. Each project picks the ones its material supports. */
export type Block =
  | { type: 'full'; media: MediaItem }
  | { type: 'pair'; media: [MediaItem, MediaItem] }
  | { type: 'row'; media: MediaItem[] }
  | { type: 'gallery'; media: MediaItem[] }
  | { type: 'compare'; before: MediaItem; after: MediaItem }
  | { type: 'split'; label: string; ai: string; me: string }


export type Project = {
  slug: string
  /** One big word on the home film strip */
  word: string
  name: string
  kind: string
  /** The project's own colours, taken from its artwork */
  colors: { bg: string; fg: string }
  /** The project page hero: a lighter or flipped version of the home colours, so the entry wipe reads */
  hero: { bg: string; fg: string; /** title outline where it crosses the cover, when the ink would sink into it */ over?: string }
  cover: MediaItem
  loop?: string
  /** Small preview on the home page when the project has no loop video */
  peek?: string
  /** Shape of the cover on the home film strip (width / height) */
  frame: { ratio: number; /** home window: how far the picture overscans (top, height of its drift box), when a logo sits near an edge */ fit?: { top: string; h: string; /** show the picture whole, on this backdrop, instead of cropping it */ whole?: string } }
  intro: string
  /** A shorter line for the home page, when the intro's first sentence runs too long */
  homeLine?: string
  link?: { label: string; href: string }
  credits: { label: string; value: string }[]
}

/** Where a cropped cover keeps its focus */
export const coverPos = (p: Project) => (p.cover.kind === 'image' ? p.cover.pos : undefined)

export const SHELL = { bg: '#181818', fg: '#f0f0f0', paper: '#f0efeb', ink: '#181818' }
/** The dark room the case study content sits in */
export const DARK = { bg: '#111111', fg: '#ececec' }

/** Every project, including ones taken off the site for now */
export const ALL_PROJECTS: Project[] = [
  {
    slug: 'pilot-rescue',
    word: 'Rescue',
    frame: { ratio: 16 / 9 },
    name: 'USA Pilot Rescue',
    kind: 'AI film · Visual storytelling',
    colors: { bg: '#c8102e', fg: '#ffffff' },
    hero: { bg: '#f7f5f2', fg: '#c8102e' },
    cover: { kind: 'image', src: v2('ai/pilot-crawling-transmitting-202604051655.webp'), alt: 'The navigator kneeling on the rocky mountainside at night, sending a signal, a frame from the film' },
    loop: asset('/assets/navigator/motion/002.mp4'),
    intro:
      'There was no real image of the rescue. I had four hours to build it as a cinematic sequence for prime-time broadcast: frame direction, AI motion generation, continuity, compositing and final delivery.',
    credits: [
      { label: 'Role', value: 'AI direction, motion, compositing, edit' },
      { label: 'Client', value: 'N12' },
      { label: 'Timeline', value: '4 hours to prime time' },
    ],
  },
  {
    slug: 'amy',
    word: 'Amy',
    frame: { ratio: 1.63 },
    name: 'Amy',
    kind: 'Editorial identity · Art direction',
    colors: { bg: '#f6efe3', fg: '#d7263d' },
    hero: { bg: '#d7263d', fg: '#f6efe3' },
    cover: { kind: 'image', src: v2('amy/hero-banner.webp'), alt: 'Amy Winehouse editorial banner with tattoo-inspired collage' },
    peek: v2('amy/grid-desktop.webp'),
    homeLine: 'An episode of N12’s Culture Gaps series on Amy Winehouse and the 27 Club: its concept and design language.',
    intro:
      'An episode of N12’s Culture Gaps series on Amy Winehouse and the 27 Club: the concept and design language, built in Storycard, banners in every size and before and after image treatments.',
    link: { label: 'View live project', href: 'https://special.n12.co.il/AmyWinehouse' },
    credits: [
      { label: 'Role', value: 'Concept, design language, banners' },
      { label: 'Client', value: 'N12 · Culture Gaps' },
    ],
  },
  {
    slug: 'louvre',
    word: 'Louvre',
    frame: { ratio: 16 / 9, fit: { top: '-9%', h: '106%' } },
    name: 'The Louvre Heist',
    kind: 'AI film · N12',
    colors: { bg: '#14171b', fg: '#d9b25f' },
    hero: { bg: '#ece6da', fg: '#14171b', over: '#d9b25f' },
    cover: { kind: 'image', src: v2('louvre/banner.webp'), alt: 'Two masked thieves by a broken jewel case with the crown, titled 8 Minutes', pos: '68% 50%' },
    loop: v2('louvre/loop.mp4'),
    peek: v2('louvre/crown-flight.webp'),
    intro: 'A 70-second AI film for N12 that rebuilds the Louvre jewel heist shot by shot, delivered in 16:9 for web and 9:16 for mobile.',
    credits: [{ label: 'Client', value: 'N12' }],
  },
  {
    slug: 'music-from-the-screen',
    word: 'Soundtrack',
    frame: { ratio: 1, fit: { top: '-3%', h: '106%', whole: 'linear-gradient(#170240, #2c077a 50%, #17023e)' } },
    name: 'Music from the Screen',
    kind: 'Key art · UI · Social',
    colors: { bg: '#f8a9fb', fg: '#14052e' },
    hero: { bg: '#14052e', fg: '#f8a9fb' },
    cover: { kind: 'image', src: v2('galgalatz/cover-phones.webp'), alt: 'Three screens of the Music from the Screen voting flow, N12 × Galgalatz' },
    peek: v2('galgalatz/rank-01.webp'),
    intro:
      'A chart of songs from Israeli cinema, for N12 and Galgalatz. I created the neon key art, designed the mobile voting flow and carried the look through the social posts of the campaign.',
    credits: [
      { label: 'Role', value: 'Key art, UI design, motion' },
      { label: 'Client', value: 'N12 × Galgalatz' },
    ],
  },
  {
    slug: 'partner',
    word: 'Partner',
    frame: { ratio: 1, fit: { top: '-3%', h: '106%' } },
    name: 'The Partner',
    kind: 'AI animation · Podcast series',
    colors: { bg: '#e8a44a', fg: '#0b1d24' },
    hero: { bg: '#0b1d24', fg: '#e8a44a' },
    cover: { kind: 'image', src: v2('partner/banner.webp'), alt: 'The Partner: a long shadow on a rooftop over the city at sunset', pos: '50% 0%' },
    loop: v2('partner/loop-1.mp4'),
    peek: v2('partner/banner.webp'),
    intro: 'A short series from N12’s daily podcast One a Day, turned into animated films with Flow.',
    credits: [],
  },
  {
    slug: 'people-in-motion',
    word: 'Motion',
    frame: { ratio: 16 / 9 },
    name: 'People in Motion',
    kind: '2D animation · Motion design',
    // taken from the film's game world: mine earth, gold nuggets, sky
    colors: { bg: '#4a1d16', fg: '#f6b42c' },
    hero: { bg: '#dff1fb', fg: '#4a1d16' },
    cover: { kind: 'image', src: v2('motion/cover-poster.webp'), alt: 'The character working a mine winch in the gold-digging game world of the film' },
    loop: asset('/assets/motion/clips/02-ui-game-animation.mp4'),
    intro: 'A character-led motion project built as a playful game world: character animation, UI and game animation, kinetic typography and transitions.',
    credits: [{ label: 'Role', value: 'Design, 2D animation, compositing' }],
  },
  {
    slug: 'quiz',
    word: 'Quiz',
    frame: { ratio: 1200 / 630 },
    name: 'Was It or Wasn’t It?',
    kind: 'AI images · N12 trivia',
    colors: { bg: '#15335e', fg: '#f4ead2' },
    hero: { bg: '#f4ead2', fg: '#15335e' },
    cover: { kind: 'image', src: v2('quiz/banner-share.webp'), alt: 'Key art of the Was It or Wasn’t It quiz, with stamp portraits' },
    peek: v2('quiz/ben-gurion.webp'),
    intro: 'Retro pop-art illustrations for a playable trivia quiz, one picture per question, all in the same halftone print style.',
    credits: [],
  },
  {
    slug: 'eighties',
    word: 'Eighties',
    frame: { ratio: 16 / 9 },
    name: 'Yardena & Ofira — an 80s room',
    kind: 'AI film · Art direction',
    colors: { bg: '#ff3e9a', fg: '#1a0b2e' },
    hero: { bg: '#14110f', fg: '#ff3e9a' },
    cover: { kind: 'image', src: v2('eighties/cover.webp'), alt: 'A teenage bedroom of the 1980s with posters and a cassette radio' },
    loop: v2('eighties/loop.mp4'),
    peek: v2('eighties/magazine.webp'),
    intro: 'A 35-second AI film set in a teenage bedroom of the 1980s, built around the pop rivalry of Yardena Arazi and Ofra Haza.',
    credits: [],
  },
]

/** Taken off the site for now; remove a slug from this list to bring the project back */
export const HIDDEN_PROJECTS = ['quiz', 'eighties']

export const PROJECTS: Project[] = ALL_PROJECTS.filter((p) => !HIDDEN_PROJECTS.includes(p.slug))

export const PERSON = {
  name: 'Shirly Herscovici',
  role: 'Motion & graphic designer · AI video creator',
  line: 'Realistic AI films for the news, and 8+ years of motion and design.',
  email: 'shirly3212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/shirly-herscovici/',
  cv: asset('/Resume.pdf'),
}
