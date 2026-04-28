import mongoose, { Schema, Document, Model } from 'mongoose'

export interface UserDocument extends Document {
  name: string
  email: string
  phone: string
  password: string
  role: 'admin' | 'enduser'
  address?: string
  createdAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['admin', 'enduser'], default: 'enduser' },
    address:  { type: String },
  },
  { timestamps: true }
)

// email unique index is already created by the `unique: true` field option above

const User: Model<UserDocument> =
  mongoose.models.User ?? mongoose.model<UserDocument>('User', UserSchema)

export default User
