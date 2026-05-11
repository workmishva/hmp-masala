import { NextResponse } from 'next/server'
import { z } from 'zod'
import { format } from 'date-fns'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { appendOrderToExcel } from '@/lib/excel'

const schema = z.object({
  code: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { code } = parsed.data

  try {
    await connectDB()

    // Load the cart with pending checkout data
    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId', 'name price stock isActive')

    if (!cart || !cart.pendingCode) {
      return NextResponse.json({ error: 'No pending checkout found. Please restart checkout.' }, { status: 400 })
    }

    // Check code match (case-insensitive)
    if (cart.pendingCode.toUpperCase() !== code.trim().toUpperCase()) {
      return NextResponse.json({ error: 'Invalid code. Please check and try again.' }, { status: 400 })
    }

    // Check expiry
    if (cart.pendingExpiry && cart.pendingExpiry < new Date()) {
      // Clear stale pending data
      cart.pendingCode    = undefined
      cart.pendingAddress = undefined
      cart.pendingExpiry  = undefined
      await cart.save()
      return NextResponse.json(
        { error: 'Your order code has expired. Please restart checkout.' },
        { status: 410 },
      )
    }

    if (!cart.items.length) {
      return NextResponse.json({ error: 'Cart is empty. Please add items and try again.' }, { status: 400 })
    }

    // Build order items snapshot + validate stock
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

    // Decrement stock atomically for each item (with rollback on failure)
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
        const product = await Product.findById(item.productId).select('name stock').lean()
        const detail  = product
          ? `${(product as { name: string }).name} only has ${(product as { stock: number }).stock} units remaining`
          : 'a product is no longer available'
        return NextResponse.json(
          { error: `Could not confirm order — ${detail}. Please contact us on WhatsApp.` },
          { status: 409 },
        )
      }

      decremented.push({ productId: item.productId, qty: item.qty })
    }

    // Create the order — only reaches here after successful stock reservation
    const order = await Order.create({
      userId:           session.user.id,
      items:            orderItems,
      totalAmount,
      deliveryAddress:  cart.pendingAddress ?? '',
      verificationCode: cart.pendingCode,
      isVerified:       true,
      status:           'Confirmed',
      paymentStatus:    'Unpaid',
    })

    // Clear cart entirely — order is now confirmed
    await Cart.deleteOne({ userId: session.user.id })

    // Async Excel logging
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
      // Excel failure must never block the response
    }

    return NextResponse.json({ data: { orderId: order._id.toString() } })
  } catch {
    return NextResponse.json({ error: 'Failed to verify order' }, { status: 500 })
  }
}
