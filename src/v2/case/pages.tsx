/* The case studies. Copy comes only from text already written for the portfolio;
 * every picture and clip is a real project asset. */
import type { ReactNode } from 'react'
import { asset } from '../../lib/asset'
import {
  Act,
  Chapter,
  Compare,
  Film,
  FlipWall,
  FrameToMotion,
  Gap,
  Grid,
  Intro,
  Palette,
  Pipeline,
  Placed,
  Reveal,
  Stack,
  Statement,
  Steps,
  Visual,
  useLightbox,
  type Img,
} from './blocks'
import { DriftRows, StampPalette, NeonSign, VoteChart, Countdown, ChannelSurf, ClipReel, SeriesStage, RealVsFilm, TruthOrFake, Vault, type Question, type Scene } from './rich'

const v2 = (p: string) => asset(`/v2/${p}`)
const A = (p: string) => asset(`/assets/${p}`)

export type Case = {
  theme: 'amy' | 'motion' | 'rescue' | 'soundtrack' | 'louvre' | 'eighties' | 'quiz' | 'partner'
  /** Colours of the first act, used before any act reaches the middle of the screen */
  acts: { bg: string; fg: string }
  heroVideo?: string
  credits: { label: string; value: string }[]
  body: ReactNode
}

/* ======================================================================
 * 01 · AMY — editorial brand story
 * ==================================================================== */
const AMY = { paper: '#f6efe3', ink: '#141212', red: '#d7263d', gold: '#c58a58' }
const ba = (n: string, alt: string) => ({
  before: { src: v2(`amy/ba/${n}-before.webp`), alt: `Original archive photo, ${alt}` },
  after: { src: v2(`amy/ba/${n}-after.webp`), alt: `Final treatment, ${alt}`, ratio: '1 / 1' },
})
const amyPairs = ['001', '002', '003', '004', '006', '007', '008', '009', '010', '011'].map((n) => ba(n, `portrait ${n}`))

/* A cropped detail that opens the whole picture */
function AmyCrop({ src, pos, alt }: { src: string; pos: string; alt: string }) {
  const open = useLightbox()
  return (
    <button type="button" className="cs-amy-crop" onClick={() => open({ src, alt })} aria-label={`Enlarge: ${alt}`}>
      <img src={src} alt="" loading="lazy" style={{ objectPosition: pos }} />
      <span className="cs-enlarge" aria-hidden="true">Enlarge ↗</span>
    </button>
  )
}

const amyBody = (
  <>
    <Act bg={AMY.paper} fg={AMY.ink} accent={AMY.red}>
      <Intro
        title="Amy Winehouse — N12 Special"
        text="An episode of Culture Gaps, an N12 corner that tells the stories of fringe artists and cultural gaps people never knew about. For the Amy Winehouse and 27 Club episode I designed the concept and the design language, built the episode in Storycard from the content I was given, and made its banners in every size and all of its visual elements."
        meta={[
          { label: 'Client', value: 'N12 · Culture Gaps series' },
          { label: 'Role', value: 'Concept, design language, banners' },
          { label: 'Built in', value: 'Storycard' },
          { label: 'Impact', value: 'Views 24,500 → 67,418' },
        ]}
        link={{ label: 'View live project', href: 'https://special.n12.co.il/AmyWinehouse' }}
        linkStyle={{ background: AMY.red, color: AMY.paper }}
      />
      <div className="cs-wrap-wide cs-amy-open">
        <Compare before={{ src: v2('amy/005-before.webp'), alt: 'Original archive photo' }} after={{ src: v2('amy/005-after.webp'), alt: 'Final treatment', ratio: '1 / 1' }} labels={['Original', 'Final']} />
        <p className="cs-caption">Drag the line: the archive photo, and the same photo in the episode’s treatment.</p>
      </div>
      <Gap size="s" />
      <div className="cs-wrap cs-stat">
        <Reveal>
          <p className="cs-label">Impact</p>
          <p className="cs-stat-num">
            24,500 <span aria-hidden="true">→</span><span className="cs-sr"> to </span> 67,418
          </p>
          <p className="cs-stat-note">Views of the special grew from 24,500 to 67,418.</p>
        </Reveal>
      </div>
      <Gap />

      <Chapter num="01" title="The final banner" note="The final direction brings tattoo culture, distressed print textures and 27 Club references into one cohesive identity." />
      <Visual m={{ src: v2('amy/hero-banner.webp'), alt: 'Final campaign banner', label: 'Final banner', ratio: '1304 / 800' }} bleed parallax />
      <Gap />

      <Chapter num="02" title="Early banners" note="Earlier banner versions made on the way to the final one. Each tested a direction, and together they shaped the episode’s visual language. Open any of them to look closer." />
      <div className="cs-wrap-wide cs-amy-trio is-early">
        <Visual m={{ src: v2('amy/concept-1.webp'), alt: 'Early banner, first direction', label: 'Early banner · 01', caption: 'Early exploration focused on strong contrast, portraiture and immediate visual impact.', ratio: '16 / 10' }} className="is-lead" />
        <Visual m={{ src: v2('amy/concept-2.webp'), alt: 'Early banner, second direction', label: 'Early banner · 02', caption: 'A bolder route testing color, portrait placement and tattoo-inspired visual language.', ratio: '16 / 10' }} />
        <Visual m={{ src: v2('amy/concept-3.webp'), alt: 'Early banner, third direction', label: 'Early banner · 03', caption: 'A more restrained direction testing monochrome treatment and a quieter editorial tone.', ratio: '16 / 10' }} />
      </div>
      <Gap />

      <Chapter num="03" title="Visual identity" />
      <div className="cs-wrap cs-amy-specimen">
        <Reveal className="cs-amy-lockup">
          <img src={v2('amy/logo.webp')} alt="Amy campaign Hebrew title lockup" loading="lazy" />
          <p className="cs-caption">A custom Hebrew lockup inspired by vintage signage, tattoo lettering and Amy’s expressive visual language.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="cs-label">Color palette</p>
          <Palette colors={['#080809', '#fbecd8', '#da2624', '#c58a58', '#885836', '#462919']} />
          <p className="cs-caption cs-left">A warm, vintage-inspired palette drawn from tattoo flash, aged print and rock imagery.</p>
        </Reveal>
      </div>
      <div className="cs-wrap cs-amy-assets">
        <Reveal className="cs-amy-asset">
          <div className="cs-amy-asset-box is-dark">
            <img src={v2('amy/badge-27.webp')} alt="27 Club series badge" loading="lazy" />
          </div>
          <p className="cs-label">Series badge</p>
          <p>A recurring 27 Club badge that connects the individual stories to the wider editorial special.</p>
        </Reveal>
      </div>
      <div className="cs-wrap cs-amy-notes">
        {[
          { k: 'Textures & treatment', v: 'Halftone dots, ink splatters and worn-paper textures give the identity its raw editorial character.', img: v2('amy/hero-banner.webp'), pos: '72% 30%', alt: 'The final banner' },
          { k: 'Iconography', v: 'Tattoo-flash motifs reference Amy’s personal iconography and the wider 27 Club visual world.', img: v2('amy/grid-desktop.webp'), pos: '6% 10%', alt: 'The full 27 Club artist grid' },
          { k: 'Image treatment', v: 'High-contrast portraiture and distressed overlays connect photography to the graphic system.', img: v2('amy/concept-3.webp'), pos: '40% 35%', alt: 'Early banner, third direction' },
        ].map((n, i) => (
          <Reveal key={n.k} delay={i * 0.08} className="cs-amy-note">
            <AmyCrop src={n.img} pos={n.pos} alt={n.alt} />
            <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>
            <p className="cs-label">{n.k}</p>
            <p>{n.v}</p>
          </Reveal>
        ))}
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={AMY.ink} fg={AMY.paper} accent={AMY.red}>
      <Chapter num="04" title="Before & after" note="Every portrait went through the same treatment. Flip any card to see the original photo." />
      <FlipWall pairs={amyPairs} />
      <Gap size="l" />
    </Act>
  </>
)
/* ======================================================================
 * 02 · PEOPLE IN MOTION — motion playground
 * ==================================================================== */
const MO = { dark: '#1f0c09', cream: '#fdf3e1', yellow: '#f6b42c', green: '#4a1d16', sky: '#5fb3e6' }
const motionBody = (
  <>
    <Act bg={MO.dark} fg={MO.cream} accent={MO.yellow}>
      <Intro
        title="People in Motion"
        text="A character-led motion piece combining animation, game-inspired UI, kinetic typography and transitions across changing visual worlds."
        meta={[
          { label: 'Role', value: 'Design, 2D animation, compositing' },
          { label: 'Disciplines', value: 'Motion Design · After Effects · 2D Animation · Visual Storytelling' },
        ]}
      />
      <Visual m={{ video: A('motion/gameplay_highlight_final.mp4'), poster: v2('motion/people-motion-hero-poster.webp'), alt: 'Highlight cut of the animation' }} frame />
      <Gap />
      <Chapter num="01" title="Character animation" />
      <Visual m={{ video: A('motion/clips/03-character-animation.mp4'), poster: v2('motion/01-character-selection.webp'), alt: 'Character animation', caption: 'Expressive character movement integrated into animated environments.' }} frame />
      <Gap size="l" />
    </Act>

    <Act bg={MO.sky} fg={MO.dark} accent={MO.green}>
      <Chapter num="02" title="UI & game animation" />
      <Visual m={{ video: A('motion/clips/02-ui-game-animation.mp4'), poster: v2('motion/02-tetris.webp'), alt: 'UI and game animation', caption: 'Animated interfaces, game systems and responsive graphic elements.' }} frame />
      <Gap size="l" />
    </Act>

    <Act bg={MO.green} fg={MO.yellow} accent={MO.yellow}>
      <Chapter num="03" title="Kinetic typography" />
      <Visual m={{ video: A('motion/clips/people-kinetic-typography.mp4'), poster: v2('motion/03-mario-platform.webp'), alt: 'Kinetic typography', caption: 'Animated typography, scene transitions and visual continuity across changing worlds.' }} bleed />
      <Gap size="l" />
    </Act>

    <Act bg={MO.dark} fg={MO.cream} accent={MO.yellow}>
      <Chapter num="04" title="The full film" note="Experience the complete motion piece and the journey across its characters, interfaces and game-inspired scenes." />
      <Film src={A('motion/aca-anashim.mp4')} poster={v2('motion/aca-anashim-poster.webp')} alt="People in Motion, full film" />
      <Gap size="l" />
    </Act>
  </>
)

/* ======================================================================
 * 03 · USA PILOT RESCUE — cinematic production breakdown
 * ==================================================================== */
const RE = { black: '#0b1d45', bone: '#ffffff', amber: '#ff4d61', flare: '#c8102e', dust: '#f7f5f2', ink: '#ffffff' }
const clip = (n: string, title: string): Scene => ({ video: v2(`ai/clips/${n}.mp4`), poster: v2(`ai/clips/${n}.webp`), title })
/* The process behind the AI films for N12, as Shirly describes it */
const AI_PROCESS = [
  { k: 'The brief', v: 'The producer asks for an idea.' },
  { k: 'Script & storyboard', v: 'I write a short script and build the storyboard in ChatGPT.' },
  { k: 'First & last frame', v: 'For every shot I create the first and the last frame.' },
  { k: 'JSON prompt', v: 'With ChatGPT I write each shot as a JSON prompt.' },
  { k: 'Animate in Flow', v: 'Each shot is animated separately in Flow.' },
  { k: 'Edit', v: 'I put the shots together into one film.' },
]

const rescueBody = (
  <>
    <Act bg={RE.black} fg={RE.bone} accent={RE.amber}>
      <Intro
        title="USA Pilot Rescue"
        text="There was no real image of the rescue. I had four hours to build it as a cinematic sequence for prime-time broadcast: frame direction, AI motion generation, continuity, compositing and final delivery."
        meta={[
          { label: 'Client', value: 'N12' },
          { label: 'Role', value: 'AI direction, motion, compositing, edit' },
          { label: 'Timeline', value: '4 hours to prime time' },
          { label: 'Disciplines', value: 'AI Direction · Script · Frame Design · Compositing' },
          { label: 'Tools', value: 'ChatGPT · Flow' },
        ]}
      />
      <Chapter num="01" title="The full film" note="The complete N12 piece as it aired: AI-generated frames, motion and compositing in one sequence." />
      <Film src={A('navigator/main-film.mp4')} poster={v2('ai/main-film-frame.webp')} captions={A('navigator/captions-en.vtt')} alt="USA Pilot Rescue, full film" tag="Full film · prime time" />
      <Gap size="l" />
    </Act>

    <Act bg="#050506" fg={RE.bone} accent="#e50914">
      <ClipReel
        title="02 · Scenes from the film"
        sound={A('navigator/main-film.mp4')}
        scenes={[
          clip('descent', 'Descent'),
          clip('pilot-down', 'Pilot down'),
          clip('command', 'Command'),
          clip('extraction', 'Extraction'),
          clip('takeoff', 'Take-off'),
        ]}
      />
    </Act>

    <Act bg={RE.black} fg={RE.bone} accent={RE.amber}>
      <Gap />
      <Chapter num="03" title="From news brief to broadcast" note="How the film was made, from the producer’s request to the final edit." />
      <Pipeline items={AI_PROCESS} />
      <Gap size="l" />
    </Act>

    <Act bg={RE.flare} fg={RE.ink} accent={RE.ink}>
      <Chapter num="04" title="From frame to motion" note="Select a shot, then watch the directed key frame come to life." />
      <FrameToMotion
        shots={[
          { label: 'Pilot / Survival', still: v2('ai/pilot-crawling-transmitting-202604051655.webp'), motion: A('navigator/motion/002.mp4'), caption: 'Directed character, environment and cinematic mood.' },
          { label: 'Command Center', still: v2('ai/2.webp'), motion: A('navigator/motion/0023.mp4'), caption: 'Controlled environment, information and visual continuity.' },
          { label: 'Rescue / Extraction', still: v2('ai/7.webp'), motion: A('navigator/motion/007.mp4'), caption: 'Consistent people, aircraft and environment across the sequence.' },
        ]}
      />
      <Gap size="l" />
    </Act>

  </>
)

/* ======================================================================
 * 04 · MUSIC FROM THE SCREEN — the voting flow, told inside the phone
 * ==================================================================== */
const SO = { night: '#14052e', lilac: '#f3eaff', neon: '#f8a9fb', violet: '#5b1fd1' }
const soundBody = (
  <>
    <Act bg={SO.night} fg={SO.lilac} accent={SO.neon}>
      <Intro
        title="Music from the Screen"
        text="A chart of songs from Israeli cinema, for N12 and Galgalatz. I created the neon key art, designed the mobile voting flow and carried the look through the social posts of the campaign."
        meta={[
          { label: 'Client', value: 'N12 × Galgalatz' },
          { label: 'Role', value: 'Lead Graphic & UI/UX Designer' },
          { label: 'Crafted', value: 'Early 2022' },
        ]}
      />
      <Gap size="s" />
    </Act>

    <Act bg="#0b0220" fg={SO.lilac} accent={SO.neon}>
      <Chapter num="01" title="The neon key art" note="The sign switches itself on, one tube at a time." />
      <NeonSign
        src={v2('galgalatz/banner-cover.webp')}
        alt="The neon key art: popcorn, a drink, nachos, 3D glasses, a clapperboard and a film reel above the title Music from the Screen, the chart"
        tubes={[
          [27.5, 35, 35.5, 47.5],
          [32.5, 24, 44, 48],
          [43.5, 17.5, 59.5, 43],
          [42, 41.5, 62.5, 48.5],
          [59, 26, 72, 48],
          [71, 35.5, 78.5, 47.5],
          [53.5, 49, 78, 60],
          [24.5, 49, 53.5, 60.5],
          [39.5, 59.5, 63, 67],
          [20.5, 14, 82, 69.5],
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={SO.violet} fg={SO.lilac} accent={SO.neon}>
      <Chapter num="02" title="Concept" />
      <Steps
        items={[
          { k: 'Challenge', v: 'A cluttered, low-engagement voting flow.' },
          { k: 'UX Idea', v: 'Guide users to discover → listen → vote.' },
          { k: 'Execution', v: 'iPhone-first voting UI, real content.' },
        ]}
      />
      <Gap />
      <Chapter num="03" title="Try the vote" note="A playable copy of the voting flow, with songs from the real chart." />
      <VoteChart
        art={v2('galgalatz/banner-cover.webp')}
        songs={[
          { film: 'Rocky III', song: 'Eye Of The Tiger', artist: 'Survivor' },
          { film: 'Saturday Night Fever', song: 'Stayin’ Alive', artist: 'Bee Gees' },
          { film: 'Titanic', song: 'My Heart Will Go On', artist: 'Céline Dion' },
          { film: 'The Big Lebowski', song: 'Hotel California', artist: 'Gipsy Kings' },
          { film: 'Despicable Me 2', song: 'Happy', artist: 'Pharrell Williams' },
          { film: 'A Star Is Born', song: 'Shallow', artist: 'Lady Gaga, Bradley Cooper' },
          { film: 'Good Morning, Vietnam', song: 'What a Wonderful World', artist: 'Louis Armstrong' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={SO.night} fg={SO.lilac} accent={SO.neon}>
      <Chapter num="04" title="The countdown" note="The chart posts, from places 50–31 down to number one." />
      <Countdown
        posts={[
          { src: v2('galgalatz/rank-31-50.webp'), alt: 'Chart post, places 50 to 31', rank: '50–31' },
          { src: v2('galgalatz/rank-03.webp'), alt: 'Chart post, number 3: Rocky III, Eye Of The Tiger', rank: '3' },
          { src: v2('galgalatz/rank-02.webp'), alt: 'Chart post, number 2: Titanic, My Heart Will Go On', rank: '2' },
          { src: v2('galgalatz/rank-01.webp'), alt: 'Chart post, number 1: A Star Is Born, Shallow', rank: '1' },
        ]}
      />
      <Gap size="l" />
    </Act>
  </>
)

/* ======================================================================
 * 05 · THE LOUVRE HEIST — AI news film, faithful to the real event
 * ==================================================================== */
const LV = { night: '#14171b', stone: '#ece6da', gold: '#d9b25f', slate: '#2b3138' }
const lr = (n: string) => v2(`louvre/real/${n}.webp`)
const louvreBody = (
  <>
    <Act bg={LV.night} fg={LV.stone} accent={LV.gold}>
      <Intro
        title="The Louvre Heist"
        text="A 70-second AI film for N12 that rebuilds the Louvre jewel heist shot by shot: the van by the Seine, the cut glass, the galleries, the crown on the pavement and the getaway. I wrote, directed and produced it, and made every shot with AI. Delivered in 16:9 for web and 9:16 for mobile."
        meta={[
          { label: 'Client', value: 'N12' },
          { label: 'Role', value: 'Script, direction, production · AI video creator' },
          { label: 'Length', value: '1:10' },
          { label: 'Formats', value: '16:9 · 9:16' },
          { label: 'Tools', value: 'ChatGPT · Flow' },
        ]}
        link={{ label: 'Visit the live site', href: 'https://special.n12.co.il/louvre' }}
        linkStyle={{ background: LV.gold, color: LV.night }}
      />
      <Chapter num="01" title="The full film" note="The complete 1:10 piece as it aired. Press play, sound on." />
      <Film src={v2('louvre/louvre-film.mp4')} poster={v2('louvre/poster.webp')} alt="The Louvre Heist, full film, 16:9" tag="Full film · 1:10 · 16:9" />
      <Gap />
      <Chapter num="02" title="Faithful to reality" note="The challenge was keeping every frame true to what happened. Switch between the real photo and the frame in the film." />
      <RealVsFilm
        pairs={[
          { title: 'The lift', real: { src: lr('scene-lift'), alt: 'Real photo: the lift raised to the gallery window' }, film: { src: v2('louvre/lift.webp'), alt: 'Film frame: the lift at the window' }, note: 'The lift the thieves used to reach the window.' },
          { title: 'The ladder', real: { src: lr('scene-ladder'), alt: 'Real photo: the ladder against the facade' }, film: { src: v2('louvre/facade.webp'), alt: 'Film frame: the facade by the Seine' }, note: 'The facade by the Seine, as it was that morning.' },
          { title: 'Apollo Gallery', real: { src: lr('scene-apollo'), alt: 'Real photo: the Apollo Gallery' }, film: { src: v2('louvre/gallery.webp'), alt: 'Film frame: two men running through the gallery' }, note: 'The gallery where the jewels were kept.' },
          { title: 'The crown', real: { src: lr('crown-eugenie'), alt: 'Real photo: the crown of Empress Eugénie' }, film: { src: v2('louvre/crown.webp'), alt: 'Film frame: the crown on the pavement' }, note: 'The crown of Empress Eugénie, dropped during the escape.' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg="#07080a" fg={LV.stone} accent={LV.gold}>
      <Chapter num="03" title="The stolen pieces" note="The real objects, used as reference so the jewels in the film match the originals. Open a case to look closer." />
      <Vault
        pieces={[
          { src: lr('crown-eugenie'), name: 'Crown of Empress Eugénie', detail: 'Dropped during the escape.' },
          { src: lr('diadem-eugenie'), name: 'Diadem of Empress Eugénie', detail: 'Musée du Louvre.' },
          { src: lr('bow-eugenie'), name: 'Large corsage bow of Empress Eugénie', detail: 'François Kramer. Musée du Louvre, OA 12238.' },
          { src: lr('tiara-marie-amelie'), name: 'Diadem of Queen Marie-Amélie and Queen Hortense', detail: 'Musée du Louvre, OA 11030.' },
          { src: lr('necklace-marie-amelie'), name: 'Necklace of Queen Marie-Amélie', detail: 'Musée du Louvre, OA 11031.' },
          { src: lr('earrings-marie-amelie'), name: 'Earrings of Queen Marie-Amélie', detail: 'Musée du Louvre, OA 11033 · OA 11034.' },
          { src: lr('necklace-marie-louise'), name: 'Emerald necklace of Marie-Louise', detail: 'Musée du Louvre, OA 12155.' },
          { src: lr('earrings-marie-louise'), name: 'Emerald earrings of Marie-Louise', detail: 'Musée du Louvre, OA 12156.' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={LV.slate} fg={LV.stone} accent={LV.gold}>
      <Chapter num="04" title="Cut for mobile" note="The same film, reframed for a vertical feed." />
      <div className="cs-lv-phone">
        <Visual m={{ video: v2('louvre/preview-vertical.mp4'), poster: v2('louvre/poster-vertical.webp'), alt: 'A few seconds of the vertical 9:16 version', label: '9:16 · preview', ratio: '9 / 16' }} />
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={LV.night} fg={LV.stone} accent={LV.gold}>
      <Chapter num="05" title="How it was made" note="From the producer’s request to the final edit." />
      <Pipeline items={AI_PROCESS} />
      <Gap size="l" />
    </Act>
  </>
)

/* ======================================================================
 * 06 · YARDENA & OFIRA — an 80s bedroom, in its own decade
 * ==================================================================== */
const EI = { night: '#14110f', cream: '#fff4e6', pink: '#ff3e9a', teal: '#19d3c5', yellow: '#ffd400' }
const eightiesBody = (
  <>
    <Act bg={EI.night} fg={EI.cream} accent={EI.pink}>

      <Intro
        title="Yardena & Ofira — an 80s room"
        text="A 35-second AI film set in a teenage bedroom of the 1980s, built around the pop rivalry of the time: Yardena Arazi against Ofra Haza. Posters, magazine covers, a cassette player and a framed photo set the scene."
        meta={[
          { label: 'Length', value: '0:35' },
          { label: 'Disciplines', value: 'AI film · Art direction' },
          { label: 'Tools', value: 'Claude · Magnific' },
        ]}
      />
      <Chapter num="01" title="The full film" note="The complete 0:35 piece. Press play, sound on." />
      <Film src={v2('eighties/room-film.mp4')} poster={v2('eighties/poster.webp')} alt="Yardena and Ofira, an 80s room, full film" tag="Full film · 0:35" />
      <Gap size="l" />
    </Act>

    <Act bg={EI.pink} fg={EI.night} accent={EI.yellow}>
      <Chapter num="02" title="The room" note="Every object placed to date the room to one decade. Scroll to flip through it, one channel at a time." />
      <ChannelSurf
        channels={[
          { src: v2('eighties/magazine.webp'), alt: 'Teen magazine on the bed with the headline about the rivalry', name: 'Magazine' },
          { src: v2('eighties/radio.webp'), alt: 'A hand turning the dial of a cassette radio', name: 'Cassette radio' },
          { src: v2('eighties/posters.webp'), alt: 'Posters and magazine covers on the wall', name: 'Posters' },
          { src: v2('eighties/bedside.webp'), alt: 'Bedside table with a framed photo and a digital clock', name: 'Bedside' },
          { src: v2('eighties/sneakers.webp'), alt: 'Sneakers on the floor by the desk', name: 'Sneakers' },
        ]}
      />
    </Act>

    <Act bg={EI.teal} fg={EI.night} accent={EI.pink}>
      <Chapter num="03" title="Real archive, placed in the room" note="Real photos and covers from the period, composited into the generated room." />
      <Placed
        sources={[
          { src: v2('eighties/src/poster-jumpsuit.webp'), alt: 'Yardena Arazi in a blue jumpsuit, original poster' },
          { src: v2('eighties/src/maariv-yardena-2.webp'), alt: 'Maariv LaNoar cover with Yardena Arazi' },
          { src: v2('eighties/src/maariv-trio.webp'), alt: 'Maariv LaNoar cover with three performers' },
        ]}
        result={{ src: v2('eighties/posters.webp'), alt: 'The same poster and covers on the bedroom wall', ratio: '16 / 9' }}
        caption="The poster and two Maariv LaNoar covers, hung on the wall."
      />
      <Gap size="s" />
      <Placed
        sources={[{ src: v2('eighties/src/ofira-yearbook.webp'), alt: 'Ofira’s school yearbook photo' }]}
        result={{ src: v2('eighties/bedside.webp'), alt: 'The yearbook photo framed on the bedside table', ratio: '16 / 9' }}
        caption="Ofira’s yearbook photo, framed on the bedside table."
      />
      <Gap size="l" />
    </Act>

    <Act bg={EI.night} fg={EI.cream} accent={EI.teal}>
      <Chapter num="04" title="Research" note="The material gathered for the room: album covers, teen magazines and family photos." />
      <DriftRows
        items={[
          { src: v2('eighties/src/album-1.webp'), alt: 'Yardena Arazi album cover', ratio: '366 / 550' },
          { src: v2('eighties/src/maariv-yardena-1.webp'), alt: 'Maariv LaNoar cover with Yardena Arazi', ratio: '445 / 575' },
          { src: v2('eighties/src/album-2.webp'), alt: 'Yardena Arazi album cover', ratio: '1 / 1' },
          { src: v2('eighties/src/maariv-ofra.webp'), alt: 'Maariv LaNoar cover with Ofra Haza', ratio: '445 / 575' },
          { src: v2('eighties/src/album-3.webp'), alt: 'Yardena Arazi album cover', ratio: '1 / 1' },
          { src: v2('eighties/src/ofira-friends.webp'), alt: 'Photo of three friends in the 80s', ratio: '851 / 900' },
          { src: v2('eighties/src/album-4.webp'), alt: 'Yardena Arazi album cover', ratio: '778 / 800' },
          { src: v2('eighties/src/ofira-childhood.webp'), alt: 'Childhood family photo', ratio: '480 / 640' },
          { src: v2('eighties/src/album-5.webp'), alt: 'Yardena Arazi album cover, Back in the Frame', ratio: '1 / 1' },
          { src: v2('eighties/src/album-6.webp'), alt: 'Yardena Arazi album cover', ratio: '1 / 1' },
        ]}
      />
      <Gap size="l" />
    </Act>
  </>
)

/* ======================================================================
 * 07 · WAS IT OR WASN’T IT — the quiz, playable here
 * ==================================================================== */
const QZ = { navy: '#15335e', cream: '#f4ead2', sky: '#8cc4e8', ink: '#0d1f3a', teal: '#5fa9b0' }
const QUIZ_URL = 'https://special.n12.co.il/independence2026_quiz'
const qi = (n: string) => v2(`quiz/${n}.webp`)
const quizQuestions: Question[] = [
  { img: qi('south-america'), alt: 'Map of South America with Israeli flags', claim: 'Israel once looked into setting up a colony in South America.', truth: true, why: 'Shimon Peres explored a settlement in French Guiana. Golda Meir blocked it.' },
  { img: qi('frank-sinatra'), alt: 'Frank Sinatra at a microphone', claim: 'Frank Sinatra helped the Haganah.', truth: true, why: 'In 1948 he delivered a million dollars in cash to a ship in New York harbour.' },
  { img: qi('cleopatra'), alt: 'Cleopatra in sunglasses in front of a pyramid', claim: 'Moshe Dayan offered to trade Sinai for the pyramids.', truth: false, why: 'Never happened.' },
  { img: qi('ben-gurion'), alt: 'Pop-art portrait of David Ben-Gurion in sunglasses', claim: 'Ben-Gurion kept a Greek island as a backup state.', truth: false, why: 'Never happened.' },
  { img: qi('paul-mccartney'), alt: 'Paul McCartney singing with a guitar', claim: 'Paul McCartney lived on Kibbutz Ein Gedi.', truth: false, why: 'Never happened.' },
  { img: qi('jimmy-turk'), alt: 'Football player in an Israel national team shirt', claim: 'Israelis invented the penalty shoot-out.', truth: true, why: 'After a 1968 coin toss knocked Israel out, the idea was proposed and adopted in 1970.' },
  { img: qi('radio'), alt: 'A vintage radio', claim: 'A radio call-up drill once sent the country into panic.', truth: true, why: 'The “Night of the Ducks”, 1 April 1959.' },
  { img: qi('jordanian-legion'), alt: 'Soldiers of the Jordanian Legion', claim: 'The Jordanian Legion was hit by a chocolate air drop.', truth: false, why: 'Never happened.' },
  { img: qi('nun'), alt: 'A nun walking by a stone wall', claim: 'A nun’s dentures needed a ceasefire to get back.', truth: true, why: 'Jerusalem, 1954.' },
  { img: qi('astronaut'), alt: 'An astronaut on the moon', claim: 'A Tnuva milk ad was filmed in space.', truth: true, why: 'Aboard the Mir station in 1997, and it made the Guinness book.' },
  { img: qi('israel-railways'), alt: 'An Israel Railways train in an underwater tunnel', claim: 'An underwater rail tunnel links Eilat and Aqaba.', truth: false, why: 'Never happened.' },
  { img: qi('telephone'), alt: 'A hand holding a smartphone by the sea', claim: 'Rafael built the first touchscreen phone.', truth: false, why: 'Never happened.' },
  { img: qi('television'), alt: 'A vintage television set', claim: 'Colour TV was blocked in Israel with a “mechikon”.', truth: true, why: 'Colour was erased from broadcasts until 1983.' },
  { img: qi('walt-disney'), alt: 'Walt Disney drinking coffee by the sea', claim: 'A Disneyland was planned for Tel Aviv.', truth: false, why: 'Never happened.' },
  { img: qi('siesta'), alt: 'A man taking a siesta on a sofa', claim: 'Israel once passed a siesta law.', truth: false, why: 'Never happened.' },
  { img: qi('bamba'), alt: 'Bags of Bamba next to a plate of hummus', claim: 'There was once a hummus-flavoured Bamba.', truth: false, why: 'Never happened.' },
]
const quizBody = (
  <>
    <Act bg={QZ.cream} fg={QZ.navy} accent={QZ.navy}>
      <Intro
        title="Was It or Wasn’t It?"
        text="An Independence Day trivia for N12: true stories from Israel’s history mixed with made-up ones. I designed the AI images for the questions, one picture per question, all in the same retro print style."
        meta={[
          { label: 'Client', value: 'N12' },
          { label: 'Role', value: 'AI image design for the trivia' },
          { label: 'Disciplines', value: 'Illustration · AI image generation' },
        ]}
        link={{ label: 'Play the quiz on N12', href: QUIZ_URL }}
        linkStyle={{ background: QZ.navy, color: QZ.cream }}
      />
      <Gap size="s" />
    </Act>

    <Act bg={QZ.navy} fg={QZ.cream} accent={QZ.sky}>
      <Chapter num="01" title="Play the Quiz" note="Real questions from the quiz, each with its image. Did it happen or not?" />
      <TruthOrFake questions={quizQuestions} playUrl={QUIZ_URL} />
      <Gap size="l" />
      <Chapter num="02" title="Colour palette" />
      <StampPalette
        colors={[
          { hex: '#14375f', name: 'Envelope navy' },
          { hex: '#f4ead2', name: 'Stamp paper' },
          { hex: '#5fa9b0', name: 'Print turquoise' },
          { hex: '#e0457b', name: 'Pop pink' },
          { hex: '#e7b53c', name: 'Mustard' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={QZ.cream} fg={QZ.navy} accent={QZ.navy}>
      <Chapter num="03" title="The illustrations" />
      <DriftRows
        items={[
          { src: qi('banner-share'), alt: 'Key art of the quiz with stamp portraits and the title', ratio: '1200 / 630' },
          ...quizQuestions.map((q) => ({ src: q.img, alt: q.alt, ratio: '1 / 1' })),
          { src: qi('shark'), alt: 'A shark wearing sunglasses and headphones', ratio: '1 / 1' },
        ]}
      />
      <Gap size="l" />
    </Act>
  </>
)

/* ======================================================================
 * 08 · THE PARTNER — a podcast, animated
 * ==================================================================== */
const PA = { night: '#0b1d24', teal: '#12333d', amber: '#e8a44a', cream: '#efe6d6', red: '#d61f2c' }
const pv = (n: string) => v2(`partner/${n}`)
const partnerBody = (
  <>
    <Act bg={PA.night} fg={PA.cream} accent={PA.amber}>
      <Intro
        title="The Partner"
        text="A short series from N12’s daily podcast One a Day. The story only existed as audio, so I turned it into pictures: I wrote, directed and produced the series, built every scene from the transcript and animated it with Flow. The speaker’s words stay on screen."
        meta={[
          { label: 'Client', value: 'N12 · One a Day podcast' },
          { label: 'Role', value: 'Script, direction, production · AI video creator' },
          { label: 'Parts', value: '4' },
          { label: 'Formats', value: '16:9 · 9:16' },
          { label: 'Tools', value: 'ChatGPT · Flow' },
        ]}
      />
      <Gap size="s" />
    </Act>

    <Act bg="#05090b" fg={PA.cream} accent={PA.amber}>
      <SeriesStage
        parts={[
          { src: pv('part-1.mp4'), poster: pv('part-1.webp'), srcMobile: pv('part-1-mobile.mp4'), posterMobile: pv('part-1-mobile.webp'), num: '01', title: '0:31' },
          { src: pv('part-2.mp4'), poster: pv('part-2.webp'), num: '02', title: '0:28' },
          { src: pv('part-3.mp4'), poster: pv('part-3.webp'), srcMobile: pv('part-3-mobile.mp4'), posterMobile: pv('part-3-mobile.webp'), num: '03', title: '0:30' },
          { src: pv('part-4.mp4'), poster: pv('part-4.webp'), srcMobile: pv('part-4-mobile.mp4'), posterMobile: pv('part-4-mobile.webp'), num: '04', title: '0:51' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={PA.night} fg={PA.cream} accent={PA.amber}>
      <Chapter num="01" title="How it was made" note="From the producer’s request to the final edit." />
      <Pipeline items={AI_PROCESS} />
      <Gap size="l" />
    </Act>
  </>
)

export const CASES: Record<string, Case> = {
  partner: {
    theme: 'partner',
    acts: { bg: PA.night, fg: PA.cream },
    credits: [
      { label: 'Client', value: 'N12 · One a Day podcast' },
      { label: 'Role', value: 'Script, direction, production · AI video creator' },
      { label: 'Formats', value: '16:9 · 9:16' },
    ],
    body: partnerBody,
  },
  amy: {
    theme: 'amy',
    acts: { bg: AMY.paper, fg: AMY.ink },
    credits: [
      { label: 'Client', value: 'N12 · Culture Gaps' },
      { label: 'Role', value: 'Concept, design language, banners' },
      { label: 'Built in', value: 'Storycard' },
      { label: 'Impact', value: 'Views 24,500 → 67,418' },
    ],
    body: amyBody,
  },
  'people-in-motion': {
    theme: 'motion',
    acts: { bg: MO.dark, fg: MO.cream },
    heroVideo: A('motion/gameplay_highlight_final.mp4'),
    credits: [
      { label: 'Role', value: 'Design, 2D animation, compositing' },
      { label: 'Type', value: '2D animation · Motion design' },
    ],
    body: motionBody,
  },
  'pilot-rescue': {
    theme: 'rescue',
    acts: { bg: RE.black, fg: RE.bone },
    credits: [
      { label: 'Client', value: 'N12' },
      { label: 'Role', value: 'AI direction, motion, compositing, edit' },
      { label: 'Timeline', value: '4 hours to prime time' },
    ],
    body: rescueBody,
  },
  'music-from-the-screen': {
    theme: 'soundtrack',
    acts: { bg: SO.night, fg: SO.lilac },
    credits: [
      { label: 'Client', value: 'N12 × Galgalatz' },
      { label: 'Role', value: 'Lead Graphic & UI/UX Designer' },
      { label: 'Crafted', value: 'Early 2022' },
    ],
    body: soundBody,
  },
  louvre: {
    theme: 'louvre',
    acts: { bg: LV.night, fg: LV.stone },
    credits: [
      { label: 'Client', value: 'N12' },
      { label: 'Role', value: 'Script, direction, production · AI video creator' },
    ],
    body: louvreBody,
  },
  eighties: {
    theme: 'eighties',
    acts: { bg: EI.night, fg: EI.cream },
    credits: [{ label: 'Type', value: 'AI film · Art direction' }],
    body: eightiesBody,
  },
  quiz: {
    theme: 'quiz',
    acts: { bg: QZ.cream, fg: QZ.navy },
    credits: [
      { label: 'Client', value: 'N12' },
      { label: 'Role', value: 'AI image design for the trivia' },
      { label: 'Live', value: 'special.n12.co.il' },
    ],
    body: quizBody,
  },
}
