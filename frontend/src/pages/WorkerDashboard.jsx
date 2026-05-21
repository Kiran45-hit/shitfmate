import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api'

export default function WorkerDashboard() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('applications')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await API.get('/jobs/my-applications')
      setApplications(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const statusColors = {
    PENDING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    ACCEPTED:  'bg-green-100 text-green-700 border-green-200',
    REJECTED:  'bg-red-100 text-red-700 border-red-200',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  const statusIcons = {
    PENDING: '⏳', ACCEPTED: '✅',
    REJECTED: '❌', COMPLETED: '🏆', CANCELLED: '🚫'
  }

  const totalEarnings = applications
    .filter(a => a.status === 'COMPLETED')
    .reduce((sum, a) => sum + (a.job?.salary || 0), 0)

  const accepted = applications.filter(a => a.status === 'ACCEPTED')
  const pending  = applications.filter(a => a.status === 'PENDING')
  const upcoming = applications.filter(a =>
    a.status === 'ACCEPTED' &&
    new Date(a.job?.shiftStartTime) > new Date()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hi, {user?.name}! 👋</h1>
                <p className="text-indigo-200 text-sm">Worker Dashboard</p>
              </div>
            </div>
            <Link to="/jobs"
              className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-indigo-50 transition">
              Browse Jobs
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Applied', value: applications.length, icon: '📋' },
              { label: 'Accepted', value: accepted.length, icon: '✅' },
              { label: 'Pending', value: pending.length, icon: '⏳' },
              { label: 'Earnings', value: `₹${totalEarnings}`, icon: '💰' },
            ].map(stat => (
              <div key={stat.label} className="bg-white bg-opacity-15 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-indigo-200 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Upcoming Shifts */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              🗓️ Upcoming Shifts ({upcoming.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map(app => (
                <div key={app.id}
                  className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.job.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">📍 {app.job.location}</p>
                      <p className="text-gray-500 text-sm">
                        🕐 {new Date(app.job.shiftStartTime).toLocaleString()}
                      </p>
                      <p className="text-green-600 font-medium text-sm mt-1">
                        💰 ₹{app.job.salary}/shift
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['applications', 'profile'].map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'applications' ? '📋 My Applications' : '👤 My Profile'}
            </button>
          ))}
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500 mb-4">No applications yet</p>
                <Link to="/jobs"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition">
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{app.job.title}</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                          <p className="text-gray-500 text-sm">📍 {app.job.location}</p>
                          <p className="text-gray-500 text-sm">💰 ₹{app.job.salary}/shift</p>
                          <p className="text-gray-500 text-sm">🏢 {app.job.employer?.name}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {app.job.shiftStartTime && (
                          <p className="text-gray-500 text-sm mt-1">
                            🕐 {new Date(app.job.shiftStartTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${statusColors[app.status]}`}>
                        {statusIcons[app.status]} {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-600">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
                <p className="text-gray-500">{user?.email}</p>
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Applications', value: applications.length },
                { label: 'Accepted Jobs', value: accepted.length },
                { label: 'Completed Jobs', value: applications.filter(a => a.status === 'COMPLETED').length },
                { label: 'Total Earnings', value: `₹${totalEarnings}` },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-indigo-600">{item.value}</div>
                  <div className="text-gray-500 text-sm mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}