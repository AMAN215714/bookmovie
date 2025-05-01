// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UserDashboard from './components/UserDashboard';
import BookTickets from './components/BookTickets';
import SeeAllMovies from './components/SeeAllMovies';

// Auth Pages
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Login from './pages/auth/Login';
import Logout from './pages/auth/Logout';

// User Pages
import UserProfile from './pages/user/UserProfile';

// Admin Components
import AdminNavbar from './components/AdminNavbar';

// Admin Pages
import DashboardPage from './pages/admin/AdminDashboard';
import MoviesPage from './pages/admin/MoviesPage';
import SettingsPage from './pages/admin/SettingsPage';
import ReportsPage from './pages/admin/ReportsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageBookingsPage from './pages/admin/ManageBookingsPage';
import AdminLogin from './pages/auth/AdminLogin';

// Protected Routes
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {isAdminRoute ? <AdminNavbar /> : <Navbar />}

      <div className={isAdminRoute ? "" : "container mt-4"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserDashboard />} />
          <Route path="/see-all/:category" element={<SeeAllMovies />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected User Routes */}
          <Route path="/BookTickets" element={
            <PrivateRoute>
              <BookTickets />
            </PrivateRoute>
          } />
          <Route path="/BookTickets/:movieTitle" element={
            <PrivateRoute>
              <BookTickets />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <DashboardPage />
            </AdminRoute>
          } />
          <Route path="/admin/movies" element={
            <AdminRoute>
              <MoviesPage />
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <SettingsPage />
            </AdminRoute>
          } />
          <Route path="/admin/reports" element={
            <AdminRoute>
              <ReportsPage />
            </AdminRoute>
          } />
          <Route path="/admin/manage-users" element={
            <AdminRoute>
              <ManageUsersPage />
            </AdminRoute>
          } />
          <Route path="/admin/manage-bookings" element={
            <AdminRoute>
              <ManageBookingsPage />
            </AdminRoute>
          } />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;