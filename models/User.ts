import mongoose, { Schema, Document, Model } from 'mongoose'

export interface UserDocument extends Document {
  name:      string
  email:     string
  phone?:    string
  password?: string
  googleId?: string
  role:      'admin' | 'enduser'
  // Legacy single-string address (kept for backward compat)
  address?: string
  // Structured profile fields
  firstName?: string
  lastName?:  string
  house?:     string
  street?:    string
  landmark?:  string
  city?:      string
  district?:  string
  state?:     string
  pincode?:   string
  profileCompleted: boolean
  createdAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, default: '', trim: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    role:     { type: String, enum: ['admin', 'enduser'], default: 'enduser' },
    address:  { type: String },
    // Structured address
    firstName: { type: String, trim: true },
    lastName:  { type: String, trim: true },
    house:     { type: String, trim: true },
    street:    { type: String, trim: true },
    landmark:  { type: String, trim: true },
    city:      { type: String, trim: true },
    district:  { type: String, trim: true },
    state:     { type: String, trim: true },
    pincode:   { type: String, trim: true },
    profileCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>('User', UserSchema)

export default User
