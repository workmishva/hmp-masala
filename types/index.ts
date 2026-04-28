import { Types } from 'mongoose'

export type UserRole = 'admin' | 'enduser'

export interface IUser {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  address?: string
  createdAt: Date
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
  createdAt: Date
}

export interface ISettings {
  paymentEnabled: boolean
  whatsappVerificationEnabled: boolean
  whatsappNumber: string
  storeName: string
}

export interface ApiSuccess<T = unknown> {
  data: T
}

export interface ApiError {
  error: string
}
