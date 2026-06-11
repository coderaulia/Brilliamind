import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import AppShell, { useTheme, type PageId } from '@/components/layout/AppShell'
import DashboardPage from '@/pages/learner/DashboardPage'
import MyCoursesPage from '@/pages/learner/MyCoursesPage'
import CatalogPage from '@/pages/learner/CatalogPage'
import PlaceholderPage from '@/pages/learner/PlaceholderPage'
import OnboardingPage from '@/pages/OnboardingPage'

const Login = () => <div className="p-8">Login</div>
const NotFound = () => <div className="p-8">404 Not Found</div>

function LearnerApp() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const { variant } = useTheme('Deep Navy')

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardPage variant={variant} />
      case 'courses':      return <MyCoursesPage />
      case 'catalog':      return <CatalogPage />
      case 'calendar':     return <PlaceholderPage page="calendar" />
      case 'certificates': return <PlaceholderPage page="certificates" />
      case 'settings':     return <PlaceholderPage page="settings" />
      default:             return <PlaceholderPage page="dashboard" />
    }
  }

  return (
    <AppShell activePage={activePage} onNav={setActivePage} variant={variant}>
      {renderPage()}
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<LearnerApp />} />
        <Route path="/verify/:certUuid" element={<div className="p-8">Certificate Verify</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
