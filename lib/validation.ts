import { z } from 'zod'

/**
 * Allowed email provider domains.
 * Covers the realistic set of providers an Indian consumer would use.
 */
const ALLOWED_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'ymail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'rediffmail.com',
])

/**
 * Strict phone schema for Indian 10-digit mobile numbers.
 * - Digits only, exactly 10 characters
 * - Must start with 6, 7, 8 or 9 (TRAI-assigned mobile prefixes)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits with no spaces or symbols')
  .refine((v) => /^[6-9]/.test(v), 'Enter a valid Indian mobile number (starts with 6–9)')

/**
 * Strict email schema — format + common-provider domain allowlist.
 * Rejects throwaway / obviously fake domains.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address')
  .refine(
    (email) => {
      const domain = email.split('@')[1]?.toLowerCase() ?? ''
      return ALLOWED_DOMAINS.has(domain)
    },
    'Please use a common email provider (Gmail, Yahoo, Outlook, iCloud, etc.)'
  )
