import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages serves this as a project site at
  // https://shirlyherscovici.github.io/shirly-portfolio/ — everything
  // (script tags, and any literal "/assets/..." string used as a runtime
  // <img src>/<video src> pointing into /public) needs this prefix, not
  // just the root the dev server uses. Must match the repo's current name
  // exactly — it changed from shirly-portfolio-hero to shirly-portfolio,
  // which is what broke the deployed site (index.html was still pointing
  // its script/style tags at the old /shirly-portfolio-hero/ path, which
  // 404s now that GitHub Pages serves from the new name).
  base: '/shirly-portfolio/',
  plugins: [react()],
  server: {
    host: true,
    // Was a hardcoded 5173 — that blocked the harness from reassigning a
    // free port when another session's dev server already holds 5173 (this
    // app has no OAuth/webhook/CORS dependency on that specific port).
    // Falls back to 5173 for a plain `npm run dev` outside the harness.
    port: Number(process.env.PORT) || 5173,
  },
})
