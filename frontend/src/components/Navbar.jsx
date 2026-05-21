import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-tight">
        ⚡ ShiftMate
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/jobs" className="hover:text-indigo-200 transition text-sm font-medium">
          Browse Jobs
        </Link>

        {user ? (
          <>
            <Link
              to={user.role === 'WORKER' ? '/worker/dashboard' : '/employer/dashboard'}
              className="hover:text-indigo-200 transition text-sm font-medium"
            >
              Dashboard
            </Link>
            <span className="text-indigo-200 text-sm">Hi, {user.name}</span>
            <button
              onClick={logout}
              className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-indigo-200 transition text-sm font-medium">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}