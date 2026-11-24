import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { PaletteName } from './data'

/* ---------- Hash router: #/ , #/project/:slug , #/about ---------- */
export type Route = { page: 'home' } | { page: 'project'; slug: string } | { page: 'about' }

function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, '')
  const [a, b] = h.split('/')
  if (a === 'project' && b) return { page: 'project', slug: b }
  if (a === 'about') return { page: 'about' }
  return { page: 'home' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))
  useEffect(() => {
    const on = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export const href = {
  home: '#/',
  about: '#/about',
  project: (slug: string) => `#/project/${slug}`,
}

export function go(to: string) {
  if (window.location.hash !== to) window.location.hash = to
}

/* ---------- Palette (Spencer-style toggle) ---------- */
type PaletteCtx = { palette: PaletteName; setPalette: (p: PaletteName) => void }
const Ctx = createContext<PaletteCtx>({ palette: 'color', setPalette: () => {} })

export function PaletteProvider({ children }: { children: ReactNode }) {
  const [palette, setPaletteState] = useState<PaletteName>(() => {
    try {
      const v = localStorage.getItem('sh-palette')
      if (v === 'night' || v === 'paper' || v === 'color') return v
    } catch {
      /* storage unavailable */
    }
    return 'color'
  })
  const setPalette = (p: PaletteName) => {
    setPaletteState(p)
    try {
      localStorage.setItem('sh-palette', p)
    } catch {
      /* storage unavailable */
    }
  }
  return <Ctx.Provider value={{ palette, setPalette }}>{children}</Ctx.Provider>
}

export const usePalette = () => useContext(Ctx)

/* ---------- Shared "current page colour" so fixed UI can adapt ---------- */
type ToneCtx = { bg: string; fg: string; setTone: (t: { bg: string; fg: string }) => void }
const Tone = createContext<ToneCtx>({ bg: '#111', fg: '#fff', setTone: () => {} })

export function ToneProvider({ children }: { children: ReactNode }) {
  const [tone, setTone] = useState({ bg: '#ff8fb8', fg: '#1d3a2f' })
  return <Tone.Provider value={{ ...tone, setTone }}>{children}</Tone.Provider>
}

export const useTone = () => useContext(Tone)

/* ---------- Hover-capable pointer ---------- */
export function useCanHover() {
  const [can, setCan] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const on = () => setCan(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return can
}
