import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'

const schema = z.object({
  orderId: z.string().min(1),
  status:  z.enum(['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']),
})

export async function PUT(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  try {
    await connectDB()
    const order = await Order.findByIdAndUpdate(
      parsed.data.orderId,
      { status: parsed.data.status },
      { returnDocument: 'after' }
    )
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ data: JSON.parse(JSON.stringify(order)) })
  } catch {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
