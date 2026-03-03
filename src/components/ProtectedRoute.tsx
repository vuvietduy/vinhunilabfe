import type {ReactNode} from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'teacher')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // User is authenticated but does not have the allowed role, redirect to an unauthorized page or home
    return <Navigate to="/" replace />; // Or a specific unauthorized page
  }

  return <>{children}</>;
};

export default ProtectedRoute;
