'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton'

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
      router.push('/profile/setup')
      router.refresh()
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="rounded-3xl border border-masala-200/80 bg-white dark:bg-masala-100 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-chili-500 to-chili-700 shadow-lg shadow-chili-600/25"
          >
            <UserPlus size={28} className="text-white" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-masala-900">Create Account</h1>
          <p className="mt-2 text-sm text-masala-600 leading-relaxed">
            Join the HMP Masala family — pure spices delivered to your door.
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-masala-800 mb-2">
                Full Name <span className="text-chili-600" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-masala-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-masala-200 bg-masala-50 pl-11 pr-4 py-3.5 text-sm text-masala-900 placeholder:text-masala-400 focus:border-chili-600 focus:ring-2 focus:ring-chili-600/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-masala-800 mb-2">
                Email Address <span className="text-chili-600" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-masala-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-masala-200 bg-masala-50 pl-11 pr-4 py-3.5 text-sm text-masala-900 placeholder:text-masala-400 focus:border-chili-600 focus:ring-2 focus:ring-chili-600/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-masala-800 mb-2">
                Phone Number <span className="text-chili-600" aria-hidden="true">*</span>
              </label>
              <div className="flex">
                <span className="flex items-center justify-center rounded-l-xl border border-r-0 border-masala-200 bg-masala-100 px-4 text-sm font-semibold text-masala-600 shrink-0">
                  <Phone size={16} className="mr-1.5 text-masala-400" />
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  autoComplete="tel"
                  className="w-full rounded-r-xl border border-masala-200 bg-masala-50 px-4 py-3.5 text-sm text-masala-900 placeholder:text-masala-400 focus:border-chili-600 focus:ring-2 focus:ring-chili-600/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-masala-800 mb-2">
                Password <span className="text-chili-600" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-masala-400" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-masala-200 bg-masala-50 pl-11 pr-12 py-3.5 text-sm text-masala-900 placeholder:text-masala-400 focus:border-chili-600 focus:ring-2 focus:ring-chili-600/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600 transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim() || !phone.trim() || password.length < 6}
              className="group mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-chili-500 to-chili-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-chili-600/25 hover:shadow-xl hover:shadow-chili-600/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-masala-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-masala-100 px-3 text-xs font-medium text-masala-400 uppercase tracking-wider">
                or sign up with
              </span>
            </div>
          </div>

          <GoogleSignInButton label="Sign up with Google" />
        </div>

        {/* Footer */}
        <div className="border-t border-masala-200 px-8 py-5 text-center space-y-2">
          <p className="text-sm text-masala-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-saffron-600 hover:text-saffron-700 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
          <p className="text-xs text-masala-500">
            By continuing, you agree to our{' '}
            <span className="font-medium text-masala-700 cursor-pointer hover:underline">Terms</span>
            {' & '}
            <span className="font-medium text-masala-700 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
