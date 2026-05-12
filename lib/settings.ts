import 'server-only'
import { cache } from 'react'
import { connectDB } from '@/lib/db'
import Settings from '@/models/Settings'

export const getSettings = cache(async () => {
  await connectDB()
  const s = await Settings.findOne().lean()
  return {
    paymentEnabled:              s?.paymentEnabled              ?? false,
    whatsappVerificationEnabled: s?.whatsappVerificationEnabled ?? true,
    whatsappNumber:              s?.whatsappNumber              ?? '',
    storeName:                   s?.storeName                   ?? 'HMP Masala',
    darkModeEnabled:             s?.darkModeEnabled             ?? false,
    lastResetAt:                 s?.lastResetAt                 ?? null,
  }
})
