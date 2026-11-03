import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 3000
const DB_FILE = path.join(__dirname, 'db.json')

// Helper to read database
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { students: [] }
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    console.error('Error reading db.json:', err)
    return { students: [] }
  }
}

// Helper to write database
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('Error writing db.json:', err)
    return false
  }
}

// Helper to send JSON response with CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  res.end(JSON.stringify(data))
}

const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    res.end()
    return
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`)
  const pathname = parsedUrl.pathname
  const searchParams = parsedUrl.searchParams

  // Root endpoint info
  if (pathname === '/' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'online',
      message: 'Student Management System API Server is running',
      endpoints: {
        students: 'http://localhost:3000/students'
      }
    })
    return
  }

  // Handle /students routes
  if (pathname === '/students' || pathname.startsWith('/students/')) {
    const db = readDb()
    const students = Array.isArray(db.students) ? db.students : []
    const pathParts = pathname.split('/').filter(Boolean)
    const id = pathParts.length > 1 ? pathParts[1] : null

    // GET /students or GET /students/:id
    if (req.method === 'GET') {
      if (id) {
        const student = students.find((s) => String(s.id) === String(id))
        if (!student) {
          sendJson(res, 404, { error: 'Student not found' })
        } else {
          sendJson(res, 200, student)
        }
      } else {
        // Handle filter query params, e.g. ?email=...
        let filtered = [...students]
        for (const [key, value] of searchParams.entries()) {
          filtered = filtered.filter((s) => {
            if (s[key] === undefined) return false
            return String(s[key]).toLowerCase() === String(value).toLowerCase()
          })
        }
        sendJson(res, 200, filtered)
      }
      return
    }

    // Read request body for POST, PUT, PATCH
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      let parsedBody = {}
      if (body) {
        try {
          parsedBody = JSON.parse(body)
        } catch {
          sendJson(res, 400, { error: 'Invalid JSON body' })
          return
        }
      }

      // POST /students
      if (req.method === 'POST') {
        const newId = parsedBody.id || `STU-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`
        const newStudent = {
          ...parsedBody,
          id: String(newId)
        }
        students.push(newStudent)
        db.students = students
        writeDb(db)
        sendJson(res, 201, newStudent)
        return
      }

      // PATCH or PUT /students/:id
      if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
        const index = students.findIndex((s) => String(s.id) === String(id))
        if (index === -1) {
          sendJson(res, 404, { error: 'Student not found' })
          return
        }

        const existing = students[index]
        const updated = req.method === 'PATCH'
          ? { ...existing, ...parsedBody, id: existing.id }
          : { ...parsedBody, id: existing.id }

        students[index] = updated
        db.students = students
        writeDb(db)
        sendJson(res, 200, updated)
        return
      }

      // DELETE /students/:id
      if (req.method === 'DELETE' && id) {
        const index = students.findIndex((s) => String(s.id) === String(id))
        if (index === -1) {
          sendJson(res, 404, { error: 'Student not found' })
          return
        }

        const deleted = students.splice(index, 1)[0]
        db.students = students
        writeDb(db)
        sendJson(res, 200, deleted)
        return
      }

      sendJson(res, 405, { error: 'Method Not Allowed' })
    })
    return
  }

  // Fallback 404
  sendJson(res, 404, { error: 'Endpoint not found' })
})

server.listen(PORT, () => {
  console.log(`\n🚀 Student Management JSON API Server is running at: http://localhost:${PORT}`)
  console.log(`📡 Endpoints available:`)
  console.log(`   - GET    http://localhost:${PORT}/students`)
  console.log(`   - POST   http://localhost:${PORT}/students`)
  console.log(`   - GET    http://localhost:${PORT}/students/:id`)
  console.log(`   - PATCH  http://localhost:${PORT}/students/:id`)
  console.log(`   - DELETE http://localhost:${PORT}/students/:id\n`)
})

