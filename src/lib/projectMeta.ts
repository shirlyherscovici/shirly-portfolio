import type { ProjectId } from '../types'

/** Single source of truth for the "0N" project number shown in three
 *  places: the homepage card's big number badge, that card's own
 *  aria-label, and the case study's breadcrumb/stage label. These three
 *  used to disagree for 3 of the 4 projects (e.g. Galgalatz showed badge
 *  "01" but its aria-label and case-study breadcrumb said "02").
 *
 *  Numbers follow the CURRENT homepage visual/DOM order — Galgalatz (big
 *  featured card) → People In Motion (wide banner) → AI Rescue → Amy —
 *  which is also what the number badges already showed; only the
 *  aria-labels and case-study stageLabels were out of sync with it.
 *  Update this map (not the individual components) to change a
 *  project's number everywhere at once. */
export const PROJECT_NUMBER: Record<ProjectId, string> = {
  galgalatz: '01',
  'people-motion': '02',
  'ai-rescue': '03',
  amy: '04',
}
