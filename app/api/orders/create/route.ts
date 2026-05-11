import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Settings from '@/models/Settings'
import { generateOrderCode, buildWhatsAppUrl } from '@/lib/whatsapp'

const schema = z.object({
  deliveryAddress: z.string().min(10, 'Address must be at least 10 characters'),
})

// PENDING_TTL: 48 hours — if user doesn't verify within this window, the
// pending checkout is silently discarded on the next GET /api/cart call.
const PENDING_TTL_MS = 48 * 60 * 60 * 1000

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { deliveryAddress } = parsed.data

  try {
    await connectDB()

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId', 'name price stock isActive')
      .lean()

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock before issuing a code — avoids wasted WhatsApp messages
    let totalAmount = 0
    for (const item of cart.items) {
      const product = item.productId as unknown as {
        name: string; price: number; stock: number; isActive: boolean
      }
      if (!product?.isActive) {
        return NextResponse.json({ error: 'A product in your cart is no longer available' }, { status: 400 })
      }
      if (product.stock < item.qty) {
        return NextResponse.json({ error: `${product.name} only has ${product.stock} in stock` }, { status: 400 })
      }
      const cartItem = item as unknown as { weightPrice?: number }
      totalAmount += (cartItem.weightPrice ?? product.price) * item.qty
    }

    const verificationCode = generateOrderCode()
    const pendingExpiry    = new Date(Date.now() + PENDING_TTL_MS)

    // Store pending checkout in the Cart document.
    // Cart items are NOT cleared — the user can still navigate back freely.
    await Cart.updateOne(
      { userId: session.user.id },
      { $set: { pendingCode: verificationCode, pendingAddress: deliveryAddress, pendingExpiry } },
    )

    const settings = await Settings.findOne().lean()
    const whatsappNumber = settings?.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? ''
    const whatsappUrl    = buildWhatsAppUrl(whatsappNumber, verificationCode)

    return NextResponse.json({
      data: { verificationCode, whatsappUrl, totalAmount },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to prepare order' }, { status: 500 })
  }
}
