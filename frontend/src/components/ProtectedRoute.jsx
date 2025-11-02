import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show a simple loader while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
