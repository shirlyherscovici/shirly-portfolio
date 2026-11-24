import { asset } from '../lib/asset'

const v2 = (p: string) => asset(`/v2/${p}`)

export type MediaItem =
  | { kind: 'image'; src: string; alt: string; caption?: string; fit?: 'cover' | 'contain'; ratio?: string }
  | { kind: 'video'; src: string; poster: string; alt: string; caption?: string; captions?: string; ratio?: string }

/** Reusable case-study modules. Each project picks the ones its material supports. */
export type Block =
  | { type: 'full'; media: MediaItem }
  | { type: 'pair'; media: [MediaItem, MediaItem] }
  | { type: 'row'; media: MediaItem[] }
  | { type: 'gallery'; media: MediaItem[] }
  | { type: 'compare'; before: MediaItem; after: MediaItem }
  | { type: 'split'; label: string; ai: string; me: string }

export type Chapter = { title: string; text?: string; blocks: Block[] }

export type Project = {
  slug: string
  /** One big word on the home film strip */
  word: string
  name: string
  kind: string
  /** The project's own colours, taken from its artwork */
  colors: { bg: string; fg: string }
  cover: MediaItem
  loop?: string
  intro: string
  link?: { label: string; href: string }
  credits: { label: string; value: string }[]
  chapters: Chapter[]
}

export const SHELL = { bg: '#181818', fg: '#f0f0f0', paper: '#f0efeb', ink: '#181818' }

export const PROJECTS: Project[] = [
  {
    slug: 'music-from-the-screen',
    word: 'Soundtrack',
    name: 'Music from the Screen',
    kind: 'Key art · UI · Social',
    colors: { bg: '#1c1540', fg: '#ff7eb6' },
    cover: { kind: 'image', src: v2('galgalatz/banner-cover.webp'), alt: 'Neon key art for Music from the Screen, N12 × Galgalatz' },
    intro:
      'A chart of songs from Israeli cinema, for N12 and Galgalatz. I created the neon key art, designed the mobile voting flow and carried the look through the social posts of the campaign.',
    credits: [
      { label: 'Role', value: 'Key art, UI design, motion' },
      { label: 'Client', value: 'N12 × Galgalatz' },
    ],
    chapters: [
      {
        title: 'Key art',
        blocks: [
          {
            type: 'pair',
            media: [
              { kind: 'image', src: v2('galgalatz/banner-cover.webp'), alt: 'Square key art with the neon sign', ratio: '1/1' },
              { kind: 'image', src: v2('galgalatz/poster-galgalts.webp'), alt: 'Vertical poster version', ratio: '1/1' },
            ],
          },
        ],
      },
      {
        title: 'Voting flow',
        blocks: [
          { type: 'full', media: { kind: 'image', src: v2('galgalatz/game-uiux.webp'), alt: 'Voting flow UI screens', fit: 'contain', ratio: '16/10' } },
          {
            type: 'row',
            media: [
              { kind: 'image', src: v2('galgalatz/1-galgaltz-front.webp'), alt: 'Voting screen', ratio: '9/16', fit: 'contain' },
              { kind: 'image', src: v2('galgalatz/3-galgaltz-front.webp'), alt: 'Voting screen', ratio: '9/16', fit: 'contain' },
              { kind: 'image', src: v2('galgalatz/5-galgaltz-front.webp'), alt: 'Voting screen', ratio: '9/16', fit: 'contain' },
            ],
          },
        ],
      },
      {
        title: 'Social',
        blocks: [
          {
            type: 'gallery',
            media: [
              { kind: 'image', src: v2('galgalatz/img-2.webp'), alt: 'Social post', ratio: '4/5' },
              { kind: 'image', src: v2('galgalatz/img-3.webp'), alt: 'Social post', ratio: '4/5' },
              { kind: 'image', src: v2('galgalatz/img-4.webp'), alt: 'Social post', ratio: '4/5' },
              { kind: 'image', src: v2('galgalatz/img-7.webp'), alt: 'Social post', ratio: '4/5' },
              { kind: 'image', src: v2('galgalatz/img-1.webp'), alt: 'Social post', ratio: '4/5' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'people-in-motion',
    word: 'Motion',
    name: 'People in Motion',
    kind: '2D animation · Motion design',
    colors: { bg: '#24563f', fg: '#f6dcb8' },
    cover: { kind: 'image', src: v2('motion/people-motion-hero-poster.webp'), alt: 'Animated character in a game-style scene' },
    loop: asset('/assets/motion/clips/02-ui-game-animation.mp4'),
    intro: 'A character-led motion project built as a playful game world: character animation, UI and game animation, kinetic typography and transitions.',
    credits: [{ label: 'Role', value: 'Design, 2D animation, compositing' }],
    chapters: [
      {
        title: 'Highlights',
        blocks: [
          {
            type: 'full',
            media: {
              kind: 'video',
              src: asset('/assets/motion/gameplay_highlight_final.mp4'),
              poster: v2('motion/people-motion-hero-poster.webp'),
              alt: 'Highlight cut of the animation',
              ratio: '16/9',
            },
          },
        ],
      },
      {
        title: 'Craft',
        blocks: [
          {
            type: 'row',
            media: [
              { kind: 'video', src: asset('/assets/motion/clips/03-character-animation.mp4'), poster: v2('motion/01-character-selection.webp'), alt: 'Character animation', caption: 'Expressive character movement integrated into animated environments.', ratio: '16/9' },
              { kind: 'video', src: asset('/assets/motion/clips/02-ui-game-animation.mp4'), poster: v2('motion/02-tetris.webp'), alt: 'UI and game animation', caption: 'Animated interfaces, game systems and responsive graphic elements.', ratio: '16/9' },
              { kind: 'video', src: asset('/assets/motion/clips/people-kinetic-typography.mp4'), poster: v2('motion/03-mario-platform.webp'), alt: 'Kinetic typography', caption: 'Animated typography, scene transitions and visual continuity across changing worlds.', ratio: '16/9' },
            ],
          },
        ],
      },
      {
        title: 'Worlds',
        blocks: [
          {
            type: 'gallery',
            media: [
              { kind: 'image', src: v2('motion/04-gold-digger.webp'), alt: 'Scene still', ratio: '16/9' },
              { kind: 'image', src: v2('motion/05-icy-tower.webp'), alt: 'Scene still', ratio: '16/9' },
              { kind: 'image', src: v2('motion/02-tetris.webp'), alt: 'Scene still', ratio: '16/9' },
              { kind: 'image', src: v2('motion/03-mario-platform.webp'), alt: 'Scene still', ratio: '16/9' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pilot-rescue',
    word: 'Rescue',
    name: 'USA Pilot Rescue',
    kind: 'AI film · Visual storytelling',
    colors: { bg: '#b8a98c', fg: '#1d1d18' },
    cover: { kind: 'image', src: v2('ai/7.webp'), alt: 'AI-generated rescue scene with soldiers and aircraft' },
    loop: asset('/assets/navigator/motion/002.mp4'),
    intro:
      'There was no real image of the rescue. I had four hours to build it as a cinematic sequence for prime-time broadcast: frame direction, AI motion generation, continuity, compositing and final delivery.',
    credits: [
      { label: 'Role', value: 'AI direction, motion, compositing, edit' },
      { label: 'Client', value: 'N12' },
      { label: 'Timeline', value: '4 hours to prime time' },
    ],
    chapters: [
      {
        title: 'The film',
        blocks: [
          {
            type: 'full',
            media: {
              kind: 'video',
              src: asset('/assets/navigator/main-film.mp4'),
              poster: v2('ai/main-film-frame.webp'),
              captions: asset('/assets/navigator/captions-en.vtt'),
              alt: 'USA Pilot Rescue final film',
              ratio: '16/9',
            },
          },
        ],
      },
      {
        title: 'Frames',
        blocks: [
          {
            type: 'row',
            media: [
              { kind: 'image', src: v2('ai/pilot-crawling-transmitting-202604051655.webp'), alt: 'Pilot on the ground', caption: 'Directed character, environment and cinematic mood.', ratio: '16/9' },
              { kind: 'image', src: v2('ai/2.webp'), alt: 'Command scene', caption: 'Controlled environment, information and visual continuity.', ratio: '16/9' },
              { kind: 'image', src: v2('ai/7.webp'), alt: 'Extraction scene', caption: 'Consistent people, aircraft and environment across the sequence.', ratio: '16/9' },
            ],
          },
        ],
      },
      {
        title: 'AI and me',
        blocks: [
          {
            type: 'split',
            label: 'Division of work',
            ai: 'Generated frames and motion from my direction.',
            me: 'Frame direction, continuity, compositing, edit and broadcast delivery.',
          },
        ],
      },
    ],
  },
  {
    slug: 'amy',
    word: 'Amy',
    name: 'Amy',
    kind: 'Editorial identity · Art direction',
    colors: { bg: '#c41e2e', fg: '#f4e3c4' },
    cover: { kind: 'image', src: v2('amy/hero-banner.webp'), alt: 'Amy Winehouse editorial banner with tattoo-inspired collage' },
    intro:
      'An N12 special inspired by Amy Winehouse and the 27 Club: art direction, banner development, identity assets, before and after image treatments and responsive applications.',
    link: { label: 'View live project', href: 'https://special.n12.co.il/AmyWinehouse' },
    credits: [
      { label: 'Role', value: 'Art direction, graphic design' },
      { label: 'Client', value: 'N12' },
    ],
    chapters: [
      {
        title: 'Directions',
        blocks: [
          {
            type: 'row',
            media: [
              { kind: 'image', src: v2('amy/concept-1.webp'), alt: 'Exploration', caption: 'Strong contrast, portraiture and immediate visual impact.', ratio: '16/9' },
              { kind: 'image', src: v2('amy/concept-2.webp'), alt: 'Exploration', caption: 'Color, portrait placement and tattoo-inspired visual language.', ratio: '16/9' },
              { kind: 'image', src: v2('amy/concept-3.webp'), alt: 'Exploration', caption: 'Monochrome treatment and a quieter editorial tone.', ratio: '16/9' },
            ],
          },
        ],
      },
      {
        title: 'Final identity',
        text: 'Tattoo culture, distressed print textures and 27 Club references in one cohesive identity.',
        blocks: [
          { type: 'full', media: { kind: 'image', src: v2('amy/hero-banner.webp'), alt: 'Final banner', ratio: '1304/800' } },
        ],
      },
      {
        title: 'Before and after',
        blocks: [
          {
            type: 'compare',
            before: { kind: 'image', src: v2('amy/005-before.webp'), alt: 'Original archive photo', ratio: '1/1' },
            after: { kind: 'image', src: v2('amy/005-after.webp'), alt: 'Final treatment', ratio: '1/1' },
          },
          {
            type: 'compare',
            before: { kind: 'image', src: v2('amy/008-before.webp'), alt: 'Original archive photo', ratio: '1/1' },
            after: { kind: 'image', src: v2('amy/008-after.webp'), alt: 'Final treatment', ratio: '1/1' },
          },
        ],
      },
      {
        title: 'Responsive',
        blocks: [
          { type: 'full', media: { kind: 'image', src: v2('amy/grid-desktop.webp'), alt: 'Desktop layout', ratio: '16/9' } },
          {
            type: 'pair',
            media: [
              { kind: 'image', src: v2('amy/amy-phones-front.webp'), alt: 'Mobile screens', ratio: '3/4', fit: 'contain' },
              { kind: 'image', src: v2('amy/grid-mobile.webp'), alt: 'Mobile layout', ratio: '3/4' },
            ],
          },
        ],
      },
    ],
  },
]

export const PERSON = {
  name: 'Shirly Herscovici',
  role: 'Motion, AI & graphic designer',
  email: 'shirly3212@gmail.com',
  linkedin: 'https://www.linkedin.com/in/shirly-herscovici/',
  cv: asset('/resume.pdf'),
}
