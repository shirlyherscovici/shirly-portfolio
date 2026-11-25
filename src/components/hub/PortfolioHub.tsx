import { memo, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Instagram, Linkedin, Mail, Menu, Play, X } from 'lucide-react'
import { AmyModule, AiModule, GalgalatzModule, MotionModule } from './ProjectModules'
import type { ProjectId } from '../../types'
import { asset } from '../../lib/asset'

const hubAsset = (name: string) => asset(`/assets/hub/${name}`)

const NAV_ITEMS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Resume', href: asset('/Resume.pdf'), download: false },
  { label: 'Contact', href: '#contact' },
]

const STAGE_POSTERS = [
  'galgalatz-homepage-wide.png?v=20260928b',
  'people-in-motion-homepage-wide.png?v=20260928b',
  'navigator-ai-homepage-wide.png?v=20260928b',
  'amy-homepage-wide.png?v=20260928b',
]

function FloatingLeavesLayer() {
  return (
    <div className="homepage-leaves" aria-hidden>
      <img src={hubAsset('leafL.png.png')} alt="" className="homepage-leaf homepage-leaf--left-a" />
      <img src={hubAsset('leafR.png.png')} alt="" className="homepage-leaf homepage-leaf--right-a" />
      <img src={hubAsset('leafL.png.png')} alt="" className="homepage-leaf homepage-leaf--left-b" />
      <img src={hubAsset('leafR.png.png')} alt="" className="homepage-leaf homepage-leaf--right-b" />
    </div>
  )
}

function PortfolioHub({ onOpen }: { onOpen: (id: ProjectId) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 28)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  useEffect(() => {
    STAGE_POSTERS.forEach((name) => {
      const poster = new Image()
      poster.src = hubAsset(name)
    })
  }, [])

  return (
    <div className="homepage-redesign relative min-h-screen bg-[#f8f5ff] text-[#15132a]" style={{ backgroundImage: `url(${hubAsset('homepage-bg.png.png')})`, backgroundPosition: 'top center', backgroundRepeat: 'no-repeat', backgroundSize: '100% auto' }}>
      <FloatingLeavesLayer />

      <section id="top" className="homepage-hero relative z-[3] overflow-hidden" style={{ backgroundImage: `linear-gradient(90deg, rgba(251,249,255,0.92) 0%, rgba(251,249,255,0.52) 48%, rgba(251,249,255,0.08) 100%), url(${hubAsset('hero-background-clean.png.png')})` }}>
        <header className={`homepage-header absolute inset-x-0 top-0 z-20 mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14 ${scrolled ? 'homepage-header--scrolled' : ''}`}>
          <a href="#top" aria-label="Shirly Herscovici home"><img src={hubAsset('LOGO.png.png')} alt="Shirly Herscovici — Motion & Visual Designer" className="h-auto w-[225px] sm:w-[255px]" /></a>
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map(({ label, href, download }) => <a key={label} href={href} download={download} className="text-[12px] font-semibold text-[#282440] transition-colors hover:text-violet-700">{label}</a>)}
          </nav>
          <a href="#contact" className="homepage-primary-button hidden lg:inline-flex">Let&apos;s Talk <ArrowRight size={16} /></a>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} className="grid h-10 w-10 place-items-center rounded-full border border-violet-900/15 bg-white/60 text-violet-900 lg:hidden">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </header>

        <AnimatePresence>
          {menuOpen && <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute inset-x-0 top-[68px] z-20 overflow-hidden border-y border-violet-900/10 bg-white/75 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-[1440px] flex-col px-6 py-3 sm:px-10">{NAV_ITEMS.map(({ label, href, download }) => <a key={label} href={href} download={download} onClick={() => setMenuOpen(false)} className="py-3 text-sm font-semibold text-[#282440]">{label}</a>)}</div>
          </motion.nav>}
        </AnimatePresence>

        <div className="homepage-hero-grid mx-auto grid min-h-[620px] max-w-[1440px] grid-cols-12 px-6 sm:px-10 lg:min-h-[720px] lg:px-14">
          <div className="homepage-hero-copy relative z-10 col-span-12 flex max-w-[600px] flex-col justify-center pt-[118px] pb-16 lg:col-span-6 lg:pt-[92px] lg:pb-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-600">Ideas That Move People</p>
            <h1 className="mt-5 font-editorial text-[clamp(64px,5.3vw,96px)] leading-[0.92] tracking-[-0.055em] text-[#111024]">Motion, AI and<br /><span className="homepage-gradient-text italic">visual stories.</span></h1>
            <p className="mt-6 max-w-[470px] text-[17px] leading-[1.5] text-[#4f4a70]">Marketing video, motion design, brand<br className="hidden sm:block" /> and AI-assisted visual experiences.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#work" className="homepage-primary-button">View My Work <ArrowRight size={17} /></a>
              <a href="#work" className="homepage-secondary-button" aria-label="Browse selected work"><Play size={14} fill="currentColor" /> Showreel</a>
            </div>
          </div>
        </div>
        <div className="homepage-hero-note" aria-hidden><img src={hubAsset('text_hiro.png.png')} alt="" /></div>
        <div className="homepage-hero-character" aria-hidden>
          <img src={hubAsset('newCharacter.png.png')} alt="" />
        </div>
      </section>

      <main id="work" className="homepage-main relative z-[3] scroll-mt-16">
        <section className="selected-work">
          <div className="project-chapters">
            <GalgalatzModule onClick={() => onOpen('galgalatz')} />
            <MotionModule onClick={() => onOpen('people-motion')} />
            <AiModule onClick={() => onOpen('ai-rescue')} />
            <AmyModule onClick={() => onOpen('amy')} />
          </div>
        </section>

        <span id="about" className="block scroll-mt-24" aria-hidden />
        <section id="contact" className="homepage-contact scroll-mt-20">
          <h2 className="font-editorial text-4xl leading-[0.88] tracking-[-0.045em] text-[#15132a] sm:text-5xl">LET&apos;S CREATE<br />SOMETHING<br /><span className="homepage-gradient-text italic">in motion.</span></h2>
          <p className="mt-5 text-sm leading-relaxed text-[#5e5a72] lg:mt-0">Interested in working together?<br />I&apos;d love to hear about your project.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:justify-end">
            <a href="mailto:shirly3212@gmail.com" className="homepage-primary-button">Let&apos;s Talk <ArrowRight size={17} /></a>
            <a href="https://www.linkedin.com/in/shirly-herscovici/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="homepage-social"><Linkedin size={17} /></a>
            <span title="Instagram" className="homepage-social homepage-social--static" aria-hidden><Instagram size={17} /></span>
            <a href="mailto:shirly3212@gmail.com" aria-label="Email Shirly" className="homepage-social"><Mail size={17} /></a>
          </div>
        </section>
      </main>
      <footer className="relative z-[3] mx-auto flex w-[calc(100%-32px)] max-w-[1440px] items-center justify-between pb-8 pt-3 sm:w-[calc(100%-64px)]">
        <img src={hubAsset('LOGO.png.png')} alt="Shirly Herscovici" className="w-[142px] opacity-80" />
        <p className="text-[10px] font-semibold tracking-[0.12em] text-[#7b7690]">© {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default memo(PortfolioHub)
