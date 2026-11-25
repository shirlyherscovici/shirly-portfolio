/* The four case studies. Copy comes only from text already written for the portfolio;
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
  Reveal,
  ScrollRows,
  Stack,
  Statement,
  Steps,
  Visual,
  type Img,
} from './blocks'

const v2 = (p: string) => asset(`/v2/${p}`)
const A = (p: string) => asset(`/assets/${p}`)

export type Case = {
  theme: 'amy' | 'motion' | 'rescue' | 'soundtrack'
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
const amyRoster: Img[] = ['amy-winehouse', 'jimi-hendrix', 'janis-joplin', 'jim-morrison', 'kurt-cobain', 'brian-jones', 'keith-moon', 'bon-scott', 'sid-vicious', 'robby-krieger', 'richard-manitas'].map((r) => ({
  src: v2(`amy/roster/${r}.webp`),
  alt: r.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}))

const amyBody = (
  <>
    <Act bg={AMY.paper} fg={AMY.ink} accent={AMY.red}>
      <Intro
        title="Amy Winehouse — N12 Special"
        text="A visual identity for an N12 editorial special celebrating Amy Winehouse and the 27 Club. The project draws from tattoo culture, distressed print aesthetics, vintage rock imagery and Amy’s iconic visual world."
        meta={[
          { label: 'Client', value: 'N12' },
          { label: 'Role', value: 'Art direction, graphic design' },
          { label: 'Disciplines', value: 'Art direction · Visual design · Campaign strategy' },
        ]}
        link={{ label: 'View live project', href: 'https://special.n12.co.il/AmyWinehouse' }}
        linkStyle={{ background: AMY.red, color: AMY.paper }}
      />
      <Visual m={{ src: v2('amy/hero-banner.webp'), alt: 'Amy Winehouse N12 Special campaign hero', ratio: '1304 / 800' }} bleed parallax />
      <Gap />

      <Chapter num="01" title="Creative direction" note="From early explorations to the final direction." />
      <div className="cs-wrap-wide cs-amy-trio">
        <Visual m={{ src: v2('amy/concept-1.webp'), alt: 'First direction', label: 'Direction 01', caption: 'Early exploration focused on strong contrast, portraiture and immediate visual impact.', ratio: '16 / 10' }} className="is-lead" />
        <Visual m={{ src: v2('amy/concept-2.webp'), alt: 'Second direction', label: 'Direction 02', caption: 'A bolder route testing color, portrait placement and tattoo-inspired visual language.', ratio: '16 / 10' }} />
        <Visual m={{ src: v2('amy/concept-3.webp'), alt: 'Third direction', label: 'Direction 03', caption: 'A more restrained direction testing monochrome treatment and a quieter editorial tone.', ratio: '16 / 10' }} />
      </div>
      <Gap />

      <Chapter num="02" title="Visual identity" />
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
      <div className="cs-wrap cs-amy-notes">
        {[
          { k: 'Textures & treatment', v: 'Halftone dots, ink splatters and worn-paper textures give the identity its raw editorial character.', img: v2('amy/hero-banner.webp'), pos: '72% 30%' },
          { k: 'Iconography', v: 'Tattoo-flash motifs reference Amy’s personal iconography and the wider 27 Club visual world.', img: v2('amy/bird.webp'), pos: 'center', contain: true },
          { k: 'Image treatment', v: 'High-contrast portraiture and distressed overlays connect photography to the graphic system.', img: v2('amy/concept-3.webp'), pos: '40% 35%' },
        ].map((n, i) => (
          <Reveal key={n.k} delay={i * 0.08} className="cs-amy-note">
            <div className={`cs-amy-crop ${n.contain ? 'is-contain' : ''}`}>
              <img src={n.img} alt="" loading="lazy" style={{ objectPosition: n.pos }} />
            </div>
            <span className="cs-step">{String(i + 1).padStart(2, '0')}</span>
            <p className="cs-label">{n.k}</p>
            <p>{n.v}</p>
          </Reveal>
        ))}
      </div>
      <Gap />

      <Chapter num="03" title="Banner development" note="The final direction brings tattoo culture, distressed print textures and 27 Club references into one cohesive identity." />
      <Visual m={{ src: v2('amy/hero-banner.webp'), alt: 'Final campaign banner', label: 'Final banner', ratio: '1304 / 800' }} />
      <Gap size="l" />
    </Act>

    <Act bg={AMY.ink} fg={AMY.paper} accent={AMY.red}>
      <Chapter num="04" title="Before & after" note="Drag the line, or flip any card to see the original photo." />
      <div className="cs-wrap cs-narrow">
        <Compare before={{ src: v2('amy/005-before.webp'), alt: 'Original archive photo' }} after={{ src: v2('amy/005-after.webp'), alt: 'Final treatment', ratio: '1 / 1' }} labels={['Original', 'Final']} />
      </div>
      <Gap size="s" />
      <FlipWall pairs={amyPairs} />
      <Gap size="l" />
    </Act>

    <Act bg={AMY.paper} fg={AMY.ink} accent={AMY.red}>
      <Chapter num="05" title="Identity assets" note="Core graphic elements that shaped the project’s visual identity." />
      <div className="cs-wrap cs-amy-assets">
        <Reveal className="cs-amy-asset">
          <div className="cs-amy-asset-box">
            <img src={v2('amy/logo.webp')} alt="Amy campaign title lockup" loading="lazy" />
          </div>
          <p className="cs-label">Primary title lockup</p>
          <p>A custom Hebrew title lockup combining vintage influence with a hand-crafted, expressive feel.</p>
        </Reveal>
        <Reveal className="cs-amy-asset" delay={0.1}>
          <div className="cs-amy-asset-box is-dark">
            <img src={v2('amy/badge-27.webp')} alt="27 Club series badge" loading="lazy" />
          </div>
          <p className="cs-label">Series badge</p>
          <p>A recurring 27 Club badge that connects the individual stories to the wider editorial special.</p>
        </Reveal>
      </div>
      <Gap size="s" />
      <div className="cs-wrap cs-roster">
        {amyRoster.map((m, i) => (
          <Reveal key={m.src} delay={i * 0.04} className="cs-roster-item">
            <img src={m.src} alt={m.alt} loading="lazy" />
          </Reveal>
        ))}
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={AMY.red} fg={AMY.paper} accent={AMY.ink}>
      <Chapter num="06" title="System in use" note="The visual system applied across desktop and mobile formats." />
      <Visual m={{ src: v2('amy/grid-desktop.webp'), alt: 'Desktop grid showing the full 27 Club artist system', label: 'Desktop layout', caption: 'The 27 Club system applied across the full artist grid.' }} />
      <div className="cs-wrap-wide cs-split-75">
        <Visual m={{ src: v2('amy/amy-phones.webp'), alt: 'Mobile screens of the special', ratio: '1579 / 996', contain: true }} />
        <Visual m={{ src: v2('amy/grid-mobile.webp'), alt: 'Mobile layout', label: 'Mobile layout', caption: 'The same visual system adapted for a compact vertical experience.', ratio: '3 / 4' }} />
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={AMY.ink} fg={AMY.paper} accent={AMY.red}>
      <Gap size="s" />
      <Visual m={{ src: v2('amy/hero-banner.webp'), alt: 'Amy Winehouse N12 Special, final banner', ratio: '1304 / 800' }} bleed parallax />
      <Gap />
    </Act>
  </>
)

/* ======================================================================
 * 02 · PEOPLE IN MOTION — motion playground
 * ==================================================================== */
const MO = { dark: '#121212', cream: '#f2efe6', yellow: '#ffd23f', green: '#174a36' }
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
      <Chapter num="01" title="Concept" note="Three motion disciplines demonstrated through real moments from the film." />
      <Stack
        items={[
          { src: v2('motion/01-character-selection.webp'), alt: 'Character selection scene', ratio: '16 / 9' },
          { src: v2('motion/02-tetris.webp'), alt: 'Puzzle game scene', ratio: '16 / 9' },
          { src: v2('motion/03-mario-platform.webp'), alt: 'Platform game scene', ratio: '16 / 9' },
          { src: v2('motion/04-gold-digger.webp'), alt: 'Gold digger scene', ratio: '16 / 9' },
          { src: v2('motion/05-icy-tower.webp'), alt: 'Tower climbing scene', ratio: '16 / 9' },
        ]}
      />
      <Gap />
      <Chapter num="02" title="Character animation" />
      <div className="cs-wrap-wide cs-split-75">
        <Visual m={{ video: A('motion/clips/03-character-animation.mp4'), poster: v2('motion/01-character-selection.webp'), alt: 'Character animation', caption: 'Expressive character movement integrated into animated environments.' }} frame />
        <Visual m={{ src: v2('motion/01-character-selection.webp'), alt: 'Character selection scene', ratio: '16 / 9' }} />
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={MO.yellow} fg={MO.green} accent={MO.green}>
      <Chapter num="03" title="UI & game animation" />
      <Visual m={{ video: A('motion/clips/02-ui-game-animation.mp4'), poster: v2('motion/02-tetris.webp'), alt: 'UI and game animation', caption: 'Animated interfaces, game systems and responsive graphic elements.' }} frame />
      <Gap size="s" />
      <Grid
        wide
        cols={4}
        steps
        items={[
          { src: v2('motion/02-tetris.webp'), alt: 'Puzzle game scene', ratio: '16 / 9' },
          { src: v2('motion/03-mario-platform.webp'), alt: 'Platform game scene', ratio: '16 / 9' },
          { src: v2('motion/04-gold-digger.webp'), alt: 'Gold digger scene', ratio: '16 / 9' },
          { src: v2('motion/05-icy-tower.webp'), alt: 'Tower climbing scene', ratio: '16 / 9' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={MO.green} fg={MO.yellow} accent={MO.yellow}>
      <Chapter num="04" title="Kinetic typography" />
      <Visual m={{ video: A('motion/clips/people-kinetic-typography.mp4'), poster: v2('motion/03-mario-platform.webp'), alt: 'Kinetic typography', caption: 'Animated typography, scene transitions and visual continuity across changing worlds.' }} bleed />
      <Gap size="l" />
    </Act>

    <Act bg={MO.dark} fg={MO.cream} accent={MO.yellow}>
      <Chapter num="05" title="The full film" note="Experience the complete motion piece and the journey across its characters, interfaces and game-inspired scenes." />
      <Film src={A('motion/aca-anashim.mp4')} poster={v2('motion/aca-anashim-poster.webp')} alt="People in Motion, full film" />
      <Gap size="l" />
    </Act>
  </>
)

/* ======================================================================
 * 03 · USA PILOT RESCUE — cinematic production breakdown
 * ==================================================================== */
const RE = { black: '#0b0b0c', bone: '#e9e2d4', amber: '#e7b76d', blue: '#2348c6', sand: '#f6dca6' }
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
        ]}
      />
      <Statement small="The brief" text="A prime-time N12 visual story created under a live-news deadline, combining AI-generated imagery with directed frame design, continuity control and motion compositing." />
      <Gap />
      <Chapter num="01" title="From news brief to broadcast" note="A simple four-step workflow from developing story to final broadcast." />
      <Pipeline
        items={[
          { k: 'News Brief', v: 'Turning a developing story into a visual sequence.' },
          { k: 'Frame Direction', v: 'Defining the shot, character, environment and mood.' },
          { k: 'AI Motion', v: 'Bringing the selected frame into motion.' },
          { k: 'Final Compositing', v: 'Refining continuity, movement and the final broadcast sequence.' },
        ]}
      />
      <Gap />
      <Chapter num="02" title="Frame direction" />
      <div className="cs-letterbox-run">
        <Visual m={{ src: v2('ai/pilot-crawling-transmitting-202604051655.webp'), alt: 'Pilot on the ground', label: 'Pilot / Survival', caption: 'Directed character, environment and cinematic mood.', ratio: '21 / 9' }} bleed parallax />
        <Visual m={{ src: v2('ai/2.webp'), alt: 'Command scene', label: 'Command Center', caption: 'Controlled environment, information and visual continuity.', ratio: '21 / 9' }} bleed parallax />
        <Visual m={{ src: v2('ai/7.webp'), alt: 'Extraction scene', label: 'Rescue / Extraction', caption: 'Consistent people, aircraft and environment across the sequence.', ratio: '21 / 9' }} bleed parallax />
      </div>
      <Gap />
      <Chapter num="03" title="AI generation" />
      <div className="cs-wrap-wide cs-split-75">
        <Compare before={{ src: v2('ai/pilot-original.webp'), alt: 'Generated pilot frame' }} after={{ src: v2('ai/pilot-cutout.webp'), alt: 'Pilot cut-out', ratio: '1616 / 973' }} labels={['Frame', 'Cut-out']} />
        <Visual m={{ src: v2('ai/c13-airplane.webp'), alt: 'Generated aircraft element', ratio: '1800 / 1105', contain: true }} />
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={RE.blue} fg={RE.sand} accent={RE.sand}>
      <Chapter num="04" title="From frame to motion" note="Select a shot, then watch the directed key frame come to life." />
      <FrameToMotion
        shots={[
          { label: 'Pilot / Survival', still: v2('ai/pilot-crawling-transmitting-202604051655.webp'), motion: A('navigator/motion/002.mp4'), caption: 'Directed character, environment and cinematic mood.' },
          { label: 'Command Center', still: v2('ai/2.webp'), motion: A('navigator/motion/0023.mp4'), caption: 'Controlled environment, information and visual continuity.' },
          { label: 'Rescue / Extraction', still: v2('ai/7.webp'), motion: A('navigator/motion/007.mp4'), caption: 'Consistent people, aircraft and environment across the sequence.' },
        ]}
      />
      <Gap size="s" />
      <Grid
        wide
        cols={3}
        items={[
          { video: A('navigator/process-1.mp4'), poster: v2('ai/pilot-terrain-frame.webp'), alt: 'Generated shot: parachute descent' },
          { video: A('navigator/process-2.mp4'), poster: v2('ai/pilot-terrain-frame.webp'), alt: 'Generated shot: pilot on the ground from above' },
          { video: A('navigator/process-3.mp4'), poster: v2('ai/7.webp'), alt: 'Generated shot: aircraft explosion' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={RE.black} fg={RE.bone} accent={RE.amber}>
      <Chapter num="05" title="Continuity & compositing" />
      <div className="cs-wrap cs-aime">
        <Reveal className="cs-aime-cell">
          <p className="cs-label">AI</p>
          <p>Generated frames and motion from my direction.</p>
        </Reveal>
        <Reveal className="cs-aime-cell is-me" delay={0.1}>
          <p className="cs-label">Me</p>
          <p>Frame direction, continuity, compositing, edit and broadcast delivery.</p>
        </Reveal>
      </div>
      <Gap />
      <Chapter num="06" title="Final broadcast" note="The complete N12 visual piece — combining AI-generated frames, motion and compositing into one final sequence." />
      <Film src={A('navigator/main-film.mp4')} poster={v2('ai/main-film-frame.webp')} captions={A('navigator/captions-en.vtt')} alt="USA Pilot Rescue final film" />
      <Gap size="l" />
    </Act>
  </>
)

/* ======================================================================
 * 04 · MUSIC FROM THE SCREEN — digital product presentation
 * ==================================================================== */
const SO = { night: '#180149', lilac: '#f4ecff', pink: '#ff4f9a', plum: '#1d0b45', deep: '#0d0626', neon: '#f8a9fb' }
const phones: Img[] = [
  { src: v2('galgalatz/1-galgaltz-front.webp'), alt: 'Splash screen with the neon key art', label: 'Key Art', ratio: '9 / 16', contain: true },
  { src: v2('galgalatz/3-galgaltz-front.webp'), alt: 'Chart position screen', label: 'Victory Story', ratio: '9 / 16', contain: true },
  { src: v2('galgalatz/4-galgaltz-front.webp'), alt: 'Chart position screen', label: 'Victory Story', ratio: '9 / 16', contain: true },
  { src: v2('galgalatz/5-galgaltz-front.webp'), alt: 'Chart position screen', label: 'Victory Story', ratio: '9 / 16', contain: true },
  { src: v2('galgalatz/2-galgaltz-front.webp'), alt: 'Full chart screen', label: 'Full Top 50', ratio: '9 / 16', contain: true },
]
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
      <Chapter num="01" title="Concept" />
      <Steps
        items={[
          { k: 'Challenge', v: 'A cluttered, low-engagement voting flow.' },
          { k: 'UX Idea', v: 'Guide users discover → listen → vote.' },
          { k: 'Execution', v: 'iPhone-first voting UI, real content.' },
          { k: 'Outcome', v: 'Music From The Screen — listen, discover and vote.' },
        ]}
      />
      <Gap size="l" />
    </Act>

    <Act bg={SO.pink} fg={SO.plum} accent={SO.plum}>
      <Chapter num="02" title="Visual language" />
      <div className="cs-wrap-wide cs-split-75">
        <Visual m={{ src: v2('galgalatz/neon-box.webp'), alt: 'Glass display case with the neon key art', ratio: '1400 / 933' }} />
        <Visual m={{ src: v2('galgalatz/poster-galgalts.webp'), alt: 'Vertical poster version', ratio: '1 / 1' }} />
      </div>
      <div className="cs-wrap">
        <p className="cs-label">Palette, sampled from the key art</p>
        <Palette colors={['#180149', '#490aa6', '#06146a', '#780239', '#f8a9fb', '#c7c6c8']} />
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={SO.deep} fg={SO.lilac} accent={SO.neon}>
      <Chapter num="03" title="The chart" />
      <Stack
        items={[
          { src: v2('galgalatz/rank-03.webp'), alt: 'Chart position 3', ratio: '4 / 5' },
          { src: v2('galgalatz/rank-02.webp'), alt: 'Chart position 2', ratio: '4 / 5' },
          { src: v2('galgalatz/rank-01.webp'), alt: 'Chart position 1', ratio: '4 / 5' },
        ]}
      />
      <Gap size="s" />
      <div className="cs-wrap cs-narrow">
        <Visual m={{ src: v2('galgalatz/rank-31-50.webp'), alt: 'Chart positions 31 to 50', label: 'Positions 31–50', ratio: '1 / 1' }} />
      </div>
      <Gap />
      <Chapter num="04" title="Voting flow" />
      <Grid wide cols={5} steps items={phones} />
      <Gap size="s" />
      <Visual m={{ src: v2('galgalatz/game-uiux.webp'), alt: 'Voting flow UI screens', ratio: '16 / 10', contain: true }} />
      <Gap />
      <Chapter num="05" title="On mobile" />
      <div className="cs-wrap-wide cs-split-75 is-reverse">
        <Visual m={{ src: v2('galgalatz/n12-phone.webp'), alt: 'The flow inside the N12 app', ratio: '1400 / 859', contain: true }} />
        <Visual m={{ src: v2('galgalatz/glaglatz-phones.webp'), alt: 'Phone mockups of the voting flow', ratio: '1086 / 1448', contain: true }} />
      </div>
      <Gap size="l" />
    </Act>

    <Act bg={SO.night} fg={SO.lilac} accent={SO.neon}>
      <Chapter num="06" title="Social" />
      <ScrollRows
        items={[
          { src: v2('galgalatz/img-1.webp'), alt: 'Social post', ratio: '4 / 5' },
          { src: v2('galgalatz/img-2.webp'), alt: 'Social post', ratio: '4 / 5' },
          { src: v2('galgalatz/img-3.webp'), alt: 'Social post', ratio: '4 / 5' },
          { src: v2('galgalatz/img-4.webp'), alt: 'Social post', ratio: '4 / 5' },
          { src: v2('galgalatz/img-7.webp'), alt: 'Social post', ratio: '4 / 5' },
          { src: v2('galgalatz/rank-01.webp'), alt: 'Chart post', ratio: '4 / 5' },
        ]}
      />
      <Gap size="l" />
    </Act>
  </>
)

export const CASES: Record<string, Case> = {
  amy: {
    theme: 'amy',
    acts: { bg: AMY.paper, fg: AMY.ink },
    credits: [
      { label: 'Client', value: 'N12' },
      { label: 'Role', value: 'Art direction, graphic design' },
      { label: 'Type', value: 'Editorial identity · Art direction' },
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
}
