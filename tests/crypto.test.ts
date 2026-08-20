import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  generateUuid,
  generateSecureToken,
} from '../worker/lib/crypto'

describe('Crypto & Security Engine', () => {
  describe('PBKDF2 Password Hashing', () => {
    it('hashes a password and produces pbkdf2$iterations$salt$key format', async () => {
      const password = 'SecretPassword123!'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.startsWith('pbkdf2$100000$')).toBe(true)

      const parts = hash.split('$')
      expect(parts.length).toBe(4)
      expect(parts[0]).toBe('pbkdf2')
      expect(parts[1]).toBe('100000')
      expect(parts[2].length).toBe(32) // 16 bytes = 32 hex chars salt
      expect(parts[3].length).toBe(64) // 32 bytes = 64 hex chars derived key
    })

    it('generates unique salts for identical passwords', async () => {
      const password = 'IdenticalPassword123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })

    it('successfully verifies correct password against stored hash', async () => {
      const password = 'SuperSecureLearner2026!'
      const hash = await hashPassword(password)

      const isMatch = await verifyPassword(password, hash)
      expect(isMatch).toBe(true)
    })

    it('rejects incorrect password against stored hash', async () => {
      const password = 'CorrectPassword123!'
      const wrongPassword = 'WrongPassword456!'
      const hash = await hashPassword(password)

      const isMatch = await verifyPassword(wrongPassword, hash)
      expect(isMatch).toBe(false)
    })
  })

  describe('JWT Signing and Verification', () => {
    const secret = 'super_secret_jwt_test_key_2026'

    it('signs and verifies a valid JWT payload', async () => {
      const payload = {
        sub: 'user-123',
        email: 'sarah@brilliamind.id',
        name: 'Sarah Chen',
        role: 'instructor',
        status: 'active',
      }

      const token = await signJwt(payload, secret)
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)

      const verified = await verifyJwt(token, secret)
      expect(verified).not.toBeNull()
      expect(verified?.sub).toBe('user-123')
      expect(verified?.email).toBe('sarah@brilliamind.id')
      expect(verified?.role).toBe('instructor')
      expect(verified?.status).toBe('active')
    })

    it('rejects JWT signed with a different secret', async () => {
      const payload = { sub: 'user-456', role: 'admin' }
      const token = await signJwt(payload, secret)

      const verified = await verifyJwt(token, 'different_wrong_secret')
      expect(verified).toBeNull()
    })

    it('rejects tampered JWT tokens', async () => {
      const payload = { sub: 'user-789', role: 'learner' }
      const token = await signJwt(payload, secret)

      // Tamper with payload part of the token
      const parts = token.split('.')
      const tamperedToken = `${parts[0]}.eyJzdWIiOiJ1c2VyLTc4OSIsInJvbGUiOiJhZG1pbiJ9.${parts[2]}`

      const verified = await verifyJwt(tamperedToken, secret)
      expect(verified).toBeNull()
    })
  })

  describe('Token and UUID Generation', () => {
    it('generates a valid UUID v4 format', () => {
      const uuid = generateUuid()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('generates cryptographically secure random tokens of specified length', () => {
      const token16 = generateSecureToken(16)
      expect(token16.length).toBe(32) // 16 bytes = 32 hex chars

      const token32 = generateSecureToken(32)
      expect(token32.length).toBe(64) // 32 bytes = 64 hex chars
    })
  })
})
