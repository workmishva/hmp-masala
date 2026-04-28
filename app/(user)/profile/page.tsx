'use client'

import { useEffect, useState } from 'react'
import { User, Lock, MapPin, Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

interface Profile {
  name: string
  email: string
  phone: string
  address?: string
}

export default function ProfilePage() {
  const [profile, setProfile]         = useState<Profile | null>(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)

  const [name, setName]               = useState('')
  const [phone, setPhone]             = useState('')
  const [address, setAddress]         = useState('')

  const [currentPwd, setCurrentPwd]   = useState('')
  const [newPwd, setNewPwd]           = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [savingPwd, setSavingPwd]     = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setProfile(data)
          setName(data.name ?? '')
          setPhone(data.phone ?? '')
          setAddress(data.address ?? '')
        }
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), phone: phone.trim(), address: address.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to save'); return }
      toast.success('Profile updated!')
      setProfile((p) => p ? { ...p, name, phone, address } : p)
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) { toast.error('Passwords do not match'); return }
    if (newPwd.length < 8)     { toast.error('Password must be at least 8 characters'); return }
    setSavingPwd(true)
    try {
      const res = await fetch('/api/user/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to change password'); return }
      toast.success('Password changed!')
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch {
      toast.error('Failed to change password')
    } finally {
      setSavingPwd(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="h-9 w-40 skeleton rounded-xl mb-8" />
        <div className="space-y-6">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-48 skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-masala-900 mb-8">My Profile</h1>

      {/* Profile info */}
      <div className="bg-white border border-masala-200 rounded-2xl p-6 shadow-card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-saffron-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-saffron-600" />
          </div>
          <h2 className="font-heading font-semibold text-masala-900">Personal Info</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 border border-masala-200 rounded-xl text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">Email</label>
            <input
              type="email"
              value={profile?.email ?? ''}
              disabled
              className="w-full h-11 px-4 border border-masala-200 rounded-xl text-masala-400 text-sm bg-masala-50 cursor-not-allowed"
            />
            <p className="text-xs text-masala-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-4 border border-masala-200 rounded-xl text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">
              <MapPin className="w-3.5 h-3.5 inline-block mr-1" />
              Default Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Your default delivery address..."
              className="w-full px-4 py-3 border border-masala-200 rounded-xl text-masala-900 text-sm placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 resize-none leading-relaxed"
            />
          </div>

          <Button onClick={handleSaveProfile} loading={saving} className="gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-masala-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-masala-100 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-masala-600" />
          </div>
          <h2 className="font-heading font-semibold text-masala-900">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
                className="w-full h-11 px-4 pr-11 border border-masala-200 rounded-xl text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} aria-label={showCurrent ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                autoComplete="new-password"
                className="w-full h-11 px-4 pr-11 border border-masala-200 rounded-xl text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} aria-label={showNew ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
                className="w-full h-11 px-4 pr-11 border border-masala-200 rounded-xl text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400"
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? 'Hide' : 'Show'} className="absolute right-3 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            loading={savingPwd}
            variant="secondary"
            disabled={!currentPwd || !newPwd || !confirmPwd}
            className="gap-2"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
        </div>
      </div>
    </div>
  )
}
