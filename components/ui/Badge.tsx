import type { OrderStatus } from '@/types'

type BadgeVariant = 'saffron' | 'chili' | 'cardamom' | 'masala' | 'blue' | 'purple' | 'indigo'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  saffron:  'bg-saffron-100 text-saffron-700',
  chili:    'bg-chili-100 text-chili-600',
  cardamom: 'bg-cardamom-100 text-cardamom-600',
  masala:   'bg-masala-100 text-masala-800',
  blue:     'bg-blue-100 text-blue-700',
  purple:   'bg-purple-100 text-purple-700',
  indigo:   'bg-indigo-100 text-indigo-700',
}

export function Badge({ children, variant = 'masala', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}

const statusStyles: Record<OrderStatus, string> = {
  'Payment Pending':   'bg-yellow-100 text-yellow-700',
  'Payment Confirmed': 'bg-blue-100 text-blue-700',
  'Packed':            'bg-purple-100 text-purple-700',
  'Shipped':           'bg-indigo-100 text-indigo-700',
  'Delivered':         'bg-cardamom-100 text-cardamom-600',
  'Cancelled':         'bg-chili-100 text-chili-600',
}

const statusLabels: Record<string, string> = {
  'Payment Pending':   'Order Placed',
  'Payment Confirmed': 'Payment Confirmed',
  'Packed':            'Packed',
  'Shipped':           'Shipped',
  'Delivered':         'Delivered',
  'Cancelled':         'Cancelled',
}

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const cls   = statusStyles[status as OrderStatus] ?? 'bg-masala-100 text-masala-700'
  const label = statusLabels[status] ?? status
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}
