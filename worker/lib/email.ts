export interface SendEmailOptions {
  to: string
  toName?: string
  subject: string
  html: string
  apiKey?: string
  from?: string
  senderName?: string
}

export async function sendEmail({
  to,
  toName,
  subject,
  html,
  apiKey,
  from = 'noreply@brilliamind.id',
  senderName = 'BrilliaMind LMS',
}: SendEmailOptions): Promise<boolean> {
  // Local development fallback: log email to console if no API key is provided
  if (!apiKey || apiKey.startsWith('xkeysib_test_dummy') || apiKey.startsWith('re_test_dummy')) {
    console.log(`\n================= [BREVO DEV EMAIL DISPATCH] =================`)
    console.log(`To: ${toName ? `${toName} <${to}>` : to}`)
    console.log(`From: ${senderName} <${from}>`)
    console.log(`Subject: ${subject}`)
    console.log(`Body (HTML):\n${html}`)
    console.log(`==============================================================\n`)
    return true
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: from,
        },
        to: [
          {
            email: to,
            name: toName || to.split('@')[0],
          },
        ],
        subject,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('[BREVO ERROR]', res.status, errBody)
      return false
    }

    return true
  } catch (err) {
    console.error('Error dispatching email via Brevo API:', err)
    return false
  }
}
