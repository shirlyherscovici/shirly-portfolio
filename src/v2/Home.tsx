import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PROJECTS, themeFor } from './data'
import { go, href, usePalette, useTone } from './store'

function useViewport() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

export function Home({ start = 0, onIndex }: { start?: number; onIndex?: (i: number) => void }) {
  const [idx, setIdx] = useState(start)
  const [dir, setDir] = useState(1)
  const { palette } = usePalette()
  const { setTone } = useTone()
  const reduce = useReducedMotion()
  const vw = useViewport()
  const lock = useRef(0)
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null)
  const dragged = useRef(false)

  const n = PROJECTS.length
  const p = PROJECTS[idx]
  const theme = themeFor(p, palette)

  useEffect(() => {
    setTone(theme)
    onIndex?.(idx)
  }, [theme.bg, theme.fg, idx]) // eslint-disable-line react-hooks/exhaustive-deps

  const to = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(n - 1, i))
      if (next === idx) return
      setDir(next > idx ? 1 : -1)
      setIdx(next)
    },
    [idx, n],
  )

  // Wheel and keyboard
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (Math.abs(d) < 18) return
      const now = Date.now()
      if (now < lock.current) return
      lock.current = now + 850
      to(idx + (d > 0 ? 1 : -1))
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to(idx + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to(idx - 1)
      if (e.key === 'Enter' && document.activeElement === document.body) go(href.project(p.slug))
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [idx, to, p.slug])

  const mobile = vw < 760
  const slideW = mobile ? vw * 0.78 : Math.min(vw * 0.44, 680)
  const gap = mobile ? 16 : 48

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, moved: false }
  }
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const dx = e.clientX - d.x
    dragged.current = Math.abs(dx) > 8
    if (Math.abs(dx) > 45) to(idx + (dx < 0 ? 1 : -1))
  }

  const ease = [0.76, 0, 0.24, 1] as const

  return (
    <motion.main
      className="v2-home"
      animate={{ backgroundColor: theme.bg, color: theme.fg }}
      transition={{ duration: reduce ? 0 : 0.7, ease }}
      onPointerDown={onDown}
      onPointerUp={onUp}
    >
      <div className="v2-dashes" role="tablist" aria-label="Projects">
        {PROJECTS.map((q, i) => (
          <button
            key={q.slug}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={q.name}
            onClick={() => to(i)}
            className={i === idx ? 'on' : ''}
            style={{ background: theme.fg }}
          />
        ))}
      </div>

      <div className="v2-track" style={{ height: (slideW * 10) / 16 }}>
        {PROJECTS.map((q, i) => {
          const off = i - idx
          const active = off === 0
          return (
            <motion.a
              key={q.slug}
              href={href.project(q.slug)}
              className="v2-slide"
              data-cursor={active ? 'View' : off > 0 ? 'Next' : 'Back'}
              tabIndex={active ? 0 : -1}
              aria-label={`${q.name}, open project`}
              onClick={(e) => {
                if (dragged.current) {
                  e.preventDefault()
                  dragged.current = false
                  return
                }
                if (!active) {
                  e.preventDefault()
                  to(i)
                }
              }}
              style={{ width: slideW, left: `calc(50% - ${slideW / 2}px)` }}
              animate={{ x: off * (slideW + gap), scale: active ? 1 : 0.86, opacity: Math.abs(off) > 1 ? 0 : 1 }}
              transition={{ duration: reduce ? 0 : 0.9, ease }}
              whileHover={active && !reduce ? { scale: 1.03 } : undefined}
              draggable={false}
            >
              <img src={q.cover.src} alt={q.cover.kind === 'image' ? q.cover.alt : q.name} draggable={false} loading={Math.abs(off) <= 1 ? 'eager' : 'lazy'} />
              {active && q.loop && !reduce && (
                <video className="v2-slide-loop" src={q.loop} autoPlay muted loop playsInline aria-hidden="true" />
              )}
            </motion.a>
          )
        })}
      </div>

      <h1 className="v2-word" aria-live="polite">
        <a href={href.project(p.slug)} data-cursor="View" className="v2-word-link">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.span key={p.slug} className="v2-word-inner" aria-label={p.word}>
              {p.word.split('').map((ch, k) => (
                <motion.span
                  key={k}
                  className="v2-char"
                  aria-hidden="true"
                  initial={{ y: reduce ? 0 : '105%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: reduce ? 0 : '-105%' }}
                  transition={{ duration: 0.7, ease, delay: reduce ? 0 : k * 0.035 }}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </a>
      </h1>

      <div className="v2-home-foot v2-label">
        <span>
          {String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
        <AnimatePresence mode="wait">
          <motion.span key={p.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {p.name} · {p.kind}
          </motion.span>
        </AnimatePresence>
        <span className="v2-hint">{mobile ? 'Swipe' : 'Scroll or drag'}</span>
      </div>
    </motion.main>
  )
}
