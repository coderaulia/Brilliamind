import { useState } from 'react'
import type { ThemeVariant } from '@/constants/design-tokens'

// Theme switcher hook — shared across pages
export function useTheme(defaultVariant: ThemeVariant = 'Deep Navy') {
  const [variant, setVariant] = useState<ThemeVariant>(defaultVariant)
  return { variant, setVariant }
}
