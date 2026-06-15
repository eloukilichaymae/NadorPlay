import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

// Layouts
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';
import DashboardLayout from '../layouts/DashboardLayout';

// Public pages
import LandingPage from '../pages/landing/LandingPage';
import FieldsPage from '../pages/fields/FieldsPage';
import FieldDetailsPage from '../pages/fields/FieldDetailsPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// User pages
import UserDashboard from '../pages/account/UserDashboard';
import MyReservationsPage from '../pages/reservations/MyReservationsPage';
import ReservationDetailsPage from '../pages/reservations/ReservationDetailsPage';
import AccountSettingsPage from '../pages/account/AccountSettingsPage';
import NotificationsPage from '../pages/account/NotificationsPage';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageFields from '../pages/admin/ManageFields';
import AddField from '../pages/admin/AddField';
import EditField from '../pages/admin/EditField';
import ManageReservations from '../pages/admin/ManageReservations';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageReviews from '../pages/admin/ManageReviews';
import ManageSubscriptions from '../pages/admin/ManageSubscriptions';


// Public layout wrapper
const PublicLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1, padding: '2rem 1rem' }}>{children}</main>
    <Footer />
  </div>
);

// Protected layout wrapper with sidebar
const PortalLayout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <DashboardLayout>{children}</DashboardLayout>
      {!isAdmin && <Footer />}
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/fields" element={<PublicLayout><FieldsPage /></PublicLayout>} />
      <Route path="/fields/:id" element={<PublicLayout><FieldDetailsPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />

      {/* Player / Regular User Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['user']}>
          <PortalLayout><UserDashboard /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/reservations" element={
        <ProtectedRoute allowedRoles={['user', 'admin']}>
          <PortalLayout><MyReservationsPage /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/reservations/:id" element={
        <ProtectedRoute allowedRoles={['user', 'admin']}>
          <PortalLayout><ReservationDetailsPage /></PortalLayout>
        </ProtectedRoute>
      } />

      {/* Shared Profile / Settings & Notifications */}
      <Route path="/account" element={
        <ProtectedRoute allowedRoles={['user', 'admin']}>
          <PortalLayout><AccountSettingsPage /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/account/notifications" element={
        <ProtectedRoute allowedRoles={['user', 'admin']}>
          <PortalLayout><NotificationsPage /></PortalLayout>
        </ProtectedRoute>
      } />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><AdminDashboard /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/fields" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><ManageFields /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/fields/add" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><AddField /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/fields/edit/:id" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><EditField /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reservations" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><ManageReservations /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><ManageUsers /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reviews" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><ManageReviews /></PortalLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/subscriptions" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <PortalLayout><ManageSubscriptions /></PortalLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
