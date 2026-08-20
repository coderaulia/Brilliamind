import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

import LandingPage from '@/pages/LandingPage'
import OnboardingPage from '@/pages/OnboardingPage'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import InstructorRegisterPage from '@/pages/auth/InstructorRegisterPage'
import AcceptInvitePage from '@/pages/auth/AcceptInvitePage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'

// Instructor Pages
import CourseManagerPage from '@/pages/instructor/CourseManagerPage'
import CourseEditorPage from '@/pages/instructor/CourseEditorPage'
import CourseAnalyticsPage from '@/pages/instructor/CourseAnalyticsPage'

// Learner Pages
import AppShell, { useTheme, type PageId } from '@/components/layout/AppShell'
import DashboardPage from '@/pages/learner/DashboardPage'
import MyCoursesPage from '@/pages/learner/MyCoursesPage'
import CatalogPage from '@/pages/learner/CatalogPage'
import CalendarPage from '@/pages/learner/CalendarPage'
import CertificatesPage from '@/pages/learner/CertificatesPage'
import SettingsPage from '@/pages/learner/SettingsPage'
import CoursePlayerPage from '@/pages/learner/CoursePlayerPage'
import VerifyCertificatePage from '@/pages/public/VerifyCertificatePage'
import PrivacyPolicyPage from '@/pages/public/PrivacyPolicyPage'
import TermsOfServicePage from '@/pages/public/TermsOfServicePage'
import FAQPage from '@/pages/public/FAQPage'
import DataSafetyPage from '@/pages/public/DataSafetyPage'
import CourseDetailModal from '@/components/course/CourseDetailModal'
import { CATALOG_COURSES } from '@/data/mock-data'

function StandaloneCoursePlayer() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const id = Number(courseId) || 1

  return <CoursePlayerPage courseId={id} onBack={() => navigate('/dashboard')} />
}

function LearnerApp() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const { variant, setVariant } = useTheme('Deep Navy')
  const [activePlayerCourseId, setActivePlayerCourseId] = useState<number | null>(null)
  const [inspectCourseId, setInspectCourseId] = useState<number | null>(null)

  const handleOpenCourse = (courseId: number) => {
    const course = CATALOG_COURSES.find(c => c.id === courseId)
    if (course?.enrolled) {
      setActivePlayerCourseId(courseId)
    } else {
      setInspectCourseId(courseId)
    }
  }

  if (activePlayerCourseId !== null) {
    return (
      <CoursePlayerPage
        courseId={activePlayerCourseId}
        onBack={() => setActivePlayerCourseId(null)}
      />
    )
  }

  const inspectingCourse = inspectCourseId ? CATALOG_COURSES.find(c => c.id === inspectCourseId) : null

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            variant={variant}
            onOpenCourse={handleOpenCourse}
            onNavToCourses={() => setActivePage('courses')}
          />
        )
      case 'courses':
        return <MyCoursesPage onOpenCourse={handleOpenCourse} />
      case 'catalog':
        return <CatalogPage onOpenCourse={(id) => setInspectCourseId(id)} />
      case 'calendar':
        return <CalendarPage />
      case 'certificates':
        return <CertificatesPage />
      case 'settings':
        return <SettingsPage currentTheme={variant} onThemeChange={setVariant} />
      default:
        return (
          <DashboardPage
            variant={variant}
            onOpenCourse={handleOpenCourse}
            onNavToCourses={() => setActivePage('courses')}
          />
        )
    }
  }

  return (
    <>
      <AppShell activePage={activePage} onNav={setActivePage} variant={variant}>
        {renderPage()}
      </AppShell>

      {inspectingCourse && (
        <CourseDetailModal
          course={inspectingCourse}
          onClose={() => setInspectCourseId(null)}
          onStartLearning={(id) => {
            setInspectCourseId(null)
            setActivePlayerCourseId(id)
          }}
        />
      )}
    </>
  )
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()
  if (!isInitialized) return <div className="min-h-screen bg-[#0F172A]" />
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function ProtectedInstructorRoute({ children }: { children: React.ReactNode }) {
  const { user, isInitialized } = useAuthStore()
  if (!isInitialized) return <div className="min-h-screen bg-[#0F172A]" />
  if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Onboarding */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/tos" element={<TermsOfServicePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/help" element={<FAQPage />} />
        <Route path="/data-safety" element={<DataSafetyPage />} />
        <Route path="/security" element={<DataSafetyPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/instructor" element={<InstructorRegisterPage />} />
        <Route path="/invite/accept" element={<AcceptInvitePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Learner Platform */}
        <Route path="/dashboard" element={<LearnerApp />} />
        <Route path="/learn/:courseId" element={<StandaloneCoursePlayer />} />
        <Route path="/verify/:certUuid" element={<VerifyCertificatePage />} />

        {/* Instructor Studio Routes */}
        <Route path="/instructor" element={<Navigate to="/instructor/courses" replace />} />
        <Route
          path="/instructor/courses"
          element={
            <ProtectedInstructorRoute>
              <CourseManagerPage />
            </ProtectedInstructorRoute>
          }
        />
        <Route
          path="/instructor/courses/:id/edit"
          element={
            <ProtectedInstructorRoute>
              <CourseEditorPage />
            </ProtectedInstructorRoute>
          }
        />
        <Route
          path="/instructor/courses/:id/learners"
          element={
            <ProtectedInstructorRoute>
              <CourseAnalyticsPage />
            </ProtectedInstructorRoute>
          }
        />

        {/* Superadmin Control Center Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/instructors"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />

        {/* 404 Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
