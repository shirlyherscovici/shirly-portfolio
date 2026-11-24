import { useEffect, useRef } from 'react'
import type { MediaItem } from './data'

/** Image or video. Silent loops play only while on screen; a video with
 *  captions is treated as "the film" and gets real controls instead. */
export function Media({ item, className = '', eager = false }: { item: MediaItem; className?: string; eager?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const isFilm = item.kind === 'video' && !!item.captions

  useEffect(() => {
    const v = ref.current
    if (!v || isFilm) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [isFilm])

  const style = item.ratio ? { aspectRatio: item.ratio } : undefined
  const fit = item.kind === 'image' && item.fit === 'contain' ? 'contain' : 'cover'

  return (
    <figure className={`v2-media ${className}`}>
      <div className={`v2-media-box fit-${fit}`} style={style}>
        {item.kind === 'image' ? (
          <img src={item.src} alt={item.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        ) : isFilm ? (
          <video ref={ref} src={item.src} poster={item.poster} controls playsInline preload="none" aria-label={item.alt}>
            <track kind="captions" src={item.captions} srcLang="en" label="English" default />
          </video>
        ) : (
          <video ref={ref} src={item.src} poster={item.poster} muted loop playsInline preload="none" aria-label={item.alt} />
        )}
      </div>
      {item.caption && <figcaption>{item.caption}</figcaption>}
    </figure>
  )
}
