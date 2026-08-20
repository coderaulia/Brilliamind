const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

function getAnonymousId(): string {
  try {
    let anonId = localStorage.getItem('bm_anon_id')
    if (!anonId) {
      anonId = 'anon_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
      localStorage.setItem('bm_anon_id', anonId)
    }
    return anonId
  } catch {
    return 'anon_fallback'
  }
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
    const payload = {
      eventType,
      anonymousId: getAnonymousId(),
      courseId: extra?.courseId,
      lessonId: extra?.lessonId,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      properties: extra?.properties || {},
    }

    const token = localStorage.getItem('bm_token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    fetch(`${API_BASE_URL}/api/analytics/event`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Telemetry failures should never interrupt UI
    })
  } catch {
    // Silent fail
  }
}

export function trackPageView(path: string) {
  trackEvent('page_view', {
    properties: {
      path,
      title: document.title,
    },
  })
}
