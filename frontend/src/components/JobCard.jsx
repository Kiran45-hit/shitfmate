export default function JobCard({ job, onApply, user }) {
  const shiftColors = {
    MORNING: 'bg-yellow-100 text-yellow-700',
    EVENING: 'bg-orange-100 text-orange-700',
    NIGHT: 'bg-purple-100 text-purple-700',
    WEEKEND: 'bg-green-100 text-green-700',
    FLEXIBLE: 'bg-blue-100 text-blue-700',
  }

  const typeIcons = {
    DELIVERY: '🚚', AUDIT: '📋', SURVEY: '📊',
    EVENT: '🎪', WAREHOUSE: '🏭', DATA_ENTRY: '💻',
    SCANNING: '📱', TECH: '⚙️', PHYSICAL: '💪', OTHER: '💼'
  }

  const slotsLeft = job.totalSlots - job.filledSlots

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{typeIcons[job.jobType] || '💼'}</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${shiftColors[job.shiftType]}`}>
          {job.shiftType}
        </span>
      </div>

      <h3 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h3>
      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{job.description}</p>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📍</span> {job.location}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>💰</span> ₹{job.salary}/shift
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>👥</span> {slotsLeft} slots left of {job.totalSlots}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🏢</span> {job.employer?.name}
        </div>
      </div>

      {/* Slots bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div
          className="bg-indigo-500 h-1.5 rounded-full"
          style={{ width: `${(job.filledSlots / job.totalSlots) * 100}%` }}
        />
      </div>

      {user?.role === 'WORKER' && (
        <button
          onClick={() => onApply(job.id)}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition text-sm"
        >
          Apply Now
        </button>
      )}

      {!user && (
        <button
          onClick={() => onApply(job.id)}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition text-sm"
        >
          Login to Apply
        </button>
      )}

      {user?.role === 'EMPLOYER' && (
        <div className="text-center text-sm text-gray-400 py-2">
          Employer view
        </div>
      )}
    </div>
  )
}