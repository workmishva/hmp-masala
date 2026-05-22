import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Product from '@/models/Product'
import Settings from '@/models/Settings'
import { generateOrderCode, buildWhatsAppUrl } from '@/lib/whatsapp'

const schema = z.object({
  deliveryAddress: z.string().min(10, 'Address must be at least 10 characters'),
})

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

    if (!cart || !cart.items.length) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }

    // Validate stock without decrementing (decrement happens at confirm)
    let totalAmount = 0

    for (const item of cart.items) {
      const product = item.productId as unknown as {
        _id: { toString(): string }; name: string; price: number; stock: number; isActive: boolean
      }
      const cartItem       = item as unknown as { weightPrice?: number; weight?: string }
      const effectivePrice = cartItem.weightPrice ?? product.price

      if (!product?.isActive) {
        return NextResponse.json({ error: 'A product in your cart is no longer available' }, { status: 400 })
      }
      if (product.stock < item.qty) {
        return NextResponse.json(
          { error: `${product.name} only has ${product.stock} in stock` },
          { status: 400 },
        )
      }

      totalAmount += effectivePrice * item.qty
    }

    // Generate friendly order code and set 48-hour expiry
    const verificationCode = generateOrderCode()
    const pendingExpiry    = new Date(Date.now() + 48 * 60 * 60 * 1000)

    // Store pending checkout data in cart — order is NOT created yet
    await Cart.updateOne(
      { userId: session.user.id },
      {
        $set: {
          pendingCode:    verificationCode,
          pendingAddress: deliveryAddress,
          pendingExpiry,
          pendingTotal:   totalAmount,
        },
      },
    )

    // Build WhatsApp URL
    const settings    = await Settings.findOne().lean()
    const whatsappNum = settings?.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? ''
    const whatsappUrl = buildWhatsAppUrl(whatsappNum, verificationCode)

    return NextResponse.json({
      data: { verificationCode, whatsappUrl, totalAmount },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
