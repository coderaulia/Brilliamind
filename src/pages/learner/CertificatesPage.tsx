import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { MOCK_CERTIFICATES, type CertificateItem } from '@/data/mock-data'
import { api } from '@/lib/api'
import { MOCK_DATA_ENABLED } from '@/lib/mock-mode'
import {
  IconAward, IconCheckCircle, IconDownload, IconShare,
  IconExternalLink, IconX
} from '@/components/ui/icons'

export default function CertificatesPage() {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [certificates, setCertificates] = useState<CertificateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get<{ certificates: CertificateItem[] }>('/api/certificates/mine')
      .then((res) => { if (active) setCertificates(res.certificates) })
      .catch((err) => {
        console.error('Failed to load certificates:', err)
        if (active && MOCK_DATA_ENABLED) setCertificates(MOCK_CERTIFICATES)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleCopyLink = (uuid: string) => {
    const url = `${window.location.origin}/verify/${uuid}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleDownloadPdf = (cert: CertificateItem) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = 297
    const pageH = 210

    // Cream diploma background
    doc.setFillColor(250, 250, 249)
    doc.rect(0, 0, pageW, pageH, 'F')

    // Outer & inner teal border
    doc.setDrawColor(13, 148, 136)
    doc.setLineWidth(2.2)
    doc.rect(12, 12, pageW - 24, pageH - 24)
    doc.setLineWidth(0.6)
    doc.rect(15, 15, pageW - 30, pageH - 30)

    // Platform Header
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(13, 148, 136)
    doc.text('BRILLIAMIND LEARNING PLATFORM', pageW / 2, 36, { align: 'center' })

    // Title
    doc.setFont('times', 'bold')
    doc.setFontSize(28)
    doc.setTextColor(15, 23, 42)
    doc.text('CERTIFICATE OF ACCOMPLISHMENT', pageW / 2, 54, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(100, 116, 139)
    doc.text('This official credential certifies that', pageW / 2, 68, { align: 'center' })

    // Recipient Name
    doc.setFont('times', 'bolditalic')
    doc.setFontSize(30)
    doc.setTextColor(15, 23, 42)
    doc.text(cert.recipientName, pageW / 2, 86, { align: 'center' })

    doc.setDrawColor(13, 148, 136)
    doc.setLineWidth(0.8)
    doc.line(pageW / 2 - 55, 90, pageW / 2 + 55, 90)

    // Course completion statement
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(71, 85, 105)
    doc.text(
      'has successfully completed all coursework, assessments, and practical requirements for',
      pageW / 2,
      104,
      { align: 'center' }
    )

    // Course Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(15, 23, 42)
    doc.text(cert.courseTitle, pageW / 2, 118, { align: 'center', maxWidth: 230 })

    // Grade & Skills
    if (cert.grade) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(13, 148, 136)
      doc.text(`Standing: ${cert.grade}`, pageW / 2, 130, { align: 'center' })
    }

    // Signatures & Issue Date
    const sigY = 165
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.4)
    doc.line(45, sigY - 8, 115, sigY - 8)
    doc.line(pageW - 115, sigY - 8, pageW - 45, sigY - 8)

    doc.setFont('times', 'italic')
    doc.setFontSize(15)
    doc.setTextColor(30, 41, 59)
    doc.text(cert.instructorName || 'Lead Instructor', 80, sigY - 12, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(cert.instructorRole || 'Course Instructor', 80, sigY - 2, { align: 'center' })

    const formattedDate = new Date(cert.issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(30, 41, 59)
    doc.text(formattedDate, pageW - 80, sigY - 12, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text('Date of Issue', pageW - 80, sigY - 2, { align: 'center' })

    // Verification footer
    const verifyUrl = `${window.location.origin}/verify/${cert.uuid}`
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(148, 163, 184)
    doc.text(`Certificate ID: ${cert.uuid}  •  Verify at: ${verifyUrl}`, pageW / 2, 186, { align: 'center' })

    const safeSlug = cert.courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    doc.save(`BrilliaMind-Certificate-${safeSlug || cert.uuid}.pdf`)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(20,184,166,0.12)', color: 'var(--accent-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconAward s={22} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              Verified Certificates & Credentials
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Official digital credentials issued upon 100% course completion and passing assessment scores.
          </p>
        </div>

        {/* Highlight Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0C1526 0%, #134e4a 100%)',
          borderRadius: 20, padding: '28px 32px', marginBottom: 32,
          color: '#fff', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Accomplishments
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              You've earned {certificates.length} Verified Certificate{certificates.length === 1 ? '' : 's'}!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', maxWidth: 540, lineHeight: 1.5 }}>
              Share your verified achievements directly to LinkedIn, include them in your portfolio, or download print-ready PDFs.
            </p>
          </div>

          <div style={{
            padding: '16px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#2dd4bf' }}>
              {certificates.length}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
              Active Credentials
            </div>
          </div>
        </div>

        {/* Certificates Grid */}
        {!loading && certificates.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40 }}>
            No certificates yet. Complete 100% of a course to earn your first verified credential.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, marginBottom: 40 }}>
          {certificates.map(cert => (
            <div
              key={cert.id}
              style={{
                background: 'var(--card-bg)', borderRadius: 18,
                border: '1px solid var(--card-border)', padding: '24px 28px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 20,
                    background: 'rgba(16,185,129,0.1)', color: '#059669',
                    fontSize: 12, fontWeight: 700
                  }}>
                    <IconCheckCircle s={14} /> Verified Credential
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>
                  {cert.courseTitle}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Awarded to <strong>{cert.recipientName}</strong> • {cert.grade}
                </p>

                {/* Skills tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {cert.skillsAcquired.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        padding: '3px 8px', borderRadius: 6,
                        background: 'var(--page-bg)', border: '1px solid var(--card-border)',
                        fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--card-border)', paddingTop: 16 }}>
                <button
                  onClick={() => setSelectedCert(cert)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10,
                    background: 'var(--accent-1)', color: '#fff', border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <IconAward s={15} /> View Certificate
                </button>

                <button
                  onClick={() => handleDownloadPdf(cert)}
                  title="Download PDF"
                  style={{
                    padding: '10px', borderRadius: 10,
                    background: 'var(--page-bg)', border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  <IconDownload s={16} />
                </button>

                <button
                  onClick={() => handleCopyLink(cert.uuid)}
                  title="Share link"
                  style={{
                    padding: '10px', borderRadius: 10,
                    background: 'var(--page-bg)', border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  <IconShare s={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Preview Modal */}
        {selectedCert && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(10,15,29,0.8)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20
            }}
            onClick={() => setSelectedCert(null)}
          >
            <div
              style={{
                width: '100%', maxWidth: 760, background: '#fff',
                borderRadius: 20, overflow: 'hidden', color: '#0f172a',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                position: 'relative'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Close */}
              <button
                onClick={() => setSelectedCert(null)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(0,0,0,0.06)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <IconX s={18} />
              </button>

              {/* Certificate Sheet (Simulated A4 Diploma) */}
              <div style={{
                padding: '48px 56px', border: '12px double #0d9488',
                margin: 20, borderRadius: 12, textAlign: 'center',
                background: '#fafaf9', position: 'relative'
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 800, color: '#0d9488',
                  letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12
                }}>
                  BrilliaMind Learning Platform
                </div>

                <h2 style={{
                  fontSize: 26, fontWeight: 900, fontFamily: 'serif',
                  color: '#0f172a', letterSpacing: '0.04em', marginBottom: 8
                }}>
                  CERTIFICATE OF ACCOMPLISHMENT
                </h2>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                  This credential certifies that
                </div>

                <div style={{
                  fontSize: 28, fontWeight: 800, color: '#0f172a',
                  borderBottom: '2px solid #0d9488', display: 'inline-block',
                  paddingBottom: 6, marginBottom: 20, minWidth: 320
                }}>
                  {selectedCert.recipientName}
                </div>

                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, maxWidth: 520, margin: '0 auto 28px' }}>
                  has successfully completed all rigorous coursework, capstone assessments, and practical requirements for
                  <br />
                  <strong style={{ color: '#0f172a', fontSize: 16 }}>{selectedCert.courseTitle}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'cursive', fontSize: 18, color: '#1e293b', marginBottom: 2 }}>
                      {selectedCert.instructorName}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{selectedCert.instructorRole}</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: '50%',
                      background: '#0d9488', color: '#fff', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 4
                    }}>
                      <IconAward s={24} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0d9488' }}>VERIFIED SEAL</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
                      {new Date(selectedCert.issueDate).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Date of Issue</div>
                  </div>
                </div>

                <div style={{ marginTop: 24, fontSize: 10, color: '#94a3b8', letterSpacing: '0.04em' }}>
                  Certificate ID: {selectedCert.uuid} • Verify at brilliamind.com{selectedCert.credentialUrl}
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div style={{
                padding: '16px 28px', background: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <a
                  href={`/verify/${selectedCert.uuid}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: '#0d9488', fontSize: 13, fontWeight: 700, textDecoration: 'none'
                  }}
                >
                  <IconExternalLink s={14} /> Open Public Verification Page
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    onClick={() => handleCopyLink(selectedCert.uuid)}
                    style={{
                      padding: '8px 16px', borderRadius: 8,
                      background: '#fff', border: '1px solid #cbd5e1',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    {copiedLink ? '✓ Copied Link' : 'Copy Public URL'}
                  </button>
                  <button
                    onClick={() => handleDownloadPdf(selectedCert)}
                    style={{
                      padding: '8px 20px', borderRadius: 8,
                      background: '#0d9488', color: '#fff', border: 'none',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
