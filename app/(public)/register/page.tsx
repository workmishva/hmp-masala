import type { Metadata } from 'next'
import { Leaf } from 'lucide-react'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Create Account — HMP Masala' }

export default function RegisterPage() {
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Leaf className="w-6 h-6 text-saffron-500" />
            <span className="font-brand text-2xl font-bold text-saffron-600">HMP Masala</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-masala-900">Create account</h1>
          <p className="text-masala-500 text-sm mt-1">Join the HMP Masala family</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  )
}
