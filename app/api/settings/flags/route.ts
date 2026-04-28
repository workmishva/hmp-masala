import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Settings from '@/models/Settings'

export async function GET() {
  try {
    await connectDB()
    let settings = await Settings.findOne()
    if (!settings) {
      settings = await Settings.create({
        paymentEnabled:              false,
        whatsappVerificationEnabled: true,
        whatsappNumber:              '',
        storeName:                   'HMP Masala',
      })
    }
    return NextResponse.json({ data: settings })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { auth } = await import('@/lib/auth')
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    await connectDB()

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: body },
      { new: true, upsert: true }
    )
    return NextResponse.json({ data: settings })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
