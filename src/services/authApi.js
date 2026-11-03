import axios from 'axios'

const SERVER_URL = 'http://localhost:3000/students'
const USERS_STORAGE_KEY = 'registered_users'

const INITIAL_USERS = [
  {
    id: 'USR-ADMIN',
    name: 'Admin User',
    email: 'admin@sms.com',
    password: 'password123'
  },
  {
    id: 'USR-DEMO',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123'
  }
]

// Get local registered users
export const getLocalUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS))
      return INITIAL_USERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : INITIAL_USERS
  } catch {
    return INITIAL_USERS
  }
}

// Save local registered users
export const saveLocalUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    return true
  } catch {
    return false
  }
}

// Register a new user
export const registerUser = async ({ name, email, password }) => {
  const cleanEmail = email.trim().toLowerCase()
  const cleanName = name.trim()

  // 1. Check local users first
  const localUsers = getLocalUsers()
  if (localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists!')
  }

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
    name: cleanName,
    email: cleanEmail,
    password
  }

  // 2. Try JSON Server if available
  let syncedToServer = false
  try {
    await axios.post(
      SERVER_URL,
      {
        ...newUser,
        role: 'user',
        status: 'Active',
        course: 'General'
      },
      { timeout: 1500 }
    )
    syncedToServer = true
  } catch (err) {
    console.warn(
      'JSON Server unreachable during registration, registered in local storage:',
      err.message
    )
  }

  // 3. Always save in local storage
  saveLocalUsers([newUser, ...localUsers])

  return {
    success: true,
    user: newUser,
    syncedToServer
  }
}

// Login user
export const loginUser = async ({ email, password }) => {
  const cleanEmail = email.trim().toLowerCase()

  // 1. Check JSON Server first if available
  try {
    const res = await axios.get(
      `${SERVER_URL}?email=${encodeURIComponent(cleanEmail)}`,
      { timeout: 1500 }
    )
    if (Array.isArray(res.data) && res.data.length > 0) {
      const match = res.data.find(
        (u) =>
          u.email?.toLowerCase() === cleanEmail &&
          (u.password === password || !u.password) // Allow student records to login if password set or matched
      )
      if (match && match.password === password) {
        const sessionData = {
          id: match.id,
          name: match.name,
          email: match.email
        }
        sessionStorage.setItem('loggedInUser', JSON.stringify(sessionData))
        return { success: true, user: sessionData, source: 'server' }
      }
    }
  } catch (err) {
    console.warn('JSON Server login check failed, checking local storage:', err.message)
  }

  // 2. Fallback to local registered users
  const localUsers = getLocalUsers()
  const localMatch = localUsers.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === password
  )

  if (localMatch) {
    const sessionData = {
      id: localMatch.id,
      name: localMatch.name,
      email: localMatch.email
    }
    sessionStorage.setItem('loggedInUser', JSON.stringify(sessionData))
    return { success: true, user: sessionData, source: 'local' }
  }

  throw new Error('Invalid email or password. Please check your credentials.')
}

