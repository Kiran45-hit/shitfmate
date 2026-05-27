import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import WorkerDashboard from './pages/WorkerDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import JobListings from './pages/JobListings'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'

function DashboardRedirect() {
  const user = JSON.parse(localStorage.getItem('user'))
  if (!user) return <Navigate to="/login" />
  if (user.role === 'EMPLOYER') return <Navigate to="/employer/dashboard" />
  if (user.role === 'ADMIN') return <Navigate to="/admin" />
  return <Navigate to="/worker/dashboard" />
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App