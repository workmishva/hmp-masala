'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Lock, LogOut, Edit3, Save, X, Eye, EyeOff, AlertCircle,
  Star, MessageSquare, Trash2, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Profile {
  _id:     string
  name:    string
  email:   string
  phone:   string
  role:    string
  // Structured
  firstName: string
  lastName:  string
  house:     string
  street:    string
  landmark:  string
  city:      string
  district:  string
  state:     string
  pincode:   string
  profileCompleted: boolean
}

interface EditForm {
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

interface UserReview {
  _id:          string
  productId:    string
  productName:  string
  productImage: string | null
  orderId:      string
  rating:       number
  title:        string
  comment:      string
  isHidden:     boolean
  createdAt:    string
}

function formatDeliveryAddress(p: Profile): string {
  const parts = [p.house, p.street, p.landmark, p.city, p.district, p.state].filter(Boolean)
  if (!parts.length) return ''
  return parts.join(', ') + (p.pincode ? ` – ${p.pincode}` : '')
}

function InputField({
  label, value, onChange, placeholder, type = 'text', maxLength, required,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; maxLength?: number; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-masala-400 mb-1.5">
        {label}{required && <span className="text-chili-600 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full h-10 px-3.5 border border-masala-200 rounded-xl text-sm text-masala-900 bg-white focus:outline-none focus:border-chili-600 focus:ring-2 focus:ring-chili-600/15 transition-all"
      />
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()

  const [profile, setProfile]       = useState<Profile | null>(null)
  const [fetchError, setFetchError] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [isEditing, setIsEditing]   = useState(false)
  const [editForm, setEditForm]     = useState<EditForm>({
    firstName: '', lastName: '', phone: '',
    house: '', street: '', landmark: '',
    city: '', district: '', state: '', pincode: '',
  })
  const [saving, setSaving]  = useState(false)

  const [currentPwd, setCurrentPwd]   = useState('')
  const [newPwd, setNewPwd]           = useState('')
  const [confirmPwd, setConfirmPwd]   = useState('')
  const [savingPwd, setSavingPwd]     = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [myReviews,        setMyReviews]        = useState<UserReview[]>([])
  const [reviewsLoading,   setReviewsLoading]   = useState(true)
  const [confirmDeleteId,  setConfirmDeleteId]  = useState<string | null>(null)
  const [deletingId,       setDeletingId]       = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`)
        return r.json()
      })
      .then(({ data }) => { if (data) setProfile(data) })
      .catch(() => { setFetchError(true); toast.error('Failed to load profile') })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/user/reviews')
      .then((r) => r.json())
      .then(({ data }) => { if (Array.isArray(data)) setMyReviews(data) })
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [])

  const handleDeleteReview = async (id: string) => {
    setDeletingId(id)
    try {
      const res  = await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to delete'); return }
      setMyReviews((prev) => prev.filter((r) => r._id !== id))
      setConfirmDeleteId(null)
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeletingId(null)
    }
  }

  const set = (key: keyof EditForm) => (v: string) => setEditForm((f) => ({ ...f, [key]: v }))

  const handleEditStart = () => {
    if (fetchError) {
      toast.error('Profile could not be loaded. Please refresh the page.')
      return
    }
    // Derive first/last name from session if profile hasn't loaded yet
    const sessionNameParts = session?.user?.name?.split(' ') ?? []
    setEditForm({
      firstName: profile?.firstName || sessionNameParts[0] || '',
      lastName:  profile?.lastName  || sessionNameParts.slice(1).join(' ') || '',
      phone:     profile?.phone     || '',
      house:     profile?.house     || '',
      street:    profile?.street    || '',
      landmark:  profile?.landmark  || '',
      city:      profile?.city      || '',
      district:  profile?.district  || '',
      state:     profile?.state     || '',
      pincode:   profile?.pincode   || '',
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error('First name and last name are required'); return
    }
    const phone = editForm.phone.trim()
    if (!/^\d{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits with no spaces or symbols'); return
    }
    if (!/^[6-9]/.test(phone)) {
      toast.error('Enter a valid Indian mobile number (starts with 6–9)'); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:        editForm.firstName.trim(),
          lastName:         editForm.lastName.trim(),
          phone:            editForm.phone.trim(),
          house:            editForm.house.trim(),
          street:           editForm.street.trim(),
          landmark:         editForm.landmark.trim(),
          city:             editForm.city.trim(),
          district:         editForm.district.trim(),
          state:            editForm.state.trim(),
          pincode:          editForm.pincode.trim(),
          profileCompleted: true,
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
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to change password'); return }
      toast.success('Password changed!')
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
    } catch {
      toast.error('Failed to change password')
    } finally {
      setSavingPwd(false)
    }
  }

  const avatarLetter  = (profile?.firstName || profile?.name || session?.user?.name || 'U')[0].toUpperCase()
  const displayName   = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || profile?.name || session?.user?.name || ''
  const deliveryAddr  = profile ? formatDeliveryAddress(profile) : ''
  const isIncomplete  = profile && !profile.profileCompleted

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

      {/* Incomplete profile banner */}
      {isIncomplete && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-saffron-50 border border-saffron-200 rounded-2xl px-4 py-3"
        >
          <AlertCircle className="w-4 h-4 text-saffron-600 shrink-0 mt-0.5" />
          <p className="text-sm text-masala-700">
            Your delivery address isn&apos;t saved yet.{' '}
            <Link href="/profile/setup" className="font-semibold text-chili-600 hover:underline">
              Complete your profile
            </Link>
            {' '}for faster checkout.
          </p>
        </motion.div>
      )}

      {/* ── Header Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-masala-200 bg-white shadow-card overflow-hidden"
      >
        {/* Banner */}
        <div className="h-14 bg-gradient-to-r from-saffron-500 via-saffron-600 to-masala-900 relative">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)' }}
          />
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 border-4 border-white shadow-md text-xl font-black text-white shrink-0">
              {avatarLetter}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {!isEditing ? (
                <button onClick={handleEditStart}
                  className="flex items-center gap-1.5 rounded-lg bg-masala-100 px-3 py-1.5 text-xs font-semibold text-masala-700 hover:bg-masala-200 transition-all">
                  <Edit3 size={12} /> Edit Profile
                </button>
              ) : (
                <>
                  <button onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 rounded-lg bg-masala-100 px-3 py-1.5 text-xs font-semibold text-masala-600 hover:bg-masala-200 transition-all">
                    <X size={12} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-saffron-500 to-saffron-600 px-3 py-1.5 text-xs font-bold text-white hover:shadow-md transition-all disabled:opacity-50">
                    {saving
                      ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : <Save size={12} />}
                    Save
                  </button>
                </>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 rounded-lg bg-chili-100 px-3 py-1.5 text-xs font-semibold text-chili-600 hover:bg-chili-100/80 transition-all">
                <LogOut size={12} /> Sign Out
              </button>
            </div>
          </div>

          {/* Name & role */}
          <h2 className="text-xl font-black text-masala-900">{displayName}</h2>
          <div className="mt-1 flex flex-wrap gap-2">
            {profile?.email && (
              <span className="flex items-center gap-1.5 text-xs text-masala-500">
                <Mail size={12} className="text-saffron-500" />{profile.email}
              </span>
            )}
            {profile?.phone && (
              <span className="flex items-center gap-1.5 text-xs text-masala-500">
                <Phone size={12} className="text-saffron-500" />+91 {profile.phone}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Details: view or edit ── */}
      <AnimatePresence mode="wait" initial={false}>
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-masala-200 bg-white shadow-card p-5 space-y-5"
          >
            {/* Personal */}
            <div>
              <p className="text-xs font-bold text-masala-400 uppercase tracking-wider mb-3">Personal Details</p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="First Name" required value={editForm.firstName} onChange={set('firstName')} placeholder="First name" />
                  <InputField label="Last Name" required value={editForm.lastName} onChange={set('lastName')} placeholder="Last name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-masala-400 mb-1.5">
                    Mobile<span className="text-chili-600 ml-0.5">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-masala-200 bg-masala-50 text-masala-500 text-xs font-medium shrink-0">+91</span>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => set('phone')(e.target.value.replace(/\D/g, ''))}
                      maxLength={10}
                      placeholder="10-digit number"
                      className="flex-1 h-10 px-3.5 border border-masala-200 rounded-r-xl text-sm text-masala-900 bg-white focus:outline-none focus:border-chili-600 focus:ring-2 focus:ring-chili-600/15 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-xs font-bold text-masala-400 uppercase tracking-wider mb-3">Delivery Address</p>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="House / Flat" value={editForm.house} onChange={set('house')} placeholder="House No. / Flat / Society" />
                  <InputField label="Street / Road" value={editForm.street} onChange={set('street')} placeholder="Street / Road / Colony" />
                </div>
                <InputField label="Landmark (optional)" value={editForm.landmark} onChange={set('landmark')} placeholder="Near temple, school..." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="City / Village" value={editForm.city} onChange={set('city')} placeholder="City or village" />
                  <InputField label="District" value={editForm.district} onChange={set('district')} placeholder="District" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InputField label="State" value={editForm.state} onChange={set('state')} placeholder="State" />
                  <InputField
                    label="Pincode" value={editForm.pincode}
                    onChange={(v) => set('pincode')(v.replace(/\D/g, ''))}
                    placeholder="6-digit pincode" maxLength={6}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-masala-200 bg-white shadow-card overflow-hidden"
          >
            <div className="p-5 space-y-0 divide-y divide-masala-100">
              {[
                { label: 'Full Name',         value: displayName,    icon: User    },
                { label: 'Email',             value: profile?.email, icon: Mail    },
                { label: 'Phone',             value: profile?.phone ? `+91 ${profile.phone}` : '', icon: Phone },
                { label: 'Delivery Address',  value: deliveryAddr,   icon: MapPin  },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-chili-100 mt-0.5">
                    <Icon size={15} className="text-chili-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-masala-400">{label}</p>
                    {value ? (
                      <p className="mt-0.5 text-sm font-semibold text-masala-800 wrap-break-word">{value}</p>
                    ) : (
                      <p className="mt-0.5 text-sm text-masala-400 italic">
                        {label === 'Delivery Address'
                          ? <><Link href="/profile/setup" className="text-chili-600 hover:underline font-medium not-italic">Add address</Link> for faster checkout</>
                          : '—'
                        }
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── My Reviews ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-masala-200 bg-white shadow-card p-5"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-saffron-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-saffron-600" />
          </div>
          <h2 className="font-heading font-semibold text-masala-900">My Reviews</h2>
          {!reviewsLoading && myReviews.length > 0 && (
            <span className="ml-auto text-xs text-masala-400">{myReviews.length} review{myReviews.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {reviewsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-masala-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : myReviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={18} className="text-masala-200 mx-0.5" />
              ))}
            </div>
            <p className="text-sm text-masala-400">No reviews submitted yet.</p>
            <Link href="/products" className="mt-2 inline-block text-sm text-chili-600 hover:underline font-medium">
              Browse products to review
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myReviews.map((review) => (
              <div
                key={review._id}
                className={`rounded-xl border p-4 ${
                  review.isHidden ? 'border-masala-200 bg-masala-50/60' : 'border-masala-100'
                }`}
              >
                {/* Product + actions row */}
                <div className="flex items-start gap-3 mb-2">
                  {review.productImage ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-masala-100 shrink-0">
                      <Image src={review.productImage} alt={review.productName} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-masala-100 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${review.productId}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-masala-900 hover:text-chili-600 transition-colors truncate max-w-full"
                    >
                      {review.productName}
                      <ExternalLink className="w-3 h-3 shrink-0 text-masala-400" />
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={11}
                            className={n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-masala-200'} />
                        ))}
                      </div>
                      <span className="text-xs text-masala-400">
                        {format(new Date(review.createdAt), 'dd MMM yyyy')}
                      </span>
                      {review.isHidden && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-masala-100 text-masala-600 text-xs font-medium">
                          <EyeOff className="w-3 h-3" /> Hidden by Admin
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  {confirmDeleteId === review._id ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={deletingId === review._id}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-masala-200 text-masala-600 hover:bg-masala-50 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={deletingId === review._id}
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-chili-600 text-white hover:bg-chili-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                      >
                        {deletingId === review._id
                          ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <Trash2 className="w-3 h-3" />}
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(review._id)}
                      className="p-1.5 rounded-lg text-masala-300 hover:text-chili-600 hover:bg-chili-100 transition-colors shrink-0"
                      aria-label="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Review content */}
                {review.title && (
                  <p className="text-sm font-semibold text-masala-900 mb-0.5">{review.title}</p>
                )}
                {review.comment && (
                  <p className="text-sm text-masala-600 leading-relaxed line-clamp-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

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
          ].map(({ label, val, set: setter, show, toggle, auto }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-masala-700 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  autoComplete={auto}
                  className="w-full h-11 px-4 pr-11 border border-masala-200 rounded-xl text-masala-900 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 transition-all"
                />
                <button type="button" onClick={toggle} aria-label={show ? 'Hide' : 'Show'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-600">
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
