import { NextResponse } from 'next/server'
import { z } from 'zod'
import { format } from 'date-fns'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
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

    // Atomically decrement stock for each item only at verification time.
    // Using findOneAndUpdate with a stock floor guard prevents negative stock even
    // under concurrent orders (race condition: another order verified first).
    const decremented: { productId: unknown; qty: number }[] = []

    for (const item of order.items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
      )

      if (!updated) {
        // Rollback every decrement that already succeeded in this loop
        for (const d of decremented) {
          await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.qty } })
        }
        const product = await Product.findById(item.productId).select('name stock').lean()
        const detail  = product
          ? `${(product as { name: string }).name} only has ${(product as { stock: number }).stock} units remaining`
          : 'a product in your order is no longer available'
        return NextResponse.json(
          { error: `Could not confirm order — ${detail}. Please contact us on WhatsApp.` },
          { status: 409 },
        )
      }

      decremented.push({ productId: item.productId, qty: item.qty })
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
