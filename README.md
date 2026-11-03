# 🎓 Student Management System (SMS)

A modern, responsive, and resilient **Student Management System** built with React 19, Vite, and Tailwind CSS. Features seamless dual-storage architecture with offline Local Storage support and an optional Node.js REST API backend.

![Student Management System](src/assets/logo.png)

---

## ✨ Features

- **⚡ Dual-Engine Data Storage**: Works 100% offline via browser Local Storage, and automatically syncs with a Node.js REST API (`db.json`) when online.
- **📋 Complete Student Lifecycle (CRUD)**: Create, view, edit, and delete student records with instant UI updates.
- **🔍 Advanced Search & Filtering**: Multi-field search across Name, Roll No, Email, Phone, and Course with multi-criteria sorting.
- **📊 Table & Grid Views**: Toggle between detailed responsive tabular view and modern card grid view.
- **📥 CSV Data Export**: Download current or filtered student records as CSV spreadsheets with one click.
- **🔐 Authentication**: Integrated Login and Sign Up with session persistence and demo account autofill.
- **🎨 Modern SaaS UI**: Glassmorphism design, responsive layouts, active route highlighting, and real-time server health indicators.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router v7, Vite
- **Styling**: Tailwind CSS & Modern Custom Glassmorphic CSS
- **HTTP Client**: Axios
- **Storage**: Local Storage (Offline fallback) & Node.js Native HTTP Server (`server/db.json`)
- **Icons & Assets**: Custom SVG & PNG branding

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd sms
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run Frontend
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. (Optional) Run JSON REST API Server
To enable live backend database synchronization:
```bash
npm run server
```
Server runs at [http://localhost:3000/students](http://localhost:3000/students).

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Click **"Deploy"**.
*(Note: `vercel.json` is already pre-configured for SPA client-side routing).*

### Deploy to Netlify
1. Push your repository to GitHub.
2. Go to [Netlify](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
3. Select your GitHub repository.
4. Build command: `npm run build`, Publish directory: `dist`.
5. Click **"Deploy site"**.
*(Note: `public/_redirects` is already included for SPA routing).*

---

## 📄 License
MIT License
