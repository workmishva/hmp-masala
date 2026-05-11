import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'

const CANCELLABLE_STATUSES = ['Pending', 'Confirmed'] as const

const schema = z.object({ orderId: z.string().min(1) })

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { orderId } = parsed.data

  try {
    await connectDB()

    const order = await Order.findOne({
      _id:        orderId,
      userId:     session.user.id,
      isVerified: true,
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (!(CANCELLABLE_STATUSES as readonly string[]).includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled once it is ${order.status}.` },
        { status: 400 },
      )
    }

    // Restore stock for each item so it becomes available again
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } })
    }

    order.status          = 'Cancelled'
    order.cancelledByUser = true
    await order.save()

    return NextResponse.json({ data: { orderId: order._id.toString() } })
  } catch {
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }
}
