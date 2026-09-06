import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Mail, PenTool, Film, Sparkles, Code2, Moon, Sun, Gamepad2, ArrowRight, TrendingUp, Menu, X } from 'lucide-react'
import { AmyModule, GalgalatzModule, AiModule, MotionModule, CardArrival } from './ProjectModules'
import HeroStage from './HeroStage'
import CinematicTransition from './CinematicTransition'
import { useDarkMode } from '../../lib/darkMode'
import type { ProjectId } from '../../types'
import { asset } from '../../lib/asset'
import { PROFESSIONAL_TITLE } from '../../lib/siteMeta'

const NAV_ITEMS = [
  { label: 'Design Strategy', icon: PenTool, glow: 'rgba(201,161,90,0.6)' },
  { label: 'Motion Development', icon: Film, glow: 'rgba(255,95,160,0.6)' },
  { label: 'Front End Development', icon: Code2, glow: 'rgba(79,216,255,0.6)' },
  { label: 'AI Creation', icon: Sparkles, glow: 'rgba(185,140,255,0.6)' },
]

// A fixed, deterministic scatter of small twinkling stars — spans the
// FULL page height (unlike the hero-background photo, which is capped to
// the top section) so the same gentle starfield continues behind the grid
// and the footer instead of stopping partway down the page. Reuses the
// existing `animate-pulse-soft` keyframe (a slow opacity pulse) rather than
// inventing a new one; it already respects the project's global
// prefers-reduced-motion override in index.css.
const STARS = [
  { x: 6, y: 4, size: 2, delay: 0 },
  { x: 18, y: 12, size: 1.5, delay: 0.8 },
  { x: 32, y: 3, size: 1.5, delay: 1.6 },
  { x: 47, y: 9, size: 2, delay: 0.4 },
  { x: 61, y: 5, size: 1.5, delay: 1.2 },
  { x: 78, y: 14, size: 2, delay: 0.2 },
  { x: 91, y: 6, size: 1.5, delay: 1.8 },
  { x: 9, y: 24, size: 1.5, delay: 1.0 },
  { x: 26, y: 30, size: 2, delay: 0.6 },
  { x: 41, y: 21, size: 1.5, delay: 1.4 },
  { x: 55, y: 33, size: 1.5, delay: 0.3 },
  { x: 70, y: 26, size: 2, delay: 1.1 },
  { x: 85, y: 35, size: 1.5, delay: 0.7 },
  { x: 4, y: 48, size: 2, delay: 1.5 },
  { x: 22, y: 55, size: 1.5, delay: 0.5 },
  { x: 38, y: 44, size: 1.5, delay: 1.3 },
  { x: 52, y: 58, size: 2, delay: 0.9 },
  { x: 67, y: 47, size: 1.5, delay: 0.1 },
  { x: 82, y: 60, size: 1.5, delay: 1.7 },
  { x: 95, y: 50, size: 2, delay: 0.4 },
  { x: 13, y: 70, size: 1.5, delay: 1.2 },
  { x: 30, y: 78, size: 2, delay: 0.6 },
  { x: 46, y: 68, size: 1.5, delay: 1.6 },
  { x: 63, y: 82, size: 1.5, delay: 0.2 },
  { x: 79, y: 72, size: 2, delay: 1.0 },
  { x: 92, y: 85, size: 1.5, delay: 0.8 },
  { x: 8, y: 92, size: 2, delay: 1.4 },
  { x: 35, y: 95, size: 1.5, delay: 0.3 },
  { x: 58, y: 90, size: 1.5, delay: 1.1 },
  { x: 88, y: 96, size: 2, delay: 0.5 },
]

function Starfield() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-pulse-soft"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${2.6 + (i % 3) * 0.5}s`,
            boxShadow: '0 0 4px rgba(255,255,255,0.8)',
          }}
        />
      ))}
    </div>
  )
}

// Top-nav links — anchor to real sections that already exist on the page
// rather than inventing new ones. "About" jumps back to the hero's own
// intro copy (the closest thing this single-page portfolio has to an About
// blurb); "Contact" jumps to the footer's real mailto CTA; "Resume"
// downloads the real resume file directly instead of scrolling.
const HEADER_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#top' },
  { label: 'Contact', href: '#contact' },
]

interface PortfolioHubProps {
  onOpen: (id: ProjectId) => void
  /** The project whose modal is currently open, if any — its own card is
   *  hidden (not unmounted) while open, so Framer Motion's shared
   *  `layoutId` can animate the card smoothly morphing into the modal
   *  panel instead of a generic dialog popping up disconnected from it. */
  openId: ProjectId | null
}

export default function PortfolioHub({ onOpen, openId }: PortfolioHubProps) {
  // Whole-site dark mode — shared with the case study modals via context
  // (App.tsx renders them as PortfolioHub's siblings, not children, so
  // this can't live as local state here anymore now that Amy and After
  // Effects also follow it).
  const { dark, toggle: setDark } = useDarkMode()

  // Mobile nav — the same three HEADER_LINKS the desktop header already
  // shows, just reachable below the md breakpoint where that nav is
  // hidden. Closes itself after a link is followed since each link is a
  // same-page anchor jump.
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className={`relative min-h-screen overflow-x-clip flex flex-col transition-colors duration-500 ${dark ? 'bg-cine' : 'bg-hub'}`}>
      {/* Immersive dark environment — the supplied hero-background artwork
          (a real image, not a CSS gradient recreation) covers the hero and
          top of the grid, fading into the page's own dark gradient
          (bg-cine, applied to this whole wrapper) rather than ending on a
          hard edge. A full page-height starfield continues on top of that
          same dark gradient all the way down, so the background now
          genuinely reaches the footer instead of stopping partway down the
          page. Dark mode only: the image is a night/cosmic scene that
          would fight the pearl-light palette, so light mode keeps its
          existing plain background untouched. */}
      {dark ? (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-[820px] sm:h-[900px] lg:h-[980px]">
            <img src={asset('/assets/hub/hero-background.png')} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0e0f18]" />
          </div>
          <Starfield />
        </div>
      ) : (
        /* Light mode's own atmosphere — not the night-sky photo (it would
           fight the pearl-light palette, per the note above), but the same
           idea expressed as color: a soft, color-only echo of the
           diorama's own gem/coin/flag palette (purple, gold, teal — the
           exact accents already used on the waypoint rings and the cards
           below), positioned roughly where the diorama sits and fading
           down toward the grid. Previously light mode had zero atmospheric
           connection between the diorama and the cards below it — the
           diorama just floated on the page's flat default wash. This gives
           it a "world" in both themes, not just dark. */
        <div className="absolute inset-x-0 top-0 z-0 pointer-events-none overflow-hidden h-[820px] sm:h-[900px] lg:h-[980px]" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 40% at 78% 18%, rgba(139,92,246,0.14), transparent 60%), ' +
                'radial-gradient(ellipse 50% 35% at 88% 48%, rgba(255,159,69,0.10), transparent 65%), ' +
                'radial-gradient(ellipse 45% 35% at 62% 58%, rgba(79,216,255,0.08), transparent 70%)',
            }}
          />
        </div>
      )}

      {/* Header — transparent/integrated with the hero (no heavy solid
          separating bar): backdrop-blur for legibility over the background
          art, but no opaque fill of its own in dark mode. */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${
          dark ? 'bg-[#0e0f18]/25 border-white/10' : 'bg-[#fdfaf7]/85 border-pearl-ink/5'
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-3.5 sm:py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-full bg-white/80 border border-white shadow-pearl-sm flex items-center justify-center font-display font-black text-[11px] text-pearl-red shrink-0">
              SH
            </span>
            <span className="leading-tight">
              <span className={`block text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${dark ? 'text-white group-hover:text-white' : 'text-pearl-ink'}`}>
                Shirly Herscovici
              </span>
              <span className={`block text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors ${dark ? 'text-white/50' : 'text-pearl-sub'}`}>
                {PROFESSIONAL_TITLE} · 8+ Years
              </span>
            </span>
          </a>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-5 lg:gap-6">
              {HEADER_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className={`text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                    dark ? 'text-white/65 hover:text-white' : 'text-pearl-sub hover:text-pearl-ink'
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-1.5">
              {/* Dark-mode toggle — a game-menu-style dark background with
                  real depth (soft glows, not a flat color swap), per
                  explicit request. */}
              <button
                type="button"
                onClick={setDark}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={dark}
                className={`flex items-center justify-center w-11 h-11 sm:w-8 sm:h-8 rounded-full border transition-colors ${
                  dark ? 'border-white/15 text-white/80 hover:bg-white/10' : 'border-transparent text-pearl-sub hover:border-pearl-sub/20 hover:text-pearl-ink'
                }`}
              >
                {dark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <a
                href={asset('/resume.pdf')}
                download
                className={`flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-[11px] font-semibold uppercase tracking-wide transition-colors px-3 py-1.5 rounded-full border border-transparent ${
                  dark ? 'text-white/70 hover:text-white hover:border-white/15' : 'text-pearl-sub hover:text-pearl-ink hover:border-pearl-sub/20'
                }`}
              >
                <Download size={12} /> <span className="hidden sm:inline">Resume</span>
              </a>
              {/* Mobile nav toggle — the desktop <nav> above is `hidden
                  md:flex`, so below that breakpoint Work/About/Contact were
                  otherwise unreachable from the header. Reveals the same
                  HEADER_LINKS in a small dropdown rather than a full-screen
                  takeover, matching the header's own restrained scale. */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-nav-menu"
                className={`flex md:hidden items-center justify-center w-11 h-11 rounded-full border transition-colors ${
                  dark ? 'border-white/15 text-white/80 hover:bg-white/10' : 'border-transparent text-pearl-sub hover:border-pearl-sub/20 hover:text-pearl-ink'
                }`}
              >
                {mobileNavOpen ? <X size={14} /> : <Menu size={14} />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.nav
              id="mobile-nav-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`md:hidden overflow-hidden border-t ${dark ? 'border-white/10' : 'border-pearl-ink/5'}`}
            >
              <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2 flex flex-col">
                {HEADER_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      dark ? 'text-white/70 hover:text-white' : 'text-pearl-sub hover:text-pearl-ink'
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <section id="top" className="relative z-10 mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 pt-4 sm:pt-10 lg:pt-12 pb-4 sm:pb-10 scroll-mt-20">
        {/* Mobile's own vertical rhythm was compressed here (gap-10→gap-5,
            trimmed mt- steps below) — measured at 863px tall against an
            812px viewport (real mobile browser chrome eats into that
            further), meaning the diorama never landed in the first swipe.
            Desktop/tablet (sm+/lg+) spacing is untouched. */}
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-5 lg:gap-6">
          {/* Left — copy, ~45% width on desktop. Left-aligned, compact,
              premium; no project art duplicated here (that used to live in
              the old centered hero) — the diorama on the right carries the
              "this is a game-world designer" signal instead. */}
          <div className="lg:w-[45%] min-w-0 text-center lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`flex items-center justify-center lg:justify-start gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] transition-colors duration-500 ${dark ? 'text-white/60' : 'text-pearl-sub'}`}
            >
              <Gamepad2 size={13} className={dark ? 'text-cine-magenta' : 'text-pearl-red'} />
              Shirly Herscovici · {PROFESSIONAL_TITLE} · 8+ Years
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className={`mt-2 sm:mt-4 font-display font-black text-[2.4rem] sm:text-5xl lg:text-[3.4rem] xl:text-[3.75rem] leading-[1.03] tracking-tight transition-colors duration-500 ${dark ? '' : 'text-pearl-ink'}`}
            >
              {/* Dark mode: a subtle white-to-silver gradient fill (a soft
                  metallic sheen) instead of flat white, matching the
                  mockup — light mode keeps the plain solid ink color. */}
              <span className={dark ? 'bg-gradient-to-b from-white via-[#e6e6ee] to-[#9d9dae] bg-clip-text text-transparent' : ''}>
                Playable Interfaces.
                <br />
                Motion Systems.
              </span>
              <br />
              <span className={dark ? 'text-gradient-cine' : 'text-pearl-red'}>Cinematic Experiences.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`mt-2 sm:mt-4 text-sm sm:text-base font-medium max-w-md mx-auto lg:mx-0 transition-colors duration-500 ${dark ? 'text-white/60' : 'text-pearl-sub'}`}
            >
              Game UI/UX · Motion Design · Interactive Prototyping · Creative AI
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 sm:mt-7 flex items-center justify-center lg:justify-start gap-3 flex-wrap"
            >
              <motion.a
                href="#work"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-[#c4a2ff] via-[#8b5cf6] to-[#5b21b6] text-white text-xs font-display font-bold uppercase tracking-wide shadow-[0_0_24px_rgba(139,92,246,0.5),0_0_50px_rgba(139,92,246,0.22)]"
              >
                View Featured Work <ArrowRight size={14} />
              </motion.a>
              <motion.a
                href={asset('/resume.pdf')}
                download
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border text-xs font-display font-bold uppercase tracking-wide transition-colors ${
                  dark ? 'border-white/25 text-white hover:bg-white/10' : 'border-pearl-ink/20 text-pearl-ink hover:bg-pearl-ink/5'
                }`}
              >
                <Download size={13} /> Resume
              </motion.a>
            </motion.div>

            {/* Credibility line — surfaces the one hard number on the whole
                site (+700%, already shown inside the Galgalatz card) and
                the real client names visible in the Motion card's own
                artwork, right in the first 5 seconds instead of only below
                the fold. Deliberately small/quiet — a trust line, not a
                second headline — so it doesn't compete with the hero copy
                above it. */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`mt-3 sm:mt-5 flex items-center justify-center lg:justify-start gap-2 flex-wrap text-[11px] font-medium ${dark ? 'text-white/55' : 'text-pearl-sub'}`}
            >
              <span className={`inline-flex items-center gap-1 font-display font-extrabold ${dark ? 'text-cine-cyan' : 'text-pearl-red'}`}>
                <TrendingUp size={13} /> +700% Engagement
              </span>
              <span aria-hidden className="opacity-50">·</span>
              <span>Real shipped work for Waze, Teva, WIX &amp; Mobileye</span>
            </motion.div>
          </div>

          {/* Right — the character + 4 Worlds composition, floating free
              (no card/container), ~52% of this row's width so it lands in
              the ~38–46% of total page width the brief calls for. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full lg:w-[52%] flex justify-center lg:justify-end"
          >
            <HeroStage onOpen={onOpen} />
          </motion.div>
        </div>
      </section>

      {/* The real bridge between the diorama and the grid — a contained
          scroll-driven scene (camera aperture, a portal, the four worlds
          announcing themselves), not a static line pretending to be one.
          See CinematicTransition's own notes for how it behaves under
          reduced motion and why it hands off cleanly with no dead pause. */}
      <CinematicTransition />

      <main id="work" className="relative z-10 mx-auto max-w-[1400px] w-full px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 flex-1 scroll-mt-20">
        {/* Four premium "world" cards in one balanced row on desktop (per
            the homepage-navigation redesign brief), 2×2 on tablet, one
            column on mobile — replacing the old asymmetric bento grid
            (one big featured card + a wide banner + two compact tiles).
            Each card is its own uniform glass surface now (WorldCard, in
            ProjectModules), so the row itself is just a plain grid — no
            row-span/featured/wide/compact size variants left to
            coordinate here. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          <CardArrival index={0} accent="#8b5cf6">
            <GalgalatzModule onClick={() => onOpen('galgalatz')} hidden={openId === 'galgalatz'} />
          </CardArrival>
          <CardArrival index={1} accent="#ffb454">
            <MotionModule onClick={() => onOpen('people-motion')} hidden={openId === 'people-motion'} />
          </CardArrival>
          <CardArrival index={2} accent="#4fd8ff">
            <AiModule onClick={() => onOpen('ai-rescue')} hidden={openId === 'ai-rescue'} />
          </CardArrival>
          <CardArrival index={3} accent="#ff5fa0">
            <AmyModule onClick={() => onOpen('amy')} hidden={openId === 'amy'} />
          </CardArrival>
        </div>
      </main>

      {/* Light mode only: the page's own light pearl background meets the
          footer's near-black fill with nothing between them (dark mode
          doesn't need this — the starfield/gradient above already carries
          the same dark tone straight down to the footer's own semi-
          transparent fill). A short fade bridges the two rather than
          cutting from light to black in a single pixel. */}
      {!dark && (
        <div
          className="relative z-20 h-10 sm:h-14 -mb-10 sm:-mb-14 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0B0C10)' }}
          aria-hidden
        />
      )}

      {/* Footer — a slim, flush strip directly under the grid rather than a
          heavy standalone black slab: a plain top border instead of a hard
          color break, so it reads as the tail end of the same dark
          interface rather than a separate section cutting the composition.
          Semi-transparent in dark mode so the starfield/background above
          keeps showing straight through it, per explicit "I want the
          background on the footer too" feedback; opaque in light mode,
          where there is no background image to show. */}
      <footer id="contact" className={`relative z-30 border-t border-white/[0.06] scroll-mt-20 ${dark ? 'bg-[#0B0C10]/55 backdrop-blur-sm' : 'bg-[#0B0C10]'}`}>
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-4 sm:py-5 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-4">
          <div className="text-center lg:text-left">
            <p className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight">SHIRLY HERSCOVICI</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60 mt-0.5">{PROFESSIONAL_TITLE}</p>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-center">
            {NAV_ITEMS.map(({ label, icon: Icon, glow }) => (
              <span
                key={label}
                style={{ ['--glow' as string]: glow }}
                className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-white/70 hover:text-white transition-colors px-2 py-1.5 rounded-full hover:bg-white/10 cursor-default group/nav"
              >
                <Icon size={12} className="shrink-0 transition-[filter] duration-300 [filter:drop-shadow(0_0_0_transparent)] group-hover/nav:[filter:drop-shadow(0_0_6px_var(--glow))]" />
                <span className="hidden md:inline leading-tight">{label}</span>
              </span>
            ))}
          </nav>

          {/* Glowing purple pill, per spec */}
          <motion.a
            href="mailto:shirly3212@gmail.com"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white text-xs font-display font-bold uppercase tracking-wide shadow-[0_0_24px_rgba(139,92,246,0.55),0_0_50px_rgba(139,92,246,0.25)] shrink-0"
          >
            <Mail size={13} /> Let&apos;s Create Magic <span aria-hidden>→</span>
          </motion.a>
        </div>
      </footer>
    </div>
  )
}
