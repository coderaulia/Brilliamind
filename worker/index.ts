import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import type { Env, Variables } from './types'
import auth from './routes/auth'
import admin from './routes/admin'
import coursesRouter from './routes/courses'
import progressRouter from './routes/progress'
import seedRouter from './routes/seed'
import analyticsRouter from './routes/analytics'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// Security Headers Middleware (OWASP Secure Headers & CSP)
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'https://images.unsplash.com', 'https://media.brilliamind.id', 'data:'],
      frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      connectSrc: ["'self'", 'https://api.stripe.com'],
    },
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    xXssProtection: '1; mode=block',
  })
)

// CORS Middleware with strict origin allowlist
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        c.env?.APP_URL || '',
      ].filter(Boolean)
      if (!origin || allowedOrigins.includes(origin)) {
        return origin || allowedOrigins[0]
      }
      return null
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// Centralized Error Handling (Redact sensitive stack/messages in production)
app.onError((err, c) => {
  console.error('[WORKER ERROR]', err)
  const appUrl = c.env?.APP_URL || ''
  const isDev = appUrl.includes('localhost') || appUrl.includes('127.0.0.1') || !appUrl
  return c.json(
    {
      error: isDev ? (err.message || 'Internal Server Error') : 'Internal Server Error',
    },
    500
  )
})

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'brilliamind-api',
  })
})

// Mount API Routers
app.route('/api/auth', auth)
app.route('/api/admin', admin)
app.route('/api/courses', coursesRouter)
app.route('/api/progress', progressRouter)
app.route('/api/analytics', analyticsRouter)
app.route('/api/seed', seedRouter)

export default app
