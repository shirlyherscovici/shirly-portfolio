import { useEffect, useState } from 'react'

const QUERY = '(hover: hover) and (pointer: fine)'

/** True when the current input is capable of a real, sustained hover
 *  (mouse/trackpad) — false on touch-only devices.
 *
 *  Used to gate the project cards' transform-driven `whileHover` lift
 *  (translateY + scale). On a touch device that transform was firing the
 *  instant a tap registered — Framer Motion treats a touch's pointerenter
 *  as a hover start — which physically moved the card out from under the
 *  finger between touchstart and the browser's synthetic click, so the
 *  click's hit-test missed the (now-shifted) button and the first tap
 *  silently did nothing but show the hover decorations. Hover-triggered
 *  decorations that don't move the element (glow, particle bursts, SFX)
 *  are untouched by this — only the lift/scale transform is gated. */
export function useCanHover() {
  const [canHover, setCanHover] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : true))

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = () => setCanHover(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return canHover
}
