import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllStudents,
  getStudentById,
  updateStudentApi,
  deleteStudentApi,
  checkServerHealth
} from '../../services/studentApi'
import { exportStudentsToCSV, getStudents } from '../../utils/studentStorage'
import '../styles/AllUsers.css'

export const AllUsers = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [serverOnline, setServerOnline] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter and search state
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null) // For View Details Modal
  const [editingStudent, setEditingStudent] = useState(null) // For Edit Modal
  const [toastMessage, setToastMessage] = useState(null) // Toast notification

  // Fetch students on mount
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const health = await checkServerHealth()
      setServerOnline(health.online)

      const data = await getAllStudents()
      setStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.warn('Error fetching students, using local backup:', err)
      const localData = getStudents()
      setStudents(localData)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  // View Handler: Fetch details
  const handleView = async (student) => {
    try {
      const freshData = await getStudentById(student.id)
      setSelectedStudent(freshData)
    } catch (err) {
      console.warn('Could not fetch single student, using cached record:', err)
      setSelectedStudent(student)
    }
  }

  // Delete Handler
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name || `Student #${id}`}"? This will permanently remove the record.`
    )
    if (!confirmed) return

    try {
      await deleteStudentApi(id)
      setStudents((prev) => prev.filter((student) => student.id !== id))
      showToast(`Student "${name || id}" was deleted successfully!`, 'info')
    } catch (err) {
      console.error('Error deleting student:', err)
      alert('Failed to delete student record. Please try again.')
    }
  }

  // Edit Submit Handler
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingStudent) return

    if (!editingStudent.name?.trim()) {
      alert('Name cannot be empty!')
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        name: editingStudent.name,
        email: editingStudent.email || '',
        phone: editingStudent.phone || '',
        age: editingStudent.age ? Number(editingStudent.age) : '',
        gender: editingStudent.gender || '',
        course: editingStudent.course || editingStudent.major || '',
        major: editingStudent.course || editingStudent.major || '',
        rollNo: editingStudent.rollNo || '',
        address: editingStudent.address || '',
        status: editingStudent.status || 'Active'
      }

      const updated = await updateStudentApi(editingStudent.id, payload)

      // Update state in AllUsers
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...updated } : s))
      )

      setEditingStudent(null)
      showToast(
        `Student "${updated.name || editingStudent.name}" updated successfully!`,
        'success'
      )
    } catch (err) {
      console.error('Error updating student:', err)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // CSV Export helper
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      showToast('No students to export.', 'warning')
      return
    }
    exportStudentsToCSV(filteredStudents)
    showToast(`Exported ${filteredStudents.length} student(s) to CSV!`, 'success')
  }

  // Course resolution helper
  const getStudentCourse = (student) => {
    return student.course || student.major || 'Not Specified'
  }

  // Collect available courses for dropdown
  const availableCourses = Array.from(
    new Set([
      'BCA',
      'B.Tech',
      'MCA',
      'MBA',
      'BBA',
      'M.Tech',
      ...students.map((s) => getStudentCourse(s)).filter((c) => c && c !== 'Not Specified')
    ])
  )

  // Filter & Sort Logic
  const filteredStudents = students
    .filter((student) => {
      const q = search.toLowerCase().trim()
      const studentCourse = getStudentCourse(student)

      const matchesSearch =
        !q ||
        (student.name && student.name.toLowerCase().includes(q)) ||
        (student.email && student.email.toLowerCase().includes(q)) ||
        (student.phone && String(student.phone).includes(q)) ||
        (student.rollNo && student.rollNo.toLowerCase().includes(q)) ||
        (student.id && String(student.id).toLowerCase().includes(q)) ||
        studentCourse.toLowerCase().includes(q)

      const matchesCourse =
        courseFilter === 'All' || studentCourse === courseFilter

      const matchesGender =
        genderFilter === 'All' ||
        (student.gender && student.gender.toLowerCase() === genderFilter.toLowerCase())

      return matchesSearch && matchesCourse && matchesGender
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '')
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '')
      if (sortBy === 'age-asc') return Number(a.age || 0) - Number(b.age || 0)
      if (sortBy === 'age-desc') return Number(b.age || 0) - Number(a.age || 0)
      if (sortBy === 'newest') {
        const idA = String(a.id)
        const idB = String(b.id)
        if (!isNaN(idA) && !isNaN(idB)) {
          return Number(idB) - Number(idA)
        }
        return idB.localeCompare(idA)
      }
      return 0
    })

  const clearFilters = () => {
    setSearch('')
    setCourseFilter('All')
    setGenderFilter('All')
    setSortBy('newest')
  }

  // Initials generator
  const getInitials = (name) => {
    if (!name) return 'ST'
    return name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Course Color Class
  const getCourseClass = (course) => {
    const c = (course || '').toLowerCase().replace(/[^a-z]/g, '')
    if (c.includes('tech') || c.includes('science')) return 'badge-btech'
    if (c.includes('bca')) return 'badge-bca'
    if (c.includes('mca')) return 'badge-mca'
    if (c.includes('mba')) return 'badge-mba'
    if (c.includes('bba') || c.includes('math')) return 'badge-bba'
    return 'badge-btech'
  }

  // KPI Calculations
  const totalStudents = students.length
  const uniqueCourses = new Set(students.map((s) => getStudentCourse(s)).filter(Boolean)).size
  const studentsWithAge = students.filter((s) => s.age && !isNaN(s.age))
  const avgAge = studentsWithAge.length
    ? Math.round(
        studentsWithAge.reduce((acc, s) => acc + Number(s.age), 0) /
          studentsWithAge.length
      )
    : 0

  return (
    <div className="all-users-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-popup ${toastMessage.type}`}>
          <span className="toast-dot"></span>
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="users-header">
        <div className="header-info">
          <div className={`header-badge ${serverOnline ? 'badge-online' : 'badge-offline'}`}>
            <span className={`live-indicator ${serverOnline ? 'dot-green' : 'dot-amber'}`}></span>
            {serverOnline
              ? '🟢 JSON Server Connected • http://localhost:3000/students'
              : '🟠 Local Storage Active (Offline) • npm run server'}
          </div>
          <h1>All Registered Students</h1>
          <p>
            {serverOnline
              ? 'Real-time synchronization with JSON Server. Inspect, search, edit, and delete records directly.'
              : 'Operating in Browser Local Storage Mode. Add, search, edit, and delete records offline.'}
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={loadStudents}
            title="Refresh student list"
          >
            🔄 Refresh Data
          </button>
          <button
            type="button"
            className="secondary-action-btn"
            onClick={handleExportCSV}
            title="Download CSV report"
          >
            📥 Export CSV
          </button>
          <Link to="/create-user" className="add-student-btn">
            + Add Student
          </Link>
        </div>
      </div>

      {/* Offline Mode Hint Banner */}
      {!serverOnline && !loading && (
        <div className="offline-notice-banner" style={{ marginBottom: 24 }}>
          <span className="notice-icon">💡</span>
          <div className="notice-text">
            <strong>Operating in Local Storage Mode:</strong> JSON Server is currently offline on port 3000. All changes are being saved locally in your browser.
            To start the live JSON Server backend, run <code>npm run server</code> in your terminal.
          </div>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue">👥</div>
          <div className="stat-data">
            <span className="stat-value">{totalStudents}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-purple">🎓</div>
          <div className="stat-data">
            <span className="stat-value">{uniqueCourses}</span>
            <span className="stat-label">Active Programs</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-green">🎂</div>
          <div className="stat-data">
            <span className="stat-value">{avgAge ? `${avgAge} yrs` : 'N/A'}</span>
            <span className="stat-label">Average Age</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-amber">🔍</div>
          <div className="stat-data">
            <span className="stat-value">{filteredStudents.length}</span>
            <span className="stat-label">Filtered Results</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="controls-card">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by student name, roll no, email, phone, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Course / Major:</label>
            <select
              className="custom-select"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="All">All Courses</option>
              {availableCourses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Gender:</label>
            <select
              className="custom-select"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select
              className="custom-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Recently Added</option>
              <option value="name-asc">Name (A → Z)</option>
              <option value="name-desc">Name (Z → A)</option>
              <option value="age-asc">Age (Lowest first)</option>
              <option value="age-desc">Age (Highest first)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              ☰ Table
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              ☷ Cards
            </button>
          </div>
        </div>
      </div>

      {/* Counter bar */}
      <div className="results-counter-bar">
        <span>
          Showing <strong>{filteredStudents.length}</strong> of{' '}
          <strong>{students.length}</strong> students
        </span>
        {(search || courseFilter !== 'All' || genderFilter !== 'All') && (
          <button
            type="button"
            className="reset-filters-link"
            onClick={clearFilters}
          >
            Clear Active Filters ✕
          </button>
        )}
      </div>

      {/* Main Content: Loading, Empty, Table or Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading student records...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h2>No Students Found</h2>
          <p>
            Your student database is currently empty. Click below to add your first student record.
          </p>
          <div className="empty-actions">
            <Link to="/create-user" className="empty-btn primary">
              + Create First Student
            </Link>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>No Matching Students Found</h2>
          <p>
            No student records match your query "{search}" or selected filters.
          </p>
          <button
            type="button"
            className="empty-btn primary"
            onClick={clearFilters}
          >
            Clear Search & Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No / ID</th>
                <th>Contact</th>
                <th>Age / Gender</th>
                <th>Course / Major</th>
                <th>Status</th>
                <th className="actions-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const courseName = getStudentCourse(student)
                return (
                  <tr key={student.id}>
                    <td>
                      <div className="student-profile-cell">
                        <div className="avatar-circle">
                          {getInitials(student.name)}
                        </div>
                        <div className="profile-names">
                          <span className="primary-name">{student.name}</span>
                          <span className="secondary-id">ID: {student.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="roll-chip">
                        {student.rollNo || `#${student.id}`}
                      </span>
                    </td>

                    <td>
                      <div className="contact-cell">
                        <span className="email-text">
                          {student.email || 'No email'}
                        </span>
                        {student.phone && (
                          <span className="phone-text">📞 {student.phone}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="demographics-cell">
                        <span>{student.age ? `${student.age} yrs` : 'N/A'}</span>
                        <span className="gender-sub">
                          {student.gender || 'Not specified'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`course-badge ${getCourseClass(courseName)}`}>
                        {courseName}
                      </span>
                    </td>

                    <td>
                      <span className="status-pill active">
                        <span className="status-dot"></span>
                        {student.status || 'Active'}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        {/* View Button */}
                        <button
                          type="button"
                          className="btn-action btn-view"
                          onClick={() => handleView(student)}
                          title="View Details"
                        >
                          👁 View
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => setEditingStudent({ ...student, course: courseName })}
                          title="Edit Student"
                        >
                          ✎ Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(student.id, student.name)}
                          title="Delete Student"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="students-grid">
          {filteredStudents.map((student) => {
            const courseName = getStudentCourse(student)
            return (
              <div key={student.id} className="student-card">
                <div className="card-top-bar">
                  <span className={`course-badge ${getCourseClass(courseName)}`}>
                    {courseName}
                  </span>
                  <span className="roll-tag">
                    {student.rollNo || `#${student.id}`}
                  </span>
                </div>

                <div className="card-main-info">
                  <div className="card-avatar">
                    {getInitials(student.name)}
                  </div>
                  <h3>{student.name}</h3>
                  <p className="card-email">{student.email || 'No email provided'}</p>
                </div>

                <div className="card-details-list">
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{student.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Age / Gender:</span>
                    <span className="detail-value">
                      {student.age ? `${student.age} yrs` : 'N/A'} •{' '}
                      {student.gender || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value truncate" title={student.address}>
                      {student.address || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="btn-action btn-view flex-1"
                    onClick={() => handleView(student)}
                  >
                    👁 View
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-edit flex-1"
                    onClick={() => setEditingStudent({ ...student, course: courseName })}
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-delete"
                    onClick={() => handleDelete(student.id, student.name)}
                    title="Delete Student"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedStudent && (
        <div className="modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-profile-header">
                <div className="modal-avatar">
                  {getInitials(selectedStudent.name)}
                </div>
                <div className="modal-title-info">
                  <h3>{selectedStudent.name}</h3>
                  <span className="modal-roll-text">
                    ID: {selectedStudent.id}{' '}
                    {selectedStudent.rollNo && `• Roll No: ${selectedStudent.rollNo}`}
                  </span>
                  <span className={`course-badge ${getCourseClass(getStudentCourse(selectedStudent))}`}>
                    {getStudentCourse(selectedStudent)}
                  </span>
                </div>
              </div>

              <div className="profile-info-grid">
                <div className="info-box">
                  <label>Database ID</label>
                  <span>{selectedStudent.id}</span>
                </div>
                <div className="info-box">
                  <label>Email Address</label>
                  <span>{selectedStudent.email || 'N/A'}</span>
                </div>
                <div className="info-box">
                  <label>Phone Number</label>
                  <span>{selectedStudent.phone || 'N/A'}</span>
                </div>
                <div className="info-box">
                  <label>Age & Gender</label>
                  <span>
                    {selectedStudent.age ? `${selectedStudent.age} Years` : 'N/A'}{' '}
                    ({selectedStudent.gender || 'Not specified'})
                  </span>
                </div>
                <div className="info-box">
                  <label>Course / Major</label>
                  <span>{getStudentCourse(selectedStudent)}</span>
                </div>
                <div className="info-box">
                  <label>Status</label>
                  <span className="status-pill active">
                    <span className="status-dot"></span>
                    {selectedStudent.status || 'Active'}
                  </span>
                </div>
                <div className="info-box full-width">
                  <label>Residential Address</label>
                  <span>{selectedStudent.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-action btn-edit"
                onClick={() => {
                  setEditingStudent({
                    ...selectedStudent,
                    course: getStudentCourse(selectedStudent)
                  })
                  setSelectedStudent(null)
                }}
              >
                ✎ Edit Record
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setEditingStudent(null)}>
          <div className="modal-box modal-edit" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Student Details</h2>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => !isSubmitting && setEditingStudent(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={editingStudent.name || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          name: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editingStudent.email || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          email: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={editingStudent.phone || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          phone: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Roll Number / Code</label>
                    <input
                      type="text"
                      value={editingStudent.rollNo || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          rollNo: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      value={editingStudent.age || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          age: e.target.value
                        })
                      }
                      min="10"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={editingStudent.gender || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          gender: e.target.value
                        })
                      }
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Course / Major *</label>
                    <select
                      value={editingStudent.course || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          course: e.target.value
                        })
                      }
                      required
                    >
                      <option value="">Select Course</option>
                      <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                      <option value="B.Tech">B.Tech (Computer Science / IT)</option>
                      <option value="MCA">MCA (Master of Computer Applications)</option>
                      <option value="MBA">MBA (Master of Business Admin)</option>
                      <option value="BBA">BBA (Bachelor of Business Admin)</option>
                      <option value="M.Tech">M.Tech (Engineering)</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Residential Address</label>
                    <textarea
                      rows="2"
                      value={editingStudent.address || ''}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          address: e.target.value
                        })
                      }
                      placeholder="Enter student residential address"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  disabled={isSubmitting}
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllUsers
