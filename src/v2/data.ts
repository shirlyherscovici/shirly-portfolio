import { asset } from '../lib/asset'

const v2 = (p: string) => asset(`/v2/${p}`)

export type MediaItem =
  | { kind: 'image'; src: string; alt: string; caption?: string; fit?: 'cover' | 'contain'; ratio?: string }
  | { kind: 'video'; src: string; poster: string; alt: string; caption?: string; captions?: string; ratio?: string }

export type Block =
  | { type: 'full'; media: MediaItem }
  | { type: 'pair'; media: [MediaItem, MediaItem] }
  | { type: 'row'; media: MediaItem[] }
  | { type: 'split'; label: string; ai: string; me: string }

export type Chapter = {
  title: string
  subtitle: string
  text: string
  blocks: Block[]
}

export type Project = {
  slug: string
  /** One big word, Robin-style */
  word: string
  name: string
  kind: string
  colors: { bg: string; fg: string; light: string; dark: string }
  cover: MediaItem
  /** Short loop played on the home slider when this project is active */
  loop?: string
  headline: string
  intro: string
  link?: { label: string; href: string }
  meta: { label: string; value: string }[]
  chapters: Chapter[]
}

export const PROJECTS: Project[] = [
  {
    slug: 'music-from-the-screen',
    word: 'Soundtrack',
    name: 'Music from the Screen',
    kind: 'UI · Key art · Social',
    colors: { bg: '#ff8fb8', fg: '#1d3a2f', light: '#ff8fb8', dark: '#c2346f' },
    cover: { kind: 'image', src: v2('galgalatz/banner-cover.webp'), alt: 'Neon key art for Music from the Screen, N12 × Galgalatz' },
    headline: 'A neon world for a movie-song chart',
    intro:
      'N12 and Galgalatz asked the audience to vote for the best songs from Israeli cinema. I built the visual language around a glowing neon sign, designed the mobile voting flow, and rolled the look out across the social posts that announced each stage of the chart.',
    meta: [
      { label: 'Role', value: 'Key art, UI design, motion' },
      { label: 'Client', value: 'N12 × Galgalatz' },
      { label: 'Format', value: 'Mobile voting flow, social' },
    ],
    chapters: [
      {
        title: 'Key art',
        subtitle: 'One sign that says cinema and music at once',
        text: 'Popcorn, a clapperboard, 3D glasses and a film reel, all drawn as neon tubes on a night skyline. The sign became the anchor that every other screen and post was built from.',
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
        subtitle: 'From the sign to the phone',
        text: 'The voting experience carries the same neon language into a mobile flow: clear steps, big tap targets and a chart that feels like a show rather than a form.',
        blocks: [
          { type: 'full', media: { kind: 'image', src: v2('galgalatz/game-uiux.webp'), alt: 'Voting flow UI screens', fit: 'contain', ratio: '16/10' } },
          {
            type: 'row',
            media: [
              { kind: 'image', src: v2('galgalatz/1-galgaltz-front.webp'), alt: 'Voting screen 1', ratio: '9/16', fit: 'contain' },
              { kind: 'image', src: v2('galgalatz/3-galgaltz-front.webp'), alt: 'Voting screen 2', ratio: '9/16', fit: 'contain' },
              { kind: 'image', src: v2('galgalatz/5-galgaltz-front.webp'), alt: 'Voting screen 3', ratio: '9/16', fit: 'contain' },
            ],
          },
        ],
      },
      {
        title: 'Social rollout',
        subtitle: 'Every stage of the chart, one family',
        text: 'Announcements, winners and the full top 50, each post designed to be recognised in a scrolling feed within a second.',
        blocks: [
          {
            type: 'row',
            media: [
              { kind: 'image', src: v2('galgalatz/img-2.webp'), alt: 'Social post', ratio: '4/5' },
              { kind: 'image', src: v2('galgalatz/img-3.webp'), alt: 'Social post', ratio: '4/5' },
              { kind: 'image', src: v2('galgalatz/img-4.webp'), alt: 'Social post', ratio: '4/5' },
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
    kind: 'Character animation · Motion',
    colors: { bg: '#1f4a3d', fg: '#ffd1e1', light: '#8fd9b6', dark: '#1f4a3d' },
    cover: { kind: 'image', src: v2('motion/people-motion-hero-poster.webp'), alt: 'Animated character in a game-style scene' },
    loop: asset('/assets/motion/clips/02-ui-game-animation.mp4'),
    headline: 'People, told as a playful game world',
    intro:
      'A character-led animated piece where real people move through game-inspired worlds. I designed and animated the characters, the game interfaces and the typography, and built the transitions that carry the story from one world to the next.',
    meta: [
      { label: 'Role', value: 'Design, 2D animation, compositing' },
      { label: 'Tools', value: 'After Effects, Illustrator' },
      { label: 'Format', value: 'Animated film' },
    ],
    chapters: [
      {
        title: 'Highlights',
        subtitle: 'The film at a glance',
        text: 'A short cut of the strongest moments: character work, interface animation and the world changes between scenes.',
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
        title: 'Three crafts',
        subtitle: 'Characters, interfaces, type',
        text: 'Expressive character movement inside animated environments, game interfaces that react and count, and kinetic typography that keeps the story readable while the worlds keep changing.',
        blocks: [
          {
            type: 'row',
            media: [
              { kind: 'video', src: asset('/assets/motion/clips/03-character-animation.mp4'), poster: v2('motion/01-character-selection.webp'), alt: 'Character animation', caption: 'Character animation', ratio: '16/9' },
              { kind: 'video', src: asset('/assets/motion/clips/02-ui-game-animation.mp4'), poster: v2('motion/02-tetris.webp'), alt: 'UI and game animation', caption: 'UI and game animation', ratio: '16/9' },
              { kind: 'video', src: asset('/assets/motion/clips/people-kinetic-typography.mp4'), poster: v2('motion/03-mario-platform.webp'), alt: 'Kinetic typography', caption: 'Kinetic type and transitions', ratio: '16/9' },
            ],
          },
        ],
      },
      {
        title: 'Worlds',
        subtitle: 'Every scene its own game',
        text: 'Each chapter of the film borrows the logic of a different classic game, redrawn in one consistent style.',
        blocks: [
          {
            type: 'pair',
            media: [
              { kind: 'image', src: v2('motion/04-gold-digger.webp'), alt: 'Gold digger scene', ratio: '16/9' },
              { kind: 'image', src: v2('motion/05-icy-tower.webp'), alt: 'Icy tower scene', ratio: '16/9' },
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
    kind: 'AI film · Visual reconstruction',
    colors: { bg: '#d9c7a7', fg: '#24211a', light: '#e6c98f', dark: '#6b5730' },
    cover: { kind: 'image', src: v2('ai/7.webp'), alt: 'AI-reconstructed rescue scene with soldiers and aircraft' },
    loop: asset('/assets/navigator/motion/002.mp4'),
    headline: 'Rebuilding a rescue nobody filmed',
    intro:
      'A rescue operation made headlines, but there was no footage of it. I had four hours to turn the reported facts into a cinematic sequence for prime-time broadcast: directing every frame with AI tools, keeping people, aircraft and terrain consistent from shot to shot, then animating, compositing and editing it into the final film.',
    meta: [
      { label: 'Role', value: 'AI direction, motion, edit' },
      { label: 'Client', value: 'N12' },
      { label: 'Timeline', value: '4 hours to prime time' },
    ],
    chapters: [
      {
        title: 'The film',
        subtitle: 'As it aired',
        text: 'The final sequence, built from scratch, with no real image of the event to start from.',
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
        title: 'Directing the frames',
        subtitle: 'Mood, character and place',
        text: 'Every key frame was directed for story first: the stranded pilot, the command decisions, the extraction. Consistency was the hard part, the same people, the same aircraft, the same mountains in every shot.',
        blocks: [
          {
            type: 'row',
            media: [
              { kind: 'image', src: v2('ai/pilot-crawling-transmitting-202604051655.webp'), alt: 'Pilot transmitting from the ground', caption: 'Pilot, survival', ratio: '16/9' },
              { kind: 'image', src: v2('ai/2.webp'), alt: 'Command scene', caption: 'Command', ratio: '16/9' },
              { kind: 'image', src: v2('ai/7.webp'), alt: 'Extraction scene', caption: 'Extraction', ratio: '16/9' },
            ],
          },
        ],
      },
      {
        title: 'Who did what',
        subtitle: 'The tools and the hand',
        text: 'AI made the impossible footage possible. The decisions, the accuracy and the finish were mine.',
        blocks: [
          {
            type: 'split',
            label: 'Division of work',
            ai: 'Generated base frames and short motion passes from my prompts and references.',
            me: 'Story and shot list, art direction, continuity across shots, fixing and compositing, animation, edit, captions and broadcast delivery.',
          },
        ],
      },
    ],
  },
  {
    slug: 'amy',
    word: 'Amy',
    name: 'Amy, forever 27',
    kind: 'Editorial identity · Art direction',
    colors: { bg: '#d7263d', fg: '#fff1e0', light: '#ff6b7d', dark: '#b3122b' },
    cover: { kind: 'image', src: v2('amy/hero-banner.webp'), alt: 'Amy Winehouse editorial banner with tattoo-inspired collage' },
    headline: 'An identity for a music icon',
    intro:
      'An N12 special on Amy Winehouse and the 27 Club. I art-directed the visual identity, from early explorations to a final language of tattoo culture, distressed print textures and 27 Club references, and applied it across the banner, the article and mobile.',
    link: { label: 'View live project', href: 'https://special.n12.co.il/AmyWinehouse' },
    meta: [
      { label: 'Role', value: 'Art direction, graphic design' },
      { label: 'Client', value: 'N12' },
      { label: 'Format', value: 'Editorial special, web and mobile' },
    ],
    chapters: [
      {
        title: 'Finding the direction',
        subtitle: 'Four routes, one answer',
        text: 'I tested bold portraiture, a louder colour route and a quiet monochrome version before landing on the final direction: tattoo flash, torn paper and print grain that feel as raw as the music.',
        blocks: [
          {
            type: 'row',
            media: [
              { kind: 'image', src: v2('amy/concept-1.webp'), alt: 'Exploration 1', caption: 'Bold and expressive', ratio: '16/9' },
              { kind: 'image', src: v2('amy/concept-2.webp'), alt: 'Exploration 2', caption: 'Colour and character', ratio: '16/9' },
              { kind: 'image', src: v2('amy/concept-3.webp'), alt: 'Exploration 3', caption: 'Mood and restraint', ratio: '16/9' },
            ],
          },
        ],
      },
      {
        title: 'The final identity',
        subtitle: 'Editorial and iconic',
        text: 'The banner leads, and the same language carries through the article layout and the portraits of the 27 Club.',
        blocks: [
          { type: 'full', media: { kind: 'image', src: v2('amy/hero-banner.webp'), alt: 'Final banner', ratio: '1304/800' } },
          { type: 'full', media: { kind: 'image', src: v2('amy/grid-desktop.webp'), alt: 'Desktop layout', ratio: '16/9' } },
        ],
      },
      {
        title: 'On every screen',
        subtitle: 'Built for mobile first',
        text: 'Most readers met the story on their phones, so the mobile layout was designed alongside the desktop one, not after it.',
        blocks: [
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

export type PaletteName = 'color' | 'night' | 'paper'
export const PALETTES: { name: PaletteName; label: string; swatch: string[] }[] = [
  { name: 'color', label: 'Color', swatch: ['#ff8fb8', '#1f4a3d', '#d7263d'] },
  { name: 'night', label: 'Night', swatch: ['#111111', '#ff8fb8', '#8fd9b6'] },
  { name: 'paper', label: 'Paper', swatch: ['#f3ede3', '#1f4a3d', '#c2346f'] },
]

export function themeFor(p: Project, palette: PaletteName): { bg: string; fg: string } {
  if (palette === 'night') return { bg: '#111111', fg: p.colors.light }
  if (palette === 'paper') return { bg: '#f3ede3', fg: p.colors.dark }
  return { bg: p.colors.bg, fg: p.colors.fg }
}
