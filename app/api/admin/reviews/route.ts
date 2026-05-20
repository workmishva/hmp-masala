import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'
import Product from '@/models/Product'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return null
  return session
}

// ── GET /api/admin/reviews ────────────────────────────────────────────────────
// No productId → products aggregation (summary grid)
// With productId → full review list for that product (detail view)
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = req.nextUrl
  const productId = searchParams.get('productId')
  const search    = searchParams.get('search')?.trim()  ?? ''
  const filter    = searchParams.get('filter')          ?? 'all'
  const ratingStr = searchParams.get('rating')
  const ratingFilter = ratingStr ? parseInt(ratingStr, 10) : null
  const page      = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit     = 25

  try {
    await connectDB()

    // ── Products aggregation mode ──────────────────────────────────────────
    if (!productId) {
      const agg = await Review.aggregate([
        {
          $group: {
            _id:          '$productId',
            total:        { $sum: 1 },
            hidden:       { $sum: { $cond: [{ $eq: ['$isHidden', true] }, 1, 0] } },
            visible:      { $sum: { $cond: [{ $ne: ['$isHidden', true] }, 1, 0] } },
            avgRating:    { $avg: '$rating' },
            lastActivity: { $max: '$createdAt' },
          },
        },
        {
          $lookup: {
            from:         'products',
            localField:   '_id',
            foreignField: '_id',
            as:           'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $sort: { total: -1 } },
      ])

      const lower = search.toLowerCase()
      const filtered = search
        ? agg.filter((s) => (s.product?.name ?? '').toLowerCase().includes(lower))
        : agg

      return NextResponse.json({
        data: {
          mode: 'products',
          products: filtered.map((s) => ({
            productId:       s._id.toString(),
            productName:     s.product?.name     ?? 'Deleted Product',
            productImage:    s.product?.images?.[0] ?? null,
            productCategory: s.product?.category  ?? '',
            total:           s.total,
            hidden:          s.hidden,
            visible:         s.visible,
            avgRating:       s.avgRating ? Number(s.avgRating.toFixed(1)) : 0,
            lastActivity:    s.lastActivity,
          })),
        },
      })
    }

    // ── Product detail mode ────────────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 })
    }

    const query: Record<string, unknown> = { productId }
    if (filter === 'hidden')  query.isHidden = true
    if (filter === 'visible') query.isHidden = { $ne: true }
    if (ratingFilter)         query.rating   = ratingFilter

    const rawReviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .populate('userId',  'name email phone')
      .populate('orderId', 'status isVerified')
      .lean()

    type PopUser  = { _id?: unknown; name?: string; email?: string; phone?: string }
    type PopOrder = { status?: string; isVerified?: boolean }

    const lower = search.toLowerCase()
    const afterSearch = search
      ? rawReviews.filter((r) => {
          const u = r.userId as unknown as PopUser
          return (
            (u?.name    ?? '').toLowerCase().includes(lower) ||
            (u?.email   ?? '').toLowerCase().includes(lower) ||
            (r.comment  ?? '').toLowerCase().includes(lower) ||
            (r.title    ?? '').toLowerCase().includes(lower)
          )
        })
      : rawReviews

    const total  = afterSearch.length
    const sliced = afterSearch.slice((page - 1) * limit, page * limit)

    const reviews = sliced.map((r) => {
      const u = r.userId  as unknown as PopUser
      const o = r.orderId as unknown as PopOrder
      return {
        _id:           r._id.toString(),
        userId:        u?._id?.toString() ?? r.userId.toString(),
        productId:     r.productId.toString(),
        orderId:       r.orderId.toString(),
        rating:        r.rating,
        title:         r.title    ?? '',
        comment:       r.comment  ?? '',
        isHidden:      r.isHidden ?? false,
        createdAt:     r.createdAt,
        userName:      u?.name    ?? 'Deleted User',
        userEmail:     u?.email   ?? '',
        userPhone:     u?.phone   ?? '',
        productName:   '',
        orderStatus:   o?.status     ?? 'Unknown',
        orderVerified: o?.isVerified ?? false,
      }
    })

    const product = await Product.findById(productId).select('name images category').lean()

    return NextResponse.json({
      data: {
        mode: 'product',
        product: product
          ? {
              _id:      product._id.toString(),
              name:     product.name,
              image:    product.images?.[0] ?? null,
              category: product.category,
            }
          : null,
        reviews,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
