'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Lock, LogOut, Edit3, Save, X, Eye, EyeOff,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Profile {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  role: string
}

interface EditForm {
  name: string
  phone: string
  address: string
}

export default function ProfilePage() {
  const { update: updateSession } = useSession()
  const router = useRouter()

  const [profile, setProfile]       = useState<Profile | null>(null)
  const [loading, setLoading]       = useState(true)
  const [isEditing, setIsEditing]   = useState(false)
  const [editForm, setEditForm]     = useState<EditForm>({ name: '', phone: '', address: '' })
  const [saving, setSaving]         = useState(false)

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
      .then(({ data }) => { if (data) setProfile(data) })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleEditStart = () => {
    setEditForm({
      name:    profile?.name    ?? '',
      phone:   profile?.phone   ?? '',
      address: profile?.address ?? '',
    })
    setIsEditing(true)
  }

  const handleCancel = () => setIsEditing(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:    editForm.name.trim(),
          phone:   editForm.phone.trim(),
          address: editForm.address.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to save'); return }
      setProfile(json.data)
      setIsEditing(false)
      toast.success('Profile updated!')
      await updateSession({ name: json.data.name })
      router.refresh()
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
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to change password'); return }
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

  const avatarLetter = (profile?.name || 'U')[0].toUpperCase()

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <div className="h-40 bg-masala-100 rounded-2xl animate-pulse" />
        <div className="h-56 bg-masala-100 rounded-2xl animate-pulse" />
        <div className="h-56 bg-masala-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

      {/* ── Header Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-masala-200 bg-white shadow-card overflow-hidden"
      >
        {/* Banner */}
        <div className="h-14 bg-linear-to-r from-saffron-500 via-saffron-600 to-masala-900 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)' }}
          />
        </div>

        <div className="px-5 py-5">
          {/* Avatar row */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-saffron-500 to-saffron-600 border-4 border-white shadow-md text-xl font-black text-white">
              {avatarLetter}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {!isEditing ? (
                <button
                  onClick={handleEditStart}
                  className="flex items-center gap-1.5 rounded-lg bg-masala-100 px-3 py-1.5 text-xs font-semibold text-masala-700 hover:bg-masala-200 transition-all"
                >
                  <Edit3 size={12} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 rounded-lg bg-masala-100 px-3 py-1.5 text-xs font-semibold text-masala-600 hover:bg-masala-200 transition-all"
                  >
                    <X size={12} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-linear-to-r from-saffron-500 to-saffron-600 px-3 py-1.5 text-xs font-bold text-white hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {saving
                      ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : <Save size={12} />}
                    Save
                  </button>
                </>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 rounded-lg bg-chili-100 px-3 py-1.5 text-xs font-semibold text-chili-600 hover:bg-chili-100/80 transition-all"
              >
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          </div>

          {/* Name & info — view vs edit */}
          <AnimatePresence mode="wait" initial={false}>
            {isEditing ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-masala-200 bg-masala-50 px-4 py-2.5 text-base font-bold text-masala-900 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-400/30 outline-none transition-all"
                />
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-masala-200 bg-masala-50 px-4 py-2.5 text-sm font-semibold text-masala-900 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-400/30 outline-none transition-all"
                />
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Delivery address..."
                  rows={3}
                  className="w-full rounded-xl border border-masala-200 bg-masala-50 px-4 py-2.5 text-sm text-masala-900 placeholder:text-masala-400 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-400/30 outline-none transition-all resize-none leading-relaxed"
                />
              </motion.div>
            ) : (
              <motion.div
                key="view-info"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <h2 className="text-2xl font-black text-masala-900">{profile?.name || 'User'}</h2>
                <div className="mt-2 flex flex-wrap gap-3">
                  {profile?.email && (
                    <span className="flex items-center gap-1.5 text-sm text-masala-500">
                      <Mail size={14} className="text-saffron-500" />
                      {profile.email}
                    </span>
                  )}
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5 text-sm text-masala-500">
                      <Phone size={14} className="text-saffron-500" />
                      {profile.phone}
                    </span>
                  )}
                  {profile?.address && (
                    <span className="flex items-center gap-1.5 text-sm text-masala-500">
                      <MapPin size={14} className="text-saffron-500" />
                      {profile.address}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Info rows (view mode only) ── */}
      <AnimatePresence>
        {!isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-masala-200 bg-white shadow-card overflow-hidden"
          >
            <div className="p-5 space-y-0 divide-y divide-masala-100">
              {[
                { label: 'Full Name',    value: profile?.name,    icon: User    },
                { label: 'Email',        value: profile?.email,   icon: Mail    },
                { label: 'Phone',        value: profile?.phone,   icon: Phone   },
                { label: 'Address',      value: profile?.address, icon: MapPin  },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chili-100">
                    <Icon size={16} className="text-chili-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-masala-400">{label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-masala-800 wrap-break-word">{value || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Change Password ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-masala-200 bg-white shadow-card p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-masala-100 rounded-xl flex items-center justify-center">
            <Lock className="w-4 h-4 text-masala-600" />
          </div>
          <h2 className="font-heading font-semibold text-masala-900">Change Password</h2>
        </div>

        <div className="space-y-4">
          {[
            { label: 'Current Password', val: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent((v) => !v), auto: 'current-password' },
            { label: 'New Password',     val: newPwd,     set: setNewPwd,     show: showNew,     toggle: () => setShowNew((v) => !v),     auto: 'new-password'     },
            { label: 'Confirm Password', val: confirmPwd, set: setConfirmPwd, show: showConfirm, toggle: () => setShowConfirm((v) => !v), auto: 'new-password'     },
          ].map(({ label, val, set, show, toggle, auto }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-masala-700 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  autoComplete={auto}
                  className="w-full h-11 px-4 pr-11 border border-masala-200 rounded-xl text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 transition-all"
                />
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleChangePassword}
            disabled={savingPwd || !currentPwd || !newPwd || !confirmPwd}
            className="flex items-center gap-2 h-10 px-5 bg-masala-900 hover:bg-masala-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {savingPwd
              ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              : <Lock className="w-4 h-4" />}
            Change Password
          </button>
        </div>
      </motion.div>

    </div>
  )
}
