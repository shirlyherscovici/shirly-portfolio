# Project pages — audit, reference study and plan

Scope: the four project case-study pages only. The homepage is not touched.

---

## 1. Audit

### Which site is which
| | Live site (`main`, GitHub Pages) | Redesign (`redesign/v2`, local, not pushed) |
|---|---|---|
| Home | Old "hub" (`src/components/hub/*`, Tailwind) | Film-strip home (`src/v2/Home.tsx`) |
| Projects | Modals over the hub (`src/components/modal/*CaseStudy.tsx`) | Routed pages `#/project/:slug` (`src/v2/ProjectPage.tsx`) |

`src/main.tsx` mounts only `src/v2/App.tsx`. The old hub and modal files are still in the repo but nothing imports them. **This plan protects the redesign homepage (`redesign/v2`)**, the one we have been building. The live `main` site is not touched at all.

### Stack
React 18, Vite 5, TypeScript, framer-motion 11. Hash routing (`#/`, `#/project/:slug`, `#/about`). Base path `/shirly-portfolio/`. One global stylesheet: `src/v2/v2.css` (1,368 lines, home + project + about rules mixed).

### What the homepage depends on (protected)
| File | Used by home | Used by project pages | Plan |
|---|---|---|---|
| `src/v2/Home.tsx` | ✔ | — | **Do not edit** |
| `src/v2/Living.tsx` (Header) | ✔ | ✔ | **Do not edit** |
| `src/v2/Contact.tsx` | ✔ | — | **Do not edit** |
| `src/v2/store.tsx` (route, tone, flight) | ✔ | ✔ | **Do not edit** |
| `src/v2/data.ts` (`PROJECTS`: word, colors, hero, cover, loop, peek, frame, intro) | ✔ | ✔ | **Do not edit** the fields home reads; case-study content moves to new files |
| `src/v2/App.tsx` (Shell, FlightLayer: home→project wipe) | ✔ | ✔ | Only the one line that imports the project page changes |
| `src/v2/geom.ts` (hero box shared by the wipe) | ✔ (via FlightLayer) | ✔ | **Do not edit** |
| `src/v2/v2.css` | ✔ | ✔ | **No edits to existing rules.** New styles go in a new file scoped under `.cs` |
| `src/v2/Media.tsx` | — | ✔ | Replaced by a new media component inside the case-study folder |

### Isolation strategy
- All new work lives in `src/v2/case/`: shared blocks, per-project page files, `case.css`.
- Every new selector starts with `.cs` (the case-study root), so nothing can match on the homepage.
- No new global variables, fonts or resets. The fonts already loaded (Fraunces, Space Grotesk) are reused.
- `App.tsx` swaps `ProjectPage` for the new `CaseStudy` component. Nothing else in the Shell changes.
- The two transitions you approved last round are kept as they are:
  - the home→project left wipe;
  - the next-project hand-over.

### Current project pages (all four share one template)
Sticky hero (hero colour, centred cover, outlined word that fills in) → dark room (About + credits) → chapters of framed panels → credits row → next-project hand-over.

| Project | Uses today | Missing vs. assets on disk |
|---|---|---|
| Soundtrack | key art ×2, voting UI, 3 phone screens, 5 social posts | rank posts, neon box, phone mockups, 2 more phone screens |
| Motion | highlight video, 3 clips, 4 stills | the full film (`aca-anashim.mp4`) |
| Rescue | final film, 3 stills, AI/Me split | 3 frame→motion videos, 3 process videos, pilot original/cut-out, C-130 asset |
| Amy | 3 concepts, banner, 2 before/after, desktop + mobile grids | 7 more before/after pairs, logo, 27 badge, roster portraits, archive photos, graphic elements |

---

## 2. Asset inventory (verified on disk; ✔ = used in the plan)

**Amy** — `public/assets/amy`, optimised copies in `public/v2/amy`
- Hero / final: `hero-banner` ✔
- Concepts: `concept-1/2/3` ✔ (with captions you already wrote)
- Before / after: 11 pairs `before-after/001…011` ✔ (only 4 have webp copies; the other 7 get converted)
- Identity: `logo.png` (Hebrew lockup) ✔, `badge-27.png` ✔
- Roster portraits: `roster/*.png` ×11 ✔; archive photos ×4 ✔
- Responsive: `grid-desktop`, `grid-mobile`, `amy-phones(-front)` ✔
- Graphic elements: `bird, rose-1, disk, music-1/2, coin-1/2, box, pie, arrow-amy`. **Need your confirmation** that these are campaign elements.
- `amy-figure-birds-gems.png`, `amy-alone.png` (3D figure renders). **Need your confirmation:** campaign, or old-site decoration?
- `joystick-amy.png`: old-site game badge, **excluded**.

**People in Motion** — `public/assets/motion`
- Full film: `aca-anashim.mp4` (34 MB) ✔ final showcase (README confirms it's this project)
- Highlight: `gameplay_highlight_final.mp4` ✔ hero
- Clips: `02-ui-game-animation`, `03-character-animation`, `people-kinetic-typography` ✔
- Stills: character selection, tetris, mario platform, gold digger, icy tower ✔
- `clips/01-transitions-compositing.mp4` is listed in the README but **is not on disk**.
- `hub/chracter-grid.png` is the SH mascot from the old site, **not this project**, so it's excluded.
- No character sheets, keyframes or process files exist.

**USA Pilot Rescue** — `public/assets/navigator`
- Final film `main-film.mp4` + English captions ✔
- Key frames ×3 + matching motion clips `motion/002, 0023, 007` ✔ (labels and captions already written)
- `pilot-original.png` → `pilot-cutout.png` ✔ (compositing comparison)
- `c13-airplane.png` ✔ (isolated element)
- `process-1/2/3.mp4`: present but **content unverified**. I'll look at them before using them.
- Posters: `poster_navigator`, `poster-ai-homepage` ✔

**Music from the Screen** — `public/assets/galgalatz`
- Key art: `banner-cover`, `poster_galgalts`, `neon-box` ✔
- Phone screens ×5 (labels already written: Key Art, Victory Story ×3, Full Top 50) ✔
- Chart posts: `rank-01/02/03`, `rank-31-50` ✔
- Voting UI board: `game-uiux` ✔; phone mockups `glaglatz-phones`, `n12-phone` ✔
- Social posts `public/galgalts/img_*` ✔
- No video, no desktop version, no motion files.

### Copy that already exists (written for the live site; reused, nothing new invented)
- **Amy:**
  - project intro;
  - 5 visual-language notes (palette, typography, textures, iconography, image treatment);
  - concept captions;
  - lockup and badge notes;
  - desktop/mobile captions;
  - "Views grew from 24,500 → 67,418" (please confirm this number is OK to show).
- **Rescue:**
  - two intros;
  - the 4-step pipeline (News Brief → Frame Direction → AI Motion → Final Compositing);
  - frame labels and captions;
  - "From Frame to Motion" and "Final Broadcast" notes;
  - AI / Me split.
- **Soundtrack:**
  - intro;
  - Challenge → UX idea → Execution → Outcome;
  - Role "Lead Graphic & UI/UX Designer";
  - Crafted "Early 2022".
- **Motion:**
  - intro;
  - 3 discipline captions;
  - "Three motion disciplines demonstrated through real moments from the film".

---

## 3. Reference study

Robin's pages were read from the site's own page data, so the section lists below are his real structure, not a guess. Spencer's patterns were read from his live stylesheet.

### Robin Noguier: the system behind all three projects
His pages are built from a small set of reusable slices, ordered differently per project:

| Slice | What it does |
|---|---|
| `about` | Caption "About the project", big headline, intro paragraph, up to 3 meta pairs, link button |
| `title` | Small number ("01") + big section title |
| `title_paragraph` | Bold lead sentence + body text in two columns |
| `single_video` / `single_image` | Full-grid or full-bleed, optional border, rounded corners, parallax, **centred caption under every visual** |
| `grid2/4/6` | 2, 3–4 or 6 screens in a row, optional numbered "steps" |
| `scroll_slider` | Two rows of images sliding in opposite directions as you scroll |
| `typography_color` | Type specimen + colour swatches |
| `quote` | Large quote, often on a full gradient background |
| `background_trigger` | **Page background colour changes as you scroll into a new act** |
| `credits` | Title / text columns |

**SnickSnack (brand story):** About → hero video → 01 Visual Identity (type + colour) → parallax image → 02–04 feature chapters with screen grids → background shifts (grey → white → near-black) → quote → "What did I learn?" → credits.

**Ueno (creative collection):** About → video → 01 agency + type/colour → two-row scroll slider → homepage video + grid → full-bleed parallax photo → 02 a run of projects, **each with its own background colour** (grey, black, red, light grey), each with a single big visual + credits → closing video.

**Fun (interactive product):** About → prototype reel → 9 numbered chapters, almost all **videos of the actual interactions**, each with a short lead and a caption → gradient "quote" interludes between acts → "Try prototype" links → sign-up → lessons.

**What makes it work:**
- one visual at a time, very large, with a one-line caption;
- text is short and always beside the visual, never a wall;
- colour changes act as chapter breaks;
- a consistent number + title rhythm.

**Adapt:**
- the slice system;
- the background triggers;
- captions under every visual;
- numbered chapters;
- the two-row scroll slider;
- type + colour specimen blocks.

**Do not copy:**
- his fonts, colours, emoji captions, or personal-story sections ("What did I learn?", "Let's work together"). We have no copy for those.

### Spencer Gabor: interaction language
- **Image stacks:** images overlap slightly, each with a small random rotation, and their angle responds to scroll speed (`rotate: base − velocity × 0.25°`).
- **Depth hover:** hovering a stack scales its layers by different amounts (1.01 / 1.02 / 1.03), with a soft three-layer shadow.
- **Elastic ease** on scale (`1s ease-out-elastic`) for a springy, physical feel.
- **Titles pop in word by word:** each word grows from its baseline (`scaleY 0 → 1`, 0.1s stagger).
- **Images pop in with a stagger:** scale 0 → 1, 0.08s apart, after a 0.4s delay.
- **Buttons and links:** scale 1.05 + shadow; footer links stretch vertically (`scaleY 1.2`).
- Every hover sits behind `(any-hover: hover)`, so touch devices never depend on it.

**Adapt:**
- velocity tilt on image stacks;
- word pop on section titles;
- depth hover;
- elastic springs;
- the hover-capable-only rule.

**Do not copy:**
- his illustration style, colour picker or modal project pages.

---

## 4. Shared design system (`src/v2/case/`)

**Kept from the current page:**
- sticky hero with the outlined title that fills in;
- the left wipe from home;
- the next-project hand-over at the bottom.

**Type:**
- Fraunces for titles: section titles clamp 40–96px; chapter numbers as small caps labels.
- Space Grotesk 17–20px for body text, 13px for captions.
- Max text width: 60ch.

**Layout:**
- 12-column grid, 1440px max for visuals, 1180px max for text.
- Full-bleed option for visuals.
- Asymmetric splits (7/5, 5/7) where art direction asks for them.

**Components:**

| Component | Description |
|---|---|
| `Act` | A section with its own background/text colour; the background changes as you scroll into it (Robin's background trigger) |
| `ChapterTitle` | Number + title with Spencer's word pop |
| `Lead` | Bold lead sentence + text |
| `Visual` | Image or video, full-grid or full-bleed, optional parallax, optional frame; centred caption; lazy loaded; click an image to open the lightbox |
| `Grid` | 2/3/4/6 items with optional numbered steps |
| `Stack` | Overlapping tilted images that react to scroll speed and fan out on hover |
| `ScrollRows` | Two rows sliding in opposite directions as you scroll |
| `Specimen` | Type lockup + colour swatches sampled from the real artwork |
| `Compare` | Before/after drag slider (keyboard accessible) |
| `CompareWall` | Grid of before/after cards revealed on hover/tap |
| `FrameToMotion` | Pick a shot; the key frame dissolves into its motion clip |
| `Pipeline` | Numbered steps that highlight as you scroll |
| `Film` | Large player with custom play / mute / fullscreen and captions |
| `Statement` | One large line on a full colour band, using existing copy only |
| `Credits` | Credit columns |
| `NextProject` | The current hand-over |

**Motion:**
- Reveals: fade + 40px rise, 0.9s, ease `[0.22,1,0.36,1]`, once per element.
- Parallax: ±8% on selected visuals only.
- Springs: stiffness 260, damping 18.
- Clips play muted only while in view; the full films use controls and never autoplay with sound.
- **Reduced motion:** velocity tilt, parallax and word pop turn off, and simple fades remain.

**Mobile:**
- Single column, and hover effects become tap.
- Stacks become a horizontal swipe row.
- Compare works by drag.
- Videos use `playsInline` and posters.

**Loading:**
- Images get `loading="lazy"` with width/height set to prevent layout shift.
- Videos use `preload="none"` + poster, except the hero clip.
- The 7 Amy before/after pairs without webp copies are converted to webp; the 34 MB film loads only when played.

---

## 5. The four pages

Each page has its own act colours and rhythm. Sections without real content or assets are **left out or merged**, never filled with invented text. They are marked ⚠.

### 01 · Amy — editorial brand story (SnickSnack, with Ueno)
Personality: magazine spread. Cream paper, black ink, Amy red. Big serif, asymmetric crops, generous margins.

1. **Hero:**
   - `hero-banner` centred;
   - outlined "Amy" fills in;
   - meta: Client N12 · Role Art direction, visual design · Disciplines from the existing line;
   - Year ⚠ (unknown, left out unless you give it).
2. **Story** (cream act):
   - lead = the existing intro (Amy Winehouse, 27 Club, tattoo culture, distressed print);
   - live-project button;
   - views figure as a big statement (if confirmed).
   - A separate "creative idea" paragraph ⚠: needs your text, otherwise this section stays one paragraph.
3. **Creative direction:**
   - the three concepts as an asymmetric trio (large + two stacked), each with its existing caption;
   - they react to scroll speed as a tilted stack.
4. **Visual identity** (specimen):
   - logo lockup large;
   - palette swatches sampled from the banner;
   - the five existing language notes as a numbered list beside close-up crops of the banner (textures, iconography, image treatment).
5. **Banner development:**
   - concepts → final as a horizontal sequence ("From early explorations to the final direction");
   - full-bleed final banner with parallax;
   - detail crops.
6. **Before & after** (black act):
   - one big drag slider (pair 005);
   - below it, a wall of the other 10 pairs that flip from archive photo to treatment on hover/tap.
7. **Identity assets:**
   - lockup + 27 badge (existing notes);
   - roster portraits as a two-row scroll slider;
   - graphic elements floating in a Spencer-style stack ⚠ (only the ones you confirm).
8. **Responsive** (red act):
   - desktop grid full-bleed;
   - phones + mobile grid side by side (existing captions).
9. **Final showcase:**
   - hero banner full-bleed, still and large;
   - then credits → next project.

### 02 · People in Motion — motion playground (Fun)
Personality: the film is the product. Dark stage, yellow and green from the project, everything moves.

1. **Motion hero:** the highlight reel plays full-width the moment the page opens (muted, looping), with the title over it and a short intro.
2. **Concept:**
   - existing lead line;
   - "Three motion disciplines…" note;
   - the five stills as a tilted stack that reacts to scroll speed.
3. **Character design** ⚠: there are no character sheets for this project. Proposal: fold it into "Character animation", using the clip `03-character-animation` large + the character-selection still. If you have sheets, send them.
4. **Animation process** ⚠: no process material exists (you said we'll make the process videos together). Left out for now; the page is built so a process section can drop in later.
5. **UI & game animation:**
   - clip `02` large;
   - game stills (tetris, mario, gold digger, icy tower) in a 4-up grid with steps.
6. **Kinetic typography:** the typography clip, full-bleed, on a yellow act.
7. **Transitions & compositing** ⚠: the dedicated clip is missing from disk. If you have it, it goes here; otherwise this merges into the kinetic-type section, which already covers "scene transitions and visual continuity" per the existing caption.
8. **Final film:**
   - the full `aca-anashim.mp4` in a large player with controls, alone on black;
   - then credits → next project.

### 03 · USA Pilot Rescue — cinematic production breakdown (Fun, with Ueno)
Personality: a dark screening room, letterboxed frames, warm amber labels. It reads as the journey from brief to broadcast.

1. **Hero:** the final-film key frame, letterboxed full-bleed; title; existing intro ("There was no real image… four hours…").
2. **Brief:**
   - the "prime-time N12 visual story under a live-news deadline" line as the lead;
   - the 4-step **Pipeline** (News Brief → Frame Direction → AI Motion → Final Compositing), each step lighting up as you scroll.
3. **Creative direction** ⚠: no written notes on mood or lighting. Proposal: let the frames speak. The three key frames go full-bleed one after another with their existing captions, plus no new text.
4. **Frame direction:** the three key frames as a selectable set (Pilot / Survival, Command Center, Rescue / Extraction).
5. **AI generation:**
   - pilot original → isolated cut-out as a compare slider;
   - the C-130 element.
   - `process-1/2/3` go here if they turn out to be generation passes (I'll check).
6. **Motion generation:** **FrameToMotion**: pick a shot and the still dissolves into its motion clip ("Select a shot, then watch the directed key frame come to life").
7. **Continuity & compositing:** the existing AI / Me split as a full-width band, plus the three motion clips side by side to show consistency across shots.
8. **Final broadcast:**
   - big film player with English captions and the existing note;
   - then credits (Client N12, Role, "4 hours to prime time") → next project.

### 04 · Music from the Screen — digital product presentation (Fun, with Ueno)
Personality: neon cinema in a deep purple night, with sharp product-style grids. It reads as product clarity plus editorial richness.

1. **Hero:**
   - neon key art;
   - title;
   - meta: Client N12 × Galgalatz · Role Lead Graphic & UI/UX Designer · Year Early 2022.
2. **Concept:**
   - existing intro;
   - Challenge → UX idea → Execution → Outcome as four numbered columns.
3. **Visual language:**
   - neon box + poster as an asymmetric pair;
   - palette swatches sampled from the key art.
   - The typography specimen is shown only from the artwork itself; no claims about fonts.
4. **Chart experience:**
   - the top-3 rank posts large, as a tilted stack that reacts to scroll speed;
   - "Full Top 50" (`rank-31-50`).
5. **UI breakdown:**
   - the five phone screens as a numbered 5-up grid with the existing labels;
   - the voting UI board full-width.
6. **Motion & interaction** ⚠: no video or motion files exist for this project. Left out unless you have screen recordings. On-page interaction (the phones tilt toward the cursor and the screens step through like changing channels) shows the flow instead.
7. **Responsive** ⚠: mobile only; no desktop version exists. Shown as "On mobile": the phone mockups + N12 phone.
8. **Final showcase:**
   - the social posts as a two-row scroll slider;
   - then credits → next project.

---

## 6. Build order and testing
1. **Baseline the homepage before any edit:**
   - screenshots at 1440 / 1024 / 768 / 375;
   - a DOM + computed-style snapshot of the home.
2. **Build the shared foundation:** `src/v2/case/` blocks + `case.css`, then the Amy page, then Motion, Rescue and Soundtrack.
3. **Swap in the new page:** switch the project route to the new page (one line in `App.tsx`), and leave the old `ProjectPage.tsx` in place until everything passes.
4. **Test:**
   - 4 routes × 4 widths;
   - images, videos, galleries, compare, lightbox, keyboard and focus;
   - reduced motion;
   - the next-project hand-over loop through all four;
   - `tsc` + production build.
5. **Homepage regression:**
   - `git diff` on Home.tsx, Living.tsx, Contact.tsx, store.tsx, data.ts and geom.ts must be empty, and no existing rule in v2.css may change;
   - re-run the baseline screenshots and DOM snapshot and compare.
6. **Commit locally.** Nothing is pushed or deployed without asking.

**Risks:**
- The home→project wipe lands on the hero geometry in `geom.ts`. The new heroes keep that exact box, or the wipe would jump.
- Video weight: the 34 MB film must stay click-to-load.
