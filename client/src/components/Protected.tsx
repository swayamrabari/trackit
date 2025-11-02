import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const Protected = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // No need to call checkAuthStatus here since it's already called in App.tsx
  // and we wait for it to complete before rendering routes

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};


