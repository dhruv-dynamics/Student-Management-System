// Utility to handle student data stored purely in the frontend (localStorage)

export const STORAGE_KEY = 'students'

export const INITIAL_STUDENTS = [
  {
    id: 'STU-1001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9876543210',
    age: '21',
    gender: 'Male',
    course: 'B.Tech',
    rollNo: 'BT2023-014',
    address: 'Sector 62, Noida, Uttar Pradesh',
    enrollDate: '2023-08-15',
    status: 'Active'
  },
  {
    id: 'STU-1002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '9823456781',
    age: '20',
    gender: 'Female',
    course: 'BCA',
    rollNo: 'BCA2024-008',
    address: 'Navrangpura, Ahmedabad, Gujarat',
    enrollDate: '2024-07-20',
    status: 'Active'
  },
  {
    id: 'STU-1003',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '9711223344',
    age: '23',
    gender: 'Male',
    course: 'MCA',
    rollNo: 'MCA2023-042',
    address: 'Indiranagar, Bengaluru, Karnataka',
    enrollDate: '2023-09-01',
    status: 'Active'
  },
  {
    id: 'STU-1004',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    phone: '9944556677',
    age: '22',
    gender: 'Female',
    course: 'MBA',
    rollNo: 'MBA2024-019',
    address: 'Adyar, Chennai, Tamil Nadu',
    enrollDate: '2024-06-10',
    status: 'Active'
  },
  {
    id: 'STU-1005',
    name: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    phone: '9812309845',
    age: '24',
    gender: 'Male',
    course: 'M.Tech',
    rollNo: 'MT2023-005',
    address: 'Bandra West, Mumbai, Maharashtra',
    enrollDate: '2023-08-25',
    status: 'Active'
  },
  {
    id: 'STU-1006',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@example.com',
    phone: '9871098723',
    age: '19',
    gender: 'Female',
    course: 'BBA',
    rollNo: 'BBA2024-031',
    address: 'Civil Lines, Jaipur, Rajasthan',
    enrollDate: '2024-07-15',
    status: 'Active'
  }
]

// Fetch all students. If none exist in localStorage, initialize with sample data
export const getStudents = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS))
      return INITIAL_STUDENTS
    }
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : INITIAL_STUDENTS
  } catch (error) {
    console.error('Error reading students from localStorage:', error)
    return INITIAL_STUDENTS
  }
}

// Save all students array to localStorage
export const saveStudents = (students) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
    return true
  } catch (error) {
    console.error('Error saving students to localStorage:', error)
    return false
  }
}

// Add a new student
export const addStudent = (studentData) => {
  const currentList = getStudents()
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const newId = studentData.id || `STU-${Date.now().toString().slice(-4)}${randomSuffix.toString().slice(-2)}`
  
  const courseCode = (studentData.course || 'GEN').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3)
  const autoRoll = studentData.rollNo?.trim() || `${courseCode}${new Date().getFullYear()}-${randomSuffix.toString().slice(-3)}`

  const newStudent = {
    ...studentData,
    id: newId,
    rollNo: autoRoll,
    enrollDate: studentData.enrollDate || new Date().toISOString().split('T')[0],
    status: studentData.status || 'Active',
    createdAt: new Date().toISOString()
  }

  const updatedList = [newStudent, ...currentList]
  saveStudents(updatedList)
  return newStudent
}

// Update an existing student by ID
export const updateStudent = (id, updatedFields) => {
  const currentList = getStudents()
  const index = currentList.findIndex((s) => s.id === id)
  if (index === -1) return null

  const updatedStudent = {
    ...currentList[index],
    ...updatedFields,
    updatedAt: new Date().toISOString()
  }

  currentList[index] = updatedStudent
  saveStudents(currentList)
  return updatedStudent
}

// Delete student by ID
export const deleteStudent = (id) => {
  const currentList = getStudents()
  const filtered = currentList.filter((s) => s.id !== id)
  saveStudents(filtered)
  return filtered
}

// Reset localStorage to default initial students
export const resetToInitialStudents = () => {
  saveStudents(INITIAL_STUDENTS)
  return INITIAL_STUDENTS
}

// Clear all students
export const clearAllStudents = () => {
  saveStudents([])
  return []
}

// Export students to CSV file
export const exportStudentsToCSV = (students) => {
  if (!students || students.length === 0) return false

  const headers = ['ID', 'Roll No', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'Course', 'Address', 'Enroll Date', 'Status']
  const rows = students.map((s) => [
    `"${s.id || ''}"`,
    `"${s.rollNo || ''}"`,
    `"${(s.name || '').replace(/"/g, '""')}"`,
    `"${s.email || ''}"`,
    `"${s.phone || ''}"`,
    `"${s.age || ''}"`,
    `"${s.gender || ''}"`,
    `"${s.course || ''}"`,
    `"${(s.address || '').replace(/"/g, '""')}"`,
    `"${s.enrollDate || ''}"`,
    `"${s.status || 'Active'}"`
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `students_export_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  return true
}
