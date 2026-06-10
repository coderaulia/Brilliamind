import { useState } from 'react'
import { CATALOG_COURSES, CATEGORIES, LEVELS } from '@/data/mock-data'
import CatalogCourseCard from '@/components/ui/CatalogCourseCard'
import { IconSearch, IconX } from '@/components/ui/icons'

interface CatalogPageProps {
  onOpenCourse?: (id: number) => void
}

export default function CatalogPage({ onOpenCourse }: CatalogPageProps) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [level, setLevel] = useState('All Levels')
  const [sort, setSort] = useState('Popular')

  const filtered = CATALOG_COURSES.filter(c => {
    if (cat !== 'All' && c.category !== cat) return false
    if (level !== 'All Levels' && c.level !== level) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.instructor.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sort === 'Popular') return b.students - a.students
    if (sort === 'Rating') return b.rating - a.rating
    if (sort === 'Newest') return b.id - a.id
    return 0
  })

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 18px', borderRadius: 20, border: active ? 'none' : '1px solid var(--card-border)',
    cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
    background: active ? 'var(--accent-1)' : 'var(--card-bg)',
    color: active ? '#fff' : 'var(--text-secondary)',
    boxShadow: active ? '0 2px 8px rgba(20,184,166,0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
  })

  const selectStyle: React.CSSProperties = {
    padding: '10px 16px', borderRadius: 12, border: '1px solid var(--card-border)',
    background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
    fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 28, background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Course Catalog
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Discover {CATALOG_COURSES.length} courses to accelerate your growth
          </p>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260,
            background: 'var(--card-bg)', borderRadius: 12, padding: '10px 16px',
            border: '1px solid var(--card-border)',
          }}>
            <IconSearch s={17} style={{ color: 'var(--text-muted)' } as React.CSSProperties} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search courses or instructors..."
              style={{
                border: 'none', outline: 'none', background: 'transparent', flex: 1,
                fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'inherit',
              }}
            />
            {search && (
              <span onClick={() => setSearch('')} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <IconX s={16} />
              </span>
            )}
          </div>

          <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
            <option>Popular</option>
            <option>Rating</option>
            <option>Newest</option>
          </select>

          <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
            {LEVELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={chipStyle(cat === c)}>{c}</button>
          ))}
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 16 }}>
          Showing {filtered.length} course{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {filtered.map((c, i) => (
            <CatalogCourseCard key={c.id} course={c} index={i} onOpen={() => onOpenCourse?.(c.id)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <IconSearch s={40} />
            <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>No courses found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters</p>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
