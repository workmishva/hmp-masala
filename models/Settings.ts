import mongoose, { Schema, Document, Model } from 'mongoose'

export interface SettingsDocument extends Document {
  paymentEnabled: boolean
  whatsappVerificationEnabled: boolean
  whatsappNumber: string
  storeName: string
  darkModeEnabled: boolean
  lastResetAt?: Date
}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    paymentEnabled:              { type: Boolean, default: false },
    whatsappVerificationEnabled: { type: Boolean, default: true },
    whatsappNumber:              { type: String, default: '' },
    storeName:                   { type: String, default: 'HMP Masala' },
    darkModeEnabled:             { type: Boolean, default: false },
    lastResetAt:                 { type: Date },
  },
  { timestamps: true }
)

const Settings: Model<SettingsDocument> =
  mongoose.models.Settings ?? mongoose.model<SettingsDocument>('Settings', SettingsSchema)

export default Settings
