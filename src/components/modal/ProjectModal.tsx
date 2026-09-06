import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { asset } from '../../lib/asset'

interface ProjectModalProps {
  open: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  children: ReactNode
  labelledBy: string
  /** Optional foreground layer rendered as a sibling of the scrollable
   *  content, inside the (non-clipping) outer panel — for elements that must
   *  visually break the modal's boundary (e.g. the AI Rescue transport
   *  plane) without being cut off by the scroll container's overflow. */
  breakout?: ReactNode
  /** Swaps the plain glass close control for a retro arcade-cabinet look
   *  (solid red square button with a white X) and adds a black joystick
   *  badge in the top-left corner, matching the approved Amy mockup
   *  exactly (checked against the actual reference file, not memory).
   *  Amy only. */
  arcadeChrome?: boolean
  /** A second, smaller joystick badge next to the close button (top-right)
   *  — the approved Galgalatz mockup has its own joystick icon there,
   *  dark/metallic rather than Amy's red-topped one, and doesn't swap the
   *  close button style. */
  joystickBadgeSrc?: string
  /** Swaps the glass pill for a plain outlined square button (border only,
   *  no fill, small centered X) — matches the approved Galgalatz mockup's
   *  close control, distinct from both the default glass pill and Amy's
   *  solid red arcade square. Galgalatz only. */
  outlineClose?: boolean
  /** AI Rescue and People In Motion's mockups show the close control as a
   *  permanently visible text label next to an outlined square X — not a
   *  pill that only reveals "CLOSE" on hover. Pass the exact label text
   *  ("Close" for AI Rescue, "Close Case Study" for People In Motion,
   *  checked against each reference file) to switch to that style. */
  closeLabel?: string
  /** Swaps the closeLabel square's neutral outline for a solid red
   *  "gaming block" (matching Amy's arcade square's color language) — the
   *  plain outline read as an accidental/broken control against AI
   *  Rescue's own cyan/magenta palette. AI Rescue only. */
  closeAccent?: 'red'
  /** Overrides the panel's default max-w-[1180px] — for a case study whose
   *  approved composition is a narrower, portrait-cinematic scene (e.g.
   *  Galgalatz) rather than the shared wide landscape shell. */
  maxWidthClass?: string
}

/** The shared cinematic modal shell every case study opens inside — glass
 *  chrome, backdrop blur, Escape-to-close, scroll lock, and a premium
 *  "game event panel" entrance/exit rather than a flat dialog fade. */
export default function ProjectModal({
  open,
  onClose,
  theme,
  children,
  labelledBy,
  breakout,
  arcadeChrome = false,
  joystickBadgeSrc,
  outlineClose = false,
  closeLabel,
  closeAccent,
  maxWidthClass = 'max-w-[1180px]',
}: ProjectModalProps) {
  const prefersReduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  // What had focus right before the dialog opened — restored on close so a
  // keyboard/screen-reader user lands back where they were, not at the top
  // of the document.
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // Whether the panel is actually in the DOM — deliberately NOT the same
  // thing as `open`. On close we still want the fade/scale-down to play,
  // but removal itself is on a plain timer, not gated on Framer Motion
  // ever reporting the exit animation "complete". That completion signal
  // depends on requestAnimationFrame, which some hosting contexts (a
  // backgrounded/hidden browser tab, confirmed in this project's own dev
  // sandbox) throttle or never fire at all — when that happens the old
  // AnimatePresence-driven exit left the panel sitting in the DOM forever,
  // invisible but still containing elements (like the close button, which
  // has its own explicit `pointer-events-auto`) that could still swallow
  // clicks meant for the page underneath. A timer-based unmount can't get
  // stuck the same way: it fires on the DOM's own clock, not on Framer's
  // animation-progress sampling.
  const [mounted, setMounted] = useState(open)
  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const timer = setTimeout(() => setMounted(false), 320)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    // `mounted` lags `open` by one render on open (see above) — the panel,
    // and therefore `panelRef.current`, doesn't exist in the DOM until
    // `mounted` catches up, so this has to wait for both.
    if (!open || !mounted) return

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null

    // Move the rest of the page out of the tab order (and out of pointer/
    // screen-reader reach) while the dialog is open, using the native
    // `inert` attribute rather than hand-managing every background
    // element's tabIndex. ProjectModal and PortfolioHub are rendered as
    // direct siblings under #root (see App.tsx), so every other child of
    // #root is "the page behind the modal".
    const root = document.getElementById('root')
    const invertedSiblings: HTMLElement[] = []
    if (root) {
      Array.from(root.children).forEach((child) => {
        if (child instanceof HTMLElement && !child.contains(panelRef.current) && child !== panelRef.current) {
          child.setAttribute('inert', '')
          invertedSiblings.push(child)
        }
      })
    }

    // The panel is a plain DOM node under the hood (Framer Motion doesn't
    // delay ref attachment for its own animation bookkeeping), and this
    // effect only runs after React has committed the dialog to the DOM, so
    // the ref is already live here — no need to defer via
    // requestAnimationFrame, which doesn't reliably tick in every hosting
    // context. Focus lands on the dialog itself (tabIndex=-1 below) rather
    // than a specific control inside it, since case-study content varies
    // too much to guess a universally-good first focus target.
    panelRef.current?.focus()

    const getFocusable = () =>
      panelRef.current
        ? Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null)
        : []

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = getFocusable()
      const active = document.activeElement

      if (focusable.length === 0) {
        // Nothing focusable inside yet — keep focus pinned to the dialog
        // itself instead of letting it fall through anywhere else.
        e.preventDefault()
        panelRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      } else if (!panelRef.current.contains(active)) {
        // Focus somehow ended up outside the dialog — pull it back in
        // rather than letting Tab continue from wherever it drifted to.
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      invertedSiblings.forEach((el) => el.removeAttribute('inert'))
      previouslyFocusedRef.current?.focus?.()
    }
  }, [open, mounted, onClose])

  return (
    // This outer shell is ALWAYS mounted (not conditionally rendered via
    // `open &&`), and its pointer-events are driven directly from the live
    // `open` prop — not from Framer's own exit-animation completion — so
    // even during the brief fade-out window (see `mounted` above) nothing
    // here can intercept a click meant for the page behind it.
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 lg:p-10"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
      aria-hidden={!open}
    >
      {/* Backdrop — a dark frosted glass, but lighter than before (was
          /60 + blur-2xl, which compounded with the panel's own tint below
          to read as fully opaque instead of "homepage pushed behind in
          blur"). Now genuinely translucent — the homepage is still
          visibly, if softly, there behind every case study. Its own
          opacity is driven directly from `open` (not an exit animation),
          so it can't get stuck either. */}
      <motion.div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-lg"
        onClick={onClose}
        aria-hidden
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />

      {mounted && (
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            // A static `initial` object combined with a branching `animate`
            // target, under this project's global reducedMotion config,
            // reliably got stuck AT `initial` (permanently opacity:0, but
            // still pointer-events:auto — invisible yet fully interactive,
            // silently swallowing every click meant for the page behind
            // it) instead of ever resolving to `animate`. `initial={false}`
            // skips the entrance reconciliation entirely, sidestepping the
            // stuck state — the same fix already applied elsewhere in this
            // codebase for the identical failure mode.
            initial={prefersReduced ? false : { opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.96, y: open ? 0 : 8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            style={{
              isolation: 'isolate',
              boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 40px 90px -20px rgba(0,0,0,0.6)',
              pointerEvents: open ? 'auto' : 'none',
            }}
            className={`relative w-full ${maxWidthClass} max-h-[90vh] rounded-[28px] sm:rounded-[32px] border outline-none ${
              theme === 'light' ? 'bg-white/25 backdrop-blur-xl border-white/60' : 'bg-slate-900/40 backdrop-blur-xl border-white/15'
            }`}
          >
            {/* Retro joystick accent, top-left, Amy only — a standalone 3D
                render breaking the panel's own top edge (no boxed
                background/border), matching the mockup exactly. The black
                square badge this used to sit in isn't in the reference
                file at all. Enlarged to match the mockup's own scale. */}
            {arcadeChrome && (
              <div
                aria-hidden
                className="absolute -top-4 left-3 sm:-top-5 sm:left-4 z-[90] w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center overflow-visible drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
              >
                <img src={asset('/assets/amy/joystick-amy.png')} alt="" className="w-full h-full object-contain" />
              </div>
            )}

            {/* Galgalatz's own joystick badge — smaller, sits directly next
                to the close button (both top-right) rather than opposite
                corners like Amy's arrangement. Enlarged to match. */}
            {joystickBadgeSrc && (
              <div
                aria-hidden
                className="absolute -top-5 right-16 sm:-top-6 sm:right-20 z-[90] w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-visible drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
              >
                <img src={joystickBadgeSrc} alt="" className="w-full h-full object-contain" />
              </div>
            )}

            {/* Close control. Amy (arcadeChrome) uses a solid red square
                with a white X, matching the mockup's arcade-button style
                exactly. Every other case study keeps the restrained glass
                pill that expands to a "CLOSE" label on hover. */}
            {arcadeChrome ? (
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[100] pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-b from-[#d34f4f] to-[#8f1f2d] border border-white/20 shadow-[0_3px_0_#5e1319,0_6px_14px_-2px_rgba(143,31,45,0.55)] flex items-center justify-center text-white"
              >
                <X size={16} strokeWidth={2.5} />
              </motion.button>
            ) : outlineClose ? (
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[100] pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 border-white/40 hover:border-white/70 hover:bg-white/10 transition-colors flex items-center justify-center text-white"
              >
                <X size={16} strokeWidth={2.5} />
              </motion.button>
            ) : closeLabel ? (
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`absolute top-3 right-3 sm:top-4 sm:right-4 z-[100] pointer-events-auto flex items-center gap-2.5 ${
                  theme === 'light' ? 'text-pearl-ink' : 'text-white'
                }`}
              >
                <span
                  className={
                    closeAccent === 'red'
                      ? 'flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-b from-[#d34f4f] to-[#8f1f2d] border border-white/20 shadow-[0_3px_0_#5e1319,0_6px_14px_-2px_rgba(143,31,45,0.55)] text-white transition-transform hover:scale-105'
                      : `flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border transition-colors ${
                          theme === 'light' ? 'border-pearl-ink/25 hover:bg-pearl-ink/5' : 'border-white/30 hover:bg-white/10'
                        }`
                  }
                >
                  <X size={15} strokeWidth={2.25} />
                </span>
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                whileHover="hover"
                initial="rest"
                whileTap={{ scale: 0.94 }}
                className={`group absolute top-3 right-3 sm:top-4 sm:right-4 z-[100] pointer-events-auto flex items-center gap-1.5 h-9 sm:h-10 pl-2.5 pr-2.5 rounded-full border backdrop-blur-md transition-colors ${
                  theme === 'light'
                    ? 'bg-white/70 border-white/80 text-pearl-ink hover:bg-white/90 shadow-pearl-sm'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <X size={15} strokeWidth={2.25} />
                <motion.span
                  variants={{ rest: { width: 0, opacity: 0, marginRight: -2 }, hover: { width: 'auto', opacity: 1, marginRight: 0 } }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-wide"
                >
                  Close
                </motion.span>
              </motion.button>
            )}

            <div className="relative max-h-[90vh] overflow-y-auto overflow-x-clip no-scrollbar rounded-[28px] sm:rounded-[32px]">
              {children}
            </div>

            {breakout}
          </motion.div>
      )}
    </div>
  )
}
