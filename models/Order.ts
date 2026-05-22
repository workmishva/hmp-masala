import mongoose, { Schema, Document, Model } from 'mongoose'
import type { OrderStatus, PaymentStatus } from '@/types'

interface OrderItemSubdoc {
  productId: mongoose.Types.ObjectId
  name: string
  price: number
  qty: number
  weight?: string
}

export interface OrderDocument extends Document {
  userId: mongoose.Types.ObjectId
  items: OrderItemSubdoc[]
  totalAmount: number
  deliveryAddress: string
  verificationCode: string
  isVerified: boolean
  status: OrderStatus
  paymentStatus: PaymentStatus
  cancelledByUser?: boolean
  archivedAt?: Date
  createdAt: Date
}

const OrderItemSchema = new Schema<OrderItemSubdoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name:      { type: String, required: true },
    price:     { type: Number, required: true },
    qty:       { type: Number, required: true, min: 1 },
    weight:    { type: String },
  },
  { _id: false }
)

const OrderSchema = new Schema<OrderDocument>(
  {
    userId:           { type: Schema.Types.ObjectId, ref: 'User', required: false },
    items:            [OrderItemSchema],
    totalAmount:      { type: Number, required: true, min: 0 },
    deliveryAddress:  { type: String, required: true },
    verificationCode: { type: String, required: true },
    isVerified:       { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Payment Pending', 'Payment Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled',
             'Pending', 'Confirmed'], // legacy values kept for backward compat with existing DB docs
      default: 'Payment Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid'],
      default: 'Unpaid',
    },
    cancelledByUser: { type: Boolean, default: false },
    archivedAt:      { type: Date },
  },
  { timestamps: true }
)

OrderSchema.index({ userId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

const Order: Model<OrderDocument> =
  mongoose.models.Order ?? mongoose.model<OrderDocument>('Order', OrderSchema)

export default Order
