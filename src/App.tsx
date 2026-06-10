import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

// Placeholder pages — replaced once mockup arrives
const Home = () => <div className="p-8 text-2xl font-bold">BrilliaMind LMS</div>
const Login = () => <div className="p-8">Login</div>
const Dashboard = () => <div className="p-8">Dashboard</div>
const Courses = () => <div className="p-8">Courses</div>
const NotFound = () => <div className="p-8">404 Not Found</div>

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/courses" element={<Courses />} />
        <Route path="/verify/:certUuid" element={<div className="p-8">Certificate Verify</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
