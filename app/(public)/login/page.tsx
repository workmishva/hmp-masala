import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Login — HMP Masala' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-saffron-500/10 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-saffron-600/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-chili-600/5 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<div className="h-96 skeleton rounded-3xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
