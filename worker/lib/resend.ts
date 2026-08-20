export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  apiKey?: string
  from?: string
}

export async function sendEmail({ to, subject, html, apiKey, from = 'noreply@brilliamind.id' }: SendEmailOptions): Promise<boolean> {
  if (!apiKey || apiKey.startsWith('re_test_dummy')) {
    // In local development, log the email to the console so developers can easily copy links
    console.log(`\n================= [DEV EMAIL DISPATCH] =================`)
    console.log(`To: ${to}`)
    console.log(`From: ${from}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body:\n${html}`)
    console.log(`========================================================\n`)
    return true
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    })

    return res.ok
  } catch (err) {
    console.error('Error dispatching email via Resend:', err)
    return false
  }
}
