import { Types } from 'mongoose'

export type UserRole = 'admin' | 'enduser'

export interface IUser {
  _id:    string
  name:   string
  email:  string
  phone:  string
  role:   UserRole
  // Legacy
  address?: string
  // Structured profile
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

export interface IProductWeight {
  weight:     string
  price:      number
  subtitle?:  string
  isDefault?: boolean
  isActive?:  boolean
}

export interface IProduct {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  weights?: IProductWeight[]
  createdAt: Date
}

export interface ICartItem {
  productId: string | IProduct
  qty: number
}

export interface ICart {
  _id: string
  userId: string
  items: ICartItem[]
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'

export type PaymentStatus = 'Unpaid' | 'Paid'

export interface IOrderItem {
  productId: string
  name: string
  price: number
  qty: number
  weight?: string
}

export interface IOrder {
  _id: string
  userId: string
  items: IOrderItem[]
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

export interface ISettings {
  paymentEnabled: boolean
  whatsappVerificationEnabled: boolean
  whatsappNumber: string
  storeName: string
}

export interface IReview {
  _id:       string
  userId:    string
  productId: string
  orderId:   string
  rating:    number
  comment:   string
  createdAt: Date
  userName?: string
}

export interface ApiSuccess<T = unknown> {
  data: T
}

export interface ApiError {
  error: string
}
