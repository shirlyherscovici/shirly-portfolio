import { useState } from 'react'
import { MotionConfig } from 'framer-motion'
import PortfolioHub from './components/hub/PortfolioHub'
import ProjectModal from './components/modal/ProjectModal'
import AmyCaseStudy, { AmyCaseStudyBreakout } from './components/modal/AmyCaseStudy'
import GalgalatzCaseStudy, { GalgalatzBreakout } from './components/modal/GalgalatzCaseStudy'
import AiRescueCaseStudy, { AiRescueBreakout } from './components/modal/AiRescueCaseStudy'
import PeopleMotionCaseStudy, { PeopleMotionBreakout } from './components/modal/PeopleMotionCaseStudy'
import EasterEgg from './components/ui/EasterEgg'
import type { ProjectId, Theme } from './types'
import { asset } from './lib/asset'

// The site is dark-mode only now (the light theme/toggle was removed
// entirely, per explicit direction) — every case study always renders its
// dark palette, so this is a plain constant rather than the old
// site-wide toggle state it replaces.
const dark = true

const LABEL_ID: Record<ProjectId, string> = {
  amy: 'modal-amy-title',
  galgalatz: 'modal-galgalatz-title',
  'ai-rescue': 'modal-ai-title',
  'people-motion': 'modal-motion-title',
}

function AppShell() {
  const [openId, setOpenId] = useState<ProjectId | null>(null)
  const close = () => setOpenId(null)

  const theme: Theme = openId ? 'dark' : 'light'

  return (
    // MotionConfig(reducedMotion="user") makes every Framer Motion
    // transform/layout animation in the tree automatically respect the
    // OS-level prefers-reduced-motion setting — previously only
    // HeroDiorama checked that preference itself (via its own
    // useReducedMotion() calls, left as-is here), so every card's idle
    // float and case-study ambient loop ran at full motion regardless of
    // it. Components that already do their own explicit reduced-motion
    // check (HeroDiorama) are unaffected — this only fills the gap
    // everywhere else.
    <MotionConfig reducedMotion="user">
      <PortfolioHub onOpen={setOpenId} openId={openId} />

      <ProjectModal
        open={openId !== null}
        onClose={close}
        theme={theme}
        labelledBy={openId ? LABEL_ID[openId] : ''}
        arcadeChrome={openId === 'amy'}
        outlineClose={openId === 'galgalatz'}
        closeLabel={openId === 'ai-rescue' ? 'Close' : openId === 'people-motion' ? 'Close Case Study' : undefined}
        closeAccent={openId === 'ai-rescue' ? 'red' : undefined}
        joystickBadgeSrc={openId === 'galgalatz' ? asset('/assets/galgalatz/joystick-galgaltz.png') : undefined}
        breakout={
          openId === 'ai-rescue' ? (
            <AiRescueBreakout />
          ) : openId === 'amy' ? (
            <AmyCaseStudyBreakout />
          ) : openId === 'people-motion' ? (
            <PeopleMotionBreakout />
          ) : openId === 'galgalatz' ? (
            <GalgalatzBreakout />
          ) : undefined
        }
      >
        {openId === 'amy' && <AmyCaseStudy onClose={close} dark={dark} />}
        {openId === 'galgalatz' && <GalgalatzCaseStudy onClose={close} />}
        {openId === 'ai-rescue' && <AiRescueCaseStudy onClose={close} />}
        {openId === 'people-motion' && <PeopleMotionCaseStudy onClose={close} dark={dark} />}
      </ProjectModal>
    </MotionConfig>
  )
}

export default function App() {
  return (
    <>
      <AppShell />
      <EasterEgg />
    </>
  )
}
