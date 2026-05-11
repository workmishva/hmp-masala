import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'

const createSchema = z.object({
  name:        z.string().min(2),
  description: z.string().min(10),
  price:       z.number().min(0),
  stock:       z.number().min(0),
  category:    z.string().min(2),
  images:      z.array(z.string()).optional().default([]),
  isActive:    z.boolean().optional().default(true),
  isFeatured:  z.boolean().optional().default(false),
  weights: z.array(z.object({
    weight:    z.string().min(1),
    price:     z.number().min(0),
    subtitle:  z.string().optional().default(''),
    isDefault: z.boolean().optional().default(false),
    isActive:  z.boolean().optional().default(true),
  })).optional().default([]),
})

// GET /api/products — public, supports ?q=&category=&sort=&page=&limit=&isActive=
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = req.nextUrl
    const q        = searchParams.get('q') ?? ''
    const category = searchParams.get('category') ?? ''
    const sort     = searchParams.get('sort') ?? 'createdAt_desc'
    const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit    = Math.min(24, parseInt(searchParams.get('limit') ?? '12'))
    const isAdminReq = searchParams.get('all') === '1'

    // Only admin can see inactive products
    const session = isAdminReq ? await auth() : null
    const showAll = isAdminReq && session?.user?.role === 'admin'

    const filter: Record<string, unknown> = {}
    if (!showAll) filter.isActive = true
    if (category) filter.category = category
    if (q) filter.$text = { $search: q }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      createdAt_desc: { createdAt: -1 },
      createdAt_asc:  { createdAt:  1 },
      price_asc:      { price:  1 },
      price_desc:     { price: -1 },
    }
    const sortObj = sortMap[sort] ?? { createdAt: -1 }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ])

    return NextResponse.json({
      data: JSON.parse(JSON.stringify(products)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products — admin only
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body   = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    await connectDB()
    const product = await Product.create(parsed.data)
    return NextResponse.json({ data: JSON.parse(JSON.stringify(product)) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
