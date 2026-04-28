import { Suspense } from 'react'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { AdminProductsClient } from '@/components/admin/AdminProductsClient'
import { Skeleton } from '@/components/ui/Skeleton'
import type { IProduct } from '@/types'

export const metadata = { title: 'Products — HMP Masala Admin' }

async function getAllProducts(): Promise<IProduct[]> {
  try {
    await connectDB()
    const products = await Product.find().sort({ createdAt: -1 }).lean()
    return JSON.parse(JSON.stringify(products))
  } catch {
    return []
  }
}

async function AdminProductsContent() {
  const products = await getAllProducts()
  return <AdminProductsClient initialProducts={products} />
}

function AdminProductsSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-10 w-48 rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminProductsSkeleton />}>
      <AdminProductsContent />
    </Suspense>
  )
}
