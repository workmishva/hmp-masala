'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export function NewsletterForm() {
  const [email, setEmail]         = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 700))
    toast.success('Subscribed! Thanks for joining.')
    setEmail('')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="bg-masala-800 border border-masala-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 placeholder:text-masala-500 transition-colors"
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-chili-600 hover:bg-chili-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Subscribing…
          </>
        ) : 'Subscribe'}
      </button>
    </form>
  )
}
