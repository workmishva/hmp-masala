import { NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'

const schema = z.object({
  productId: z.string().min(1),
  weight:    z.string().optional(),
})

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { productId, weight } = parsed.data

  try {
    await connectDB()
    const pullFilter: Record<string, unknown> = { productId: new mongoose.Types.ObjectId(productId) }
    if (weight !== undefined) pullFilter.weight = weight
    await Cart.updateOne(
      { userId: session.user.id },
      { $pull: { items: pullFilter } }
    )
    return NextResponse.json({ data: { removed: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
  }
}
