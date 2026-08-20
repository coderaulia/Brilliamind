import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { COVER_GRADIENTS } from '@/constants/design-tokens'

// ─── Data ──────────────────────────────────────────────────────────────────

const STATS = [
  { val: '12K+', lbl: 'Happy Learners' },
  { val: '250+', lbl: 'Expert Courses' },
  { val: '40+',  lbl: 'Top Instructors' },
  { val: '4.8★', lbl: 'Average Rating' },
  { val: '94%',  lbl: 'Completion Rate' },
]

const CATEGORIES = [
  { emoji: '🎨', name: 'Design',      count: '48 courses', bg: '#14b8a615' },
  { emoji: '💻', name: 'Development', count: '92 courses', bg: '#3b82f615' },
  { emoji: '📊', name: 'Analytics',   count: '36 courses', bg: '#8b5cf615' },
  { emoji: '💼', name: 'Business',    count: '44 courses', bg: '#f59e0b15' },
  { emoji: '📢', name: 'Marketing',   count: '30 courses', bg: '#ec489915' },
]

const COURSES = [
  {
    cat: 'design', grad: COVER_GRADIENTS[0], tag: 'Design',
    badge: { label: 'FREE', bg: 'rgba(255,255,255,.25)', color: '#fff' },
    level: 'Beginner · 18h · 24 lessons', title: 'UX Design Fundamentals',
    initials: 'SC', instructor: 'Sarah Chen', rating: 4.8, students: '2,340', price: 'Free', freePrice: true,
  },
  {
    cat: 'development', grad: COVER_GRADIENTS[1], tag: 'Development',
    badge: { label: 'Bestseller', bg: 'rgba(239,68,68,.3)', color: '#fecaca' },
    level: 'Advanced · 28h · 32 lessons', title: 'Advanced JavaScript',
    initials: 'MW', instructor: 'Marcus Webb', rating: 4.9, students: '3,120', price: '$49',
  },
  {
    cat: 'analytics', grad: COVER_GRADIENTS[3], tag: 'Analytics',
    badge: null,
    level: 'Intermediate · 14h · 18 lessons', title: 'Data Analytics with Python',
    initials: 'PP', instructor: 'Priya Patel', rating: 4.7, students: '1,850', price: '$39',
  },
  {
    cat: 'analytics', grad: COVER_GRADIENTS[4], tag: 'Analytics',
    badge: { label: 'Hot 🔥', bg: 'rgba(245,158,11,.3)', color: '#fef3c7' },
    level: 'Intermediate · 22h · 28 lessons', title: 'Machine Learning Basics',
    initials: 'AK', instructor: 'Dr. Amir Karim', rating: 4.9, students: '4,200', price: '$59',
  },
  {
    cat: 'design', grad: COVER_GRADIENTS[0], tag: 'Design',
    badge: null,
    level: 'Beginner · 17h · 22 lessons', title: 'UI Design with Figma',
    initials: 'NR', instructor: 'Nina Rodriguez', rating: 4.8, students: '2,860', price: '$29',
  },
  {
    cat: 'business', grad: COVER_GRADIENTS[2], tag: 'Business',
    badge: { label: 'FREE', bg: 'rgba(255,255,255,.25)', color: '#fff' },
    level: 'Beginner · 16h · 20 lessons', title: 'Product Management 101',
    initials: 'JL', instructor: 'James Liu', rating: 4.6, students: '980', price: 'Free', freePrice: true,
  },
]

const BENEFITS = [
  { icon: '🎓', title: 'Earn Certificates',  desc: 'Get a verified certificate on every completed course — shareable on LinkedIn and your portfolio.' },
  { icon: '⚡', title: 'Learn Your Way',     desc: 'Pause, rewind, and continue any time. Your progress is always saved — pick up exactly where you left off.' },
  { icon: '👨‍🏫', title: 'Expert Instructors', desc: 'Every course is taught by a practitioner with real-world experience — not just theory.' },
  { icon: '📈', title: 'Track Your Growth',  desc: 'Visual progress rings, streaks, and a learning heatmap keep you motivated day after day.' },
]

const INSTRUCTORS = [
  { initials: 'SC', name: 'Sarah Chen',      title: 'Senior UX Designer',      grad: COVER_GRADIENTS[0], courses: 2, rating: '4.8★', students: '5.2K' },
  { initials: 'MW', name: 'Marcus Webb',     title: 'Lead JavaScript Engineer', grad: COVER_GRADIENTS[1], courses: 2, rating: '4.9★', students: '4.7K' },
  { initials: 'PP', name: 'Priya Patel',     title: 'Data Scientist & Analyst', grad: COVER_GRADIENTS[3], courses: 3, rating: '4.7★', students: '3.9K' },
  { initials: 'AK', name: 'Dr. Amir Karim', title: 'ML Researcher & Educator', grad: COVER_GRADIENTS[4], courses: 1, rating: '4.9★', students: '4.2K' },
]

const TESTIMONIALS = [
  { initials: 'RA', grad: COVER_GRADIENTS[0], name: 'Rina Aditi',    role: 'Freelance UX Designer', outcome: '🎯 Got first client', text: '"I completed the UX Design course in 3 weeks and landed my first design freelance contract the week after. The projects in the course gave me exactly the portfolio pieces I needed."' },
  { initials: 'BK', grad: COVER_GRADIENTS[1], name: 'Bram Kusuma',   role: 'Frontend Developer',    outcome: '📈 Got promoted',     text: '"The JavaScript course is the best I\'ve found anywhere — not just theory, but real patterns I use at work every day. My code reviews have been dramatically better since finishing it."' },
  { initials: 'DW', grad: COVER_GRADIENTS[2], name: 'Dewi Wulandari',role: 'Junior Data Analyst',   outcome: '🔄 Career switcher',  text: '"I switched from accounting to data analytics after finishing the Python course. The certificate helped me prove my skills to employers, and I got two interview calls in the same week."' },
]

const TABS   = ['All', 'Design', 'Development', 'Analytics', 'Business']
const CHIPS  = ['All Courses', 'UI/UX Design', 'JavaScript', 'Python', 'Product Management', 'Machine Learning']

const HERO_CARDS = [
  { grad: COVER_GRADIENTS[0], title: 'UX Design Fundamentals',    meta: 'Sarah Chen · 24 lessons',  rating: '4.8', reviews: '2,340', delay: 0 },
  { grad: COVER_GRADIENTS[1], title: 'Advanced JavaScript',        meta: 'Marcus Webb · 32 lessons', rating: '4.9', reviews: '3,120', delay: 0.8 },
  { grad: COVER_GRADIENTS[3], title: 'Data Analytics with Python', meta: 'Priya Patel · 18 lessons', rating: '4.7', reviews: '1,850', delay: 1.6 },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled]   = useState(false)
  const [activeChip, setActiveChip] = useState('All Courses')
  const [activeTab,  setActiveTab]  = useState('All')
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    setScrolled((scrollRef.current?.scrollTop ?? 0) > 40)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    el.addEventListener('scroll', handleScroll, { passive: true })

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('lp-visible'); obs.unobserve(e.target) }
      }),
      { threshold: 0.08, root: el }
    )
    el.querySelectorAll('.lp-fade').forEach(el => obs.observe(el))

    return () => { el.removeEventListener('scroll', handleScroll); obs.disconnect() }
  }, [handleScroll])

  const visibleCourses = activeTab === 'All'
    ? COURSES
    : COURSES.filter(c => c.cat === activeTab.toLowerCase())

  return (
    <div
      ref={scrollRef}
      style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#0f172a', background: '#fff' }}
    >
      <style>{`
        @keyframes lp-fadeUp   { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
        @keyframes lp-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes lp-pulse    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.04)} }
        @keyframes lp-orb1     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes lp-orb2     { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-40px,25px)} }

        .lp-fade             { opacity:0; transform:translateY(24px); transition:opacity .6s ease, transform .6s ease; }
        .lp-visible          { opacity:1!important; transform:none!important; }
        .lp-hero-in          { animation:lp-fadeUp .6s ease both; }
        .lp-orb-1            { animation:lp-orb1 14s ease-in-out infinite; }
        .lp-orb-2            { animation:lp-orb2 18s ease-in-out infinite; }
        .lp-pulse            { animation:lp-pulse 2s ease-in-out infinite; }

        ::-webkit-scrollbar         { width:6px; }
        ::-webkit-scrollbar-track   { background:transparent; }
        ::-webkit-scrollbar-thumb   { background:#cbd5e1; border-radius:3px; }

        .lp-nav-btn:hover        { color:#fff!important; background:rgba(255,255,255,.07)!important; }
        .lp-btn-teal:hover       { background:#5eead4!important; transform:translateY(-1px); box-shadow:0 4px 14px rgba(45,212,191,.3); }
        .lp-btn-search:hover     { background:#0d9488!important; transform:translateY(-1px); }
        .lp-chip:hover           { background:rgba(255,255,255,.14)!important; color:#fff!important; }
        .lp-cat-card:hover       { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.08); border-color:transparent!important; }
        .lp-course-card:hover    { transform:translateY(-5px); box-shadow:0 20px 50px rgba(0,0,0,.1); }
        .lp-tab:hover            { background:#e2e8f0!important; }
        .lp-view-all:hover       { opacity:.8; }
        .lp-benefit-card:hover   { background:rgba(255,255,255,.08)!important; transform:translateY(-2px); }
        .lp-inst-card:hover      { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.08); }
        .lp-testi-card:hover     { box-shadow:0 12px 32px rgba(0,0,0,.07); }
        .lp-start-free:hover     { background:#5eead4!important; transform:translateY(-1px); }
        .lp-btn-cta-main:hover   { background:#5eead4!important; transform:translateY(-2px); box-shadow:0 8px 28px rgba(45,212,191,.35); }
        .lp-btn-cta-ghost:hover  { background:rgba(255,255,255,.14)!important; color:#fff!important; }
        .lp-footer-link:hover    { color:rgba(255,255,255,.75)!important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        background: scrolled ? 'rgba(10,15,30,0.96)' : 'rgba(10,15,30,0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background .3s',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#3B5278,#5b7eab)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>B</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>BrilliaMind</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {['Design', 'Development', 'Analytics', 'Business'].map(c => (
            <button key={c} className="lp-nav-btn" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>{c}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="lp-nav-btn" style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)', background: 'transparent', border: '1px solid rgba(255,255,255,.15)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>Sign In</button>
          </Link>
          <Link to="/onboarding" style={{ textDecoration: 'none' }}>
            <button className="lp-btn-teal" style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#0A0F1E', background: '#2dd4bf', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>Get Started Free</button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '92vh', background: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '110px 48px 80px' }}>
        <div className="lp-orb-1" style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,.15) 0%,transparent 70%)', top: -100, left: -60, filter: 'blur(72px)', pointerEvents: 'none' }} />
        <div className="lp-orb-2" style={{ position: 'absolute', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.12) 0%,transparent 70%)', bottom: -60, right: '8%', filter: 'blur(72px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)', backgroundSize: '56px 56px', maskImage: 'radial-gradient(ellipse 75% 75% at 50% 40%,black 25%,transparent 100%)' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div className="lp-hero-in" style={{ animationDelay: '0s', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(45,212,191,.1)', border: '1px solid rgba(45,212,191,.22)', borderRadius: 20, padding: '5px 16px', marginBottom: 24, fontSize: 12, fontWeight: 700, color: '#2dd4bf', letterSpacing: '.03em' }}>
            <div className="lp-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf' }} />
            250+ expert-led courses
          </div>

          <h1 className="lp-hero-in" style={{ animationDelay: '.08s', fontSize: 'clamp(38px,6vw,68px)', fontWeight: 800, color: '#fff', lineHeight: 1.06, letterSpacing: '-.025em', marginBottom: 20, textWrap: 'balance' as never }}>
            Learn skills that<br />
            <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#2dd4bf 0%,#60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>open doors</em>
          </h1>

          <p className="lp-hero-in" style={{ animationDelay: '.15s', fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, marginBottom: 36, textWrap: 'balance' as never }}>
            Practical, expert-led courses in design, development, analytics, and business —<br />learn at your pace, earn a certificate, and grow your career.
          </p>

          {/* Search */}
          <div className="lp-hero-in" style={{ animationDelay: '.22s', display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 14, padding: '6px 6px 6px 20px', boxShadow: '0 20px 60px rgba(0,0,0,.4)', maxWidth: 640, margin: '0 auto 28px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="What do you want to learn today?" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontWeight: 500, color: '#0f172a', fontFamily: 'inherit', background: 'transparent', margin: '0 12px' }} />
            <button className="lp-btn-search" style={{ padding: '12px 28px', borderRadius: 10, border: 'none', background: '#14b8a6', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', whiteSpace: 'nowrap' }}>Search</button>
          </div>

          {/* Chips */}
          <div className="lp-hero-in" style={{ animationDelay: '.3s', display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {CHIPS.map(chip => (
              <span
                key={chip}
                className="lp-chip"
                onClick={() => setActiveChip(chip)}
                style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s', color: activeChip === chip ? '#0A0F1E' : 'rgba(255,255,255,.7)', background: activeChip === chip ? '#14b8a6' : 'rgba(255,255,255,.08)', border: `1px solid ${activeChip === chip ? '#14b8a6' : 'rgba(255,255,255,.12)'}` }}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Floating cards */}
          <div className="lp-hero-in" style={{ animationDelay: '.38s', display: 'flex', gap: 14, justifyContent: 'center', marginTop: 52 }}>
            {HERO_CARDS.map(card => (
              <div key={card.title} style={{ animation: `lp-float 6s ease-in-out ${card.delay}s infinite`, background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '14px 16px', width: 200, flexShrink: 0 }}>
                <div style={{ height: 64, borderRadius: 9, marginBottom: 10, background: card.grad, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,.1)', right: -10, top: -10 }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.35 }}>{card.title}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', fontWeight: 500, marginBottom: 8 }}>{card.meta}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#fbbf24' }}>
                  ★ {card.rating} <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 9, fontWeight: 500 }}>({card.reviews})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#0C1526', padding: '36px 48px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {STATS.map((s, i) => (
            <div key={s.lbl} className="lp-fade" style={{ flex: 1, textAlign: 'center', padding: '0 20px', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none', transitionDelay: `${i * 0.07}s` }}>
              <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg,#2dd4bf,#fff 70%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: 5, letterSpacing: '-.02em' }}>{s.val}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.4)' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ background: '#f8fafc', padding: '80px 48px' }} id="categories">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-fade">
            <Tag>Browse by Topic</Tag>
            <Title>Find your <Grad>next skill</Grad></Title>
            <Sub>From beginner to advanced — find a course that fits where you are and where you want to go.</Sub>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginTop: 40 }}>
            {CATEGORIES.map((c, i) => (
              <Link key={c.name} to="/courses" style={{ textDecoration: 'none' }}>
                <div className="lp-fade lp-cat-card" style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer', transition: 'all .25s', transitionDelay: `${i * 0.06}s` }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: c.bg }}>{c.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{c.count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section style={{ background: '#fff', padding: '80px 48px' }} id="courses">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <Tag>Most Popular</Tag>
              <Title>Start with the <Grad>best</Grad></Title>
            </div>
            <Link to="/courses" className="lp-view-all" style={{ fontSize: 14, fontWeight: 700, color: '#14b8a6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, transition: 'opacity .15s' }}>
              View all
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>

          <div className="lp-fade" style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={t !== activeTab ? 'lp-tab' : ''}
                style={{ padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', background: t === activeTab ? '#0f172a' : '#f8fafc', color: t === activeTab ? '#fff' : '#64748b' }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {visibleCourses.map((c, i) => (
              <Link key={c.title} to="/courses" style={{ textDecoration: 'none' }}>
                <div className="lp-fade lp-course-card" style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all .3s', transitionDelay: `${(i % 3) * 0.07}s` }}>
                  <div style={{ height: 140, position: 'relative', overflow: 'hidden', background: c.grad }}>
                    <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.08)', right: -20, top: -20 }} />
                    <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.2)', color: '#fff', padding: '4px 11px', borderRadius: 20, backdropFilter: 'blur(8px)' }}>{c.tag}</span>
                    {c.badge && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: c.badge.bg, color: c.badge.color }}>{c.badge.label}</span>}
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 7 }}>{c.level}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 10, lineHeight: 1.35 }}>{c.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: c.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{c.initials}</div>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{c.instructor}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700 }}>
                        <span style={{ color: '#f59e0b' }}>★</span>
                        {c.rating} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>({c.students})</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: c.freePrice ? '#14b8a6' : '#0f172a' }}>{c.price}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ background: '#0A0F1E', padding: '80px 48px', position: 'relative', overflow: 'hidden' }} id="benefits">
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,.1) 0%,transparent 70%)', top: -100, right: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%)', bottom: -80, left: '5%', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div className="lp-fade">
            <Tag teal2>Why BrilliaMind</Tag>
            <h2 style={{ fontSize: 'clamp(26px,3.2vw,40px)', fontWeight: 800, color: '#fff', lineHeight: 1.12, letterSpacing: '-.02em', marginBottom: 12 }}>
              Learning built<br />around <em style={{ fontStyle: 'normal', background: 'linear-gradient(135deg,#14b8a6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>you</em>
            </h2>
            <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,.55)', lineHeight: 1.65, maxWidth: 520, marginBottom: 32 }}>Not just videos — a complete learning experience designed to keep you engaged, track your growth, and reward your effort.</p>
            <Link to="/onboarding" style={{ textDecoration: 'none' }}>
              <button className="lp-start-free" style={{ padding: '12px 30px', borderRadius: 10, border: 'none', background: '#2dd4bf', color: '#0A0F1E', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>Start Learning Free →</button>
            </Link>
          </div>
          <div className="lp-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, transitionDelay: '.15s' }}>
            {BENEFITS.map(b => (
              <div key={b.title} className="lp-benefit-card" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 22, transition: 'all .25s' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 500, lineHeight: 1.55 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTRUCTORS ── */}
      <section style={{ background: '#f8fafc', padding: '80px 48px' }} id="instructors">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-fade" style={{ textAlign: 'center', marginBottom: 0 }}>
            <Tag center>Meet the Instructors</Tag>
            <Title center>Learn from <Grad>the best</Grad></Title>
            <Sub center>Practitioners, not lecturers — every instructor brings hands-on industry experience to every lesson.</Sub>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 40 }}>
            {INSTRUCTORS.map((inst, i) => (
              <Link key={inst.name} to="/courses" style={{ textDecoration: 'none' }}>
                <div className="lp-fade lp-inst-card" style={{ background: '#fff', borderRadius: 18, padding: '24px 20px', border: '1px solid #e2e8f0', textAlign: 'center', transition: 'all .25s', cursor: 'pointer', transitionDelay: `${i * 0.07}s` }}>
                  <div style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 14px', background: inst.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>{inst.initials}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{inst.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 12 }}>{inst.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                    {([{ val: inst.courses, lbl: 'Courses' }, { val: inst.rating, lbl: 'Rating' }, { val: inst.students, lbl: 'Students' }] as const).map(s => (
                      <div key={s.lbl} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{s.val}</div>
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#fff', padding: '80px 48px' }} id="testimonials">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-fade" style={{ textAlign: 'center', marginBottom: 48 }}>
            <Tag center>Student Stories</Tag>
            <Title center>Real people, <Grad>real results</Grad></Title>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="lp-fade lp-testi-card" style={{ background: '#f8fafc', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0', transition: 'box-shadow .25s', transitionDelay: `${i * 0.08}s` }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 15 }}>{s}</span>)}
                </div>
                <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, fontWeight: 500, marginBottom: 20 }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: t.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{t.role}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginTop: 6 }}>{t.outcome}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg,#0A0F1E 0%,#0f3433 50%,#0d9488 100%)', padding: '90px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', borderRadius: '50%', background: 'radial-gradient(circle,rgba(45,212,191,.12) 0%,transparent 70%)', width: 500, height: 500, top: -200, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />
        <div className="lp-fade" style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(30px,4vw,50px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 14, letterSpacing: '-.02em', textWrap: 'balance' as never }}>Your next skill is one course away</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', fontWeight: 500, lineHeight: 1.6, marginBottom: 32 }}>Join 12,000+ learners already building skills that matter. Many courses are completely free to start.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/onboarding" style={{ textDecoration: 'none' }}>
              <button className="lp-btn-cta-main" style={{ padding: '14px 36px', borderRadius: 12, border: 'none', background: '#2dd4bf', color: '#0A0F1E', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>Start For Free</button>
            </Link>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button className="lp-btn-cta-ghost" style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.85)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>Sign In to Continue</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#070d1a', padding: '56px 48px 28px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, maxWidth: 1100, margin: '0 auto 40px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#3B5278,#5b7eab)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>B</div>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>BrilliaMind</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', fontWeight: 500, lineHeight: 1.7, marginTop: 12, maxWidth: 260 }}>Expert-led courses in design, development, analytics, and business. Learn at your own pace and earn certificates that matter.</p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Explore</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Link to="/onboarding" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Course Catalog</Link>
              <Link to="/register/instructor" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Become an Instructor</Link>
              <Link to="/login" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Member Sign In</Link>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Support</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Link to="/faq" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>FAQ & Help Center</Link>
              <Link to="/data-safety" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Data Safety & Security</Link>
              <a href="mailto:support@brilliamind.id" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Contact Team</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Link to="/privacy" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>Terms of Service</Link>
              <Link to="/data-safety" className="lp-footer-link" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>PDP & GDPR Notice</Link>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 22, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', fontWeight: 500 }}>© 2026 Vanaila Digital. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="lp-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#14b8a6' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', fontWeight: 500 }}>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRAD_TEXT: React.CSSProperties = { fontStyle: 'normal', background: 'linear-gradient(135deg,#14b8a6,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }

function Grad({ children }: { children: React.ReactNode }) {
  return <em style={GRAD_TEXT}>{children}</em>
}

function Tag({ children, teal2, center }: { children: React.ReactNode; teal2?: boolean; center?: boolean }) {
  const color = teal2 ? '#2dd4bf' : '#14b8a6'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color, marginBottom: 12, ...(center ? { justifyContent: 'center', width: '100%' } : {}) }}>
      <div style={{ width: 22, height: 2, background: color, borderRadius: 1 }} />
      {children}
    </div>
  )
}

function Title({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <h2 style={{ fontSize: 'clamp(26px,3.2vw,40px)', fontWeight: 800, color: '#0f172a', lineHeight: 1.12, letterSpacing: '-.02em', marginBottom: 12, ...(center ? { textAlign: 'center' } : {}) }}>{children}</h2>
  )
}

function Sub({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p style={{ fontSize: 16, fontWeight: 500, color: '#64748b', lineHeight: 1.65, maxWidth: 520, ...(center ? { margin: '0 auto' } : {}) }}>{children}</p>
  )
}
