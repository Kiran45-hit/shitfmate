import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api'

export default function Payment({ jobId, jobTitle, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  const navigate = useNavigate()

  const createOrder = async () => {
    setLoading(true)
    try {
      const res = await API.post(`/payments/create-order/${jobId}`)
      setOrderDetails(res.data)
      openRazorpay(res.data)
    } catch (err) {
      alert('Failed to create payment order')
    }
    setLoading(false)
  }

  const openRazorpay = (order) => {
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'ShiftMate',
      description: `Payment for ${order.jobTitle}`,
      order_id: order.orderId,
      handler: async (response) => {
        try {
          await API.post('/payments/verify', {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
          })
          alert('Payment successful! Job is now live.')
          if (onSuccess) onSuccess()
        } catch (err) {
          alert('Payment verification failed')
        }
      },
      prefill: {
        name: 'Employer',
        email: JSON.parse(localStorage.getItem('user'))?.email,
      },
      theme: { color: '#4F46E5' }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        💳 Pay to Activate Job
      </h3>

      {orderDetails && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-medium">₹{orderDetails.totalAmount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Platform Fee (10%)</span>
            <span className="text-red-500">-₹{orderDetails.platformFee}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-gray-500">Workers Get</span>
            <span className="text-green-600 font-medium">
              ₹{orderDetails.workerAmount}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={createOrder}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : '💳 Pay with Razorpay'}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Secured by Razorpay • Money held in escrow until job completion
      </p>
    </div>
  )
}