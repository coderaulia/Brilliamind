import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { CertificateItem } from '@/data/mock-data'
import { IconCheckCircle } from '@/components/ui/icons'
import { api } from '@/lib/api'

type VerifyState =
  | { status: 'loading' }
  | { status: 'invalid' }
  | { status: 'verified'; cert: CertificateItem }

export default function VerifyCertificatePage() {
  const { certUuid } = useParams<{ certUuid: string }>()
  const [state, setState] = useState<VerifyState>({ status: 'loading' })

  useEffect(() => {
    if (!certUuid) {
      setState({ status: 'invalid' })
      return
    }
    let active = true
    setState({ status: 'loading' })
    api.get<{ certificate: CertificateItem }>(`/api/certificates/verify/${encodeURIComponent(certUuid)}`)
      .then((res) => { if (active) setState({ status: 'verified', cert: res.certificate }) })
      .catch(() => { if (active) setState({ status: 'invalid' }) })
    return () => { active = false }
  }, [certUuid])

  if (state.status !== 'verified') {
    return (
      <div style={{
        minHeight: '100vh', background: '#090d16', color: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 20px', textAlign: 'center', gap: 12
      }}>
        {state.status === 'loading' ? (
          <p style={{ fontSize: 14, color: '#94a3b8' }}>Verifying certificate…</p>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f87171' }}>Certificate not found</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', maxWidth: 420 }}>
              No BrilliaMind certificate matches this ID. The link may be mistyped, or the credential may not exist.
            </p>
            <Link to="/" style={{ color: '#2dd4bf', fontSize: 13, fontWeight: 700 }}>Go to BrilliaMind →</Link>
          </>
        )}
      </div>
    )
  }

  const { cert } = state

  return (
    <div style={{
      minHeight: '100vh', background: '#090d16', color: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px', position: 'relative'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Brand Header */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 18
        }}>
          B
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          BrilliaMind
        </span>
      </Link>

      {/* Main Verification Card */}
      <div style={{
        width: '100%', maxWidth: 640, background: '#0f172a',
        borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)',
        padding: '36px 40px', boxShadow: '0 25px 60px -15px rgba(0,0,0,0.7)',
        position: 'relative', zIndex: 1
      }}>
        {/* Verification Status Badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, border: '2px solid rgba(16,185,129,0.3)'
          }}>
            <IconCheckCircle s={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            Official Certificate Verified
          </h1>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            This credential is valid and registered with BrilliaMind LMS.
          </p>
        </div>

        {/* Certificate Details Sheet */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recipient
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', marginTop: 2 }}>
                {cert.recipientName}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Course Completed
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2dd4bf', marginTop: 2 }}>
                {cert.courseTitle}
              </div>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Issue Date</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>{new Date(cert.issueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Performance Grade</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>{cert.grade}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Verified Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {cert.skillsAcquired.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '3px 8px', borderRadius: 6,
                      background: 'rgba(20,184,166,0.15)', color: '#2dd4bf',
                      fontSize: 11, fontWeight: 700
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Instructor & Authority</div>
              <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 2 }}>
                {cert.instructorName} • {cert.instructorRole}
              </div>
            </div>
          </div>
        </div>

        {/* UUID Footer */}
        <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginBottom: 24 }}>
          Certificate UUID: <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{cert.uuid}</span>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/dashboard"
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              color: '#fff', textAlign: 'center', textDecoration: 'none',
              fontSize: 14, fontWeight: 700, display: 'block'
            }}
          >
            Explore BrilliaMind Platform →
          </Link>
        </div>
      </div>
    </div>
  )
}
