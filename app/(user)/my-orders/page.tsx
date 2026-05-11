'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Package, ChevronDown, ChevronUp, Download, XCircle, AlertTriangle, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { IOrder } from '@/types'

const CANCELLABLE = new Set(['Pending', 'Confirmed'])

const statusColors: Record<string, string> = {
  Pending:   'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed:    'bg-purple-100 text-purple-700',
  Shipped:   'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-cardamom-100 text-cardamom-700',
  Cancelled: 'bg-chili-100 text-chili-700',
}

export default function MyOrdersPage() {
  const [orders, setOrders]       = useState<IOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [cancelling, setCancelling]       = useState<string | null>(null)
  const [downloading, setDownloading]     = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders/my')
      .then((r) => r.json())
      .then(({ data }) => { if (data) setOrders(data) })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (orderId: string) => {
    setCancelling(orderId)
    try {
      const res  = await fetch('/api/orders/cancel', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed to cancel order'); return }
      setOrders((prev) => prev.map((o) =>
        o._id === orderId ? { ...o, status: 'Cancelled', cancelledByUser: true } : o
      ))
      toast.success('Order cancelled successfully.')
    } catch {
      toast.error('Failed to cancel order')
    } finally {
      setCancelling(null)
      setConfirmCancel(null)
    }
  }

  const handleDownloadInvoice = async (order: IOrder) => {
    setDownloading(order._id)
    try {
      const res = await fetch(`/api/orders/invoice/${order._id}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Failed to generate invoice')
      }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `HMP-Invoice-${order.verificationCode}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to download invoice')
    } finally {
      setDownloading(null)
    }
  }

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
          const isOpen    = expanded === order._id
          const canCancel = CANCELLABLE.has(order.status)
          const isConfirmingCancel = confirmCancel === order._id

          return (
            <div
              key={order._id}
              className={`bg-white border rounded-2xl shadow-card overflow-hidden transition-colors ${
                order.status === 'Cancelled' ? 'border-chili-200 opacity-80' : 'border-masala-200'
              }`}
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
                  {order.cancelledByUser && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-chili-100 text-chili-700">
                      Cancelled by you
                    </span>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-masala-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-masala-500 shrink-0" />}
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-6 pb-5 border-t border-masala-100">
                  {/* Items */}
                  <div className="pt-4 space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-masala-700 truncate">{item.name}</span>
                          {item.weight && (
                            <span className="text-xs font-medium text-saffron-600 bg-saffron-50 border border-saffron-200 rounded-full px-1.5 py-0.5 shrink-0">
                              {item.weight}
                            </span>
                          )}
                          <span className="text-masala-500 shrink-0">× {item.qty}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-masala-900 font-medium">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                          {order.status === 'Delivered' && (
                            <Link
                              href={`/products/${item.productId}#reviews`}
                              className="text-xs text-saffron-600 hover:text-saffron-700 font-semibold underline-offset-2 hover:underline transition-colors"
                            >
                              Review
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-3 border-masala-100" />

                  {/* Delivery address */}
                  <div className="text-sm text-masala-600 mb-4">
                    <p className="font-medium text-masala-900 mb-1">Delivery Address</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{order.deliveryAddress}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Download Invoice */}
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={!!downloading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-saffron-300 text-saffron-700 bg-saffron-50 hover:bg-saffron-100 transition-colors disabled:opacity-50"
                    >
                      {downloading === order._id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Download className="w-4 h-4" />
                      }
                      {downloading === order._id ? 'Generating…' : 'Download Invoice'}
                    </button>

                    {/* Cancel Order */}
                    {canCancel && !isConfirmingCancel && (
                      <button
                        onClick={() => setConfirmCancel(order._id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-chili-200 text-chili-600 hover:bg-chili-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Order
                      </button>
                    )}

                    {/* Inline cancel confirmation */}
                    {isConfirmingCancel && (
                      <div className="flex items-center gap-2 bg-chili-50 border border-chili-200 rounded-xl px-4 py-2">
                        <AlertTriangle className="w-4 h-4 text-chili-600 shrink-0" />
                        <span className="text-sm text-chili-700 font-medium">Cancel this order?</span>
                        <button
                          onClick={() => handleCancel(order._id)}
                          disabled={cancelling === order._id}
                          className="ml-1 px-3 py-1 bg-chili-600 text-white text-xs font-bold rounded-lg hover:bg-chili-700 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {cancelling === order._id && <Loader2 className="w-3 h-3 animate-spin" />}
                          Yes, Cancel
                        </button>
                        <button
                          onClick={() => setConfirmCancel(null)}
                          className="px-3 py-1 text-xs font-semibold text-masala-600 hover:text-masala-900 transition-colors"
                        >
                          Keep Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
