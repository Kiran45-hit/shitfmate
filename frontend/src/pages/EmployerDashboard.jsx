import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('jobs')
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    salary: '', jobType: 'DELIVERY', shiftType: 'WEEKEND',
    totalSlots: '', shiftStartTime: '', shiftEndTime: ''
  })
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs/my-jobs')
      setJobs(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fetchApplicants = async (jobId) => {
    try {
      const res = await API.get(`/jobs/${jobId}/applicants`)
      setApplicants(res.data)
      setSelectedJob(jobs.find(j => j.id === jobId))
      setActiveTab('applicants')
    } catch (err) { console.error(err) }
  }

  const updateStatus = async (applicationId, status) => {
    try {
      await API.put(`/jobs/applications/${applicationId}/status?status=${status}`)
      fetchApplicants(selectedJob.id)
      fetchJobs()
    } catch (err) { alert('Failed to update status') }
  }

  const handlePostJob = async (e) => {
    e.preventDefault()
    try {
      await API.post('/jobs', {
        ...form,
        salary: parseFloat(form.salary),
        totalSlots: parseInt(form.totalSlots),
      })
      alert('Job posted successfully!')
      setShowForm(false)
      fetchJobs()
    } catch (err) { alert('Failed to post job') }
  }

  const statusColors = {
    PENDING:   'bg-yellow-100 text-yellow-700',
    ACCEPTED:  'bg-green-100 text-green-700',
    REJECTED:  'bg-red-100 text-red-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
  }

  const totalApplicants = jobs.reduce((sum, j) => sum + j.filledSlots, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                🏢
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-purple-200 text-sm">Employer Dashboard</p>
              </div>
            </div>
            <button onClick={() => { setShowForm(!showForm); setActiveTab('jobs') }}
              className="bg-white text-purple-600 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-purple-50 transition">
              {showForm ? '✕ Cancel' : '+ Post Job'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Jobs Posted', value: jobs.length, icon: '📋' },
              { label: 'Active Jobs', value: jobs.filter(j => j.status === 'OPEN').length, icon: '🟢' },
              { label: 'Total Hired', value: totalApplicants, icon: '👥' },
              { label: 'Closed Jobs', value: jobs.filter(j => j.status === 'CLOSED').length, icon: '🔒' },
            ].map(stat => (
              <div key={stat.label} className="bg-white bg-opacity-15 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-purple-200 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Post a New Job</h2>
            <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Job Title', key: 'title', placeholder: 'e.g. Warehouse Scanner' },
                { label: 'Location', key: 'location', placeholder: 'e.g. Bangalore' },
                { label: 'Salary (₹/shift)', key: 'salary', placeholder: '400', type: 'number' },
                { label: 'Total Slots', key: 'totalSlots', placeholder: '5', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input required type={field.type || 'text'}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm({...form, [field.key]: e.target.value})}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.jobType} onChange={e => setForm({...form, jobType: e.target.value})}>
                  {['DELIVERY','AUDIT','SURVEY','EVENT','WAREHOUSE','DATA_ENTRY','SCANNING','TECH','PHYSICAL','OTHER'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.shiftType} onChange={e => setForm({...form, shiftType: e.target.value})}>
                  {['MORNING','EVENING','NIGHT','WEEKEND','FLEXIBLE'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Start</label>
                <input required type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.shiftStartTime}
                  onChange={e => setForm({...form, shiftStartTime: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift End</label>
                <input required type="datetime-local"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.shiftEndTime}
                  onChange={e => setForm({...form, shiftEndTime: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the job responsibilities..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <button type="submit"
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition">
                  Post Job ✓
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: 'jobs', label: '📋 My Jobs' },
            { key: 'applicants', label: `👥 Applicants${selectedJob ? ` — ${selectedJob.title}` : ''}` },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'jobs' && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-gray-400">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-500 mb-4">No jobs posted yet</p>
                <button onClick={() => setShowForm(true)}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition">
                  Post Your First Job
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                          <p className="text-gray-500 text-sm">📍 {job.location}</p>
                          <p className="text-gray-500 text-sm">💰 ₹{job.salary}/shift</p>
                          <p className="text-gray-500 text-sm">👥 {job.filledSlots}/{job.totalSlots} filled</p>
                          <p className="text-gray-500 text-sm">🏷️ {job.jobType}</p>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${(job.filledSlots / job.totalSlots) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {job.totalSlots - job.filledSlots} slots remaining
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 ml-4">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          job.status === 'OPEN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {job.status}
                        </span>
                        <button
                          onClick={() => fetchApplicants(job.id)}
                          className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition">
                          View Applicants
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applicants' && (
          <div>
            {applicants.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">👥</div>
                <p className="text-gray-500">No applicants yet for this job</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map(app => (
                  <div key={app.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-lg font-bold text-indigo-600">
                          {app.worker?.name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.worker?.name}</h3>
                          <p className="text-gray-500 text-sm">{app.worker?.email}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                        {app.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateStatus(app.id, 'ACCEPTED')}
                              className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition">
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'REJECTED')}
                              className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition">
                              ✕ Reject
                            </button>
                          </div>
                        )}
                        {app.status === 'ACCEPTED' && (
                          <button
                            onClick={() => updateStatus(app.id, 'COMPLETED')}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition">
                            🏆 Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}