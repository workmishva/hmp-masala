import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await connectDB()

    const { searchParams } = req.nextUrl
    const includeUnverified = searchParams.get('unverified') === '1'

    // Archived orders are excluded from the admin orders panel by default.
    // They still exist in the database and remain visible to end-users in My Orders.
    const filter: Record<string, unknown> = { archivedAt: { $exists: false } }
    if (!includeUnverified) filter.isVerified = true

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .lean()
    return NextResponse.json({ data: JSON.parse(JSON.stringify(orders)) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
