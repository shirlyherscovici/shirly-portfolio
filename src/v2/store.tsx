import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

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

/* ---------- Shared-image page transition ---------- */
/** `handoff` is the next-project hand-over: the old page already played the move, so just swap pages */
export type Flight = { slug: string; src: string; rect: { x: number; y: number; w: number; h: number }; bg: string; handoff?: boolean } | null
type FlightCtx = { flight: Flight; fly: (f: NonNullable<Flight>) => void; land: () => void }
const FlightC = createContext<FlightCtx>({ flight: null, fly: () => {}, land: () => {} })

export function FlightProvider({ children }: { children: ReactNode }) {
  const [flight, setFlight] = useState<Flight>(null)
  const land = useCallback(() => setFlight(null), [])
  const value = useMemo(() => ({ flight, fly: setFlight, land }), [flight, land])
  return <FlightC.Provider value={value}>{children}</FlightC.Provider>
}

export const useFlight = () => useContext(FlightC)

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
