import { NextResponse } from 'next/server'
import { z } from 'zod'
import { format } from 'date-fns'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import Settings from '@/models/Settings'
import { generateOrderCode, buildWhatsAppUrl } from '@/lib/whatsapp'
import { appendOrderToExcel } from '@/lib/excel'

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

    // Build items snapshot + validate stock
    const orderItems: { productId: string; name: string; price: number; qty: number; weight?: string }[] = []
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
        return NextResponse.json({ error: `${product.name} only has ${product.stock} in stock` }, { status: 400 })
      }

      orderItems.push({
        productId: product._id.toString(),
        name:      product.name,
        price:     effectivePrice,
        qty:       item.qty,
        ...(cartItem.weight ? { weight: cartItem.weight } : {}),
      })
      totalAmount += effectivePrice * item.qty
    }

    // Decrement stock atomically with rollback on failure
    const decremented: { productId: unknown; qty: number }[] = []

    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
      )

      if (!updated) {
        for (const d of decremented) {
          await Product.findByIdAndUpdate(d.productId, { $inc: { stock: d.qty } })
        }
        const p = await Product.findById(item.productId).select('name stock').lean()
        const detail = p
          ? `${(p as { name: string }).name} only has ${(p as { stock: number }).stock} unit(s) remaining`
          : 'a product is no longer available'
        return NextResponse.json({ error: `Could not place order — ${detail}.` }, { status: 409 })
      }

      decremented.push({ productId: item.productId, qty: item.qty })
    }

    // Generate order code (used as a friendly order identifier)
    const verificationCode = generateOrderCode()

    // Create order immediately — no code verification step required
    const order = await Order.create({
      userId:           session.user.id,
      items:            orderItems,
      totalAmount,
      deliveryAddress,
      verificationCode,
      isVerified:       true,
      status:           'Payment Pending',
      paymentStatus:    'Unpaid',
    })

    // Clear cart
    await Cart.deleteOne({ userId: session.user.id })

    // Build WhatsApp URL for optional customer contact
    const settings      = await Settings.findOne().lean()
    const whatsappNum   = settings?.whatsappNumber ?? process.env.WHATSAPP_NUMBER ?? ''
    const whatsappUrl   = buildWhatsAppUrl(whatsappNum, verificationCode)

    // Async Excel logging — failure must never block the response
    try {
      const user = await User.findById(session.user.id).select('name email').lean()
      appendOrderToExcel({
        orderId:          `HMP-${order._id.toString().slice(-8).toUpperCase()}`,
        verificationCode: order.verificationCode,
        customerName:     (user as { name?: string } | null)?.name ?? session.user.name ?? 'Unknown',
        customerEmail:    (user as { email?: string } | null)?.email ?? session.user.email ?? 'Unknown',
        items:            order.items.map((i) => `${i.name} x${i.qty}`).join(', '),
        totalAmount:      order.totalAmount,
        deliveryAddress:  order.deliveryAddress,
        status:           order.status,
        placedAt:         format(new Date(order.createdAt), 'dd MMM yyyy HH:mm'),
      })
    } catch {
      // Excel failure never blocks the order
    }

    return NextResponse.json({
      data: {
        orderId:          order._id.toString(),
        verificationCode: order.verificationCode,
        whatsappUrl,
        totalAmount,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
