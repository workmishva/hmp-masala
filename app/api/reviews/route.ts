import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import Order from '@/models/Order'

// ── GET /api/reviews?productId=xxx ────────────────────────────────────────────
// Public: returns all reviews for a product.
// If the requester is an authenticated enduser, also returns eligibility fields
// (canReview, hasReviewed, eligibleOrderId) so the client can show the form.
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 })
  }

  try {
    await connectDB()

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .lean()

    const serialized = reviews.map((r) => ({
      _id:       r._id.toString(),
      userId:    (r.userId as unknown as { _id?: unknown })?._id?.toString() ?? r.userId.toString(),
      productId: r.productId.toString(),
      orderId:   r.orderId.toString(),
      rating:    r.rating,
      comment:   r.comment,
      createdAt: r.createdAt,
      userName:  (r.userId as unknown as { name?: string })?.name ?? 'Customer',
    }))

    let canReview:       boolean     = false
    let hasReviewed:     boolean     = false
    let eligibleOrderId: string|null = null

    const session = await auth()
    if (session?.user.role === 'enduser') {
      const existing = await Review.findOne({ userId: session.user.id, productId })
      hasReviewed = !!existing

      if (!hasReviewed) {
        const oid = new mongoose.Types.ObjectId(productId)
        const order = await Order.findOne({
          userId:            session.user.id,
          isVerified:        true,
          status:            'Delivered',
          'items.productId': oid,
        }).select('_id')

        canReview       = !!order
        eligibleOrderId = order?._id.toString() ?? null
      }
    }

    return NextResponse.json({ data: { reviews: serialized, canReview, hasReviewed, eligibleOrderId } })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// ── POST /api/reviews ─────────────────────────────────────────────────────────
// Authenticated endusers only.
// Validates that the referenced order is Delivered + verified + belongs to them
// + contains the product, then upserts the review.
const postSchema = z.object({
  productId: z.string().min(1),
  orderId:   z.string().min(1),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().max(500).optional().default(''),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'enduser') {
    return NextResponse.json({ error: 'Only customers can submit reviews' }, { status: 403 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { productId, orderId, rating, comment } = parsed.data

  if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(orderId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    await connectDB()

    const oid = new mongoose.Types.ObjectId(productId)
    const order = await Order.findOne({
      _id:               orderId,
      userId:            session.user.id,
      isVerified:        true,
      status:            'Delivered',
      'items.productId': oid,
    }).select('_id')

    if (!order) {
      return NextResponse.json(
        { error: 'You can only review products from your delivered orders' },
        { status: 403 },
      )
    }

    // findOneAndUpdate with upsert so a duplicate POST is idempotent
    const review = await Review.findOneAndUpdate(
      { userId: session.user.id, productId },
      { userId: session.user.id, productId, orderId, rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    return NextResponse.json({ data: { _id: review._id.toString() } }, { status: 201 })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
