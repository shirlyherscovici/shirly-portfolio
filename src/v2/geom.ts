/** Where the cover sits on a project page hero. Mirrors .v2-hero-media in v2.css. */
export function heroBox() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const w = vw < 760 ? vw * 0.84 : Math.min(vw * 0.5, 860)
  const h = w * 0.625
  return { x: (vw - w) / 2, y: (vh - h) / 2, w, h }
}
