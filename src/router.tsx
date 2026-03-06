import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store';
import Login from './pages/Login';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Admin from './pages/Admin';
import SystemAdmin from './pages/SystemAdmin';
import ClientLayout from './components/layout/ClientLayout';
import ClientTop from './pages/ClientTop';
import ClientProperties from './pages/ClientProperties';
import ClientAccounts from './pages/ClientAccounts';

// Redirects to correct home page based on user role
function RoleHome() {
  const { user } = useAuthStore();
  const role = user?.role;
  if (role === 'system_admin' || role === 'admin') return <Navigate to="/system-admin" replace />;
  if (role === 'client_admin') return <Navigate to="/client/top" replace />;
  return <Properties />;
}

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
        <RoleHome />
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
    path: '/admin',
    element: (
      <ProtectedRoute>
        <Admin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/system-admin',
    element: (
      <ProtectedRoute>
        <SystemAdmin />
      </ProtectedRoute>
    ),
  },
  {
    path: '/client',
    element: (
      <ProtectedRoute>
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/client/top" replace />,
      },
      {
        path: 'top',
        element: <ClientTop />,
      },
      {
        path: 'properties',
        element: <ClientProperties />,
      },
      {
        path: 'accounts',
        element: <ClientAccounts />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
