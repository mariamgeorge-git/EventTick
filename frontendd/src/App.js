import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';

import Navbar from './components/shared/Navbar';
import LoginPage from './pages/Loginpage';
import RegisterPage from './pages/Registerpage';
import Events from './components/public/Events';
import ForgetPasswordPage from './pages/ForgetPasswordPage';
import Resetpasswordpage from './pages/Resetpasswordpage';
import Footer from './components/shared/Footer';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Navbar />

          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<Events />} />
              <Route path="/forget-password" element={<ForgetPasswordPage />} />
              <Route path="/reset-password" element={<Resetpasswordpage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/dashboard" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;