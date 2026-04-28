'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import type { IOrder } from '@/types'

const statusColors: Record<string, string> = {
  Pending:   'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed:    'bg-purple-100 text-purple-700',
  Shipped:   'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-cardamom-100 text-cardamom-700',
  Cancelled: 'bg-chili-100 text-chili-700',
}

export default function MyOrdersPage() {
  const [orders, setOrders]   = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders/my')
      .then((r) => r.json())
      .then(({ data }) => { if (data) setOrders(data) })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-9 w-48 skeleton rounded-xl mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Package className="w-16 h-16 text-masala-300 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-masala-900 mb-2">No orders yet</h1>
        <p className="text-masala-500 mb-6">Start shopping to see your orders here.</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-saffron-500 text-white rounded-xl font-medium hover:bg-saffron-600 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-heading text-3xl font-bold text-masala-900 mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isOpen = expanded === order._id

          return (
            <div
              key={order._id}
              className="bg-white border border-masala-200 rounded-2xl shadow-card overflow-hidden"
            >
              {/* Header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : order._id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-masala-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-masala-500">Order Code</p>
                    <p className="font-mono font-bold text-masala-900">{order.verificationCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-masala-500">Date</p>
                    <p className="text-sm font-medium text-masala-900">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-masala-500">Total</p>
                    <p className="text-sm font-bold text-saffron-600">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? 'bg-masala-100 text-masala-600'}`}>
                    {order.status}
                  </span>
                  {!order.isVerified && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      Unverified
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-masala-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-masala-500 shrink-0" />}
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-6 pb-5 border-t border-masala-100">
                  <div className="pt-4 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-masala-700">{item.name} × {item.qty}</span>
                        <span className="text-masala-900 font-medium">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="my-3 border-masala-100" />
                  <div className="text-sm text-masala-600">
                    <p className="font-medium text-masala-900 mb-1">Delivery Address</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{order.deliveryAddress}</p>
                  </div>
                  {!order.isVerified && (
                    <Link
                      href="/checkout"
                      className="inline-flex items-center gap-1.5 text-sm text-saffron-600 hover:text-saffron-700 font-medium mt-3"
                    >
                      Verify this order →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
