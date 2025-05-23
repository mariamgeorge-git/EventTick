import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import './Navbar.css';
import { AuthContext } from '../auth/AuthContext.js';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Log user object and role
  console.log('Navbar user:', user);
  console.log('Navbar user role:', user?.role);

  // Simple logout handler
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Update URL search parameter
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({}); // Remove search parameter if query is empty
    }

    // Optional: navigate to events page if not already there
    // Remove this automatic navigation to avoid unintended redirects
    // if (window.location.pathname !== '/' && window.location.pathname !== '/events') {
    //    navigate('/');
    // }
  };

  return (
    <nav className="navbar bg-gray-800 text-white p-4 flex justify-between items-center">
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
            Events
          </NavLink>
        </li>

        <li>
          <input
            type="text"
            placeholder="Search Events..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              padding: '0.3rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '0.9rem',
              color: '#333'
            }}
          />
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

            {user.role === 'event_organizer' && (
              <>
                <li>
                  <NavLink to="/my-events" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    My Events
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
                <li>
                  <NavLink to="/admin/events" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    Manage Events
                  </NavLink>
                </li>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <li>
                  <NavLink to="/admin/events" className={({ isActive }) => (isActive ? 'underline' : '')}>
                    Manage Events
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