import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'

// GET /api/user/reviews
// Returns all of the authenticated user's own reviews (including hidden ones).
// Populates product name and image for display in profile.
export async function GET() {
  const session = await auth()
  if (!session)                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'enduser') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  try {
    await connectDB()

    const reviews = await Review.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate('productId', 'name images _id')
      .lean()

    const serialized = reviews.map((r) => {
      const p = r.productId as unknown as { _id?: unknown; name?: string; images?: string[] } | null
      return {
        _id:          r._id.toString(),
        productId:    p?._id?.toString() ?? r.productId.toString(),
        productName:  p?.name    ?? 'Deleted Product',
        productImage: p?.images?.[0] ?? null,
        orderId:      r.orderId.toString(),
        rating:       r.rating,
        title:        r.title    ?? '',
        comment:      r.comment  ?? '',
        isHidden:     r.isHidden ?? false,
        createdAt:    r.createdAt,
      }
    })

    return NextResponse.json({ data: serialized })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch your reviews' }, { status: 500 })
  }
}
