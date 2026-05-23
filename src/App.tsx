import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthInit } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { FirebaseSetupBanner } from '@/components/FirebaseSetupBanner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TeacherDashboard } from '@/pages/teacher/TeacherDashboard'
import { CreateAssignmentPage } from '@/pages/teacher/CreateAssignmentPage'
import { AssignmentDetailPage } from '@/pages/teacher/AssignmentDetailPage'
import { QuestionReviewPage } from '@/pages/teacher/QuestionReviewPage'
import { LiveVerificationPage } from '@/pages/teacher/LiveVerificationPage'
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { SubmitAssignmentPage } from '@/pages/student/SubmitAssignmentPage'
import { useAuthStore } from '@/store/authStore'

function HomeRedirect() {
  const { user, loading } = useAuthStore()
  if (loading) return null
  if (!user) return <LandingPage />
  return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
}

export default function App() {
  useAuthInit()

  return (
    <BrowserRouter>
      <FirebaseSetupBanner />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherDashboard />} />
          <Route path="assignments/new" element={<CreateAssignmentPage />} />
          <Route path="assignments/:id" element={<AssignmentDetailPage />} />
        </Route>

        <Route
          path="/teacher/submissions/:submissionId/questions"
          element={
            <ProtectedRoute role="teacher">
              <QuestionReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/submissions/:submissionId/verify"
          element={
            <ProtectedRoute role="teacher">
              <LiveVerificationPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="assignments" element={<StudentDashboard />} />
          <Route path="assignments/:id/submit" element={<SubmitAssignmentPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
