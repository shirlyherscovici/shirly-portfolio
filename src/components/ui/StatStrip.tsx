interface Stat {
  icon?: React.ReactNode
  label: string
  value: string
}

interface StatStripProps {
  stats: Stat[]
  theme: 'light' | 'dark'
  className?: string
  /** 'lg' bumps the value size up for footers where readability matters
   *  more than density (e.g. Amy's animated count-up metrics). */
  size?: 'sm' | 'lg'
  /** Keeps the 'light' theme's red glow on the VALUE (brand color, still
   *  reads fine against a dark backdrop) while forcing the LABEL to white
   *  — for Amy's dark-mode variant, where `theme` stays 'light' (to keep
   *  the red numbers) but the surrounding panel is now dark, and the
   *  light theme's own `text-pearl-ink/80` label color is real dark gray
   *  on near-black — effectively invisible. */
  labelOnDark?: boolean
}

/** A compact row of "IMPACT" style stats used in every case study footer.
 *  Every value glows in its theme's accent color — a real "this is
 *  evidence, look here" pop rather than flat text sitting in a list. */
export default function StatStrip({ stats, theme, className = '', size = 'sm', labelOnDark = false }: StatStripProps) {
  const light = theme === 'light'
  const valueSize = size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
  const glow = light
    ? { textShadow: '0 0 16px rgba(176,42,58,0.4), 0 0 32px rgba(176,42,58,0.2)' }
    : { textShadow: '0 0 16px rgba(79,216,255,0.5), 0 0 32px rgba(79,216,255,0.25)' }
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`}>
      {stats.map((s, index) => (
        <div key={`${s.label}-${s.value}-${index}`} className="flex items-center gap-2">
          {s.icon && <span className={light ? 'text-pearl-red' : 'text-cine-cyan'}>{s.icon}</span>}
          <div className="leading-tight">
            <span
              className={`font-display font-black tabular-nums ${valueSize} ${light ? 'text-pearl-red' : 'text-white'}`}
              style={glow}
            >
              {s.value}
            </span>{' '}
            <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wide ${labelOnDark ? 'text-white/85' : light ? 'text-pearl-ink/80' : 'text-slate-100'}`}>{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
