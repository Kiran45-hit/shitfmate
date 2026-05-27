import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [payments, setPayments] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, jobsRes, paymentsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/jobs'),
        API.get('/admin/payments'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setJobs(jobsRes.data)
      setPayments(paymentsRes.data)
    } catch (err) {
      console.error(err)
      alert('Access denied! Admin only.')
      navigate('/')
    }
    setLoading(false)
  }

  const banUser = async (userId, userName) => {
    if (!window.confirm(`Ban user ${userName}? This cannot be undone.`)) return
    try {
      await API.delete(`/admin/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      alert('User banned successfully')
    } catch (err) { alert('Failed to ban user') }
  }

  const deleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Remove job "${jobTitle}"?`)) return
    try {
      await API.delete(`/admin/jobs/${jobId}`)
      setJobs(jobs.filter(j => j.id !== jobId))
      alert('Job removed successfully')
    } catch (err) { alert('Failed to remove job') }
  }

  const roleColors = {
    WORKER: 'bg-blue-100 text-blue-700',
    EMPLOYER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
  }

  const statusColors = {
    OPEN: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-600',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-lg">Loading admin panel...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-2xl">
              🛡️
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-red-200 text-sm">ShiftMate Platform Control</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Workers', value: stats.totalWorkers, icon: '👷' },
                { label: 'Employers', value: stats.totalEmployers, icon: '🏢' },
                { label: 'Total Jobs', value: stats.totalJobs, icon: '📋' },
                { label: 'Open Jobs', value: stats.openJobs, icon: '🟢' },
                { label: 'Applications', value: stats.totalApplications, icon: '📝' },
                { label: 'Payments', value: stats.totalPayments, icon: '💳' },
                { label: 'Revenue', value: `₹${stats.totalRevenue?.toFixed(0)}`, icon: '💰' },
              ].map(stat => (
                <div key={stat.label}
                  className="bg-white bg-opacity-15 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-red-200 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'users', label: `👥 Users (${users.length})` },
            { key: 'jobs', label: `📋 Jobs (${jobs.length})` },
            { key: 'payments', label: `💳 Payments (${payments.length})` },
            { key: 'reports', label: '🚨 Scam Reports' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">👥 User Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Workers', value: stats.totalWorkers, color: 'bg-blue-500' },
                  { label: 'Employers', value: stats.totalEmployers, color: 'bg-purple-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${(item.value / stats.totalUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">💰 Revenue Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Payments</span>
                  <span className="font-medium">{stats.totalPayments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform Revenue (10%)</span>
                  <span className="font-bold text-green-600">
                    ₹{stats.totalRevenue?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Applications</span>
                  <span className="font-medium">{stats.totalApplications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Open Jobs</span>
                  <span className="font-medium text-green-600">{stats.openJobs}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-lg font-bold text-indigo-600">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{u.name}</h3>
                    <p className="text-gray-500 text-sm">{u.email}</p>
                    <p className="text-gray-400 text-xs">{u.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${roleColors[u.role]}`}>
                    {u.role}
                  </span>
                  {u.role !== 'ADMIN' && (
                    <button
                      onClick={() => banUser(u.id, u.name)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition">
                      🚫 Ban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id}
                className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                      <p className="text-gray-500 text-sm">📍 {job.location}</p>
                      <p className="text-gray-500 text-sm">💰 ₹{job.salary}/shift</p>
                      <p className="text-gray-500 text-sm">🏢 {job.employer?.name}</p>
                      <p className="text-gray-500 text-sm">
                        👥 {job.filledSlots}/{job.totalSlots} filled
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                    <button
                      onClick={() => deleteJob(job.id, job.title)}
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition">
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                No payments yet
              </div>
            ) : (
              payments.map(payment => (
                <div key={payment.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {payment.job?.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        Employer: {payment.employer?.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(payment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ₹{payment.amount}
                      </p>
                      <p className="text-green-600 text-sm">
                        Fee: ₹{payment.platformFee}
                      </p>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full mt-1 inline-block ${
                        payment.status === 'CAPTURED'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'RELEASED'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Scam Reports Tab */}
        {activeTab === 'reports' && (
          <ScamReportsPanel />
        )}
      </div>
    </div>
  )
}

// Scam Reports Panel Component
function ScamReportsPanel() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/scam-shield/reports')
      .then(res => setReports(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const resolveReport = async (id, status) => {
    try {
      await API.put(`/scam-shield/reports/${id}/resolve?status=${status}`)
      setReports(reports.map(r =>
        r.id === id ? {...r, status} : r
      ))
    } catch (err) { alert('Failed to resolve') }
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    REVIEWED: 'bg-blue-100 text-blue-700',
    RESOLVED: 'bg-green-100 text-green-700',
    DISMISSED: 'bg-gray-100 text-gray-600',
  }

  if (loading) return (
    <div className="text-center py-20 text-gray-400">Loading...</div>
  )

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🛡️</div>
          <p className="text-gray-500">No scam reports yet</p>
        </div>
      ) : (
        reports.map(report => (
          <div key={report.id}
            className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-500 font-medium text-sm">
                    🚨 {report.type?.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[report.status]}`}>
                    {report.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">
                  Job: {report.reportedJob?.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Employer: {report.reportedEmployer?.name}
                </p>
                <p className="text-gray-500 text-sm">
                  Reason: {report.reason}
                </p>
                {report.description && (
                  <p className="text-gray-400 text-xs mt-1">
                    {report.description}
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  Reported by: {report.reporter?.name} •{' '}
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              {report.status === 'PENDING' && (
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => resolveReport(report.id, 'RESOLVED')}
                    className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-600">
                    ✓ Resolve
                  </button>
                  <button
                    onClick={() => resolveReport(report.id, 'DISMISSED')}
                    className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}