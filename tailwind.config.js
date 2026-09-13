/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Pearl / light system — homepage + light case studies (Amy, People in Motion)
        pearl: {
          bg: '#faf6f2',
          bg2: '#f3ecf5',
          white: '#fffdfb',
          blush: '#f5dde2',
          lavender: '#e6dff2',
          ink: '#231f2c',
          sub: '#635b70',
          gold: '#c9a15a',
          gold2: '#b8863b',
          red: '#b02a3a',
          red2: '#8f1f2d',
        },
        // Cinematic / dark system — Galgalatz, AI Rescue
        cine: {
          bg: '#0e0f18',
          bg2: '#171a29',
          panel: '#1c1f30',
          navy: '#131523',
          purple: '#4b2e83',
          cyan: '#4fd8ff',
          magenta: '#ff5fa0',
          gold: '#ffc93c',
          ink: '#f4f1fb',
          sub: '#cbc8de',
        },
      },
      boxShadow: {
        // Each "-lg" stack now has 4 layers instead of 3: a crisp near
        // contact-shadow (reads as the card actually resting close to the
        // surface below it), the original mid/far layers for the soft
        // ambient falloff, and — since box-shadow can't add a highlight on
        // its own — a subtle inset top-edge line simulating a bevel catching
        // light, for real perceived thickness rather than a flat cutout.
        'pearl-lg':
          '0 1px 2px rgba(35,31,44,0.06), 0 6px 14px -4px rgba(35,31,44,0.10), 0 20px 40px -10px rgba(35,31,44,0.14), 0 40px 80px -20px rgba(35,31,44,0.14), inset 0 1px 0 rgba(255,255,255,0.5)',
        'pearl-sm': '0 1px 2px rgba(35,31,44,0.06), 0 4px 10px -3px rgba(35,31,44,0.10), 0 10px 22px -6px rgba(35,31,44,0.10)',
        'cine-lg':
          '0 1px 2px rgba(0,0,0,0.4), 0 8px 18px -6px rgba(0,0,0,0.5), 0 24px 52px -14px rgba(0,0,0,0.6), 0 46px 90px -22px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-gold': '0 0 28px rgba(201,161,90,0.4), 0 0 68px rgba(201,161,90,0.18)',
        'glow-cyan': '0 0 24px rgba(79,216,255,0.45), 0 0 68px rgba(79,216,255,0.18)',
        'glow-magenta': '0 0 24px rgba(255,95,160,0.45), 0 0 68px rgba(255,95,160,0.18)',
        'glow-purple': '0 0 28px rgba(139,92,246,0.5), 0 0 68px rgba(139,92,246,0.22)',
        'glow-red': '0 0 28px rgba(176,42,58,0.35), 0 8px 20px -6px rgba(176,42,58,0.3)',
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'float-slower': 'float 9s ease-in-out infinite',
        'spin-slow': 'spin 10s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'sweep-radar': 'sweep-radar 4s linear infinite',
        'draw-stroke': 'draw-stroke 1.4s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(3deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%) rotate(20deg)' },
          '100%': { transform: 'translateX(150%) rotate(20deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 0.55 },
          '50%': { opacity: 1 },
        },
        'sweep-radar': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        // Draws the arrow's stroke in (and, via the `alternate` direction
        // on the animation itself, back out) — relies on the SVG's own
        // `pathLength="1"` attribute so dasharray/dashoffset work in
        // normalized 0–1 units regardless of the path's real geometry.
        'draw-stroke': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}
