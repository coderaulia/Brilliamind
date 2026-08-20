import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trackEvent, trackPageView } from '../src/lib/analytics'

describe('Edge Telemetry & Analytics Client', () => {
  beforeEach(() => {
    // Mock localStorage
    const storage: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => { storage[k] = v },
      removeItem: (k: string) => { delete storage[k] },
    })
  })

  it('assigns and persists an anonymous session ID in localStorage', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"success":true}'))

    trackPageView('/courses')

    const anonId = localStorage.getItem('bm_anon_id')
    expect(anonId).toBeDefined()
    expect(anonId).toMatch(/^anon_/)

    fetchSpy.mockRestore()
  })

  it('dispatches telemetry payload with eventType and properties', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"success":true}'))

    trackEvent('lesson_complete', {
      courseId: 'crs-web-dev-001',
      lessonId: 'lsn-01',
      properties: {
        durationSeconds: 320,
      },
    })

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/analytics/event'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )

    fetchSpy.mockRestore()
  })
})
