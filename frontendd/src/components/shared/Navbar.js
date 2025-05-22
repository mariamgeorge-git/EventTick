import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../auth/AuthContext.js';

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Simple logout handler (adjust as needed)
  const handleLogout = () => {
    // Clear user state, tokens, etc.
    setUser(null);
    // Redirect to home or login page
    navigate('/login');
  };

  return (
    <nav className="navbar bg-gray-800 text-white p-4 flex justify-between">
      {/* <div className="logo font-bold text-xl">
        <NavLink to="/" className="hover:text-gray-300">
          Event Ticketing
        </NavLink>
      </div> */}

      <ul className="flex space-x-4 items-center">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'underline' : '')}
          >
            Home
          </NavLink>
        </li>

        {!user && (
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'underline' : '')}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'underline' : '')}>
                Register
              </NavLink>
            </li>
          </>
        )}

        {user && (
          <>
            <li>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'underline' : '')}>
                Profile
              </NavLink>
            </li>

            {user.role === 'User' && (
              <>
                <li>
                  <NavLink to="/events" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    Events
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    My Bookings
                  </NavLink>
                </li>
              </>
            )}

            {user.role === 'Organizer' && (
              <>
                <li>
                  <NavLink to="/manage-events" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    Manage Events
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/create-event" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    Create Event
                  </NavLink>
                </li>
              </>
            )}

            {user.role === 'Admin' && (
              <>
                <li>
                  <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    Admin Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    Manage Users
                  </NavLink>
                </li>
              </>
            )}

            <li>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;