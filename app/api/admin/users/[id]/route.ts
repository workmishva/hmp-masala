import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Cart from '@/models/Cart'
import Order from '@/models/Order'
import Review from '@/models/Review'

// DELETE /api/admin/users/:id — admin only
// Permanently removes a user and all their associated data.
// Orders are anonymised (userId unset) rather than deleted so revenue
// history and admin analytics remain intact.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  }

  try {
    await connectDB()

    const target = await User.findById(id).lean()
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (target.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot be deleted' }, { status: 403 })
    }

    // 1. Anonymise orders — financial records are preserved for analytics;
    //    the user reference is removed so no broken ObjectId ref remains.
    await Order.updateMany({ userId: id }, { $unset: { userId: 1 } })

    // 2. Delete all reviews written by this user.
    await Review.deleteMany({ userId: id })

    // 3. Delete cart and any pending checkout state.
    await Cart.deleteOne({ userId: id })

    // 4. Delete the user document itself.
    await User.findByIdAndDelete(id)

    return NextResponse.json({ data: { deleted: id } })
  } catch {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
