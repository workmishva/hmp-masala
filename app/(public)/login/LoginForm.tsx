'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const callbackUrl   = searchParams.get('callbackUrl') ?? '/'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    const result = await signIn('credentials', {
      email:    email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (result?.error) {
      toast.error('Invalid email or password')
      setLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-masala-200 shadow-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-masala-700 mb-1.5">
              Email address <span className="text-chili-600" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full h-11 px-4 border border-masala-200 rounded-xl text-masala-900 text-sm placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-saffron-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-masala-700 mb-1.5">
              Password <span className="text-chili-600" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="w-full h-11 px-4 pr-11 border border-masala-200 rounded-xl text-masala-900 text-sm placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-saffron-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600 transition-colors"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!email.trim() || !password}
            size="lg"
            className="w-full mt-2"
          >
            Sign In
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-masala-600 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-saffron-600 font-medium hover:text-saffron-700">
          Create one
        </Link>
      </p>
    </>
  )
}
