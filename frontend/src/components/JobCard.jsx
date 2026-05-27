import { useState } from 'react'
import API from '../api'

export default function JobCard({ job, onApply, user }) {
  const [showReport, setShowReport] = useState(false)
  const [reportForm, setReportForm] = useState({
    reason: '', description: '', type: 'FAKE_JOB'
  })
  const [reportSent, setReportSent] = useState(false)

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

  const handleReport = async () => {
    if (!user) { alert('Login to report a job'); return }
    try {
      await API.post('/scam-shield/report', {
        reporterId: String(user.id),
        jobId: String(job.id),
        reason: reportForm.reason,
        description: reportForm.description,
        type: reportForm.type
      })
      setReportSent(true)
      setShowReport(false)
      alert('Report submitted! Our team will review it.')
    } catch (err) {
      alert('Failed to submit report')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition relative">

      {/* Verified Badge */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{typeIcons[job.jobType] || '💼'}</span>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${shiftColors[job.shiftType]}`}>
            {job.shiftType}
          </span>
          {job.employer?.employerVerified ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              ✓ Verified
            </span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
              ⚠️ Unverified
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-lg mb-1">
        {job.title}
      </h3>
      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
        {job.description}
      </p>

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
          {job.employer?.employerVerified && (
            <span className="text-green-600 text-xs">✓</span>
          )}
        </div>
      </div>

      {/* Unverified Warning */}
      {!job.employer?.employerVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
          <p className="text-yellow-700 text-xs font-medium">
            ⚠️ This employer is not verified yet.
            Proceed with caution.
          </p>
        </div>
      )}

      {/* Slots progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div
          className="bg-indigo-500 h-1.5 rounded-full"
          style={{ width: `${(job.filledSlots / job.totalSlots) * 100}%` }}
        />
      </div>

      {/* Apply Button */}
      {user?.role === 'WORKER' && (
        <button
          onClick={() => onApply(job.id)}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition text-sm mb-2">
          Apply Now
        </button>
      )}

      {!user && (
        <button
          onClick={() => onApply(job.id)}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition text-sm mb-2">
          Login to Apply
        </button>
      )}

      {/* Report Scam Button */}
      {user && !reportSent && (
        <button
          onClick={() => setShowReport(!showReport)}
          className="w-full text-red-500 text-xs py-1.5 hover:bg-red-50 rounded-xl transition">
          🚨 Report this job
        </button>
      )}

      {reportSent && (
        <p className="text-center text-xs text-green-600 py-1">
          ✓ Report submitted
        </p>
      )}

      {/* Report Form */}
      {showReport && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-medium text-red-700 text-sm mb-3">
            🚨 Report Scam Job
          </h4>

          <select
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-2 bg-white"
            value={reportForm.type}
            onChange={e => setReportForm({
              ...reportForm, type: e.target.value
            })}>
            <option value="FAKE_JOB">Fake Job</option>
            <option value="MONEY_REQUIRED">Asking for Money</option>
            <option value="FAKE_EMPLOYER">Fake Employer</option>
            <option value="PAYMENT_FRAUD">Payment Fraud</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="text"
            placeholder="Brief reason..."
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-2"
            value={reportForm.reason}
            onChange={e => setReportForm({
              ...reportForm, reason: e.target.value
            })}
          />

          <textarea
            placeholder="Describe what happened..."
            rows={2}
            className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm mb-3"
            value={reportForm.description}
            onChange={e => setReportForm({
              ...reportForm, description: e.target.value
            })}
          />

          <div className="flex gap-2">
            <button
              onClick={handleReport}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition">
              Submit Report
            </button>
            <button
              onClick={() => setShowReport(false)}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}