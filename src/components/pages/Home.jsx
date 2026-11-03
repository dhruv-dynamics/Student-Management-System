import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllStudents, checkServerHealth } from '../../services/studentApi'
import '../styles/Home.css'

export const Home = () => {
  const [studentCount, setStudentCount] = useState(0)
  const [serverOnline, setServerOnline] = useState(false)

  useEffect(() => {
    checkServerHealth().then((health) => {
      setServerOnline(health.online)
    })

    getAllStudents().then((students) => {
      if (Array.isArray(students)) {
        setStudentCount(students.length)
      }
    })
  }, [])

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-status-pill">
            <span className={`status-dot ${serverOnline ? 'online' : 'offline'}`}></span>
            <span>{serverOnline ? 'Live JSON Server Active' : 'Local Storage Mode Active'}</span>
            <span className="dot-divider">•</span>
            <span>{studentCount} Students Enrolled</span>
          </div>

          <h1>Student Management System</h1>

          <p>
            Effortlessly manage students, create records, view detailed profiles,
            and keep all academic information seamlessly organized.
          </p>

          <div className="hero-buttons">
            <Link to="/create-user" className="primary-btn">
              + Add Student
            </Link>

            <Link to="/all-users" className="secondary-btn">
              👥 View All Students ({studentCount})
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Manage Your Students Easily</h2>

        <div className="features-grid">
          <div className="feature-card">
            <h3>📋 Student Records</h3>
            <p>
              Create and manage comprehensive student profiles with roll numbers,
              contact information, age, gender, and course programs.
            </p>
          </div>

          <div className="feature-card">
            <h3>🔍 Search & Filter</h3>
            <p>
              Quickly find any student using real-time search across names, emails,
              phone numbers, and filter by courses and demographics.
            </p>
          </div>

          <div className="feature-card">
            <h3>⚡ Dual-Mode Storage</h3>
            <p>
              Work seamlessly with offline Local Storage or run the built-in
              JSON Server for live REST API sync with persistent JSON database.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-section">
        <h2>Quick Actions</h2>

        <div className="quick-actions">
          <Link to="/create-user" className="quick-card">
            <div>
              <h3>Add New Student</h3>
              <p>Register a student with autofill demo support</p>
            </div>
          </Link>

          <Link to="/all-users" className="quick-card">
            <div>
              <h3>All Students</h3>
              <p>Explore table/grid views, edit, delete & export CSV</p>
            </div>
          </Link>

          <Link to="/about" className="quick-card">
            <div>
              <h3>About System</h3>
              <p>Learn more about the architecture & features</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
