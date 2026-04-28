import { NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Product from '@/models/Product'

const schema = z.object({
  productId: z.string().min(1),
  qty:       z.number().int().min(0).max(100),
  weight:    z.string().optional(),
})

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { productId, qty, weight } = parsed.data

  const pullFilter: Record<string, unknown> = { productId: new mongoose.Types.ObjectId(productId) }
  if (weight !== undefined) pullFilter.weight = weight

  const arrayFilter: Record<string, unknown> = { 'el.productId': new mongoose.Types.ObjectId(productId) }
  if (weight !== undefined) arrayFilter['el.weight'] = weight

  try {
    await connectDB()

    if (qty === 0) {
      await Cart.updateOne(
        { userId: session.user.id },
        { $pull: { items: pullFilter } }
      )
      return NextResponse.json({ data: { removed: true } })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (qty > product.stock) {
      return NextResponse.json({ error: `Only ${product.stock} in stock` }, { status: 400 })
    }

    await Cart.updateOne(
      { userId: session.user.id },
      { $set: { 'items.$[el].qty': qty } },
      { arrayFilters: [arrayFilter] }
    )
    return NextResponse.json({ data: { qty } })
  } catch {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
