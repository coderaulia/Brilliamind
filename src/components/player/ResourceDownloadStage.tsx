import { IconDownload, IconFileText } from '@/components/ui/icons'

interface ResourceDownloadStageProps {
  title: string
  resources?: Array<{ title: string; size: string; downloadUrl: string }>
}

export default function ResourceDownloadStage({ title, resources }: ResourceDownloadStageProps) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: 460,
        background: 'var(--card-bg)',
        padding: '40px 48px',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            background: 'rgba(59,130,246,0.1)',
            color: '#3b82f6',
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <IconDownload s={14} /> Downloadable Course Assets
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
          Download the project files, templates, and Figma libraries to follow along with this module.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {resources?.map((res, rIdx) => (
            <div
              key={rIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: 12,
                background: 'var(--page-bg)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(20,184,166,0.12)',
                    color: 'var(--accent-1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconFileText s={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {res.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{res.size}</div>
                </div>
              </div>

              <button
                onClick={() => alert(`Downloading ${res.title}...`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--accent-1)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <IconDownload s={14} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
