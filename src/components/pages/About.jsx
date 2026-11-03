import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/About.css'

export const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Student Management System</h1>
          <p>
            A high-performance and resilient platform for managing student
            records, generating academic IDs, analyzing cohorts, and organizing
            academic workflows with dual offline/online synchronization.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content">
        <div className="about-card">
          <h2>What is Student Management System?</h2>
          <p>
            Student Management System (SMS) is an enterprise-grade web application
            designed to streamline student administration. It allows educators and
            administrators to create, view, edit, search, filter, and delete student
            records from a clean, single-page application.
          </p>
          <p>
            The system is equipped with dual-engine data storage: it syncs automatically
            with a Node.js REST API / JSON Server on port 3000 when active, and seamlessly
            falls back to browser Local Storage if the server is offline, ensuring zero data loss.
          </p>
        </div>

        {/* Features */}
        <div className="about-card">
          <h2>Key Features</h2>
          <div className="features-list">
            <div className="feature-item">
              <h3>⚡ Quick Student Registration</h3>
              <p>
                Create new student records with automatic roll number generation,
                course tags, demographic details, and quick demo autofill.
              </p>
            </div>

            <div className="feature-item">
              <h3>🔍 Real-Time Search & Filtering</h3>
              <p>
                Filter records by courses, gender, and multi-field keyword search
                across names, roll numbers, emails, and contact numbers.
              </p>
            </div>

            <div className="feature-item">
              <h3>📊 Grid & Table Views</h3>
              <p>
                Toggle between detailed responsive tables and visual card grids
                with quick action buttons for editing, viewing, and deletion.
              </p>
            </div>

            <div className="feature-item">
              <h3>📥 CSV Data Export</h3>
              <p>
                Export all active and filtered student datasets into standard CSV
                spreadsheets with a single click.
              </p>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div className="about-card">
          <h2>Technologies Used</h2>
          <div className="technology-list">
            <span>React 19</span>
            <span>React Router v7</span>
            <span>Node.js REST API</span>
            <span>JSON Server</span>
            <span>Axios</span>
            <span>Local Storage</span>
            <span>CSS3 & Glassmorphism</span>
            <span>Vite</span>
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta">
          <h2>Start Managing Students</h2>
          <p>
            Create your first student record or explore the full student registry.
          </p>
          <Link to="/create-user" className="about-btn">
            Create Student →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default About
