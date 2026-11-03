import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import './styles/Nav.css'
import { checkServerHealth } from '../services/studentApi'

export const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [serverOnline, setServerOnline] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check logged in user
    try {
      const user = sessionStorage.getItem('loggedInUser')
      if (user) {
        setCurrentUser(JSON.parse(user))
      } else {
        setCurrentUser(null)
      }
    } catch {
      setCurrentUser(null)
    }

    // Check server status
    checkServerHealth().then((health) => {
      setServerOnline(health.online)
    })
  }, [location.pathname])

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser')
    setCurrentUser(null)
    navigate('/login')
  }

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {/* Brand / Logo */}
        <div className="nav-logo">
          <Link to="/" className="nav-logo-link">
            <img src={logo} alt="Logo" />
            <span className="brand-text">Student Management System</span>
          </Link>

          {/* Quick status indicator */}
          <div
            className={`server-pill ${serverOnline ? 'pill-online' : 'pill-offline'}`}
            title={
              serverOnline
                ? 'JSON Server is running at http://localhost:3000'
                : 'JSON Server is offline. Running in Local Storage Mode (npm run server to start)'
            }
          >
            <span className="server-dot"></span>
            <span className="server-status-text">
              {serverOnline ? 'Server Online' : 'Local Mode'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <ul>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/all-users"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                All Students
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/create-user"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                Add Student
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) => (isActive ? 'active-link' : '')}
              >
                About
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Authentication Actions */}
        <div className="auth">
          {currentUser ? (
            <div className="user-profile-menu">
              <span className="user-greeting" title={currentUser.email}>
                👤 {currentUser.name || 'User'}
              </span>
              <button
                type="button"
                className="logout-nav-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Login
              </Link>
              <Link to="/register" className="register-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
