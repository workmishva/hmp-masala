import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId', 'name price images stock isActive category')
      .lean()

    return NextResponse.json({ data: cart ?? { items: [] } })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
