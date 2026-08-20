import { describe, it, expect, vi } from 'vitest'
import { sendEmail } from '../worker/lib/email'

describe('Brevo Transactional Email Dispatcher', () => {
  it('logs email to console in development mode when API key is a dummy or missing', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await sendEmail({
      to: 'learner@brilliamind.id',
      toName: 'Budi Santoso',
      subject: 'Welcome to BrilliaMind LMS',
      html: '<p>Click here to access your course</p>',
      apiKey: 'xkeysib_test_dummy',
      from: 'noreply@brilliamind.id',
    })

    expect(result).toBe(true)
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('correctly constructs Brevo v3 SMTP REST payload on active API key', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ messageId: '<20260820.brevo.msg@smtp-relay>' }), { status: 201 })
    )

    const result = await sendEmail({
      to: 'sarah@brilliamind.id',
      toName: 'Sarah Chen',
      subject: 'Your Instructor Application Has Been Approved!',
      html: '<p>You can now log in</p>',
      apiKey: 'xkeysib-live-valid-api-key-test',
      from: 'noreply@brilliamind.id',
      senderName: 'BrilliaMind LMS',
    })

    expect(result).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.brevo.com/v3/smtp/email',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': 'xkeysib-live-valid-api-key-test',
          'content-type': 'application/json',
        },
      })
    )

    fetchSpy.mockRestore()
  })

  it('handles Brevo API HTTP error responses gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ code: 'unauthorized', message: 'Key not found' }), { status: 401 })
    )

    const result = await sendEmail({
      to: 'learner@brilliamind.id',
      subject: 'Test',
      html: '<p>Test</p>',
      apiKey: 'xkeysib-invalid-key',
    })

    expect(result).toBe(false)
    errorSpy.mockRestore()
    fetchSpy.mockRestore()
  })
})
