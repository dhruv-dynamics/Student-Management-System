import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createStudent,
  getStudentById,
  updateStudentApi,
  checkServerHealth
} from '../../services/studentApi'
import '../styles/CreateUser.css'

export const CreateUser = () => {
  const navigate = useNavigate()
  const { id: editId } = useParams()
  const isEditing = Boolean(editId)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    course: '',
    rollNo: '',
    address: ''
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)

  // Check server health on mount & when editId changes
  useEffect(() => {
    checkServerHealth().then((health) => {
      setServerOnline(health.online)
    })

    if (isEditing) {
      loadExistingStudent()
    }
  }, [editId, isEditing])

  const loadExistingStudent = async () => {
    try {
      const student = await getStudentById(editId)
      if (student) {
        setFormData({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          age: student.age ? String(student.age) : '',
          gender: student.gender || '',
          course: student.course || student.major || '',
          rollNo: student.rollNo || '',
          address: student.address || ''
        })
      }
    } catch (err) {
      console.error('Error loading student for edit:', err)
      alert('Could not fetch student record.')
      navigate('/all-users')
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-+\s]/g, ''))) {
      newErrors.phone = 'Phone number must be a valid 10-digit number'
    }

    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (Number(formData.age) < 15 || Number(formData.age) > 99) {
      newErrors.age = 'Age must be between 15 and 99'
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select a gender'
    }

    if (!formData.course) {
      newErrors.course = 'Please select a course'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Quick helper to fill sample data for fast testing
  const handleFillSample = () => {
    const courses = ['BCA', 'B.Tech', 'MCA', 'MBA', 'BBA', 'M.Tech']
    const randomCourse = courses[Math.floor(Math.random() * courses.length)]
    const randomNum = Math.floor(100 + Math.random() * 900)

    setFormData({
      name: 'Aditya Kashyap',
      email: `aditya.${randomNum}@example.com`,
      phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      age: '21',
      gender: 'Male',
      course: randomCourse,
      rollNo: `${randomCourse.replace(/[^A-Z]/g, '')}2024-${randomNum}`,
      address: '42, Cyber Hub, Knowledge Park, Delhi NCR'
    })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        course: formData.course,
        major: formData.course,
        rollNo:
          formData.rollNo.trim() ||
          `${formData.course.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3)}${new Date().getFullYear()}-${Math.floor(
            100 + Math.random() * 900
          )}`,
        address: formData.address.trim(),
        enrollDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      }

      if (isEditing) {
        const updated = await updateStudentApi(editId, payload)
        const isOffline = updated._source === 'local' || updated._offlineNotice

        setSuccessMessage({
          title: isOffline
            ? 'Student Updated in Local Storage!'
            : 'Student Updated in JSON Server!',
          detail: isOffline
            ? `${updated.name}'s profile has been updated locally. (JSON Server is offline on port 3000 • run 'npm run server' to sync).`
            : `${updated.name}'s profile has been updated on the JSON Server!`,
          id: editId,
          isOffline
        })
      } else {
        const created = await createStudent(payload)
        const isOffline = created._source === 'local' || created._offlineNotice

        setSuccessMessage({
          title: isOffline
            ? 'Student Created in Local Storage!'
            : 'Student Created in JSON Server!',
          detail: isOffline
            ? `${created.name} (${created.rollNo || created.id}) has been saved locally in browser storage. (JSON Server is offline • run 'npm run server' to sync).`
            : `${created.name} (${created.rollNo || created.id}) has been added to JSON Server!`,
          id: created.id,
          isOffline
        })

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          age: '',
          gender: '',
          course: '',
          rollNo: '',
          address: ''
        })
      }
    } catch (err) {
      console.error('Error saving student:', err)
      alert('An unexpected error occurred while saving. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Avatar Initials
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

  return (
    <div className="create-user-container">
      <div className="create-user-card">
        {/* Header */}
        <div className="form-header">
          <div className={`header-badge ${serverOnline ? 'badge-server-on' : 'badge-server-off'}`}>
            <span className={`pulse-dot ${serverOnline ? 'dot-green' : 'dot-amber'}`}></span>
            {serverOnline
              ? (isEditing ? '🟢 JSON Server Connected • Update Mode' : '🟢 JSON Server Online • http://localhost:3000')
              : (isEditing ? '🟠 Local Storage Mode • Edit Student' : '🟠 Local Storage Active (Offline) • npm run server')}
          </div>
          <h1>{isEditing ? 'Edit Student Details' : 'Create Student'}</h1>
          <p>
            {isEditing
              ? 'Modify details below and save your student record.'
              : 'Enter student details to add a new record to the system.'}
          </p>
        </div>

        {/* Offline Mode Hint Banner */}
        {!serverOnline && (
          <div className="offline-notice-banner">
            <span className="notice-icon">💡</span>
            <div className="notice-text">
              <strong>Offline / Browser Storage Mode Active:</strong> Your records are saved safely in Local Storage.
              To sync with live JSON Server at <code>http://localhost:3000</code>, run <code>npm run server</code> in your terminal.
            </div>
          </div>
        )}

        {/* Live Preview Card */}
        {formData.name && (
          <div className="live-preview-pill">
            <div className="preview-avatar">{getInitials(formData.name)}</div>
            <div className="preview-info">
              <span className="preview-name">{formData.name}</span>
              <span className="preview-sub">
                {formData.course ? formData.course : 'Course not selected'} •{' '}
                {formData.email || 'No email entered'}
              </span>
            </div>
            {formData.course && (
              <span className={`course-badge badge-${formData.course.toLowerCase().replace(/[^a-z]/g, '')}`}>
                {formData.course}
              </span>
            )}
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div className={`success-banner ${successMessage.isOffline ? 'success-offline' : ''}`}>
            <div className="success-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="success-content">
              <h4>{successMessage.title}</h4>
              <p>{successMessage.detail}</p>
              <div className="success-actions">
                <button
                  type="button"
                  className="banner-btn primary"
                  onClick={() => navigate('/all-users')}
                >
                  View in All Students →
                </button>
                {!isEditing && (
                  <button
                    type="button"
                    className="banner-btn secondary"
                    onClick={() => setSuccessMessage(null)}
                  >
                    + Add Another
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Quick Demo Fill Bar */}
          {!isEditing && (
            <div className="demo-helper-bar">
              <span>Quick test?</span>
              <button
                type="button"
                className="fill-demo-btn"
                onClick={handleFillSample}
              >
                ⚡ Autofill Demo Data
              </button>
            </div>
          )}

          {/* Row 1: Name & Email */}
          <div className="form-row">
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="name">
                Full Name <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">
                Email Address <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. rahul@example.com"
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          {/* Row 2: Phone & Age */}
          <div className="form-row">
            <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
              <label htmlFor="phone">
                Phone Number <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="14"
                />
              </div>
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className={`form-group ${errors.age ? 'has-error' : ''}`}>
              <label htmlFor="age">
                Age <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 21"
                  min="15"
                  max="99"
                />
              </div>
              {errors.age && <span className="error-text">{errors.age}</span>}
            </div>
          </div>

          {/* Row 3: Gender & Course */}
          <div className="form-row">
            <div className={`form-group ${errors.gender ? 'has-error' : ''}`}>
              <label htmlFor="gender">
                Gender <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {errors.gender && <span className="error-text">{errors.gender}</span>}
            </div>

            <div className={`form-group ${errors.course ? 'has-error' : ''}`}>
              <label htmlFor="course">
                Course Program <span className="req">*</span>
              </label>
              <div className="input-wrap">
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                >
                  <option value="">Select Course</option>
                  <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                  <option value="B.Tech">B.Tech (Computer Science / IT)</option>
                  <option value="MCA">MCA (Master of Computer Applications)</option>
                  <option value="MBA">MBA (Master of Business Admin)</option>
                  <option value="BBA">BBA (Bachelor of Business Admin)</option>
                  <option value="M.Tech">M.Tech (Engineering)</option>
                </select>
              </div>
              {errors.course && <span className="error-text">{errors.course}</span>}
            </div>
          </div>

          {/* Row 4: Roll Number (Optional / Auto) */}
          <div className="form-group">
            <div className="label-with-hint">
              <label htmlFor="rollNo">Roll Number / Student ID</label>
              <span className="field-hint">(Leave blank to auto-generate)</span>
            </div>
            <div className="input-wrap">
              <input
                type="text"
                id="rollNo"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="e.g. BT2024-102 (or leave empty)"
              />
            </div>
          </div>

          {/* Row 5: Address */}
          <div className={`form-group ${errors.address ? 'has-error' : ''}`}>
            <label htmlFor="address">
              Address / City <span className="req">*</span>
            </label>
            <div className="input-wrap">
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete residential address, city, state"
                rows="3"
              ></textarea>
            </div>
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Submit and Buttons */}
          <div className="form-footer-buttons">
            <button
              type="submit"
              className="create-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-spinner">Saving Record...</span>
              ) : isEditing ? (
                '💾 Save Changes'
              ) : (
                '✓ Add Student'
              )}
            </button>

            <Link to="/all-users" className="cancel-btn">
              Cancel & Back to List
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

// Export both CreateUser and CreateUsers for maximum compatibility
export const CreateUsers = CreateUser
export default CreateUser
