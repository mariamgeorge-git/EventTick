import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './components/auth/AuthContext';
import { NotificationProvider } from './components/auth/NotificationContext';
import theme from './theme';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import LoginPage from './pages/Loginpage';
import RegisterPage from './pages/Registerpage';
import Events from './components/public/Events';
import ForgetPasswordPage from './pages/ForgetPasswordPage';
import Resetpasswordpage from './pages/Resetpasswordpage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProfilePage from './pages/ProfilePage';
import EventDetailsPage from './pages/EventDetailsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import MyEventsPage from './pages/MyEventsPage';
import OrganizerEventAnalytics from './components/organizer/OrganizerEventAnalytics';
import AdminEventsPage from './pages/AdminEventsPage';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import UserBookingsPage from './pages/UserBookingsPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// If you have MFA/ProtectedRoute components, import them here
// import MfaVerification from './components/MfaVerification';
// import MfaSetup from './components/MfaSetup';
// import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div id="root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/" element={<Events />} />
                  <Route path="/forget-password" element={<ForgetPasswordPage />} />
                  <Route path="/reset-password" element={<Resetpasswordpage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route
                    path="/dashboard"
                    element={<RoleBasedRoute element={<ProfilePage />} requiredRoles={['standard_user', 'user', 'event_organizer', 'admin']} />}
                  />
                  <Route
                    path="/profile"
                    element={<RoleBasedRoute element={<ProfilePage />} requiredRoles={['standard_user', 'user', 'event_organizer', 'admin']} />}
                  />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route
                    path="/create-event"
                    element={<RoleBasedRoute element={<CreateEventPage />} requiredRoles={['event_organizer']} />}
                  />
                  <Route
                    path="/edit-event/:id"
                    element={<RoleBasedRoute element={<EditEventPage />} requiredRoles={['event_organizer']} />}
                  />
                  <Route
                    path="/my-events"
                    element={<RoleBasedRoute element={<MyEventsPage />} requiredRoles={['event_organizer']} />}
                  />
                  <Route
                    path="/my-events/analytics"
                    element={<RoleBasedRoute element={<OrganizerEventAnalytics />} requiredRoles={['event_organizer']} />}
                  />
                  <Route
                    path="/admin/users"
                    element={<RoleBasedRoute element={<AdminUsersPage />} requiredRoles={['admin']} />}
                  />
                  <Route
                    path="/admin/events"
                    element={<RoleBasedRoute element={<AdminEventsPage />} requiredRoles={['admin']} />}
                  />
                  <Route
                    path="/bookings"
                    element={<RoleBasedRoute element={<UserBookingsPage />} requiredRoles={['standard_user']} />}
                  />
                  {/* Uncomment and adjust these if you have MFA/ProtectedRoute components */}
                  {/*
                  <Route 
                    path="/mfa-verification" 
                    element={
                      <ProtectedRoute requireMfa={false}>
                        <MfaVerification />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/mfa-setup" 
                    element={
                      <ProtectedRoute>
                        <MfaSetup />
                      </ProtectedRoute>
                    } 
                  />
                  */}
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          <ToastContainer />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;