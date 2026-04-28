'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-6xl mb-5 select-none">🌶️</p>
        <h1 className="font-heading text-2xl font-bold text-masala-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-masala-600 text-sm mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or go back to the store.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-saffron-500 text-white text-sm font-medium rounded-xl hover:bg-saffron-600 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-masala-200 text-masala-700 text-sm font-medium rounded-xl hover:bg-masala-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
