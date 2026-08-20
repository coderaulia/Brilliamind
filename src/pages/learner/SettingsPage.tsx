import { useState } from 'react'
import type { ThemeVariant } from '@/constants/design-tokens'
import {
  IconSettings, IconUser, IconCheck, IconBell, IconLock,
  IconGrid
} from '@/components/ui/icons'

interface SettingsPageProps {
  currentTheme: ThemeVariant
  onThemeChange: (theme: ThemeVariant) => void
}

export default function SettingsPage({ currentTheme, onThemeChange }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security'>('profile')
  
  // Profile form state
  const [name, setName] = useState('Aulia Rahman')
  const [headline, setHeadline] = useState('Aspiring Product Designer & Frontend Enthusiast')
  const [bio, setBio] = useState('Passionate about crafting intuitive human-computer interfaces and building modern web apps.')
  const [email, setEmail] = useState('aulia@example.com')
  const [goal, setGoal] = useState('Career Transition to Senior Product Designer')
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Preferences state
  const [language, setLanguage] = useState('English (US)')
  const [emailDigest, setEmailDigest] = useState(true)
  const [qnaAlerts, setQnaAlerts] = useState(true)

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 28, background: 'var(--page-bg)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(20,184,166,0.12)', color: 'var(--accent-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <IconSettings s={22} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
              Learner Account & Settings
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Manage your personal profile, visual themes, learning preferences, and notifications.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', gap: 8, borderBottom: '1px solid var(--card-border)',
          paddingBottom: 12, marginBottom: 28
        }}>
          {[
            { id: 'profile' as const, label: 'Personal Profile', icon: IconUser },
            { id: 'appearance' as const, label: 'Appearance & Themes', icon: IconGrid },
            { id: 'notifications' as const, label: 'Email Notifications', icon: IconBell },
            { id: 'security' as const, label: 'Security & Auth', icon: IconLock }
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', borderRadius: 10,
                  border: isActive ? 'none' : '1px solid transparent',
                  background: isActive ? 'var(--card-bg)' : 'transparent',
                  color: isActive ? 'var(--accent-1)' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  fontSize: 14, fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s'
                }}
              >
                <Icon s={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Save Toast Notification */}
        {savedSuccess && (
          <div style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981',
            color: '#059669', fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20
          }}>
            <IconCheck s={18} /> Settings successfully updated and saved!
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{
            background: 'var(--card-bg)', borderRadius: 18,
            border: '1px solid var(--card-border)', padding: '28px 32px'
          }}>
            {/* Avatar Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--card-border)' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
                color: '#fff', fontSize: 24, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                AR
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {name}
                </h3>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Learner ID: #BM-8942-AUL
                </div>
                <button
                  style={{
                    padding: '6px 14px', borderRadius: 8,
                    background: 'var(--page-bg)', border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Upload New Avatar
                </button>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Professional Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Primary Learning Goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={e => setGoal(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Short Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={handleSave}
              style={{
                padding: '11px 28px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(20,184,166,0.3)'
              }}
            >
              Save Profile Changes
            </button>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div style={{
            background: 'var(--card-bg)', borderRadius: 18,
            border: '1px solid var(--card-border)', padding: '28px 32px'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>
              Theme & Visual Style
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              {[
                { name: 'Deep Navy' as ThemeVariant, desc: 'Ultra-modern dark navy palette with emerald & teal accents' },
                { name: 'Bright Canvas' as ThemeVariant, desc: 'Crisp, high-contrast light workspace for daylight focus' }
              ].map(th => {
                const isSelected = currentTheme === th.name
                return (
                  <button
                    key={th.name}
                    onClick={() => {
                      onThemeChange(th.name)
                      handleSave()
                    }}
                    style={{
                      padding: '20px 22px', borderRadius: 14,
                      border: isSelected ? '2px solid var(--accent-1)' : '1px solid var(--card-border)',
                      background: isSelected ? 'rgba(20,184,166,0.08)' : 'var(--page-bg)',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {th.name}
                      </span>
                      {isSelected && (
                        <span style={{ color: 'var(--accent-1)' }}><IconCheck s={18} /></span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                      {th.desc}
                    </p>
                  </button>
                )
              })}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>
              Platform Language
            </h3>
            <div style={{ maxWidth: 360, marginBottom: 28 }}>
              <select
                value={language}
                onChange={e => {
                  setLanguage(e.target.value)
                  handleSave()
                }}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 10,
                  border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                  color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: 'inherit'
                }}
              >
                <option>English (US)</option>
                <option>Bahasa Indonesia</option>
              </select>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div style={{
            background: 'var(--card-bg)', borderRadius: 18,
            border: '1px solid var(--card-border)', padding: '28px 32px'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
              Email Notifications & Alerts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 12, background: 'var(--page-bg)',
                border: '1px solid var(--card-border)', cursor: 'pointer'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Weekly Learning Digest & Streak Reports
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Receive a summary of hours spent, quizzes completed, and upcoming workshops.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={e => setEmailDigest(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-1)' }}
                />
              </label>

              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: 12, background: 'var(--page-bg)',
                border: '1px solid var(--card-border)', cursor: 'pointer'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Q&A Discussion Replies
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Get notified immediately when instructors or peers answer your questions.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={qnaAlerts}
                  onChange={e => setQnaAlerts(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--accent-1)' }}
                />
              </label>
            </div>

            <button
              onClick={handleSave}
              style={{
                padding: '11px 28px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Update Notification Preferences
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{
            background: 'var(--card-bg)', borderRadius: 18,
            border: '1px solid var(--card-border)', padding: '28px 32px'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>
              Password & Account Security
            </h3>

            <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              style={{
                padding: '11px 28px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Update Password
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
