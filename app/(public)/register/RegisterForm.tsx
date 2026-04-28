'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

export function RegisterForm() {
  const router = useRouter()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !password) return

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     name.trim(),
          email:    email.trim().toLowerCase(),
          phone:    phone.trim(),
          password,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Registration failed')
        return
      }

      const result = await signIn('credentials', {
        email:    email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.success('Account created! Please sign in.')
        router.push('/login')
        return
      }

      toast.success('Welcome to HMP Masala!')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-3xl border border-masala-200 shadow-card p-8">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-masala-700 mb-1.5">
              Full name <span className="text-chili-600" aria-hidden="true">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              autoComplete="name"
              className="w-full h-11 px-4 border border-masala-200 rounded-xl text-masala-900 text-sm placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:border-saffron-500"
            />
          </div>

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
            <label htmlFor="phone" className="block text-sm font-medium text-masala-700 mb-1.5">
              Phone number <span className="text-chili-600" aria-hidden="true">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
              autoComplete="tel"
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
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
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
            disabled={!name.trim() || !email.trim() || !phone.trim() || password.length < 6}
            size="lg"
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-masala-600 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-saffron-600 font-medium hover:text-saffron-700">
          Sign in
        </Link>
      </p>
    </>
  )
}
