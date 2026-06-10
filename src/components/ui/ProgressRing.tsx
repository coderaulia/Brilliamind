import { useState, useEffect } from 'react'

interface ProgressRingProps {
  progress?: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  label?: string
  showPercent?: boolean
}

export default function ProgressRing({
  progress = 0,
  size = 80,
  strokeWidth = 6,
  color = '#14b8a6',
  bgColor,
  label,
  showPercent = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circ = radius * 2 * Math.PI
  const target = circ - (progress / 100) * circ
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    const t = setTimeout(() => setOffset(target), 80)
    return () => clearTimeout(t)
  }, [target])

  const bg = bgColor ?? 'rgba(148,163,184,0.15)'

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bg} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        {showPercent && (
          <span style={{ fontSize: size * 0.24, fontWeight: 700, color: 'inherit', lineHeight: 1 }}>
            {progress}%
          </span>
        )}
        {label && (
          <span style={{ fontSize: size * 0.12, fontWeight: 500, opacity: 0.6, lineHeight: 1, marginTop: 2 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
