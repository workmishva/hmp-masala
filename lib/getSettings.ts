import { cache } from 'react'
import { connectDB } from '@/lib/db'
import Settings from '@/models/Settings'
import type { SettingsDocument } from '@/models/Settings'

export const getSettings = cache(async (): Promise<SettingsDocument> => {
  await connectDB()
  let settings = await Settings.findOne()
  if (!settings) {
    settings = await Settings.create({
      paymentEnabled:              false,
      whatsappVerificationEnabled: true,
      whatsappNumber:              process.env.WHATSAPP_NUMBER ?? '',
      storeName:                   'HMP Masala',
    })
  }
  return settings
})
