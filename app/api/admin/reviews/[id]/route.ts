import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Review from '@/models/Review'

async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return null
  return session
}

// PATCH /api/admin/reviews/[id]  — toggle isHidden
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const { isHidden } = body as { isHidden?: boolean }
  if (typeof isHidden !== 'boolean') {
    return NextResponse.json({ error: 'isHidden (boolean) is required' }, { status: 400 })
  }

  try {
    await connectDB()
    const review = await Review.findByIdAndUpdate(
      id,
      { isHidden },
      { new: true },
    ).lean()
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    return NextResponse.json({ data: { _id: review._id.toString(), isHidden: review.isHidden } })
  } catch {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

// DELETE /api/admin/reviews/[id]  — permanent delete
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid review ID' }, { status: 400 })
  }

  try {
    await connectDB()
    const result = await Review.findByIdAndDelete(id)
    if (!result) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    return NextResponse.json({ data: { deleted: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
