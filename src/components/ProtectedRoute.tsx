import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  // Check for the simulated JWT token in local storage
  return !!localStorage.getItem('authToken');
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;