import { ArrowRight } from 'lucide-react'
import { asset } from '../../lib/asset'

type ProjectChapterProps = {
  number: string
  category: string
  title: React.ReactNode
  description: React.ReactNode
  tags: string[]
  image: string
  imageAlt: string
  onClick: () => void
}

function ProjectChapter({ number, category, title, description, tags, image, imageAlt, onClick }: ProjectChapterProps) {
  return (
    <article data-project-chapter={number} className="project-chapter">
      <div className="project-chapter-panel">
        <div className="project-chapter-copy">
          <p className="project-chapter-number">{number}</p>
          <p className="project-chapter-category">{category}</p>
          <h2 className="sr-only">{title}</h2>
          <p className="project-chapter-description">{description}</p>
          <button type="button" onClick={onClick} className="project-chapter-button">View Project <ArrowRight size={16} /></button>
          <ul className="project-chapter-tags" aria-label={`${category} disciplines`}>
            {tags.map((tag) => <li key={tag}>{tag}</li>)}
          </ul>
        </div>
        <button type="button" onClick={onClick} className="project-chapter-media" aria-label={`View ${category} project`}>
          <img src={image} alt={imageAlt} loading={number === '01' ? 'eager' : 'lazy'} />
        </button>
      </div>
    </article>
  )
}

type ModuleProps = Pick<ProjectChapterProps, 'onClick'>

export function GalgalatzModule({ onClick }: ModuleProps) {
  return <ProjectChapter number="01" category="UI / PRODUCT" title={<>Music from<br />the Screen</>} description={<>N12 × Galgalatz collaboration<br />around a movie-song chart<br />experience.</>} tags={['UI Design', 'Visual Language', 'Motion']} image={asset('/assets/hub/galgalatz-homepage-wide.png?v=20261003-final')} imageAlt="Music from the Screen by N12 and Galgalatz" onClick={onClick} />
}

export function MotionModule({ onClick }: ModuleProps) {
  return <ProjectChapter number="02" category="MOTION & VISUAL" title={<>People<br />in Motion</>} description={<>A character-led motion project<br />built as a playful game world.</>} tags={['3D Animation', 'Character Design', 'Motion']} image={asset('/assets/hub/people-in-motion-homepage-wide.png?v=20261003-final')} imageAlt="People in Motion character-led animation project" onClick={onClick} />
}

export function AiModule({ onClick }: ModuleProps) {
  return <ProjectChapter number="03" category="AI / VISUAL STORYTELLING" title={<>AI Cinematic<br />Pipeline</>} description={<>Cinematic concept development<br />with AI tools.</>} tags={['AI Concept', 'Visual Exploration', 'Cinematic Storytelling']} image={asset('/assets/hub/navigator-ai-homepage-wide.png?v=20261003-final')} imageAlt="AI Cinematic Pipeline astronaut in a mountainous desert environment" onClick={onClick} />
}

export function AmyModule({ onClick }: ModuleProps) {
  return <ProjectChapter number="04" category="GRAPHIC DESIGN" title="Amy" description={<>A bold visual campaign<br />around a music icon.</>} tags={['Art Direction', 'Graphic Design', 'Editorial']} image={asset('/assets/hub/amy-homepage-wide.png?v=20261003-final')} imageAlt="Amy campaign artwork" onClick={onClick} />
}
