import type { CloudflareStats } from '../../../../worker/lib/cloudflare'

export interface PopularCourse {
  id: string
  title: string
  slug: string
  category: string
  status: string
  price: number
  enrollmentCount: number
  completedCount: number
  completionRate: number
  lessonsPlayedCount: number
  rating: number
}

export interface PlatformAnalyticsData {
  timeframe: '7d' | '30d' | '90d'
  summary: {
    requests: number
    errorRate: number
    liveVisitors: number
    pageViews: number
    activeUsers: number
    newUsersInRange: number
    paidRevenue: number
    pendingPayments: number
    funnelCompletionRate: number
    completedFromVisitors: string
    returningVisitorsRate: number
    returningVisitorsCount: number
    trafficSourcesCount: number
    topSourceVisitors: number
    frontendErrorsCount: number
    affectedVisitorsCount: number
  }
  funnel: Array<{ step: string; count: number }>
  activation: {
    visitors: number
    enrolled: number
    halfway: number
    certified: number
  }
  topPages: Array<{ path: string; count: number }>
  ctaClicks: Array<{ label: string; count: number }>
  recentVisitors: Array<{
    path: string
    title: string
    sessionId: string
    country: string
    createdAt: string
  }>
  trafficSources: Array<{ source: string; count: number }>
  errors: Array<{ errorType: string; path: string; count: number }>
  apiHealth: {
    averageLatencyMs: number
    maxLatencyMs: number
    serverErrors: number
    uniqueClients: number
    topEndpoints: Array<{ endpoint: string; count: number }>
  }
  cloudflare: CloudflareStats
  usersAndSessions: {
    admins: number
    instructors: number
    learners: number
    activeSessions: number
  }
    coursesAndLearning: {
    totalCourses: number
    coursesPlayed: number
    lessonsCompleted: number
    certificatesReleased: number
    totalWatchMinutes: number
    popularCourses: PopularCourse[]
    quizStats?: {
      totalAttempts: number
      passedAttempts: number
      passRate: number
      avgScore: number
    }
    categories?: Array<{ name: string; count: number }>
  }
  transactions: {
    totalRevenueIdr: number
    pendingInvoices: number
    activeSubscriptions: number
  }
}

export type Timeframe = PlatformAnalyticsData['timeframe']
