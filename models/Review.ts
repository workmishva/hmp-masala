import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ReviewDocument extends Document {
  userId:    mongoose.Types.ObjectId
  productId: mongoose.Types.ObjectId
  orderId:   mongoose.Types.ObjectId
  rating:    number
  title:     string
  comment:   string
  isHidden:  boolean
  createdAt: Date
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    orderId:   { type: Schema.Types.ObjectId, ref: 'Order',   required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    title:     { type: String, default: '', maxlength: 100, trim: true },
    comment:   { type: String, default: '', maxlength: 500, trim: true },
    isHidden:  { type: Boolean, default: false },
  },
  { timestamps: true },
)

// One review per user per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true })
ReviewSchema.index({ productId: 1, createdAt: -1 })

const Review: Model<ReviewDocument> =
  mongoose.models.Review ?? mongoose.model<ReviewDocument>('Review', ReviewSchema)

export default Review
