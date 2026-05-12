'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, MessageCircle, CheckCircle, Lock, Info } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'

interface CartProduct {
  _id: string
  name: string
  price: number
  images: string[]
}

interface CartItem {
  productId:    CartProduct
  qty:          number
  weight?:      string
  weightPrice?: number
}

interface OrderResult {
  verificationCode: string
  whatsappUrl: string
  totalAmount: number
}

interface Address {
  firstName: string
  surname:   string
  phone:     string
  house:     string
  street:    string
  nearby:    string
  city:      string
  district:  string
  state:     string
  pincode:   string
}

const EMPTY_ADDRESS: Address = {
  firstName: '', surname: '', phone: '',
  house: '', street: '', nearby: '',
  city: '', district: '', state: '', pincode: '',
}

function InputField({
  label, required, value, onChange, placeholder, type = 'text', maxLength,
}: {
  label: string; required?: boolean; value: string
  onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-masala-700 mb-1.5">
        {label} {required && <span className="text-chili-600">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-4 py-3 rounded-xl border border-masala-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-400/30 bg-masala-50 dark:bg-masala-200 text-masala-900 text-sm transition-all outline-none"
      />
    </div>
  )
}

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <h2 className="text-lg font-bold text-masala-900 mb-5 flex items-center gap-2.5 font-heading">
      <span className="w-8 h-8 rounded-full bg-chili-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
        {n}
      </span>
      {label}
    </h2>
  )
}

export default function CheckoutPage() {
  const router      = useRouter()
  const { refresh } = useCart()

  const [items, setItems]             = useState<CartItem[]>([])
  const [loading, setLoading]         = useState(true)
  const [address, setAddress]         = useState<Address>(EMPTY_ADDRESS)
  const [placing, setPlacing]         = useState(false)
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [verifyCode, setVerifyCode]       = useState('')
  const [verifying, setVerifying]         = useState(false)
  const [whatsappOpened, setWhatsappOpened] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const { data } = await res.json()
        if (!data?.items?.length) { router.push('/cart'); return }
        setItems(data.items)
        // Pre-fill address fields from saved profile
        const pr = await fetch('/api/user/profile')
        if (pr.ok) {
          const { data: profile } = await pr.json()
          if (profile) {
            setAddress((prev) => ({
              ...prev,
              firstName: profile.firstName || prev.firstName,
              surname:   profile.lastName  || prev.surname,
              phone:     profile.phone     || prev.phone,
              house:     profile.house     || prev.house,
              street:    profile.street    || prev.street,
              nearby:    profile.landmark  || prev.nearby,
              city:      profile.city      || prev.city,
              district:  profile.district  || prev.district,
              state:     profile.state     || prev.state,
              pincode:   profile.pincode   || prev.pincode,
            }))
          }
        }
      }
    } catch {
      toast.error('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchCart() }, [fetchCart])

  const buildDeliveryAddress = (a: Address) =>
    `${a.firstName} ${a.surname}, ${a.house}, ${a.street}${a.nearby ? ', ' + a.nearby : ''}, ${a.city}, ${a.district}, ${a.state} - ${a.pincode}. Ph: ${a.phone}`

  const validateAddress = (): boolean => {
    const errs: string[] = []
    if (!address.firstName.trim()) errs.push('First name')
    if (!address.surname.trim())   errs.push('Surname')
    if (address.phone.trim().length < 10) errs.push('Valid 10-digit phone')
    if (!address.house.trim())     errs.push('House/Flat')
    if (!address.street.trim())    errs.push('Street')
    if (!address.city.trim())      errs.push('City/Village')
    if (!address.district.trim())  errs.push('District')
    if (!address.state.trim())     errs.push('State')
    if (!address.pincode.trim())   errs.push('Pincode')
    if (errs.length > 0) {
      toast.error(`Please fill in: ${errs.slice(0, 2).join(', ')}${errs.length > 2 ? ` and ${errs.length - 2} more` : ''}`)
      return false
    }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return
    setPlacing(true)
    try {
      const res  = await fetch('/api/orders/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ deliveryAddress: buildDeliveryAddress(address) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to place order'); return }
      setOrderResult(data.data)
      await refresh()
    } catch {
      toast.error('Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  const openWhatsApp = () => {
    if (!orderResult) return
    window.open(orderResult.whatsappUrl, '_blank')
    setWhatsappOpened(true)
  }

  const handleVerify = async () => {
    if (!orderResult || !verifyCode.trim() || !whatsappOpened) return
    setVerifying(true)
    try {
      const res  = await fetch('/api/orders/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: verifyCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Invalid code'); return }
      toast.success('Order confirmed! We\'ll start preparing your masala. 🎉')
      router.push('/my-orders')
    } catch {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const subtotal   = items.reduce((sum, item) => sum + (item.weightPrice ?? item.productId.price) * item.qty, 0)
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="h-9 w-48 skeleton rounded-xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-72 skeleton rounded-2xl" />
          <div className="h-72 skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  /* ── WhatsApp verification step ── */
  if (orderResult) {
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className="text-6xl mb-4"
          >
            💬
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-masala-900 mb-2">Verify Your Order</h1>
          <p className="text-masala-600 text-sm">
            Total: <strong className="text-masala-900">₹{orderResult.totalAmount.toLocaleString('en-IN')}</strong>
          </p>
        </motion.div>

        <div className="bg-white dark:bg-masala-100 border border-masala-200 rounded-2xl p-6 space-y-5 shadow-card">

          {/* Instruction banner */}
          <div className="flex gap-3 bg-saffron-50 border border-saffron-200 rounded-xl p-4">
            <Info className="w-4 h-4 text-saffron-600 shrink-0 mt-0.5" />
            <p className="text-sm text-masala-700 leading-relaxed">
              Send this message on WhatsApp so we can confirm your order and arrange payment. Copy the code from WhatsApp and paste it below to confirm your order.
            </p>
          </div>

          {/* Step 1: WhatsApp */}
          <div>
            <p className="text-xs font-semibold text-masala-500 uppercase tracking-wider mb-2">Step 1 — Send via WhatsApp</p>
            <p className="text-xs text-masala-500 mb-3">Your order code is pre-filled in the message. Just tap and send.</p>
            <button
              type="button"
              onClick={openWhatsApp}
              className="flex items-center justify-center gap-2 w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-semibold transition-colors shadow-md active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              Open WhatsApp &amp; Send Code
            </button>
          </div>

          {/* Step 2: Enter code — locked until WhatsApp is opened */}
          <div>
            <p className="text-xs font-semibold text-masala-500 uppercase tracking-wider mb-2">Step 2 — Enter code to confirm</p>
            {!whatsappOpened && (
              <p className="text-xs text-masala-400 mb-2 flex items-center gap-1.5">
                <Lock className="w-3 h-3 shrink-0" />
                Send the WhatsApp message first to unlock this step.
              </p>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. HMP4582"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                maxLength={8}
                disabled={!whatsappOpened}
                className="flex-1 h-12 px-4 border border-masala-200 rounded-xl text-masala-900 font-mono tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-masala-50 dark:bg-masala-200 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              />
              <Button
                onClick={handleVerify}
                loading={verifying}
                disabled={!whatsappOpened || verifyCode.trim().length < 4}
                className="shrink-0"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Verify
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Checkout form ── */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-masala-600 hover:text-saffron-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="font-heading text-3xl font-bold text-masala-900 mb-2">Checkout</h1>
      <p className="text-masala-500 text-sm mb-8">Fill in your details to complete your order.</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left — Forms */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">

          {/* Section 1 — Customer Info */}
          <section className="bg-white dark:bg-masala-100 border border-masala-200 rounded-2xl p-6 shadow-card">
            <StepBadge n={1} label="Customer Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="First Name" required value={address.firstName} onChange={(v) => setAddress(p => ({ ...p, firstName: v }))} placeholder="Enter first name" />
              <InputField label="Surname" required value={address.surname} onChange={(v) => setAddress(p => ({ ...p, surname: v }))} placeholder="Enter surname" />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-masala-700 mb-1.5">
                  Mobile Number <span className="text-chili-600">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-masala-200 bg-masala-100 dark:bg-masala-200 text-masala-600 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={address.phone}
                    onChange={(e) => setAddress(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder="9876543210"
                    className="flex-1 px-4 py-3 rounded-r-xl border border-masala-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-400/30 bg-masala-50 dark:bg-masala-200 text-masala-900 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 — Delivery Address */}
          <section className="bg-white dark:bg-masala-100 border border-masala-200 rounded-2xl p-6 shadow-card">
            <StepBadge n={2} label="Delivery Address" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="House / Flat" required value={address.house} onChange={(v) => setAddress(p => ({ ...p, house: v }))} placeholder="House No. / Flat / Society" />
              <InputField label="Street" required value={address.street} onChange={(v) => setAddress(p => ({ ...p, street: v }))} placeholder="Street / Road / Colony" />
              <div className="sm:col-span-2">
                <InputField label="Nearby Landmark (optional)" value={address.nearby} onChange={(v) => setAddress(p => ({ ...p, nearby: v }))} placeholder="Famous building, temple, school..." />
              </div>
              <InputField label="City / Village" required value={address.city} onChange={(v) => setAddress(p => ({ ...p, city: v }))} placeholder="City or Village name" />
              <InputField label="District" required value={address.district} onChange={(v) => setAddress(p => ({ ...p, district: v }))} placeholder="District" />
              <InputField label="State" required value={address.state} onChange={(v) => setAddress(p => ({ ...p, state: v }))} placeholder="State" />
              <InputField label="Pincode" required value={address.pincode} onChange={(v) => setAddress(p => ({ ...p, pincode: v.replace(/\D/g, '') }))} placeholder="000000" maxLength={6} />
            </div>
          </section>

          {/* Section 3 — Payment */}
          <section className="bg-white dark:bg-masala-100 border border-masala-200 rounded-2xl p-6 shadow-card">
            <StepBadge n={3} label="Payment Method" />
            <label className="flex gap-3 p-4 rounded-xl border-2 border-[#25D366] bg-green-50/60 cursor-pointer">
              <input type="radio" defaultChecked readOnly className="mt-0.5 h-4 w-4 text-green-600 border-masala-300" />
              <div>
                <p className="font-semibold text-masala-900 text-sm">WhatsApp Verification</p>
                <p className="text-xs text-masala-500 mt-0.5">Place your order via WhatsApp. We&apos;ll confirm and arrange payment.</p>
              </div>
            </label>
          </section>
        </div>

        {/* Right — Order Summary (sticky) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-masala-100 rounded-2xl shadow-card border border-masala-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-masala-100 bg-masala-50 dark:bg-masala-200/60">
                <h3 className="font-heading font-bold text-masala-900">
                  Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                </h3>
              </div>

              <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
                {items.map((item) => {
                  const p = item.productId
                  return (
                    <div key={p._id} className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-masala-100 shrink-0">
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt={p.name} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🌶️</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-masala-900 truncate">{p.name}</p>
                        <p className="text-xs text-masala-500">{item.weight ? `${item.weight} · ` : ''}Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-bold text-masala-900 shrink-0">
                        ₹{((item.weightPrice ?? p.price) * item.qty).toLocaleString('en-IN')}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="p-5 bg-masala-50 dark:bg-masala-200/60 space-y-3 border-t border-masala-200">
                <div className="flex justify-between text-sm text-masala-600">
                  <span>Delivery</span>
                  <span className="text-cardamom-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-bold text-masala-900 pt-2 border-t border-masala-200">
                  <span>Total</span>
                  <span className="text-chili-600 text-xl">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  loading={placing}
                  size="lg"
                  className="w-full gap-2 mt-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Checkout via WhatsApp
                </Button>

                <p className="text-center text-[10px] text-masala-400">
                  Secure checkout · You will verify via WhatsApp
                </p>
                <p className="text-center text-[10px] text-masala-400 leading-relaxed">
                  * By clicking on checkout you agree to our{' '}
                  <span className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer transition-colors">Terms</span>
                  {' '}&amp;{' '}
                  <span className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer transition-colors">Shipping Policy</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
