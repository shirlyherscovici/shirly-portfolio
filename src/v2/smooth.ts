import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/** Smooth, weighted scrolling (like robin-noguier.com) on the pages that read top to bottom.
 *  The home strip keeps the browser's own scroll, because it snaps from project to project.
 *  Touch keeps native scrolling; only the wheel and keys are eased. */
export function useSmoothScroll(on: boolean, page: string) {
  useEffect(() => {
    if (!on) return
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true })
    let id = 0
    const raf = (t: number) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    // when something locks the page (the lightbox), pause the smooth scroll too
    const html = document.documentElement
    const mo = new MutationObserver(() => (html.style.overflow === 'hidden' ? lenis.stop() : lenis.start()))
    mo.observe(html, { attributes: true, attributeFilter: ['style'] })
    return () => {
      cancelAnimationFrame(id)
      mo.disconnect()
      lenis.destroy()
    }
  }, [on, page])
}
