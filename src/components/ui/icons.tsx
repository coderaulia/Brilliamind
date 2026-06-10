import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { s?: number }

const base = (s: number): SVGProps<SVGSVGElement> => ({
  width: s,
  height: s,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const IconDashboard = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="2" />
    <rect x="14" y="3" width="7" height="5" rx="2" />
    <rect x="14" y="12" width="7" height="9" rx="2" />
    <rect x="3" y="16" width="7" height="5" rx="2" />
  </svg>
)

export const IconBook = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
)

export const IconGrid = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
)

export const IconCalendar = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export const IconAward = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
  </svg>
)

export const IconSettings = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

export const IconBell = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
)

export const IconSearch = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

export const IconCheck = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

export const IconClock = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const IconPlay = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

export const IconStar = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const IconPlus = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

export const IconChevRight = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} strokeWidth={2} {...p}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

export const IconFire = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M12 2c.5 4-2.5 6-2.5 10a5 5 0 0010 0c0-4-1.5-6-1.5-8" />
    <path d="M12 18a2.5 2.5 0 01-2.5-2.5c0-1.5.5-2.5 2.5-4 2 1.5 2.5 2.5 2.5 4A2.5 2.5 0 0112 18z" />
  </svg>
)

// ---- Extra icons (VIX) ----

export const IconFilter = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

export const IconUsers = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

export const IconUser = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export const IconChevLeft = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} strokeWidth={2} {...p}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

export const IconChevDown = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} strokeWidth={2} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export const IconX = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} strokeWidth={2} {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export const IconStarFilled = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} fill="currentColor" strokeWidth={1} {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const IconVideo = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
)

export const IconFile = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
)

export const IconLock = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
)

export const IconCheckCircle = ({ s = 20, ...p }: IconProps) => (
  <svg {...base(s)} {...p}>
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
