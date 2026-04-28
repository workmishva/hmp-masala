'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { WeightSelector, WEIGHT_OPTIONS, type WeightOption } from './WeightSelector'
import { useCart } from '@/context/CartContext'

interface ProductActionsProps {
  productId:   string
  productName: string
  basePrice:   number
  maxStock:    number
}

export function ProductActions({ productId, productName, basePrice, maxStock }: ProductActionsProps) {
  const { refresh }                     = useCart()
  const [selectedWeight, setSelectedWeight] = useState<WeightOption>(WEIGHT_OPTIONS[2]) // default 250g
  const [qty, setQty]                   = useState(1)
  const [loading, setLoading]           = useState(false)

  const computedPrice = Math.round(basePrice * selectedWeight.multiplier)

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart/add', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          qty,
          weight:      selectedWeight.id,
          weightPrice: computedPrice,
        }),
      })

      if (res.status === 401) {
        toast.error('Please log in to add items to your cart')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to add to cart')
      }

      toast.success(`${productName} (${selectedWeight.id}) added to cart!`)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }

  if (maxStock === 0) {
    return (
      <button
        disabled
        className="w-full h-12 bg-masala-100 text-masala-500 rounded-xl text-sm font-medium cursor-not-allowed mt-2"
      >
        Out of Stock
      </button>
    )
  }

  const priceDisplay = (
    <div className="flex items-baseline gap-2 mb-5">
      <span className="text-3xl font-bold text-saffron-600">
        ₹{computedPrice.toLocaleString('en-IN')}
      </span>
      {selectedWeight.id !== '250g' && (
        <span className="text-sm text-masala-500">for {selectedWeight.id}</span>
      )}
    </div>
  )

  const weightPicker = (
    <div className="mb-5">
      <WeightSelector
        basePrice={basePrice}
        selected={selectedWeight}
        onChange={setSelectedWeight}
      />
    </div>
  )

  const qtyControls = (
    <div className="flex items-center border border-masala-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        disabled={qty <= 1}
        className="w-10 h-12 flex items-center justify-center text-masala-600 hover:bg-masala-100 disabled:opacity-40 transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-12 text-center text-sm font-semibold text-masala-900" aria-label={`Quantity: ${qty}`}>
        {qty}
      </span>
      <button
        onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
        disabled={qty >= maxStock}
        className="w-10 h-12 flex items-center justify-center text-masala-600 hover:bg-masala-100 disabled:opacity-40 transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <>
      {/* ── Desktop inline ── */}
      <div className="hidden sm:block">
        {priceDisplay}
        {weightPicker}
        <div className="flex gap-3">
          {qtyControls}
          <Button onClick={handleAddToCart} loading={loading} size="lg" className="flex-1 gap-2">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* ── Mobile inline price + weight ── */}
      <div className="sm:hidden">
        {priceDisplay}
        {weightPicker}
      </div>

      {/* ── Mobile sticky bar ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-masala-200 px-4 pt-3 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-masala-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="w-9 h-11 flex items-center justify-center text-masala-600 hover:bg-masala-100 disabled:opacity-40 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-masala-900">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(maxStock, q + 1))}
              disabled={qty >= maxStock}
              className="w-9 h-11 flex items-center justify-center text-masala-600 hover:bg-masala-100 disabled:opacity-40 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleAddToCart} loading={loading} size="lg" className="flex-1 gap-2">
            <ShoppingCart className="w-5 h-5" />
            Add — ₹{(computedPrice * qty).toLocaleString('en-IN')}
          </Button>
        </div>
      </div>
    </>
  )
}
