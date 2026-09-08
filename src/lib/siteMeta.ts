/** Single source of truth for the professional title shown in the header,
 *  hero, footer and document <title>. These previously disagreed (header
 *  and hero said "Game UI / Motion Designer", the footer and page title
 *  said "Visual, Motion & Front-End Designer") — a careful reviewer
 *  reading top-to-bottom would get two different answers for the same
 *  question. Update this one string to change it everywhere. Rewritten to
 *  name all four real disciplines directly (Graphic, Motion, UI/UX, AI) —
 *  a recruiter scanning for keywords now finds them in the first line,
 *  not buried three lines down. index.html's <title> tag is hardcoded
 *  separately (outside React) and was updated to match by hand. */
export const PROFESSIONAL_TITLE = 'Graphic, Motion, UI/UX & AI Designer'
