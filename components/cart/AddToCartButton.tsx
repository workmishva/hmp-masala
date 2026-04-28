'use client'

import { useState } from 'react'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'

interface AddToCartButtonProps {
  productId:   string
  productName: string
  maxStock:    number
}

export function AddToCartButton({ productId, productName, maxStock }: AddToCartButtonProps) {
  const [qty, setQty]         = useState(1)
  const [loading, setLoading] = useState(false)
  const { refresh }           = useCart()

  const isOutOfStock = maxStock === 0

  const handleAddToCart = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/cart/add', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ productId, qty }),
      })

      if (res.status === 401) {
        toast.error('Please log in to add items to your cart')
        return
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to add to cart')
      }

      toast.success(`${productName} added to cart!`)
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="w-full h-12 bg-masala-100 text-masala-500 rounded-xl text-sm font-medium cursor-not-allowed"
      >
        Out of Stock
      </button>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Quantity selector */}
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

      {/* Add to cart */}
      <Button
        onClick={handleAddToCart}
        loading={loading}
        size="lg"
        className="flex-1 gap-2"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </Button>
    </div>
  )
}
