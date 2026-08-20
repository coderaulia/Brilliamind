import type { Context, Next } from 'hono'
import type { Env, Variables, UserRole } from '../types'

export function requireRole(...allowedRoles: UserRole[]) {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    const user = c.get('user')
    if (!user) {
      return c.json({ error: 'Unauthorized: login required' }, 401)
    }

    if (user.status !== 'active') {
      if (user.status === 'pending') {
        return c.json({ error: 'Account pending superadmin approval', status: 'pending' }, 403)
      }
      return c.json({ error: 'Account suspended or inactive', status: user.status }, 403)
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json({ error: 'Forbidden: insufficient role permissions' }, 403)
    }

    await next()
  }
}
