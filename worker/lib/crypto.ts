// Web Crypto utilities for Edge environments (zero external native dependencies)

const PBKDF2_ITERATIONS = 100_000

// Generate random UUID string
export function generateUuid(): string {
  return crypto.randomUUID()
}

// Generate random hex token for invitations and password reset
export function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

// Password hashing using PBKDF2 (SHA-256)
export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)

  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  const saltHex = Array.from(salt, b => b.toString(16).padStart(2, '0')).join('')
  const hashHex = Array.from(new Uint8Array(derivedBits), b => b.toString(16).padStart(2, '0')).join('')

  return `pbkdf2$${PBKDF2_ITERATIONS}$${saltHex}$${hashHex}`
}

// Password verification
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$')
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false
    }

    const iterations = parseInt(parts[1], 10)
    const saltHex = parts[2]
    const originalHashHex = parts[3]

    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    )

    const derivedHex = Array.from(new Uint8Array(derivedBits), b => b.toString(16).padStart(2, '0')).join('')
    return derivedHex === originalHashHex
  } catch {
    return false
  }
}

// JWT Payload Interface
export interface JwtPayload {
  sub: string
  email: string
  name: string
  role: 'admin' | 'instructor' | 'learner'
  status: 'pending' | 'active' | 'suspended'
  exp: number
  iat: number
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return atob(base64)
}

// Sign JWT token
export async function signJwt(payload: Omit<JwtPayload, 'exp' | 'iat'>, secret: string, expiresInSec = 86400 * 7): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSec,
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign))
  const signatureBytes = Array.from(new Uint8Array(signature), b => String.fromCharCode(b)).join('')
  const encodedSignature = base64UrlEncode(signatureBytes)

  return `${dataToSign}.${encodedSignature}`
}

// Verify JWT token
export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const dataToSign = `${encodedHeader}.${encodedPayload}`

    const enc = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const rawSignature = base64UrlDecode(encodedSignature)
    const signatureBytes = new Uint8Array(rawSignature.split('').map(c => c.charCodeAt(0)))

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, enc.encode(dataToSign))
    if (!isValid) return null

    const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}
