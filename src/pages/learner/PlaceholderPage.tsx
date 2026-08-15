import { IconCalendar, IconAward, IconGrid } from '@/components/ui/icons'
import type { ComponentType, SVGProps } from 'react'
import type { PageId } from '@/types/nav'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { s?: number }>

const PAGE_META: Partial<Record<PageId, { title: string; icon: IconType }>> = {
  calendar:     { title: 'Calendar',     icon: IconCalendar },
  certificates: { title: 'Certificates', icon: IconAward },
  settings:     { title: 'Settings',     icon: IconGrid },
}

interface PlaceholderPageProps {
  page: PageId
}

export default function PlaceholderPage({ page }: PlaceholderPageProps) {
  const meta = PAGE_META[page]
  const Icon = meta?.icon ?? IconGrid
  const title = meta?.title ?? page

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: 28,
      background: 'var(--page-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: 'var(--card-border)', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
        }}>
          <Icon s={28} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
          This page is coming soon
        </p>
      </div>
    </div>
  )
}
