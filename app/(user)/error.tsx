'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-6xl mb-5 select-none">⚠️</p>
        <h1 className="font-heading text-2xl font-bold text-masala-900 mb-2">
          Oops, something went wrong
        </h1>
        <p className="text-masala-600 text-sm mb-8 leading-relaxed">
          We hit an unexpected error. Try again or return to the store.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-saffron-500 text-white text-sm font-medium rounded-xl hover:bg-saffron-600 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 border border-masala-200 text-masala-700 text-sm font-medium rounded-xl hover:bg-masala-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
