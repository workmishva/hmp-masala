import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateSignedUploadParams } from '@/lib/cloudinary'

// POST /api/upload — admin only, returns signed Cloudinary upload params
export async function POST() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const params = await generateSignedUploadParams()
    return NextResponse.json({ data: params })
  } catch {
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 })
  }
}
