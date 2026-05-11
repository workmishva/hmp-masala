'use client'

import { useEffect } from 'react'

export default function AdminError({
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
    <div className="flex flex-col items-center justify-center min-h-100 text-center px-6">
      <p className="text-5xl mb-4 select-none">⚠️</p>
      <h2 className="font-heading text-xl font-bold text-masala-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-masala-500 text-sm mb-6">
        An error occurred while loading this page.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-chili-600 text-white text-sm font-medium rounded-xl hover:bg-chili-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
