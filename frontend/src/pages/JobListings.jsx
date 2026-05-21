import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'
import JobCard from '../components/JobCard'

export default function JobListings() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await API.get('/jobs')
      setJobs(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleApply = async (jobId) => {
    if (!user) { navigate('/login'); return }
    try {
      await API.post(`/jobs/${jobId}/apply`)
      alert('Applied successfully!')
    } catch (err) {
      alert(err.response?.data || 'Already applied!')
    }
  }

  const filtered = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-indigo-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Find Your Next Shift</h1>
        <p className="text-indigo-200 mb-8 text-lg">
          Flexible jobs for students and part-time workers
        </p>
        <input
          type="text"
          placeholder="Search by job title or location..."
          className="w-full max-w-xl px-5 py-3 rounded-xl text-gray-800 focus:outline-none shadow-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Jobs Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {filtered.length} jobs available
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading jobs...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No jobs found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}