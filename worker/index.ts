import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env, Variables } from './types'
import auth from './routes/auth'
import admin from './routes/admin'
import coursesRouter from './routes/courses'
import progressRouter from './routes/progress'
import seedRouter from './routes/seed'
import analyticsRouter from './routes/analytics'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

// CORS Middleware
app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: (origin) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        c.env?.APP_URL || '',
      ].filter(Boolean)
      return allowedOrigins.includes(origin) || !origin ? origin : allowedOrigins[0]
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
  return corsMiddleware(c, next)
})

// Centralized Error Handling
app.onError((err, c) => {
  console.error('[WORKER ERROR]', err)
  return c.json(
    {
      error: err.message || 'Internal Server Error',
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
