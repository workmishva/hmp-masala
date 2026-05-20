import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import Order from '@/models/Order'

type PopulatedUser = { _id: unknown; name?: string }

function serializeReview(r: Awaited<ReturnType<typeof Review.findOne>> & Record<string, unknown>, overrideUserId?: string) {
  const u = r.userId as unknown as PopulatedUser | null
  return {
    _id:       (r._id as mongoose.Types.ObjectId).toString(),
    userId:    overrideUserId ?? u?._id?.toString() ?? (r.userId as mongoose.Types.ObjectId).toString(),
    productId: (r.productId as mongoose.Types.ObjectId).toString(),
    orderId:   (r.orderId as mongoose.Types.ObjectId).toString(),
    rating:    r.rating as number,
    title:     (r.title   as string)  ?? '',
    comment:   (r.comment as string)  ?? '',
    isHidden:  (r.isHidden as boolean) ?? false,
    createdAt: r.createdAt as Date,
    userName:  u?.name ?? 'Customer',
  }
}

// ── GET /api/reviews?productId=xxx ────────────────────────────────────────────
// Returns:
//   reviews     — visible public reviews (not including current user's own)
//   userReview  — current enduser's own review regardless of visibility (null if none)
//   canReview / hasReviewed / eligibleOrderId / reviewEligibility
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 })
  }

  try {
    await connectDB()

    const session = await auth()
    const userId  = session?.user?.role === 'enduser' ? session.user.id : null

    // ── 1. User's own review (any visibility) ──────────────────────────────
    let userReview: ReturnType<typeof serializeReview> | null = null
    if (userId) {
      const own = await Review.findOne({ userId, productId })
        .populate('userId', 'name')
        .lean()
      if (own) userReview = serializeReview(own as Parameters<typeof serializeReview>[0], userId)
    }

    // ── 2. Public visible reviews — exclude current user's own ─────────────
    const publicFilter: Record<string, unknown> = { productId, isHidden: { $ne: true } }
    if (userId) publicFilter['userId'] = { $ne: new mongoose.Types.ObjectId(userId) }

    const rawReviews = await Review.find(publicFilter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name')
      .lean()

    const reviews = rawReviews.map((r) => serializeReview(r as Parameters<typeof serializeReview>[0]))

    // ── 3. Eligibility ─────────────────────────────────────────────────────
    let canReview        = false
    let hasReviewed      = !!userReview
    let eligibleOrderId: string | null = null
    type ReviewEligibility = 'guest' | 'admin' | 'no_order' | 'already_reviewed' | 'eligible'
    let reviewEligibility: ReviewEligibility = 'guest'

    if (session) {
      if (session.user.role === 'admin') {
        reviewEligibility = 'admin'
      } else if (userId) {
        if (hasReviewed && userReview) {
          // Use existing review's orderId for the edit flow
          reviewEligibility = 'already_reviewed'
          eligibleOrderId   = userReview.orderId
        } else {
          const oid   = new mongoose.Types.ObjectId(productId)
          const order = await Order.findOne({
            userId,
            isVerified:        true,
            status:            'Delivered',
            'items.productId': oid,
          }).select('_id')

          canReview       = !!order
          eligibleOrderId = order?._id.toString() ?? null
          reviewEligibility = order ? 'eligible' : 'no_order'
        }
      }
    }

    return NextResponse.json({
      data: { reviews, userReview, canReview, hasReviewed, eligibleOrderId, reviewEligibility },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// ── POST /api/reviews ─────────────────────────────────────────────────────────
// Create or edit own review (upsert). Uses $set so isHidden is never clobbered.
const postSchema = z.object({
  productId: z.string().min(1),
  orderId:   z.string().min(1),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().max(100).optional().default(''),
  comment:   z.string().max(500).optional().default(''),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session)                          return NextResponse.json({ error: 'Unauthorized' },                        { status: 401 })
  if (session.user.role !== 'enduser')   return NextResponse.json({ error: 'Only customers can submit reviews' }, { status: 403 })

  const body   = await req.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { productId, orderId, rating, title, comment } = parsed.data

  if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(orderId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    await connectDB()

    const oid   = new mongoose.Types.ObjectId(productId)
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

    // Use $set so isHidden (set by admin moderation) is preserved on edits.
    // $setOnInsert seeds required fields + isHidden default only for new documents.
    const review = await Review.findOneAndUpdate(
      { userId: session.user.id, productId },
      {
        $set:         { orderId, rating, title, comment },
        $setOnInsert: { userId: session.user.id, productId, isHidden: false },
      },
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
