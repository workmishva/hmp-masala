import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'

// DELETE /api/reviews/[id] — authenticated enduser deletes their own review.
// After deletion the user is eligible to re-review if they still have a qualifying order.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session)                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'enduser') return NextResponse.json({ error: 'Forbidden' },    { status: 403 })

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 })
  }

  try {
    await connectDB()

    // Ownership check — only the author can delete their review
    const review = await Review.findOne({ _id: id, userId: session.user.id })
    if (!review) {
      return NextResponse.json({ error: 'Review not found or not yours' }, { status: 404 })
    }

    await review.deleteOne()
    return NextResponse.json({ data: { deleted: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
