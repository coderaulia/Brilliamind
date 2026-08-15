import { HEATMAP_DATA } from '@/data/mock-data'

type HeatmapScheme = 'teal' | 'blue' | 'violet'

const SCALES: Record<HeatmapScheme, string[]> = {
  teal:   ['rgba(30,41,59,0.18)', '#134e4a', '#0f766e', '#0d9488', '#2dd4bf'],
  blue:   ['rgba(30,41,59,0.18)', '#1e3a5f', '#2563eb', '#3b82f6', '#93c5fd'],
  violet: ['rgba(30,41,59,0.18)', '#3b0764', '#6d28d9', '#8b5cf6', '#c4b5fd'],
}

interface ActivityHeatmapProps {
  scheme?: HeatmapScheme
}

export default function ActivityHeatmap({ scheme = 'teal' }: ActivityHeatmapProps) {
  const scale = SCALES[scheme]
  const cell = 12, gap = 3, step = cell + gap

  const weeks: typeof HEATMAP_DATA[] = []
  for (let i = 0; i < HEATMAP_DATA.length; i += 7) {
    weeks.push(HEATMAP_DATA.slice(i, i + 7))
  }

  const months: { label: string; x: number }[] = []
  let lastM = -1
  weeks.forEach((w, wi) => {
    const m = w[0].date.getMonth()
    if (m !== lastM) {
      months.push({ label: w[0].date.toLocaleString('en', { month: 'short' }), x: wi * step })
      lastM = m
    }
  })

  const totalActive = HEATMAP_DATA.filter(d => d.level > 0).length
  const svgW = weeks.length * step

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          {totalActive} active days in the last year
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
          <span>Less</span>
          {scale.map((c, i) => (
            <div key={i} style={{ width: cell, height: cell, borderRadius: 3, background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <svg width={svgW} height={7 * step + 22} style={{ display: 'block' }}>
          {months.map((m, i) => (
            <text key={i} x={m.x} y={10} fontSize="10" fill="var(--text-muted)" fontFamily="inherit">
              {m.label}
            </text>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <rect
                key={`${wi}-${di}`}
                x={wi * step} y={di * step + 16}
                width={cell} height={cell} rx={3}
                fill={scale[day.level]}
                opacity={day.level === 0 ? 0.5 : 1}
              >
                <title>
                  {day.date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}:{' '}
                  {day.level > 0 ? `${day.level} session${day.level > 1 ? 's' : ''}` : 'No activity'}
                </title>
              </rect>
            ))
          )}
        </svg>
      </div>
    </div>
  )
}
