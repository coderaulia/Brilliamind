export const COVER_GRADIENTS = [
  'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  'linear-gradient(135deg, #059669 0%, #06b6d4 100%)',
]

export const STAT_COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b']

export const STAT_GRADIENTS = [
  'linear-gradient(135deg, #0d9488, #06b6d4)',
  'linear-gradient(135deg, #2563eb, #60a5fa)',
  'linear-gradient(135deg, #7c3aed, #a78bfa)',
  'linear-gradient(135deg, #e11d48, #fb7185)',
]

export const ACT_COLORS: Record<string, string> = {
  lesson: '#14b8a6',
  quiz:   '#3b82f6',
  start:  '#8b5cf6',
  cert:   '#f59e0b',
  enroll: '#ec4899',
}

export type ThemeVariant = 'Deep Navy' | 'Bright Canvas'

export const THEMES: Record<ThemeVariant, Record<string, string>> = {
  'Deep Navy': {
    '--sidebar-bg':          '#0C1526',
    '--sidebar-text':        '#7a8ba5',
    '--sidebar-active-bg':   'rgba(45,212,191,0.1)',
    '--sidebar-active-text': '#2dd4bf',
    '--sidebar-hover-bg':    'rgba(255,255,255,0.04)',
    '--sidebar-border':      'rgba(255,255,255,0.06)',
    '--topnav-bg':           '#ffffff',
    '--topnav-border':       '#e8ecf1',
    '--accent-1':            '#14b8a6',
    '--card-bg':             '#ffffff',
    '--card-border':         '#eaeff5',
    '--page-bg':             '#f0f4f8',
    '--text-primary':        '#0f172a',
    '--text-secondary':      '#475569',
    '--text-muted':          '#94a3b8',
  },
  'Bright Canvas': {
    '--sidebar-bg':          '#ffffff',
    '--sidebar-text':        '#64748b',
    '--sidebar-active-bg':   '#3b82f6',
    '--sidebar-active-text': '#ffffff',
    '--sidebar-hover-bg':    '#f1f5f9',
    '--sidebar-border':      '#eaeff5',
    '--topnav-bg':           '#ffffff',
    '--topnav-border':       '#e8ecf1',
    '--accent-1':            '#3b82f6',
    '--card-bg':             '#ffffff',
    '--card-border':         '#eaeff5',
    '--page-bg':             '#f7f9fb',
    '--text-primary':        '#0f172a',
    '--text-secondary':      '#475569',
    '--text-muted':          '#94a3b8',
  },
}
