/** Single source of truth for the professional title shown in the header,
 *  hero, footer and document <title>. These previously disagreed (header
 *  and hero said "Game UI / Motion Designer", the footer and page title
 *  said "Visual, Motion & Front-End Designer") — a careful reviewer
 *  reading top-to-bottom would get two different answers for the same
 *  question. Update this one string to change it everywhere. Set per
 *  explicit direction (latest copy pass) — repositioned toward Marketing
 *  Video & Motion work specifically, the exact phrase the recruiter-facing
 *  hero copy now leads with. index.html's <title> tag is hardcoded
 *  separately (outside React) and was updated to match by hand. */
export const PROFESSIONAL_TITLE = 'Marketing Video & Motion Designer'
