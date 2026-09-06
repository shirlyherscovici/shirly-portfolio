import type { ReactNode, CSSProperties } from 'react'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface FloatingElementProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
  duration?: number
  distance?: number
  rotate?: number
  /** When false, freezes the float at its rest position instead of
   *  looping — used to stop a homepage card's idle decoration from
   *  animating while the card sits hidden (opacity:0) behind an open
   *  case-study modal. Defaults to true so every other caller (case
   *  studies, breakouts) is unaffected. */
  active?: boolean
  /** Premium hover interaction, replacing the old cursor-flee behavior:
   *  the element springs a small amount TOWARD the cursor, tilts to track
   *  it, and scales up slightly — reads as "notices you" rather than
   *  "dodges you". `true` uses sensible defaults; pass an object to tune
   *  `strength` (px of pull) or `tilt` (max degrees). Requires pointer
   *  events (auto instead of the default none) to receive the hover. */
  magnetic?: boolean | { strength?: number; tilt?: number }
  /** Opt-in — layers a slow scale pulse onto the existing float/rotate
   *  loop, out of phase with it (half the duration, no delay offset) so
   *  the two never lock into a single mechanical beat. Reads as organic
   *  "breathing" rather than a rigid bob. Off by default so every
   *  existing caller (coins, chips, etc.) is unaffected. */
  breathe?: boolean
}

/** A slow, subtle vertical float — used for coins, music notes, tactical
 *  chips and every other foreground object that breaks a panel's bounds.
 *  Optionally adds a magnetic/tilt hover response (see `magnetic`). */
export default function FloatingElement({
  children,
  className = '',
  style,
  delay = 0,
  duration = 5,
  distance = 12,
  rotate = 4,
  active = true,
  magnetic,
  breathe = false,
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null)
  const magConfig = typeof magnetic === 'object' ? magnetic : {}
  const strength = magConfig.strength ?? 8
  const tiltMax = magConfig.tilt ?? 8

  // Breathing runs its own, shorter period with no delay offset — a flat
  // shared transition (fine for the plain y/rotate float) would lock
  // scale to the exact same beat as the bob, which reads as mechanical
  // rather than organic. Per-key transitions only kick in when `breathe`
  // is on, so every existing non-breathing caller is byte-for-byte
  // unchanged.
  const floatAnimate = active
    ? breathe
      ? { y: [0, -distance, 0], rotate: [0, rotate, 0], scale: [1, 1.045, 1] }
      : { y: [0, -distance, 0], rotate: [0, rotate, 0] }
    : breathe
      ? { y: 0, rotate: 0, scale: 1 }
      : { y: 0, rotate: 0 }
  const floatTransition = breathe
    ? {
        y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
        rotate: { duration, repeat: Infinity, ease: 'easeInOut', delay },
        scale: { duration: duration * 0.6, repeat: Infinity, ease: 'easeInOut' },
      }
    : { duration, repeat: Infinity, ease: 'easeInOut', delay }

  // Cursor position within the element's own bounding box, 0..1 on each
  // axis, resting at the center (0.5, 0.5) when untouched.
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const springConfig = { stiffness: 220, damping: 16, mass: 0.4 }
  const magX = useSpring(useTransform(mx, [0, 1], [-strength, strength]), springConfig)
  const magY = useSpring(useTransform(my, [0, 1], [-strength, strength]), springConfig)
  const tiltX = useSpring(useTransform(my, [0, 1], [tiltMax, -tiltMax]), springConfig)
  const tiltY = useSpring(useTransform(mx, [0, 1], [-tiltMax, tiltMax]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }
  const handleMouseLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      className={`select-none ${magnetic ? 'pointer-events-auto cursor-default' : 'pointer-events-none'} ${className}`}
      style={style}
      onMouseMove={magnetic ? handleMouseMove : undefined}
      onMouseLeave={magnetic ? handleMouseLeave : undefined}
      animate={floatAnimate}
      transition={floatTransition}
    >
      {/* The idle float/rotate loop above and the magnetic pull/tilt below
          are kept on two separate elements — both animate transform
          properties, and Framer's `animate` keyframes vs. externally-driven
          motion values fight over the same style key if combined on one
          node. Nesting sidesteps that entirely. */}
      {magnetic ? (
        <motion.div
          style={{ x: magX, y: magY, rotateX: tiltX, rotateY: tiltY }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  )
}
