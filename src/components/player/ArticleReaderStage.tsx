import DOMPurify from 'dompurify'
import { IconFileText } from '@/components/ui/icons'

interface ArticleReaderStageProps {
  title: string
  content?: string
}

export default function ArticleReaderStage({ title, content }: ArticleReaderStageProps) {
  const formattedHtml = DOMPurify.sanitize(
    (content || '')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/### (.*?)\n/g, '<h3 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 24px 0 12px;">$1</h3>')
      .replace(/#### (.*?)\n/g, '<h4 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 18px 0 8px;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary);">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
  )

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
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            background: 'rgba(20,184,166,0.1)',
            color: 'var(--accent-1)',
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <IconFileText s={14} /> Comprehensive Reading Guide
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 20 }}>
          {title}
        </h1>
        <div
          style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      </div>
    </div>
  )
}
