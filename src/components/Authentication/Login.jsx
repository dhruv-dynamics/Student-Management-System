import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../../services/authApi'
import '../styles/auth.css'

export const Login = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    if (error) setError(null)
  }

  const handleDemoFill = () => {
    setFormData({
      email: 'admin@sms.com',
      password: 'password123'
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await loginUser({
        email: formData.email,
        password: formData.password
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 700)
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to your Student Management System</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success-alert">
            <span>✓ Login successful! Redirecting...</span>
          </div>
        )}

        {/* Quick Demo Fill Helper */}
        <div className="auth-demo-hint">
          <span>Demo Account:</span>
          <button type="button" onClick={handleDemoFill} className="demo-fill-btn">
            admin@sms.com (password123)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
