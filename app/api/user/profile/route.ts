import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

const updateSchema = z.object({
  // Personal
  firstName: z.string().min(1).max(40).optional(),
  lastName:  z.string().min(1).max(40).optional(),
  phone:     z.string().min(10).max(15).optional(),
  // Address
  house:    z.string().max(100).optional(),
  street:   z.string().max(100).optional(),
  landmark: z.string().max(100).optional(),
  city:     z.string().max(60).optional(),
  district: z.string().max(60).optional(),
  state:    z.string().max(60).optional(),
  pincode:  z.string().max(10).optional(),
  // Profile flag
  profileCompleted: z.boolean().optional(),
  // Password change
  newPassword:     z.string().min(8).optional(),
  currentPassword: z.string().optional(),
})

function serializeUser(user: InstanceType<typeof User>) {
  return {
    _id:              user._id.toString(),
    name:             user.name,
    email:            user.email,
    phone:            user.phone,
    role:             user.role,
    firstName:        user.firstName        ?? '',
    lastName:         user.lastName         ?? '',
    house:            user.house            ?? '',
    street:           user.street           ?? '',
    landmark:         user.landmark         ?? '',
    city:             user.city             ?? '',
    district:         user.district         ?? '',
    state:            user.state            ?? '',
    pincode:          user.pincode          ?? '',
    profileCompleted: user.profileCompleted ?? false,
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const user = await User.findById(session.user.id).lean()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      data: {
        _id:              user._id.toString(),
        name:             user.name,
        email:            user.email,
        phone:            user.phone,
        role:             user.role,
        firstName:        user.firstName        ?? '',
        lastName:         user.lastName         ?? '',
        house:            user.house            ?? '',
        street:           user.street           ?? '',
        landmark:         user.landmark         ?? '',
        city:             user.city             ?? '',
        district:         user.district         ?? '',
        state:            user.state            ?? '',
        pincode:          user.pincode          ?? '',
        profileCompleted: user.profileCompleted ?? false,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const {
    firstName, lastName, phone,
    house, street, landmark, city, district, state, pincode,
    profileCompleted,
    newPassword, currentPassword,
  } = parsed.data

  try {
    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (firstName !== undefined) user.firstName = firstName
    if (lastName  !== undefined) user.lastName  = lastName
    if (phone     !== undefined) user.phone     = phone
    if (house     !== undefined) user.house     = house
    if (street    !== undefined) user.street    = street
    if (landmark  !== undefined) user.landmark  = landmark
    if (city      !== undefined) user.city      = city
    if (district  !== undefined) user.district  = district
    if (state     !== undefined) user.state     = state
    if (pincode   !== undefined) user.pincode   = pincode
    if (profileCompleted !== undefined) user.profileCompleted = profileCompleted

    // Sync display name from structured fields
    const fn = firstName ?? user.firstName ?? ''
    const ln = lastName  ?? user.lastName  ?? ''
    if (fn || ln) user.name = [fn, ln].filter(Boolean).join(' ')

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
      }
      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      user.password = await bcrypt.hash(newPassword, 12)
    }

    await user.save()
    return NextResponse.json({ data: serializeUser(user) })
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
