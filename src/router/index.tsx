import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import Login from '@/pages/Login';
import Properties from '@/pages/Properties';
import PropertyDetail from '@/pages/PropertyDetail';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Guest Route Component (redirect to home if already logged in)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Properties />
      </ProtectedRoute>
    ),
  },
  {
    path: '/properties/:id',
    element: (
      <ProtectedRoute>
        <PropertyDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
