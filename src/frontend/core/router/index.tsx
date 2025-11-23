import { Navigate, createHashRouter } from 'react-router-dom'
import MainLayout from '@/frontend/shared/layouts/MainLayout'
import LoginPage from '@/features/user/frontend/pages/login'
import DashboardPage from '@/features/dashboard/frontend/pages/dashboard'
import LiveLogsPage from '@/features/monitor/frontend/pages/LiveLogs'
import ProtectedRoute from './ProtectedRoute'

const router = createHashRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    errorElement: <Navigate to="/login" />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/monitor/logs', element: <LiveLogsPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])

export default router
