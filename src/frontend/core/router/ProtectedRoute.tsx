import { Navigate } from 'react-router-dom'
import { useUserStore } from '@/frontend/shared/stores/user'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useUserStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}
