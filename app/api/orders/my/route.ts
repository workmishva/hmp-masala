import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    // Only return verified, non-cancelled orders to the user.
    // Unverified / abandoned orders are hidden from user view.
    const orders = await Order.find({
      userId:     session.user.id,
      isVerified: true,
    })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ data: JSON.parse(JSON.stringify(orders)) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
