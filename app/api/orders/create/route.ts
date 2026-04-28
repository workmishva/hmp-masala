import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Settings from '@/models/Settings'
import { generateOrderCode, buildWhatsAppUrl } from '@/lib/whatsapp'

const schema = z.object({
  deliveryAddress: z.string().min(10, 'Address must be at least 10 characters'),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { deliveryAddress } = parsed.data

  try {
    await connectDB()

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId')
      .lean()

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const orderItems: { productId: string; name: string; price: number; qty: number }[] = []
    let totalAmount = 0

    for (const item of cart.items) {
      const product = item.productId as unknown as {
        _id: string
        name: string
        price: number
        stock: number
        isActive: boolean
      }
      const effectivePrice = (item as unknown as { weightPrice?: number }).weightPrice ?? product.price

      if (!product || !product.isActive) {
        return NextResponse.json({ error: 'A product in your cart is no longer available' }, { status: 400 })
      }
      if (product.stock < item.qty) {
        return NextResponse.json({ error: `${product.name} only has ${product.stock} in stock` }, { status: 400 })
      }

      orderItems.push({
        productId: product._id.toString(),
        name:      product.name,
        price:     effectivePrice,
        qty:       item.qty,
      })
      totalAmount += effectivePrice * item.qty
    }

    const verificationCode = generateOrderCode()

    const order = await Order.create({
      userId:           session.user.id,
      items:            orderItems,
      totalAmount,
      deliveryAddress,
      verificationCode,
      isVerified:       false,
      status:           'Pending',
      paymentStatus:    'Unpaid',
    })

    // Deduct stock for each product
    for (const item of cart.items) {
      const product = item.productId as unknown as { _id: string }
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.qty } })
    }

    // Clear cart
    await Cart.deleteOne({ userId: session.user.id })

    const settings = await Settings.findOne().lean()
    const whatsappNumber = settings?.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? ''
    const whatsappUrl    = buildWhatsAppUrl(whatsappNumber, verificationCode)

    return NextResponse.json({
      data: {
        orderId:          order._id.toString(),
        verificationCode,
        whatsappUrl,
        totalAmount,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
