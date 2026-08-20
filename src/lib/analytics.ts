const API_BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8787'

function getAnonymousId(): string {
  try {
    if (typeof localStorage !== 'undefined') {
      let anonId = localStorage.getItem('bm_anon_id')
      if (!anonId) {
        anonId = 'anon_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
        localStorage.setItem('bm_anon_id', anonId)
      }
      return anonId
    }
  } catch {
    // ignore storage error
  }
  return 'anon_fallback'
}

export interface TelemetryEventPayload {
  eventType: string
  courseId?: string
  lessonId?: string
  path?: string
  referrer?: string
  properties?: Record<string, unknown>
}

export function trackEvent(
  eventType: string,
  extra?: {
    courseId?: string
    lessonId?: string
    properties?: Record<string, unknown>
  }
) {
  try {
    const currentPath = typeof window !== 'undefined' && window.location ? window.location.pathname : '/'
    const referrer = typeof document !== 'undefined' ? document.referrer : undefined

    const payload = {
      eventType,
      anonymousId: getAnonymousId(),
      courseId: extra?.courseId,
      lessonId: extra?.lessonId,
      path: currentPath,
      referrer: referrer || undefined,
      properties: extra?.properties || {},
    }

    let token: string | null = null
    if (typeof localStorage !== 'undefined') {
      try {
        token = localStorage.getItem('bm_token')
      } catch {
        // ignore
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (typeof fetch !== 'undefined') {
      fetch(`${API_BASE_URL}/api/analytics/event`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // Telemetry failures should never interrupt UI
      })
    }
  } catch {
    // Silent fail
  }
}

export function trackPageView(path: string) {
  const title = typeof document !== 'undefined' ? document.title : ''
  trackEvent('page_view', {
    properties: {
      path,
      title,
    },
  })
}
