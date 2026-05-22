import { NextResponse } from 'next/server'
import { format } from 'date-fns'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Order from '@/models/Order'
import Product from '@/models/Product'
import User from '@/models/User'
import { appendOrderToExcel } from '@/lib/excel'

export async function POST() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()

    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId', 'name price stock isActive')

    if (!cart || !cart.items.length) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }

    if (!cart.pendingCode || !cart.pendingAddress || !cart.pendingExpiry) {
      return NextResponse.json({ error: 'No pending order found. Please place your order first.' }, { status: 400 })
    }

    if (new Date(cart.pendingExpiry) < new Date()) {
      // Expired — clear pending fields so user can start fresh
      await Cart.updateOne(
        { userId: session.user.id },
        { $unset: { pendingCode: '', pendingAddress: '', pendingExpiry: '', pendingTotal: '' } },
      )
      return NextResponse.json({ error: 'Your order session has expired. Please place your order again.' }, { status: 410 })
    }

    // Re-validate stock (prices and availability may have changed)
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
        return NextResponse.json(
          { error: `${product.name} only has ${product.stock} in stock` },
          { status: 400 },
        )
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

    // Atomically decrement stock with rollback on failure
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

    // Create the order
    const order = await Order.create({
      userId:           session.user.id,
      items:            orderItems,
      totalAmount,
      deliveryAddress:  cart.pendingAddress,
      verificationCode: cart.pendingCode,
      isVerified:       true,
      status:           'Payment Pending',
      paymentStatus:    'Unpaid',
    })

    // Clear the cart entirely
    await Cart.deleteOne({ userId: session.user.id })

    // Async Excel logging — never blocks the response
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

    return NextResponse.json({ data: { orderId: order._id.toString() } })
  } catch {
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 })
  }
}
