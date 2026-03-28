import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider }        from '@tanstack/react-query'
import { Toaster }                                 from 'react-hot-toast'
import { TooltipProvider }                         from '@/components/ui/tooltip'

import AuthLayout     from '@/components/layout/AuthLayout'
import AppLayout      from '@/components/layout/AppLayout'
import AdminLayout    from '@/components/layout/AdminLayout'

import LoginPage      from '@/pages/auth/LoginPage'
import RegisterPage   from '@/pages/auth/RegisterPage'
import HomePage       from '@/pages/home/HomePage'
import ExamPage       from '@/pages/exam/ExamPage'
import ResultsPage    from '@/pages/results/ResultsPage'
import ReviewPage     from '@/pages/results/ReviewPage'
import DashboardPage  from '@/pages/dashboard/DashboardPage'
import AdminDashboardPage  from '@/pages/admin/AdminDashboardPage'
import ImportQuestionsPage from '@/pages/admin/ImportQuestionsPage'
import AdminUsersPage      from '@/pages/admin/AdminUsersPage'
import AdminQuestionsPage  from '@/pages/admin/AdminQuestionsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      refetchOnWindowFocus: false,
    }
  }
})

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Auth routes ─────────────────────────── */}
            <Route element={<AuthLayout />}>
              <Route path="/login"    element={<LoginPage />}    />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* ── Student routes ──────────────────────── */}
            <Route element={<AppLayout />}>
              <Route path="/"                     element={<HomePage />}      />
              <Route path="/results/:sessionId"   element={<ResultsPage />}   />
              <Route path="/review/:sessionId"    element={<ReviewPage />}    />
              <Route path="/dashboard"            element={<DashboardPage />} />
            </Route>
            <Route path="/exam/:sessionId"        element={<ExamPage />}      />

            {/* ── Admin routes ────────────────────────── */}
            <Route element={<AdminLayout />}>
              <Route path="/admin"            element={<AdminDashboardPage />}   />
              <Route path="/admin/import"     element={<ImportQuestionsPage />}  />
              <Route path="/admin/users"      element={<AdminUsersPage />}       />
              <Route path="/admin/questions"  element={<AdminQuestionsPage />} />
            </Route>

            {/* ── Fallback ────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#18181b',
              color:      '#fff',
              fontSize:   '14px',
              borderRadius: '12px',
              padding:    '12px 16px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App