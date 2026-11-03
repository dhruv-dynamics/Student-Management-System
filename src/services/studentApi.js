import axios from 'axios'
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  saveStudents
} from '../utils/studentStorage'

export const API_URL = 'http://localhost:3000/students'
const TIMEOUT_MS = 2000

// Helper to check if server is reachable
export const checkServerHealth = async () => {
  try {
    const res = await axios.get(API_URL, { timeout: 1500 })
    return { online: true, count: Array.isArray(res.data) ? res.data.length : 0 }
  } catch (err) {
    return { online: false, error: err.message }
  }
}

// Fetch all students with seamless fallback to localStorage
export const getAllStudents = async () => {
  try {
    const response = await axios.get(API_URL, { timeout: TIMEOUT_MS })
    if (Array.isArray(response.data)) {
      // Sync fresh data to localStorage for offline cache
      if (response.data.length > 0) {
        saveStudents(response.data)
      }
      return response.data
    }
    return getStudents()
  } catch (error) {
    console.warn(
      '⚠️ JSON Server unreachable at http://localhost:3000. Seamlessly falling back to Local Storage.',
      error.message
    )
    return getStudents()
  }
}

// Fetch single student by ID with fallback
export const getStudentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, { timeout: TIMEOUT_MS })
    return response.data
  } catch (error) {
    console.warn(
      `⚠️ JSON Server getStudentById(${id}) failed, checking Local Storage.`,
      error.message
    )
    const localList = getStudents()
    const student = localList.find((s) => String(s.id) === String(id))
    if (!student) {
      throw new Error(`Student with ID ${id} not found in Server or Local Storage.`)
    }
    return student
  }
}

// Create new student: tries JSON Server first, seamlessly falls back to Local Storage
export const createStudent = async (studentData) => {
  try {
    const response = await axios.post(API_URL, studentData, { timeout: TIMEOUT_MS })
    const created = response.data

    // Keep localStorage in sync
    const currentList = getStudents()
    if (!currentList.some((s) => String(s.id) === String(created.id))) {
      saveStudents([created, ...currentList])
    }

    return { ...created, _source: 'server' }
  } catch (error) {
    console.warn(
      '⚠️ JSON Server offline while creating student. Saving student to Local Storage.',
      error.message
    )

    // Save directly to localStorage
    const localRecord = addStudent(studentData)
    return { ...localRecord, _source: 'local', _offlineNotice: true }
  }
}

// Update student: tries JSON Server first, seamlessly falls back to Local Storage
export const updateStudentApi = async (id, updatedData) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}`, updatedData, {
      timeout: TIMEOUT_MS
    })
    const updated = response.data

    // Keep localStorage in sync
    updateStudent(id, updated)

    return { ...updated, _source: 'server' }
  } catch (error) {
    console.warn(
      `⚠️ JSON Server offline while updating student #${id}. Updating in Local Storage.`,
      error.message
    )

    const updatedLocal = updateStudent(id, updatedData)
    if (!updatedLocal) {
      throw new Error(`Could not find student #${id} to update.`)
    }
    return { ...updatedLocal, _source: 'local', _offlineNotice: true }
  }
}

// Delete student: tries JSON Server first, always removes from Local Storage
export const deleteStudentApi = async (id) => {
  // Always delete locally first
  deleteStudent(id)

  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      timeout: TIMEOUT_MS
    })
    return { success: true, data: response.data, _source: 'server' }
  } catch (error) {
    console.warn(
      `⚠️ JSON Server offline while deleting student #${id}. Removed from Local Storage.`,
      error.message
    )
    return { success: true, id, _source: 'local' }
  }
}
