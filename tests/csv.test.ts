import { describe, it, expect } from 'vitest'

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""'
  let str = String(val)
  // Prevent CSV Formula Injection in Excel / Google Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`
  }
  return `"${str.replace(/"/g, '""')}"`
}

describe('CSV Export & Security', () => {
  it('escapes standard strings by wrapping in double quotes', () => {
    expect(escapeCsvCell('Sarah Mitchell')).toBe('"Sarah Mitchell"')
    expect(escapeCsvCell('sarah@brilliamind.id')).toBe('"sarah@brilliamind.id"')
  })

  it('escapes existing double quotes within cell values', () => {
    expect(escapeCsvCell('Lesson "UX Introduction" Part 1')).toBe('"Lesson ""UX Introduction"" Part 1"')
  })

  it('sanitizes formula injection payloads starting with =', () => {
    const maliciousFormula = '=SUM(A1:A10)'
    const escaped = escapeCsvCell(maliciousFormula)
    expect(escaped).toBe("\"'=SUM(A1:A10)\"")
  })

  it('sanitizes formula injection payloads starting with +, -, @, or tab', () => {
    expect(escapeCsvCell('+cmd|\' /C calc\'!A0')).toBe("\"'+cmd|' /C calc'!A0\"")
    expect(escapeCsvCell('-2+3')).toBe("\"'-2+3\"")
    expect(escapeCsvCell('@SUM(1+1)')).toBe("\"'@SUM(1+1)\"")
    expect(escapeCsvCell('\t=cmd')).toBe("\"'\t=cmd\"")
  })

  it('handles null and undefined safely', () => {
    expect(escapeCsvCell(null)).toBe('""')
    expect(escapeCsvCell(undefined)).toBe('""')
  })

  it('handles numeric progress values correctly', () => {
    expect(escapeCsvCell(100)).toBe('"100"')
    expect(escapeCsvCell(0)).toBe('"0"')
    expect(escapeCsvCell('75%')).toBe('"75%"')
  })
})
