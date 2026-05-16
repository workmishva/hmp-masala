'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { User, Phone, MapPin, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

interface SetupForm {
  firstName: string
  lastName:  string
  phone:     string
  house:     string
  street:    string
  landmark:  string
  city:      string
  district:  string
  state:     string
  pincode:   string
}

const EMPTY: SetupForm = {
  firstName: '', lastName:  '', phone:    '',
  house:     '', street:    '', landmark: '',
  city:      '', district:  '', state:    '', pincode: '',
}

function Field({
  label, required, value, onChange, placeholder, type = 'text', maxLength, readOnly,
}: {
  label: string; required?: boolean; value: string
  onChange?: (v: string) => void; placeholder?: string
  type?: string; maxLength?: number; readOnly?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-masala-700 mb-1.5">
        {label}{required && <span className="text-chili-600 ml-0.5">*</span>}
        {readOnly && <span className="ml-2 text-xs text-masala-400 font-normal">(can&apos;t be changed)</span>}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
          readOnly
            ? 'border-masala-100 bg-masala-50 text-masala-500 cursor-default'
            : 'border-masala-200 bg-white focus:border-chili-600 focus:ring-2 focus:ring-chili-600/15 text-masala-900'
        }`}
      />
    </div>
  )
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 bg-chili-100 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-chili-600" />
      </div>
      <h2 className="font-heading font-semibold text-masala-900 text-sm uppercase tracking-wider">{label}</h2>
    </div>
  )
}

export default function ProfileSetupPage() {
  const router           = useRouter()
  const { data: session } = useSession()
  const [form, setForm]  = useState<SetupForm>(EMPTY)
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const set = (key: keyof SetupForm) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (!res.ok) return
      const { data } = await res.json()
      if (!data) return
      setEmail(data.email ?? '')

      // Pre-split name into first/last if structured fields are empty
      const nameparts = (data.name ?? '').trim().split(/\s+/)
      setForm({
        firstName: data.firstName || nameparts[0] || '',
        lastName:  data.lastName  || nameparts.slice(1).join(' ') || '',
        phone:     data.phone     || '',
        house:     data.house     || '',
        street:    data.street    || '',
        landmark:  data.landmark  || '',
        city:      data.city      || '',
        district:  data.district  || '',
        state:     data.state     || '',
        pincode:   data.pincode   || '',
      })
    } catch {
      // silently ignore — form stays empty
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { loadProfile() }, [loadProfile])

  const validate = (): boolean => {
    const phone = form.phone.trim()

    if (!form.firstName.trim()) { toast.error('First name is required'); return false }
    if (!form.lastName.trim())  { toast.error('Last name is required'); return false }

    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits with no spaces or symbols')
      return false
    }
    if (!/^[6-9]/.test(phone)) {
      toast.error('Enter a valid Indian mobile number (starts with 6–9)')
      return false
    }

    const missing: string[] = []
    if (!form.house.trim())    missing.push('House / Flat')
    if (!form.street.trim())   missing.push('Street')
    if (!form.city.trim())     missing.push('City / Village')
    if (!form.district.trim()) missing.push('District')
    if (!form.state.trim())    missing.push('State')
    if (form.pincode.trim().length < 6) missing.push('6-digit Pincode')
    if (missing.length) {
      toast.error(`Please fill in: ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? ` and ${missing.length - 2} more` : ''}`)
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:        form.firstName.trim(),
          lastName:         form.lastName.trim(),
          phone:            form.phone.trim(),
          house:            form.house.trim(),
          street:           form.street.trim(),
          landmark:         form.landmark.trim(),
          city:             form.city.trim(),
          district:         form.district.trim(),
          state:            form.state.trim(),
          pincode:          form.pincode.trim(),
          profileCompleted: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to save'); return }
      toast.success('Profile saved! Welcome to HMP Masala.')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <div className="h-20 skeleton rounded-2xl" />
        <div className="h-80 skeleton rounded-2xl" />
        <div className="h-80 skeleton rounded-2xl" />
      </div>
    )
  }

  const displayName = session?.user?.name || form.firstName || 'there'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-8"
      >
        <div className="text-5xl mb-3 select-none">🌶️</div>
        <h1 className="font-heading text-2xl font-bold text-masala-900">
          Welcome, {displayName.split(' ')[0]}!
        </h1>
        <p className="mt-2 text-sm text-masala-500 leading-relaxed max-w-sm mx-auto">
          Complete your profile so we can prefill your details at checkout and deliver your masalas faster.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5"
      >

        {/* Section 1 — Personal Details */}
        <div className="bg-white rounded-2xl border border-masala-200 shadow-card p-6">
          <SectionTitle icon={User} label="Personal Details" />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" required value={form.firstName} onChange={set('firstName')} placeholder="Enter first name" />
              <Field label="Last Name / Surname" required value={form.lastName} onChange={set('lastName')} placeholder="Enter last name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-masala-700 mb-1.5">
                Email <span className="ml-2 text-xs text-masala-400 font-normal">(can&apos;t be changed)</span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-masala-100 bg-masala-50 text-masala-500 text-sm cursor-default outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-masala-700 mb-1.5">
                Mobile Number<span className="text-chili-600 ml-0.5">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-masala-200 bg-masala-50 text-masala-600 text-sm font-medium shrink-0">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-masala-400" />
                  +91
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone')(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 rounded-r-xl border border-masala-200 bg-white focus:border-chili-600 focus:ring-2 focus:ring-chili-600/15 text-masala-900 text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 — Delivery Address */}
        <div className="bg-white rounded-2xl border border-masala-200 shadow-card p-6">
          <SectionTitle icon={MapPin} label="Delivery Address" />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="House / Flat / Society" required value={form.house} onChange={set('house')} placeholder="e.g. Flat 4B, Rose Apartments" />
              <Field label="Street / Road / Colony" required value={form.street} onChange={set('street')} placeholder="e.g. MG Road" />
            </div>

            <Field label="Landmark (optional)" value={form.landmark} onChange={set('landmark')} placeholder="Near temple, school, hospital..." />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City / Village" required value={form.city} onChange={set('city')} placeholder="City or village name" />
              <Field label="District" required value={form.district} onChange={set('district')} placeholder="District name" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="State" required value={form.state} onChange={set('state')} placeholder="State" />
              <Field
                label="Pincode" required value={form.pincode}
                onChange={(v) => set('pincode')(v.replace(/\D/g, ''))}
                placeholder="6-digit pincode" maxLength={6}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={handleSave} loading={saving} size="lg" className="w-full sm:w-auto gap-2">
            <CheckCircle className="w-4 h-4" />
            Save & Continue
          </Button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-sm text-masala-400 hover:text-masala-600 transition-colors py-2"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  )
}
