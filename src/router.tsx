import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store';
import Login from './pages/Login';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await checkAuth();
      }
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuth]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Router Configuration
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
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
