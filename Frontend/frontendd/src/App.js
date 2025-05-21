import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/shared/Navbar';
import LoginPage from './pages/Loginpage';
import RegisterPage from './pages/Registerpage';
import Events from './components/public/Events';
import ForgetPasswordPage from './pages/ForgetPasswordPage';
import Resetpasswordpage from './pages/Resetpasswordpage'; // Added import
import Footer from './components/shared/Footer'; // Import the Footer component
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Navbar />

        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<Events />} />
            <Route path="/forget-password" element={<ForgetPasswordPage />} />
            <Route path="/reset-password" element={<Resetpasswordpage />} /> {/* New route */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </div>
        <Footer /> {/* Add the Footer component here */}
      </div>
    </Router>
  );
}

export default App;