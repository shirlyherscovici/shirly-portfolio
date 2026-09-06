import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParticleBurst } from '../ui/ParticleBurst'
import { playGuitarPluck } from '../../lib/sfx'
import { asset } from '../../lib/asset'

interface RosterMember {
  name: string
  front: string
  /** Real archive photograph, where one exists in the source material. */
  back?: string
  /** CSS object-position for the back (archive) photo, overriding the
   *  default `object-top` — only set where a plain top-crop actually cuts
   *  into the face. Most archive photos already have the face positioned
   *  near the top of the frame, so `object-top` alone keeps them whole;
   *  a few tighter headshots have the face centered lower in the source
   *  image, and a flat top-crop was cutting off the chin/mouth. Checked
   *  every one of the 10 photos directly against its rendered crop before
   *  adding an override here — this is not a blanket change. */
  backFocus?: string
}

/** Sourced from the real /public/AMY/AMY/Before&After archive — front shows
 *  the restored, game-ready artwork; back reveals the raw archive photo it
 *  was built from. */
const ROSTER: RosterMember[] = [
  { name: 'Robert Johnson', front: '/assets/amy/before-after/001-after.jpg', back: '/assets/amy/before-after/001-before.jpg' },
  // A plain top-crop cut this one off right below the eyes — the source
  // photo's face sits lower in frame than most of the others.
  { name: 'Mia Zapata', front: '/assets/amy/before-after/002-after.jpg', back: '/assets/amy/before-after/002-before.jpg', backFocus: 'center 32%' },
  { name: 'Jean-Michel Basquiat', front: '/assets/amy/before-after/003-after.jpg', back: '/assets/amy/before-after/003-before.jpg' },
  // Anton Yelchin dropped (10 members, chosen by the user) so the grid
  // can go 2 columns instead of 3 — bigger cards inside the phone screen.
  { name: 'Jimi Hendrix', front: '/assets/amy/before-after/005-after.jpg', back: '/assets/amy/before-after/005-before.jpg' },
  { name: 'Jim Morrison', front: '/assets/amy/before-after/006-after.jpg', back: '/assets/amy/before-after/006-before.jpg' },
  { name: 'Janis Joplin', front: '/assets/amy/before-after/007-after.jpg', back: '/assets/amy/before-after/007-before.jpg' },
  { name: 'Brian Jones', front: '/assets/amy/before-after/008-after.jpg', back: '/assets/amy/before-after/008-before.jpg' },
  { name: 'Cecilia', front: '/assets/amy/before-after/009-after.jpg', back: '/assets/amy/before-after/009-before.jpg' },
  // Same issue as Mia Zapata above — this archive photo is a very tight,
  // small headshot, and a top-crop was cutting into the chin/mouth.
  { name: 'Alan Wilson', front: '/assets/amy/before-after/010-after.jpg', back: '/assets/amy/before-after/010-before.jpg', backFocus: 'center 30%' },
  { name: 'Kurt Cobain', front: '/assets/amy/before-after/011-after.jpg', back: '/assets/amy/before-after/011-before.jpg' },
].map((m) => ({ ...m, front: asset(m.front), back: m.back ? asset(m.back) : undefined }))

function FlipCard({ member }: { member: RosterMember }) {
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const showBack = pinned || hovered
  const hasArchive = !!member.back
  const { spawn, field } = useParticleBurst(3)

  const triggerFx = () => {
    spawn()
    playGuitarPluck()
  }

  return (
    <button
      type="button"
      onClick={() => {
        setPinned((p) => !p)
        triggerFx()
      }}
      onMouseEnter={() => {
        setHovered(true)
        triggerFx()
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-pressed={pinned}
      aria-label={`${member.name} — ${showBack ? 'showing archive side, activate to flip back' : 'showing restored artwork, activate to reveal archive photo'}`}
      // aspect-[3/2] (was 4/3, was aspect-square before that) — 4/3 still
      // measured taller than the real calibrated screen window could hold
      // (verified via screenshot: the 5th row rendered with only the top
      // ~25% of each photo visible, cut off right at the phone's own
      // bottom bezel) — 3/2 buys the remaining vertical room needed for
      // all 5 rows to render complete, no scroll, no crop.
      className="group relative aspect-[3/2] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pearl-gold"
      style={{ perspective: 700 }}
    >
      {field}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: showBack ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        {/* Front — restored / redesigned artwork. No name label — the
            card grid reads cleaner as a pure gallery of faces, per
            explicit request.
            These "after" images are SQUARE (1000×1000) with a decorative
            vintage postcard frame — ornate corners, stars — baked into
            the full canvas edge-to-edge. `object-cover object-top` on
            this landscape (3/2) card was cropping off roughly the bottom
            third of that square, cutting the frame's own bottom border
            and corners clean off (caught in review). object-contain
            guarantees the whole square — frame fully intact on all four
            sides — is always visible; a blurred, scaled-up copy of the
            same image fills the left/right letterbox gaps so it reads as
            "a postcard sitting on its own backdrop" rather than empty
            bars, the same technique already used for Galgalatz's phone
            screen. */}
        <div className="absolute inset-0 rounded-xl overflow-hidden border-2 border-white/10 shadow-md bg-black" style={{ backfaceVisibility: 'hidden' }}>
          <img src={member.front} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-60" />
          <img src={member.front} alt={member.name} className="absolute inset-0 w-full h-full object-contain" />
        </div>

        {/* Back — original archive photo (or a vintage-toned pass when no
            source photo of this specific member exists in the project files) */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden border-2 border-pearl-gold/40 shadow-md bg-black"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* object-top (not the default center crop) — several archive
              photos are full torso/waist-up shots, and a center crop was
              cutting off the face and showing chest/shoulders instead. */}
          <img
            src={member.back ?? member.front}
            alt=""
            aria-hidden
            className={`w-full h-full object-cover ${hasArchive ? '' : 'grayscale sepia contrast-125 brightness-90'}`}
            style={{ objectPosition: member.backFocus ?? 'top' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className="absolute top-1 left-1 text-[6px] font-bold uppercase tracking-widest text-pearl-gold bg-black/50 px-1 py-0.5 rounded">
            {hasArchive ? 'Archive' : 'Vintage'}
          </span>
        </div>
      </motion.div>
    </button>
  )
}

/** The interactive "27 Club" roster — hover or click any member to flip the
 *  card and reveal the archive-photo (or vintage-toned) reverse side. */
export default function AmyRosterGrid() {
  return (
    // No background fill anymore — the photographed phone screen behind
    // this grid already supplies one; painting a second, different-toned
    // background on top of it just looked like a mismatched patch.
    //
    // This grid must fit entirely within the parent's fixed-size window
    // with no scrolling required — a previous version let it grow taller
    // than that window and relied on `overflow-y-auto` + a bottom fade to
    // signal "more below," which in practice meant the last row rendered
    // hard-cropped mid-photo at rest (only visible after scrolling), i.e.
    // real archive photographs were shown with faces cut off. The card
    // aspect ratio (3/2, was 4/3) and the tighter gap/padding below are
    // sized so all 10 members render complete, at once, no crop, no
    // scroll needed — measured against the actual calibrated phone-screen
    // window in AmyCaseStudy's PhoneRosterZone.
    <div className="relative flex flex-col p-1.5">
      <p className="text-center font-display font-extrabold text-[9px] text-white tracking-tight mb-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
        THE 27 CLUB
      </p>
      {/* 2 columns (was 3) — one member dropped (10 remain) specifically
          so this grid could go 2x5, giving each card real size instead of
          a cramped thumbnail, while still fitting the full 5 rows. */}
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {ROSTER.map((m) => (
          <FlipCard key={m.name} member={m} />
        ))}
      </div>
    </div>
  )
}
