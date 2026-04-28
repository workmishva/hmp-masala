import mongoose, { Schema, Document, Model } from 'mongoose'

interface CartItemSubdoc {
  productId:   mongoose.Types.ObjectId
  qty:         number
  weight?:     string
  weightPrice?: number
}

export interface CartDocument extends Document {
  userId: mongoose.Types.ObjectId
  items: CartItemSubdoc[]
}

const CartItemSchema = new Schema<CartItemSubdoc>(
  {
    productId:   { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty:         { type: Number, required: true, min: 1 },
    weight:      { type: String },
    weightPrice: { type: Number, min: 0 },
  },
  { _id: false }
)

const CartSchema = new Schema<CartDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items:  [CartItemSchema],
  },
  { timestamps: true }
)

const Cart: Model<CartDocument> =
  mongoose.models.Cart ?? mongoose.model<CartDocument>('Cart', CartSchema)

export default Cart
