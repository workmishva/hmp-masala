import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Leaf } from 'lucide-react'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Login — HMP Masala' }

export default function LoginPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf className="w-6 h-6 text-saffron-500" />
            <span className="font-brand text-2xl font-bold text-saffron-600">HMP Masala</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-masala-900">Welcome back</h1>
          <p className="text-masala-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <Suspense fallback={<div className="h-64 skeleton rounded-3xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
