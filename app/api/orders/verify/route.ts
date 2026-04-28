import { NextResponse } from 'next/server'
import { z } from 'zod'
import { format } from 'date-fns'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import User from '@/models/User'
import { appendOrderToExcel } from '@/lib/excel'

const schema = z.object({
  orderId: z.string().min(1),
  code:    z.string().min(1),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { orderId, code } = parsed.data

  try {
    await connectDB()

    const order = await Order.findOne({
      _id:              orderId,
      userId:           session.user.id,
      verificationCode: code.trim().toUpperCase(),
    })

    if (!order) {
      return NextResponse.json({ error: 'Invalid code. Please check and try again.' }, { status: 400 })
    }

    if (order.isVerified) {
      return NextResponse.json({ data: { orderId: order._id.toString(), alreadyVerified: true } })
    }

    order.isVerified = true
    order.status     = 'Confirmed'
    await order.save()

    // Async Excel logging — fetch user info for the row
    try {
      const user = await User.findById(session.user.id).select('name email').lean()
      appendOrderToExcel({
        orderId:          `HMP-${order._id.toString().slice(-8).toUpperCase()}`,
        verificationCode: order.verificationCode,
        customerName:     (user as { name?: string } | null)?.name ?? session.user.name ?? 'Unknown',
        customerEmail:    (user as { email?: string } | null)?.email ?? session.user.email ?? 'Unknown',
        items:            order.items.map((i) => `${i.name} x${i.qty}`).join(', '),
        totalAmount:      order.totalAmount,
        deliveryAddress:  order.deliveryAddress,
        status:           order.status,
        placedAt:         format(new Date(order.createdAt), 'dd MMM yyyy HH:mm'),
      })
    } catch {
      // Excel failure must never block the response
    }

    return NextResponse.json({ data: { orderId: order._id.toString() } })
  } catch {
    return NextResponse.json({ error: 'Failed to verify order' }, { status: 500 })
  }
}
