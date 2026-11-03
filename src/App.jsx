import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Nav' 
import { Home } from "./components/pages/Home"
import { AllUsers } from './components/pages/AllUsers'
import { CreateUser } from './components/pages/CreateUser'
import { About } from './components/pages/About'
import { Login } from './components/Authentication/Login'
import { Register } from './components/Authentication/Register'
import './App.css'

export const App = () => {
  return (
    <BrowserRouter>
      <div className='app-container'>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/create-users" element={<CreateUser />} />
          <Route path="/edit-user/:id" element={<CreateUser />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App