import { useState, useEffect, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Data ────────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'job',     emoji: '💼', title: 'Land a new job',     desc: 'Build skills employers want' },
  { id: 'skill',   emoji: '🚀', title: 'Level up my skills', desc: 'Go deeper in what I know' },
  { id: 'switch',  emoji: '🔄', title: 'Switch careers',     desc: 'Move into a new industry' },
  { id: 'project', emoji: '🛠',  title: 'Build a project',   desc: 'Ship something real' },
  { id: 'fun',     emoji: '✨', title: 'Learn for fun',      desc: 'Explore at my own pace' },
]

const TOPICS = [
  { id: 'design',    emoji: '🎨',  label: 'UI/UX Design',       color: '#14b8a6' },
  { id: 'frontend',  emoji: '💻',  label: 'Frontend Dev',        color: '#3b82f6' },
  { id: 'backend',   emoji: '⚙️',  label: 'Backend Dev',         color: '#6366f1' },
  { id: 'data',      emoji: '📊',  label: 'Data Analytics',      color: '#8b5cf6' },
  { id: 'ml',        emoji: '🤖',  label: 'Machine Learning',    color: '#ec4899' },
  { id: 'product',   emoji: '📦',  label: 'Product Management',  color: '#f59e0b' },
  { id: 'marketing', emoji: '📢',  label: 'Digital Marketing',   color: '#ef4444' },
  { id: 'figma',     emoji: '🖌️', label: 'Figma & Design Tools', color: '#14b8a6' },
  { id: 'react',     emoji: '⚛️', label: 'React & Next.js',     color: '#06b6d4' },
]

const LEVELS = [
  { id: 'beginner', label: 'Beginner',     desc: 'New to this topic',    emoji: '🌱' },
  { id: 'mid',      label: 'Intermediate', desc: 'I know the basics',    emoji: '🌿' },
  { id: 'advanced', label: 'Advanced',     desc: 'Looking to go deeper', emoji: '🌳' },
]

const PACES = [
  { id: 'casual',  label: 'Casual',    hours: '1–3 hrs/week', desc: 'Slow and steady',     emoji: '☕', color: '#14b8a6' },
  { id: 'steady',  label: 'Steady',    hours: '4–7 hrs/week', desc: 'Consistent progress', emoji: '🎯', color: '#3b82f6' },
  { id: 'intense', label: 'Intensive', hours: '8+ hrs/week',  desc: 'Fast-track mode',     emoji: '⚡', color: '#f59e0b' },
]

const COURSES = [
  { id: 1, title: 'UX Design Fundamentals',    instructor: 'Sarah Chen',    rating: 4.8, hours: 18, level: 'Beginner',     topics: ['design','figma'],   grad: 'linear-gradient(135deg,#0d9488,#06b6d4)', badge: 'FREE' },
  { id: 2, title: 'Advanced JavaScript',        instructor: 'Marcus Webb',   rating: 4.9, hours: 28, level: 'Advanced',     topics: ['frontend','react'],  grad: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', badge: 'Bestseller' },
  { id: 3, title: 'Data Analytics with Python', instructor: 'Priya Patel',   rating: 4.7, hours: 14, level: 'Intermediate', topics: ['data'],              grad: 'linear-gradient(135deg,#8b5cf6,#ec4899)', badge: null },
  { id: 4, title: 'Machine Learning Basics',    instructor: 'Dr. Amir K.',   rating: 4.9, hours: 22, level: 'Intermediate', topics: ['ml','data'],         grad: 'linear-gradient(135deg,#059669,#06b6d4)', badge: 'Hot 🔥' },
  { id: 5, title: 'UI Design with Figma',       instructor: 'Nina Rodriguez', rating: 4.8, hours: 17, level: 'Beginner',     topics: ['figma','design'],    grad: 'linear-gradient(135deg,#0d9488,#06b6d4)', badge: null },
  { id: 6, title: 'React & Next.js Masterclass',instructor: 'Alex Turner',   rating: 4.7, hours: 30, level: 'Advanced',     topics: ['react','frontend'],  grad: 'linear-gradient(135deg,#06b6d4,#6366f1)', badge: null },
  { id: 7, title: 'Product Management 101',     instructor: 'James Liu',     rating: 4.6, hours: 16, level: 'Beginner',     topics: ['product'],           grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', badge: 'FREE' },
  { id: 8, title: 'Digital Marketing Strategy', instructor: 'Laura Kim',     rating: 4.5, hours: 12, level: 'Beginner',     topics: ['marketing'],         grad: 'linear-gradient(135deg,#ef4444,#f59e0b)', badge: 'FREE' },
]

type OnboardingData = {
  name: string
  goal: string
  topics: string[]
  level: string
  pace: string
}

const TOTAL_STEPS = 6

// ─── Keyframe injection ───────────────────────────────────────────────────────

const STYLE_ID = 'onboarding-keyframes'

function injectKeyframes() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.06)} }
    @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-35px,25px) scale(1.08)} }
    @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(20px,30px) scale(0.96)} }
    @keyframes fadeUp    { from{transform:translateY(18px)} to{transform:translateY(0)} }
    @keyframes slideInR  { from{transform:translateX(44px)} to{transform:translateX(0)} }
    @keyframes slideInL  { from{transform:translateX(-44px)} to{transform:translateX(0)} }
    @keyframes popIn     { 0%{transform:scale(.88)} 70%{transform:scale(1.03)} 100%{transform:scale(1)} }
    @keyframes confettiDrop { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(120px) rotate(360deg);opacity:0} }
  `
  document.head.appendChild(style)
}

// ─── Background mesh ──────────────────────────────────────────────────────────

function Mesh() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,.13) 0%,transparent 70%)', top: -150, left: -100, filter: 'blur(60px)', animation: 'orbFloat1 14s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,.1) 0%,transparent 70%)', bottom: -80, right: 5, filter: 'blur(60px)', animation: 'orbFloat2 18s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.08) 0%,transparent 70%)', top: '40%', left: '45%', filter: 'blur(50px)', animation: 'orbFloat3 22s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize: '52px 52px', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%)' }} />
    </div>
  )
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: ['#2dd4bf','#3b82f6','#8b5cf6','#f59e0b','#ec4899','#06b6d4'][i % 6],
    left: 5 + Math.random() * 90,
    delay: Math.random() * 0.8,
    dur: 1.2 + Math.random() * 0.8,
    size: 6 + Math.random() * 8,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.left}%`, top: -20,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.id % 3 === 0 ? '50%' : p.id % 3 === 1 ? '2px' : '0',
          animation: `confettiDrop ${p.dur}s ease ${p.delay}s both`,
          opacity: 0,
        }} />
      ))}
    </div>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>Step {step} of {total}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(45,212,191,.7)' }}>{Math.round((step / total) * 100)}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,.08)' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg,#14b8a6,#2dd4bf)',
          width: `${(step / total) * 100}%`,
          transition: 'width .6s cubic-bezier(.34,1.56,.64,1)',
          boxShadow: '0 0 10px rgba(45,212,191,.4)',
        }} />
      </div>
    </div>
  )
}

// ─── Step wrapper (slide animation) ──────────────────────────────────────────

function StepWrap({ dir, children }: { dir: string; children: React.ReactNode }) {
  const anim = dir === 'forward' ? 'slideInR' : dir === 'back' ? 'slideInL' : 'fadeUp'
  return (
    <div style={{ animation: `${anim} .38s cubic-bezier(.34,1.2,.64,1) both` }}>
      {children}
    </div>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

function BtnPrimary({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '14px 36px', borderRadius: 12, border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? 'rgba(255,255,255,.08)' : hov ? '#5eead4' : '#2dd4bf',
        color: disabled ? 'rgba(255,255,255,.3)' : '#0A0F1E',
        fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
        transform: hov && !disabled ? 'translateY(-2px)' : 'none',
        boxShadow: hov && !disabled ? '0 8px 24px rgba(45,212,191,.3)' : 'none',
        transition: 'all .2s', letterSpacing: '.01em',
      }}
    >{children}</button>
  )
}

function BtnBack({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ padding: '14px 22px', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: 'transparent', color: 'rgba(255,255,255,.45)', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.05)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.75)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.45)' }}
    >← Back</button>
  )
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function StepWelcome({ data, onUpdate, dir }: { data: OnboardingData; onUpdate: (p: Partial<OnboardingData>) => void; dir: string }) {
  return (
    <StepWrap dir={dir}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#3B5278,#5b7eab)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32, fontWeight: 800, color: '#fff', boxShadow: '0 8px 32px rgba(59,82,120,.4)' }}>B</div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 10, lineHeight: 1.15 }}>Welcome to BrilliaMind</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', fontWeight: 500, lineHeight: 1.6 }}>Let's personalise your learning experience.<br />This takes less than a minute.</p>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.5)', marginBottom: 8, letterSpacing: '.04em', textTransform: 'uppercase' }}>Your first name</label>
        <input
          value={data.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="e.g. Aulia"
          autoFocus
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 12, fontSize: 16, fontWeight: 600,
            fontFamily: 'inherit', outline: 'none', transition: 'border .2s, box-shadow .2s',
            background: 'rgba(255,255,255,.06)', color: '#fff',
            border: data.name ? '1.5px solid rgba(45,212,191,.5)' : '1.5px solid rgba(255,255,255,.1)',
            boxShadow: data.name ? '0 0 0 3px rgba(45,212,191,.1)' : 'none',
          }}
          onFocus={e => { e.target.style.border = '1.5px solid rgba(45,212,191,.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,.1)' }}
          onBlur={e => { if (!data.name) { e.target.style.border = '1.5px solid rgba(255,255,255,.1)'; e.target.style.boxShadow = 'none' } }}
        />
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', fontWeight: 500, marginTop: 8 }}>You can change this later in your profile settings.</p>
    </StepWrap>
  )
}

// ─── Step 2: Goal ─────────────────────────────────────────────────────────────

function StepGoal({ data, onUpdate, dir }: { data: OnboardingData; onUpdate: (p: Partial<OnboardingData>) => void; dir: string }) {
  return (
    <StepWrap dir={dir}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>What's your main goal{data.name ? `, ${data.name}` : ''}?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>We'll tailor your course recommendations to match.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GOALS.map(g => {
          const sel = data.goal === g.id
          const baseStyle: CSSProperties = {
            display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 14,
            border: sel ? '1.5px solid rgba(45,212,191,.6)' : '1.5px solid rgba(255,255,255,.07)',
            background: sel ? 'rgba(45,212,191,.1)' : 'rgba(255,255,255,.03)',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all .18s',
            boxShadow: sel ? '0 0 0 3px rgba(45,212,191,.08), inset 0 0 20px rgba(45,212,191,.04)' : 'none',
            transform: sel ? 'scale(1.01)' : 'none',
          }
          return (
            <button key={g.id} onClick={() => onUpdate({ goal: g.id })} style={baseStyle}
              onMouseEnter={e => { if (!sel) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.14)' } }}
              onMouseLeave={e => { if (!sel) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.07)' } }}
            >
              <span style={{ fontSize: 24, flexShrink: 0, width: 36, textAlign: 'center' }}>{g.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: sel ? '#2dd4bf' : '#fff', marginBottom: 2 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>{g.desc}</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: sel ? '2px solid #2dd4bf' : '2px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2dd4bf' }} />}
              </div>
            </button>
          )
        })}
      </div>
    </StepWrap>
  )
}

// ─── Step 3: Topics ───────────────────────────────────────────────────────────

function StepTopics({ data, onUpdate, dir }: { data: OnboardingData; onUpdate: (p: Partial<OnboardingData>) => void; dir: string }) {
  const toggle = (id: string) => {
    const cur = data.topics || []
    const next = cur.includes(id) ? cur.filter(t => t !== id) : [...cur, id]
    onUpdate({ topics: next })
  }
  const sel = data.topics || []
  return (
    <StepWrap dir={dir}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>What do you want to learn?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>Pick as many as you like — we'll find courses that match.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {TOPICS.map(t => {
          const isOn = sel.includes(t.id)
          return (
            <button key={t.id} onClick={() => toggle(t.id)} style={{
              padding: '14px 12px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
              border: isOn ? `1.5px solid ${t.color}80` : '1.5px solid rgba(255,255,255,.07)',
              background: isOn ? `${t.color}15` : 'rgba(255,255,255,.03)',
              textAlign: 'center', transition: 'all .18s',
              boxShadow: isOn ? `0 0 0 3px ${t.color}12` : 'none',
              transform: isOn ? 'scale(1.03)' : 'none',
            }}
              onMouseEnter={e => { if (!isOn) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.14)' } }}
              onMouseLeave={e => { if (!isOn) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.07)' } }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: isOn ? t.color : 'rgba(255,255,255,.65)', lineHeight: 1.3 }}>{t.label}</div>
            </button>
          )
        })}
      </div>
      {sel.length > 0 && (
        <div style={{ marginTop: 14, padding: '8px 14px', borderRadius: 8, background: 'rgba(45,212,191,.08)', border: '1px solid rgba(45,212,191,.15)', fontSize: 12, fontWeight: 600, color: '#2dd4bf', textAlign: 'center' }}>
          {sel.length} topic{sel.length > 1 ? 's' : ''} selected ✓
        </div>
      )}
    </StepWrap>
  )
}

// ─── Step 4: Level ────────────────────────────────────────────────────────────

function StepLevel({ data, onUpdate, dir }: { data: OnboardingData; onUpdate: (p: Partial<OnboardingData>) => void; dir: string }) {
  return (
    <StepWrap dir={dir}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>What's your current level?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>Be honest — we'll find courses that meet you where you are.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {LEVELS.map(l => {
          const sel = data.level === l.id
          return (
            <button key={l.id} onClick={() => onUpdate({ level: l.id })} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderRadius: 16,
              border: sel ? '1.5px solid rgba(99,102,241,.6)' : '1.5px solid rgba(255,255,255,.07)',
              background: sel ? 'rgba(99,102,241,.1)' : 'rgba(255,255,255,.03)',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all .18s',
              transform: sel ? 'scale(1.02)' : 'none',
              boxShadow: sel ? '0 0 0 3px rgba(99,102,241,.1)' : 'none',
            }}
              onMouseEnter={e => { if (!sel) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.14)' } }}
              onMouseLeave={e => { if (!sel) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.07)' } }}
            >
              <span style={{ fontSize: 32 }}>{l.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: sel ? '#818cf8' : '#fff', marginBottom: 3 }}>{l.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>{l.desc}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: sel ? '2px solid #818cf8' : '2px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {sel && <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#818cf8' }} />}
              </div>
            </button>
          )
        })}
      </div>
    </StepWrap>
  )
}

// ─── Step 5: Pace ─────────────────────────────────────────────────────────────

function StepPace({ data, onUpdate, dir }: { data: OnboardingData; onUpdate: (p: Partial<OnboardingData>) => void; dir: string }) {
  return (
    <StepWrap dir={dir}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>How much time can you commit?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>No pressure — any pace works. You can always change this later.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {PACES.map(p => {
          const sel = data.pace === p.id
          return (
            <button key={p.id} onClick={() => onUpdate({ pace: p.id })} style={{
              padding: '24px 16px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
              border: sel ? `1.5px solid ${p.color}70` : '1.5px solid rgba(255,255,255,.07)',
              background: sel ? `${p.color}12` : 'rgba(255,255,255,.03)',
              transition: 'all .18s', position: 'relative', overflow: 'hidden',
              transform: sel ? 'scale(1.04) translateY(-2px)' : 'none',
              boxShadow: sel ? `0 8px 24px ${p.color}20, 0 0 0 3px ${p.color}12` : 'none',
            }}
              onMouseEnter={e => { if (!sel) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.14)' } }}
              onMouseLeave={e => { if (!sel) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.03)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.07)' } }}
            >
              <div style={{ fontSize: 30, marginBottom: 10 }}>{p.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: sel ? p.color : '#fff', marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: sel ? p.color : 'rgba(255,255,255,.5)', marginBottom: 4 }}>{p.hours}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>{p.desc}</div>
            </button>
          )
        })}
      </div>
    </StepWrap>
  )
}

// ─── Recommendation card ──────────────────────────────────────────────────────

type Course = typeof COURSES[number]

function RecoCard({ course, index }: { course: Course; index: number }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.04)',
        border: hov ? '1px solid rgba(255,255,255,.14)' : '1px solid rgba(255,255,255,.07)',
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s',
        transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? '0 12px 32px rgba(0,0,0,.3)' : 'none',
        animation: 'popIn .5s ease both', animationDelay: `${index * 0.1 + 0.1}s`,
      }}
    >
      <div style={{ height: 70, background: course.grad, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -15, top: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
        {course.badge && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, background: 'rgba(255,255,255,.2)', color: '#fff', padding: '2px 8px', borderRadius: 12, backdropFilter: 'blur(8px)' }}>{course.badge}</div>}
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.35 }}>{course.title}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontWeight: 500, marginBottom: 8 }}>{course.instructor} · {course.hours}h</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24' }}>★ {course.rating}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#2dd4bf', background: 'rgba(45,212,191,.1)', padding: '2px 8px', borderRadius: 8 }}>{course.level}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Step 6: Recommendations ──────────────────────────────────────────────────

function StepReco({ data, dir }: { data: OnboardingData; dir: string }) {
  const lvlMap: Record<string, string> = { beginner: 'Beginner', mid: 'Intermediate', advanced: 'Advanced' }
  const selLvlLabel = lvlMap[data.level]
  const scored = COURSES.map(c => {
    let score = 0
    if (data.topics.some(t => c.topics.includes(t))) score += 3
    if (c.level === selLvlLabel) score += 2
    return { ...c, score }
  }).sort((a, b) => b.score - a.score).slice(0, 3)
  const recos = scored.length > 0 ? scored : COURSES.slice(0, 3)

  return (
    <StepWrap dir={dir}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 12, animation: 'popIn .5s ease both' }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>You're all set{data.name ? `, ${data.name}` : ''}!</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', fontWeight: 500, lineHeight: 1.6 }}>Based on your profile, here are your top course picks.<br />You can always explore more in the catalog.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {recos.map((c, i) => <RecoCard key={c.id} course={c} index={i} />)}
      </div>
      <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {data.goal && <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>Goal: <span style={{ color: '#2dd4bf' }}>{GOALS.find(g => g.id === data.goal)?.title}</span></div>}
        {data.level && <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>Level: <span style={{ color: '#818cf8' }}>{LEVELS.find(l => l.id === data.level)?.label}</span></div>}
        {data.pace && <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>Pace: <span style={{ color: '#14b8a6' }}>{PACES.find(p => p.id === data.pace)?.hours}</span></div>}
        {data.topics.length > 0 && <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}>Topics: <span style={{ color: 'rgba(255,255,255,.75)' }}>{data.topics.length} selected</span></div>}
      </div>
    </StepWrap>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const STEP_LABELS = ['', 'Welcome', 'Goals', 'Topics', 'Level', 'Pace', 'Done']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState('forward')
  const [data, setData] = useState<OnboardingData>({ name: '', goal: '', topics: [], level: '', pace: '' })
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => { injectKeyframes() }, [])

  const update = (patch: Partial<OnboardingData>) => setData(prev => ({ ...prev, ...patch }))

  const canNext = () => {
    if (step === 1) return data.name.trim().length > 0
    if (step === 2) return !!data.goal
    if (step === 3) return data.topics.length > 0
    if (step === 4) return !!data.level
    if (step === 5) return !!data.pace
    return true
  }

  const next = () => {
    if (!canNext()) return
    if (step === 5) setShowConfetti(true)
    setDir('forward')
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  const back = () => {
    if (step === 1) return
    setDir('back')
    setStep(s => Math.max(s - 1, 1))
  }

  const finish = () => navigate('/dashboard')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter' && step < TOTAL_STEPS) next() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step, data])

  const isLast = step === TOTAL_STEPS

  const stepContent = () => {
    switch (step) {
      case 1: return <StepWelcome data={data} onUpdate={update} dir={dir} />
      case 2: return <StepGoal    data={data} onUpdate={update} dir={dir} />
      case 3: return <StepTopics  data={data} onUpdate={update} dir={dir} />
      case 4: return <StepLevel   data={data} onUpdate={update} dir={dir} />
      case 5: return <StepPace    data={data} onUpdate={update} dir={dir} />
      case 6: return <StepReco    data={data} dir={dir} />
    }
  }

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      background: '#0A0F1E', width: '100%', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', WebkitFontSmoothing: 'antialiased',
    }}>
      <Mesh />
      {showConfetti && <Confetti />}

      {/* Skip */}
      {!isLast && (
        <button onClick={finish} style={{
          position: 'absolute', top: 24, right: 28,
          fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.3)',
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', transition: 'color .15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.3)')}
        >Skip for now →</button>
      )}

      {/* Card */}
      <div style={{
        width: step === 6 ? 680 : 520,
        background: 'rgba(12,21,38,0.85)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 24,
        padding: '36px 40px',
        boxShadow: '0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)',
        position: 'relative', zIndex: 10,
        transition: 'width .4s cubic-bezier(.34,1.2,.64,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#3B5278,#5b7eab)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff' }}>B</div>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,.8)' }}>BrilliaMind</span>
          </div>
          {!isLast && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.3)', background: 'rgba(255,255,255,.05)', padding: '3px 10px', borderRadius: 20 }}>
              {STEP_LABELS[step]}
            </span>
          )}
        </div>

        {/* Progress */}
        {!isLast && <ProgressBar step={step} total={TOTAL_STEPS - 1} />}

        {/* Step content */}
        <div key={step} style={{ minHeight: step === 6 ? 'auto' : 320 }}>
          {stepContent()}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 28,
          justifyContent: step === 1 ? 'flex-end' : 'space-between',
          alignItems: 'center',
        }}>
          {step > 1 && !isLast && <BtnBack onClick={back} />}
          {!isLast && (
            <BtnPrimary onClick={next} disabled={!canNext()}>
              {step === TOTAL_STEPS - 1 ? 'See My Courses →' : 'Continue →'}
            </BtnPrimary>
          )}
          {isLast && (
            <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
              <button onClick={finish} style={{
                padding: '14px 40px', borderRadius: 12, border: 'none',
                background: '#2dd4bf', color: '#0A0F1E',
                fontSize: 15, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all .2s',
                boxShadow: '0 4px 20px rgba(45,212,191,.3)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#5eead4'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(45,212,191,.4)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2dd4bf'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(45,212,191,.3)' }}
              >Start Learning →</button>
            </div>
          )}
        </div>

        {/* Step dots */}
        {!isLast && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            {Array.from({ length: TOTAL_STEPS - 1 }).map((_, i) => (
              <div key={i} style={{
                width: step - 1 === i ? 20 : 6, height: 6, borderRadius: 3,
                background: i < step ? '#2dd4bf' : 'rgba(255,255,255,.12)',
                transition: 'all .3s ease',
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
