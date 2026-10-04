import { useState } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import CaseStudyHeader from './CaseStudyHeader'
import { asset } from '../../lib/asset'
import { PROJECT_NUMBER } from '../../lib/projectMeta'

const amyAsset = (name: string) => asset(`/assets/amy/${name}`)

function SectionHeading({ id, children, note }: { id: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-1 border-b border-[#302d35]/50 pb-2">
      <h2 id={id} className="font-serif text-3xl font-semibold leading-none tracking-[-0.045em] text-[#1d1b21] sm:text-4xl">{children}</h2>
      {note && <p className="mb-0.5 text-xs leading-snug text-[#605a61]">{note}</p>}
    </div>
  )
}

function LanguageCard({ label, children, copy }: { label: string; children: React.ReactNode; copy: string }) {
  return (
    <article className="min-w-0">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-[#403b43]">{label}</p>
      <div className="aspect-[1.35/1] overflow-hidden border border-black/10 bg-[#eee4d3]">{children}</div>
      <p className="mt-2 text-xs leading-[1.35] text-[#5f5960]">{copy}</p>
    </article>
  )
}

type BannerStage = {
  number: '01' | '02' | '03' | '04'
  title: string
  subtitle: string
  copy: string
  image: string
}

const BANNER_STAGES: BannerStage[] = [
  {
    number: '01',
    title: 'Initial Direction',
    subtitle: 'Bold & Expressive',
    copy: 'Early exploration focused on strong contrast, portraiture and immediate visual impact.',
    image: 'concept-1.png',
  },
  {
    number: '02',
    title: 'Visual Exploration',
    subtitle: 'Color & Character',
    copy: 'A bolder route testing color, portrait placement and tattoo-inspired visual language.',
    image: 'concept-2.png',
  },
  {
    number: '03',
    title: 'Refined Exploration',
    subtitle: 'Mood & Restraint',
    copy: 'A more restrained direction testing monochrome treatment and a quieter editorial tone.',
    image: 'concept-3.png',
  },
  {
    number: '04',
    title: 'Final Direction',
    subtitle: 'Editorial & Iconic',
    copy: 'The final direction brings tattoo culture, distressed print textures and 27 Club references into one cohesive identity.',
    image: 'hero-banner.png',
  },
]

type ComparisonExample = {
  number: '01' | '02' | '03'
  before: string
  after: string
  label: string
}

const COMPARISON_EXAMPLES: ComparisonExample[] = [
  { number: '01', before: 'before-after/001-before.jpg', after: 'before-after/001-after.jpg', label: 'Archive portrait' },
  { number: '02', before: 'before-after/005-before.jpg', after: 'before-after/005-after.jpg', label: 'Campaign transformation' },
  { number: '03', before: 'before-after/006-before.jpg', after: 'before-after/006-after.jpg', label: 'Editorial treatment' },
]

function BannerCard({ stage, active, onPreview, onPreviewEnd, onSelect }: {
  stage: BannerStage
  active: boolean
  onPreview: () => void
  onPreviewEnd: () => void
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onMouseEnter={onPreview}
      onMouseLeave={onPreviewEnd}
      onFocus={onPreview}
      onBlur={onPreviewEnd}
      onClick={onSelect}
      className={`group block min-w-0 text-left transition-[opacity,transform] duration-300 ease-out ${active ? 'scale-[1.018] opacity-100' : 'opacity-65'}`}
    >
      <span className={`relative block aspect-[1.72/1] overflow-hidden border transition-colors duration-300 ${active ? 'border-[#d3172f] ring-1 ring-[#d3172f]' : 'border-black/15'}`}>
        {stage.number === '04' && <span className="absolute right-2 top-2 z-10 rounded-full bg-[#d3172f] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Final</span>}
        <img src={amyAsset(stage.image)} alt={`${stage.title} banner direction`} className={`h-full w-full bg-[#ede1cf] object-contain object-center transition-[filter,transform] duration-300 ${active ? 'scale-[1.015] grayscale-0 saturate-100' : 'grayscale saturate-0'}`} />
      </span>
      <span className="mt-3 flex gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-serif text-lg transition-colors duration-300 ${active ? 'bg-[#d3172f] text-white' : 'bg-[#b6aa95] text-white'}`}>{stage.number}</span>
        <span>
          <span className={`block font-serif text-lg font-semibold leading-none transition-colors duration-300 ${active ? 'text-[#27232a]' : 'text-[#625c63]'}`}>{stage.title}</span>
          <span className={`mt-1 block text-xs font-semibold leading-[1.35] transition-colors duration-300 ${active ? 'text-[#b31b2d]' : 'text-[#625c63]'}`}>{stage.subtitle}</span>
          <span className="mt-1 block text-xs leading-[1.35] text-[#625c63]">{stage.copy}</span>
        </span>
      </span>
    </button>
  )
}

function BannerDevelopment() {
  const [selected, setSelected] = useState<BannerStage['number']>('04')
  const [preview, setPreview] = useState<BannerStage['number'] | null>(null)
  const active = preview ?? selected

  return (
    <>
      <div aria-hidden className="relative mb-5 hidden grid-cols-4 items-center md:grid">
        <span className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px -translate-y-1/2 bg-[#302d35]/25" />
        {BANNER_STAGES.map((stage) => <span key={stage.number} className={`relative z-10 mx-auto grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold ${active === stage.number ? 'bg-[#d3172f] text-white' : 'bg-[#c7baa7] text-white'}`}>{stage.number}</span>)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {BANNER_STAGES.map((stage) => (
          <BannerCard
            key={stage.number}
            stage={stage}
            active={active === stage.number}
            onPreview={() => setPreview(stage.number)}
            onPreviewEnd={() => setPreview(null)}
            onSelect={() => setSelected(stage.number)}
          />
        ))}
      </div>
      <BeforeAfterExamples />
    </>
  )
}

function BeforeAfterExamples() {
  const [selected, setSelected] = useState<ComparisonExample['number']>('02')
  const [view, setView] = useState<'before' | 'after'>('after')
  const example = COMPARISON_EXAMPLES.find((item) => item.number === selected) ?? COMPARISON_EXAMPLES[1]
  const image = view === 'before' ? example.before : example.after

  return (
    <div className="mt-7 border border-black/10 bg-[#f5ecdc] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#403b43]">Before / After</p>
          <p className="mt-1 font-serif text-xl font-semibold text-[#27232a]">Design transformation</p>
        </div>
        <p className="text-xs text-[#625c63]">Choose an example, then switch between the original and campaign treatment.</p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_168px]">
        <div className="aspect-[1.35/1] overflow-hidden border border-black/15 bg-[#292325] sm:aspect-[1.55/1]">
          <div className="relative h-full w-full">
            <img src={amyAsset(image)} alt={`${view === 'before' ? 'Before' : 'After'}: ${example.label}`} className="block h-full w-full object-contain" />
            <div className="absolute left-3 top-3 inline-flex overflow-hidden rounded-full border border-white/25 bg-black/55 p-1 text-[10px] font-bold tracking-[0.14em] text-white backdrop-blur-sm" aria-label="Before and after view">
              <button type="button" onClick={() => setView('before')} aria-pressed={view === 'before'} className={`rounded-full px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${view === 'before' ? 'bg-white text-[#27232a]' : 'text-white/80 hover:text-white'}`}>Before</button>
              <button type="button" onClick={() => setView('after')} aria-pressed={view === 'after'} className={`rounded-full px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${view === 'after' ? 'bg-[#d3172f] text-white' : 'text-white/80 hover:text-white'}`}>After</button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1" aria-label="Before and after examples">
          {COMPARISON_EXAMPLES.map((item) => {
            const isSelected = item.number === selected
            return (
              <button
                key={item.number}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setSelected(item.number)
                  setView('after')
                }}
                className={`overflow-hidden border text-left transition-colors ${isSelected ? 'border-[#d3172f] ring-1 ring-[#d3172f]' : 'border-black/15 hover:border-[#8a6268]'}`}
              >
                <span className="block aspect-[1.65/1] bg-[#292325]">
                  <img src={amyAsset(item.after)} alt="" className="h-full w-full object-contain" />
                </span>
                <span className={`block px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${isSelected ? 'bg-[#d3172f] text-white' : 'text-[#4b454b]'}`}>Example {item.number}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** The approved Amy case study: a single light, editorial page composed
 * only of the seven reference sections and existing Amy campaign assets. */
export default function AmyCaseStudy({ onClose }: { onClose: () => void; dark?: boolean }) {
  return (
    <article className="overflow-hidden rounded-[30px] bg-[#f8f1e5] text-[#1d1b21] shadow-[0_24px_70px_rgba(62,40,35,0.16)]">
      <CaseStudyHeader
        id="modal-amy-title"
        stageLabel={PROJECT_NUMBER.amy}
        title="Graphic Design"
        supportLabel=""
        theme="light"
        onClose={onClose}
        variant="minimal"
        meta={[]}
      />

      <div className="px-4 pb-4 sm:px-7 sm:pb-7 lg:px-9 lg:pb-9">
        {/* 1. Hero */}
        <section aria-label="Amy Winehouse campaign hero" className="overflow-hidden border border-black/15 bg-[#e7d6c3] shadow-[0_10px_24px_rgba(58,37,31,0.12)]">
          <img
            src={amyAsset('hero-banner.png')}
            alt="Amy Winehouse N12 Special campaign hero"
            className="block aspect-[1.95/1] w-full object-cover object-[center_46%]"
          />
        </section>

        {/* 2. Project intro + impact */}
        <section aria-labelledby="amy-intro" className="grid gap-7 border-b border-[#302d35]/40 py-7 lg:grid-cols-[1.17fr_0.83fr] lg:gap-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6a5d63]">Art direction · Visual design · Campaign strategy</p>
            <h1 id="amy-intro" className="mt-2 font-serif text-[clamp(2.2rem,4vw,4.1rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[#1d1b21]">Amy Winehouse — N12 Special</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#514c53] sm:text-[15px]">A visual identity for an N12 editorial special celebrating Amy Winehouse and the 27 Club. The project draws from tattoo culture, distressed print aesthetics, vintage rock imagery and Amy’s iconic visual world.</p>
            <a
              href="https://special.n12.co.il/AmyWinehouse"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border border-[#a81628] bg-[#c92032] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#a81628]"
            >
              View live project <ExternalLink size={13} />
            </a>
          </div>
          <aside className="border-l border-[#302d35]/25 pl-5 sm:pl-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#403b43]">Project impact</p>
            <p className="mt-2 text-sm font-semibold text-[#322d33]">Views grew from</p>
            <p className="mt-1 font-serif text-4xl font-semibold leading-none tracking-[-0.04em] text-[#c4172c] sm:text-5xl">24,500 → 67,418</p>
          </aside>
        </section>

        {/* 3. Visual Language */}
        <section aria-labelledby="amy-language" className="py-8">
          <SectionHeading id="amy-language">Visual Language</SectionHeading>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            <LanguageCard label="Color palette" copy="A warm, vintage-inspired palette drawn from tattoo flash, aged print and rock imagery.">
              <div className="grid h-full grid-cols-3 grid-rows-2">
                <span className="bg-[#f3e7d1]" /><span className="bg-[#171418]" /><span className="bg-[#c8172d]" />
                <span className="bg-[#d68689]" /><span className="bg-[#d9a343]" /><span className="bg-[#c9b29a]" />
              </div>
            </LanguageCard>
            <LanguageCard label="Typography" copy="A custom Hebrew lockup inspired by vintage signage, tattoo lettering and Amy’s expressive visual language.">
              <img src={amyAsset('logo.png')} alt="Amy campaign Hebrew title lockup" className="h-full w-full object-contain p-3" />
            </LanguageCard>
            <LanguageCard label="Textures & treatment" copy="Halftone dots, ink splatters and worn-paper textures give the identity its raw editorial character.">
              <img src={amyAsset('hero-banner.png')} alt="Campaign texture treatment" className="h-full w-full object-cover object-left" />
            </LanguageCard>
            <LanguageCard label="Iconography" copy="Tattoo-flash motifs reference Amy’s personal iconography and the wider 27 Club visual world.">
              <img src={amyAsset('bird.png')} alt="Gold swallow campaign icon" className="h-full w-full object-cover object-center" />
            </LanguageCard>
            <LanguageCard label="Image treatment" copy="High-contrast portraiture and distressed overlays connect photography to the graphic system.">
              <img src={amyAsset('concept-3.png')} alt="Amy portrait campaign treatment" className="h-full w-full object-cover object-[65%_center]" />
            </LanguageCard>
          </div>
        </section>

        {/* 4. Banner Development */}
        <section aria-labelledby="amy-banner" className="border-t border-[#302d35]/25 py-8">
          <SectionHeading id="amy-banner" note="From early explorations to the final direction.">Banner Development</SectionHeading>
          <div className="mt-5"><BannerDevelopment /></div>
        </section>

        {/* 5. Identity Assets */}
        <section aria-labelledby="amy-assets" className="border-t border-[#302d35]/25 py-8">
          <SectionHeading id="amy-assets" note="Core graphic elements that shaped the project’s visual identity.">Identity Assets</SectionHeading>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <article className="border border-black/10 bg-[#f5ecdc] p-4 sm:p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#403b43]">Primary title lockup</p>
              <div className="mt-3 flex min-h-32 items-center justify-center border-y border-black/10 bg-[#fbf5e9] p-4">
                <img src={amyAsset('logo.png')} alt="Amy campaign title lockup" className="max-h-28 w-auto max-w-full object-contain" />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#5f5960]">A custom Hebrew title lockup combining vintage influence with a hand-crafted, expressive feel.</p>
            </article>
            <article className="border border-black/10 bg-[#f5ecdc] p-4 sm:p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#403b43]">Series badge</p>
              <div className="mt-3 flex min-h-32 items-center justify-center border-y border-black/10 bg-[#fbf5e9] p-4">
                <img src={amyAsset('badge-27.png')} alt="27 Club series badge" className="max-h-20 w-auto max-w-full object-contain" />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#5f5960]">A recurring 27 Club badge that connects the individual stories to the wider editorial special.</p>
            </article>
          </div>
        </section>

        {/* 6. System in Use */}
        <section aria-labelledby="amy-system" className="border-t border-[#302d35]/25 py-8">
          <SectionHeading id="amy-system" note="The visual system applied across desktop and mobile formats.">System in Use</SectionHeading>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.65fr_0.7fr]">
            <figure className="min-w-0">
              <div className="overflow-hidden border border-black/15 bg-[#ca1c2b]">
                <img src={amyAsset('grid-desktop.png')} alt="Desktop grid showing the full 27 Club artist system" className="block w-full object-cover" />
              </div>
              <figcaption className="mt-2 text-xs text-[#4e4850]"><strong className="font-semibold text-[#27232a]">Desktop Layout — </strong>The 27 Club system applied across the full artist grid.</figcaption>
            </figure>
            <figure className="min-w-0">
              <div className="aspect-[0.72/1] overflow-hidden border border-black/15 bg-[#f6ecdc]">
                <img src={amyAsset('grid-mobile.png')} alt="Mobile 27 Club experience" className="h-full w-full object-cover object-top" />
              </div>
              <figcaption className="mt-2 text-xs text-[#4e4850]"><strong className="font-semibold text-[#27232a]">Mobile Layout — </strong>The same visual system adapted for a compact vertical experience.</figcaption>
            </figure>
          </div>
        </section>
      </div>

      {/* 7. Footer project navigation */}
      <footer className="flex items-center justify-between gap-4 border-t border-black/20 bg-[#202125] px-5 py-5 text-[#f8f1e5] sm:px-8">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-2 text-xs transition-colors hover:text-[#e9c7ca]"><ArrowLeft size={18} /> Back to portfolio</button>
        <p className="text-center text-[10px] uppercase tracking-[0.15em] text-white/60"><span className="mb-1 block text-[9px]">Next project</span><span className="font-serif text-xl normal-case tracking-normal text-[#f8f1e5]">Selected Work</span></p>
        <button type="button" onClick={onClose} aria-label="Return to selected work" className="grid h-9 w-9 place-items-center border border-white/30 transition-colors hover:border-white"><ArrowRight size={18} /></button>
      </footer>
    </article>
  )
}

/** The reference is self-contained; keep the shared modal breakout slot empty. */
export function AmyCaseStudyBreakout() {
  return null
}
