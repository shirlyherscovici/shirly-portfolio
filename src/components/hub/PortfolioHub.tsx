import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Mail, PenTool, Film, Code2, Sparkles, Gamepad2, ArrowRight, TrendingUp, Menu, X } from 'lucide-react'
import { AmyModule, GalgalatzModule, AiModule, MotionModule, CardArrival } from './ProjectModules'
import HeroStage from './HeroStage'
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
// FULL page now (the site is one continuous dark/purple cinematic
// environment top to bottom, not just behind the Hero). Reuses the
// existing `animate-pulse-soft` keyframe (a slow opacity pulse) rather
// than inventing a new one; it already respects the project's global
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
  // Mobile nav — the same three HEADER_LINKS the desktop header already
  // shows, just reachable below the md breakpoint where that nav is
  // hidden. Closes itself after a link is followed since each link is a
  // same-page anchor jump.
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    // The outer shell is plain natural-height flow — only the header+Hero+
    // grid wrapper below locks itself to one desktop viewport (no
    // scrolling to discover the four projects, per explicit direction);
    // the footer lives after it in normal flow, reachable with a small
    // scroll, the same way the approved mockup itself doesn't try to
    // cram a footer into its own one-screen composition either. Below
    // `lg` (tablet/mobile) none of this applies — plain natural-height
    // flow throughout, since forcing "one screen" there would crush the
    // cards unreadably small.
    <div className="relative bg-cine overflow-x-clip flex flex-col">
      {/* Immersive dark/purple environment — spans the ENTIRE page (not a
          capped region behind the Hero), so the Hero, the project cards
          and the footer all read as one continuous cinematic environment.
          The supplied hero-background artwork anchors the top and fades
          out gradually over a long stretch (not a hard cutoff) into
          .bg-cine's own matching dark tone beneath, so there's no visible
          seam where "the photo" ends and "the gradient" begins. */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-[70%] min-h-[520px]">
          <img src={asset('/assets/hub/hero-background.png')} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent 40%, #0b0a14 90%)' }} />
        </div>
        <Starfield />
      </div>

      {/* Header — transparent/integrated with the hero (no heavy solid
          separating bar): backdrop-blur for legibility over the background
          art, no opaque fill of its own. Compact padding (py-2.5/3, was
          3.5/4) — reclaims a little vertical budget toward the one-screen
          composition without visibly cramping it. */}
      {/* A fixed, known height on desktop (lg:h-14, was auto/padding-driven)
          — paired with the footer's own fixed height and the content
          wrapper's matching `calc(100vh - both)` below, this is what makes
          the one-screen budget exact instead of an approximation that can
          drift as copy/spacing changes. */}
      <header className="shrink-0 sticky top-0 z-50 lg:h-14 backdrop-blur-xl border-b bg-[#0e0f18]/25 border-white/10">
        <div className="mx-auto max-w-[1280px] h-full px-4 sm:px-6 lg:px-10 py-2.5 sm:py-3 lg:py-0 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5 group">
            {/* Purple accent (was pearl-red) — matches this site's own
                cinematic purple identity rather than the old light-theme
                red, per explicit direction. Circle/size/position/structure
                all unchanged. */}
            <span className="w-8 h-8 rounded-full bg-white/90 border border-white shadow-pearl-sm flex items-center justify-center font-display font-black text-[11px] text-[#8b5cf6] shrink-0">
              SH
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Shirly Herscovici</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">{PROFESSIONAL_TITLE} · 8+ Years</span>
            </span>
          </a>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-5 lg:gap-6">
              {HEADER_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65 hover:text-white transition-colors">
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-1.5">
              <a
                href={asset('/resume.pdf')}
                download
                className="flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-[11px] font-semibold uppercase tracking-wide transition-colors px-3 py-1.5 rounded-full border border-transparent text-white/70 hover:text-white hover:border-white/15"
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
                className="flex md:hidden items-center justify-center w-11 h-11 rounded-full border border-white/15 text-white/80 hover:bg-white/10 transition-colors"
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
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-2 flex flex-col">
                {HEADER_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    className="py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Content — Hero + grid. On desktop this wrapper gets an exact
          `calc(100vh - header)` height (56px, matching the header's own
          fixed lg height above) and is split into two fixed percentage
          bands below (53/47, matched to the approved mockup's own
          hero:grid proportions) — a hard pixel budget each section is
          centered and clipped within, rather than natural content height
          plus flex-grow, which let the grid silently push past the
          viewport. The footer is NOT part of this budget (see below) —
          reclaiming that height is what let the cards grow back to the
          mockup's own generous size. Below `lg` this is entirely inert
          (plain natural-height flow, scrollable). */}
      <div className="relative z-10 flex flex-col lg:h-[calc(100vh-56px)] lg:overflow-hidden">
        <section
          id="top"
          className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 lg:pt-0 pb-4 sm:pb-6 lg:pb-0 scroll-mt-20 shrink-0 lg:h-[52%] lg:flex lg:items-center lg:overflow-hidden"
        >
          {/* Mobile's own vertical rhythm was compressed here (gap-10→gap-5,
              trimmed mt- steps below) — measured at 863px tall against an
              812px viewport (real mobile browser chrome eats into that
              further), meaning the diorama never landed in the first swipe.
              Desktop/tablet (sm+/lg+) spacing is further compressed again
              for the one-screen composition specifically (lg: steps only). */}
          {/* A real 2-column grid (was flex with hand-tuned 45%/52% widths)
              — two EQUAL columns, so the right column's own center is the
              true horizontal center of its half, not an off-center point
              determined by unequal flex-basis math. Fixes a real reported
              bug: on a wide 1080p external monitor the old right column
              was both wider than the left (52% vs 45%) AND right-justified
              within itself (see below), which visibly dragged the
              character/floating-icon cluster toward the far right edge of
              the container instead of sitting centered over its own half. */}
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-5 lg:gap-4 w-full">
            {/* Left — copy. Left-aligned, compact, premium; no project art
                duplicated here (that used to live in the old centered
                hero) — the diorama on the right carries the "this is a
                game-world designer" signal instead. */}
            <div className="min-w-0 text-center lg:text-left">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center lg:justify-start gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/60"
              >
                <Gamepad2 size={13} className="text-cine-magenta" />
                Shirly Herscovici · {PROFESSIONAL_TITLE} · 8+ Years
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mt-1.5 sm:mt-3 lg:mt-2 font-display font-black text-[2.1rem] sm:text-4xl lg:text-[2.5rem] xl:text-[2.85rem] leading-[1.05] tracking-tight"
              >
                {/* A subtle white-to-silver gradient fill (a soft metallic
                    sheen) instead of flat white, matching the mockup. */}
                <span className="bg-gradient-to-b from-white via-[#e6e6ee] to-[#9d9dae] bg-clip-text text-transparent">
                  Playable Interfaces.
                  <br />
                  Motion Systems.
                </span>
                <br />
                <span className="text-gradient-cine">Cinematic Experiences.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-2 sm:mt-3 text-sm sm:text-base font-medium max-w-md mx-auto lg:mx-0 text-white/60"
              >
                Game UI/UX · Motion Design · Interactive Prototyping · Creative AI
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-3 sm:mt-5 lg:mt-4 flex items-center justify-center lg:justify-start gap-3 flex-wrap"
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
                  className="flex items-center gap-2 px-6 py-3 rounded-full border text-xs font-display font-bold uppercase tracking-wide transition-colors border-white/25 text-white hover:bg-white/10"
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
                className="mt-2.5 sm:mt-4 lg:mt-3 flex items-center justify-center lg:justify-start gap-2 flex-wrap text-[11px] font-medium text-white/55"
              >
                <span className="inline-flex items-center gap-1 font-display font-extrabold text-cine-cyan">
                  <TrendingUp size={13} /> +700% Engagement
                </span>
                <span aria-hidden className="opacity-50">·</span>
                <span>Real shipped work for Waze, Teva, WIX &amp; Mobileye</span>
              </motion.div>
            </div>

            {/* Right — the character + 4 Worlds composition, floating free
                (no card/container). Centered within its own grid cell at
                every size (was `lg:justify-end`, pinning it to the
                column's far edge instead) — HeroStage's own internal
                sizing (see useHeroSizes) already keeps it well clear of
                the left column's text on every viewport this was checked
                against, so centering it here doesn't need its own
                per-breakpoint override. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full flex justify-center items-center"
            >
              <HeroStage onOpen={onOpen} />
            </motion.div>
          </div>
        </section>

        {/* Four premium "world" cards in one balanced row on desktop, 2×2
            on tablet, one column on mobile. Sits directly under the Hero
            now — the old scroll-driven "CinematicTransition" bridge
            (its own aperture/portal animation, and a second, separate
            01–04 numbering) has been removed: it added a scroll-length
            no longer compatible with the one-screen composition, and its
            numbering duplicated the ask to remove the colored numbers
            entirely. */}
        <main
          id="work"
          className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 lg:px-10 pb-4 sm:pb-6 lg:pb-2 shrink-0 lg:h-[48%] lg:flex lg:items-center lg:overflow-hidden scroll-mt-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-5 lg:w-full lg:h-full">
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
      </div>

      {/* Footer — sits in normal flow AFTER the one-screen Hero+grid
          wrapper above (not squeezed into its viewport budget, matching
          the approved mockup, which doesn't fit a footer into its own
          one-screen composition either) — reachable with a small scroll
          past the four projects, never required to see them. A plain top
          border instead of a hard color break, so it still reads as the
          tail end of the same dark interface rather than a separate
          section; semi-transparent so the starfield/background above
          keeps showing straight through it. */}
      <footer id="contact" className="shrink-0 relative z-30 border-t border-white/[0.06] scroll-mt-20 bg-[#0B0C10]/55 backdrop-blur-sm">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 py-4 sm:py-5 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-3">
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
