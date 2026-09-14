export interface Instructor {
  id: string
  email: string
  name: string
  role: string
  status: 'pending' | 'active' | 'suspended'
  bio: string | null
  createdAt: string
}

export interface PlatformUser {
  id: string
  email: string
  name: string
  role: string
  status: string
  createdAt: string
}

export interface AnalyticsOverview {
  funnel: Array<{ stage: string; count: number; color: string }>
  metrics: {
    totalVisitors: number
    totalUsers: number
    totalEnrollments: number
    totalGraduates: number
    activationRate: number
    completionRate: number
  }
  geo: Array<{ country: string; count: number }>
  recentEvents: Array<{
    id: string
    eventType: string
    path: string | null
    ipCountry: string | null
    createdAt: string
  }>
}
