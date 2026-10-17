import { useState, useEffect } from 'react'
import type { ThemeVariant } from '@/constants/design-tokens'
import {
  IconSettings, IconUser, IconCheck, IconBell, IconLock,
  IconGrid
} from '@/components/ui/icons'
import { useAuthStore, type UserProfile } from '@/stores/auth'
import { api, ApiError } from '@/lib/api'

interface SettingsPageProps {
  currentTheme: ThemeVariant
  onThemeChange: (theme: ThemeVariant) => void
}

export default function SettingsPage({ currentTheme, onThemeChange }: SettingsPageProps) {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'security'>('profile')

  // Profile form state
  const [name, setName] = useState(user?.name || 'Learner')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
  const [headline, setHeadline] = useState(() => localStorage.getItem('bm_pref_headline') || 'Product & Engineering Learner')
  const [bio, setBio] = useState(user?.bio || '')
  const [email, setEmail] = useState(user?.email || '')
  const [goal, setGoal] = useState(() => localStorage.getItem('bm_pref_goal') || 'Master modern cloud & product engineering')
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Preferences state
  const [language, setLanguage] = useState(() => localStorage.getItem('bm_pref_lang') || 'English (US)')
  const [emailDigest, setEmailDigest] = useState(() => localStorage.getItem('bm_pref_digest') !== 'false')
  const [qnaAlerts, setQnaAlerts] = useState(() => localStorage.getItem('bm_pref_qna') !== 'false')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setBio(user.bio || '')
      setAvatarUrl(user.avatarUrl || '')
    }
  }, [user])

  const showToast = (msg: string) => {
    setErrorMessage(null)
    setSavedMessage(msg)
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const handleSaveProfile = async () => {
    setErrorMessage(null)
    localStorage.setItem('bm_pref_headline', headline)
    localStorage.setItem('bm_pref_goal', goal)

    if (!user) {
      showToast('Profile preferences saved locally!')
      return
    }

    setIsSaving(true)
    try {
      const res = await api.put<{ user: UserProfile; message: string }>('/api/auth/profile', {
        name: name.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      })
      setUser(res.user)
      showToast('Profile updated and saved!')
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = () => {
    localStorage.setItem('bm_pref_lang', language)
    localStorage.setItem('bm_pref_digest', String(emailDigest))
    localStorage.setItem('bm_pref_qna', String(qnaAlerts))
    showToast('Preferences updated and saved!')
  }

  const handleChangePassword = async () => {
    setErrorMessage(null)
    if (!currentPassword || newPassword.length < 6) {
      setErrorMessage('Please enter your current password and a new password (min 6 characters).')
      return
    }
    setIsSaving(true)
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      showToast('Password updated successfully!')
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : 'Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  const initials = (name || 'L')
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L'

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
                onClick={() => { setActiveTab(tab.id); setErrorMessage(null) }}
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
        {savedMessage && (
          <div style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981',
            color: '#059669', fontSize: 14, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20
          }}>
            <IconCheck s={18} /> {savedMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            padding: '12px 20px', borderRadius: 12,
            background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444',
            color: '#ef4444', fontSize: 14, fontWeight: 700,
            marginBottom: 20
          }}>
            {errorMessage}
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
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  style={{ width: 72, height: 72, borderRadius: 20, objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
                  color: '#fff', fontSize: 24, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {initials}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {name}
                </h3>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Account ID: #{user?.id ? user.id.slice(0, 8).toUpperCase() : 'BM-LOCAL'}
                </div>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="Avatar Image URL (https://...)"
                  style={{
                    width: '100%', maxWidth: 360, padding: '6px 12px', borderRadius: 8,
                    background: 'var(--page-bg)', border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)', fontSize: 12, outline: 'none', fontFamily: 'inherit'
                  }}
                />
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
                  disabled
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                    color: 'var(--text-muted)', fontSize: 14, outline: 'none', fontFamily: 'inherit', opacity: 0.75
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
              onClick={handleSaveProfile}
              disabled={isSaving}
              style={{
                padding: '11px 28px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: isSaving ? 'wait' : 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
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
                      showToast('Theme updated!')
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
                  localStorage.setItem('bm_pref_lang', e.target.value)
                  showToast('Language updated!')
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
              onClick={handleSavePreferences}
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
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
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
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid var(--card-border)', background: 'var(--page-bg)',
                    color: 'var(--text-primary)', fontSize: 14, outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isSaving}
              style={{
                padding: '11px 28px', borderRadius: 10,
                background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 700,
                cursor: isSaving ? 'wait' : 'pointer', fontFamily: 'inherit',
                opacity: isSaving ? 0.7 : 1
              }}
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
