import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import API from '../api'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch (err) {}
  }

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications')
      setNotifications(res.data)
      await API.put('/notifications/mark-read')
      setUnreadCount(0)
    } catch (err) {}
  }

  const toggleNotifications = () => {
    if (!showNotifications) fetchNotifications()
    setShowNotifications(!showNotifications)
  }

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const typeColors = {
    JOB_APPLICATION: 'bg-blue-50 border-blue-200',
    APPLICATION_ACCEPTED: 'bg-green-50 border-green-200',
    APPLICATION_REJECTED: 'bg-red-50 border-red-200',
    PAYMENT_RELEASED: 'bg-yellow-50 border-yellow-200',
    JOB_POSTED: 'bg-purple-50 border-purple-200',
    SHIFT_REMINDER: 'bg-orange-50 border-orange-200',
  }

  const typeIcons = {
    JOB_APPLICATION: '📋',
    APPLICATION_ACCEPTED: '✅',
    APPLICATION_REJECTED: '❌',
    PAYMENT_RELEASED: '💰',
    JOB_POSTED: '📢',
    SHIFT_REMINDER: '⏰',
  }

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between shadow-md relative">
      <Link to="/" className="text-xl font-bold tracking-tight">
        ⚡ ShiftMate
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/jobs"
          className="hover:text-indigo-200 transition text-sm font-medium">
          Browse Jobs
        </Link>

        {user ? (
          <>
            <Link to="/dashboard"
              className="hover:text-indigo-200 transition text-sm font-medium">
              Dashboard
            </Link>

            {/* Admin Link — only visible to ADMIN role */}
            {user?.role === 'ADMIN' && (
              <Link to="/admin"
                className="hover:text-indigo-200 transition text-sm font-medium">
                🛡️ Admin
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={toggleNotifications}
                className="relative p-1 hover:text-indigo-200 transition">
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      <div className="text-3xl mb-2">🔔</div>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id}
                        className={`p-4 border-b border-gray-50 ${typeColors[n.type] || 'bg-white'}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-lg">
                            {typeIcons[n.type] || '📢'}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {n.title}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {n.message}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <span className="text-indigo-200 text-sm">
              Hi, {user.name}
            </span>
            <button
              onClick={logout}
              className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
              className="hover:text-indigo-200 transition text-sm font-medium">
              Login
            </Link>
            <Link to="/register"
              className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}