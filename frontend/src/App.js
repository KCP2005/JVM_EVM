import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/HomePage';
import RetrieveCardPage from './pages/RetrieveCardPage';

// Auth Pages
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EventManagement from './pages/admin/EventManagement';
import UserManagement from './pages/admin/UserManagement';
import Statistics from './pages/admin/Statistics';

// Authenticator Pages
import AuthenticatorDashboard from './pages/authenticator/AuthenticatorDashboard';
import ScanQR from './pages/authenticator/ScanQRPage';
import OnSpotRegistration from './pages/authenticator/OnSpotRegistrationPage';

// Layout Components
import AdminLayout from './components/layouts/AdminLayout';
import AuthenticatorLayout from './components/layouts/AuthenticatorLayout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/retrieve" element={<RetrieveCardPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="events" element={<EventManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="statistics" element={<Statistics />} />
      </Route>
      
      {/* Authenticator Routes */}
      <Route path="/authenticator" element={
        <ProtectedRoute allowedRoles={['admin', 'authenticator']}>
          <AuthenticatorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AuthenticatorDashboard />} />
        <Route path="scan" element={<ScanQR />} />
        <Route path="register" element={<OnSpotRegistration />} />
      </Route>
      
      {/* Catch all - 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;