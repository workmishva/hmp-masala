import { Suspense } from 'react'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { ProductCard } from '@/components/products/ProductCard'
import { StickyFilterBar } from '@/components/products/StickyFilterBar'
import { Pagination } from '@/components/products/Pagination'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import type { IProduct } from '@/types'

export const metadata = { title: 'Products — HMP Masala' }

interface PageProps {
  searchParams: Promise<{
    q?:        string
    category?: string
    sort?:     string
    page?:     string
  }>
}

async function getProducts(params: Awaited<PageProps['searchParams']>) {
  const q        = params.q        ?? ''
  const category = params.category ?? ''
  const sort     = params.sort     ?? 'createdAt_desc'
  const page     = Math.max(1, parseInt(params.page ?? '1'))
  const limit    = 12

  await connectDB()

  const filter: Record<string, unknown> = { isActive: true }
  if (category) filter.category = category
  if (q)        filter.$text    = { $search: q }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    createdAt_desc: { createdAt: -1 },
    createdAt_asc:  { createdAt:  1 },
    price_asc:      { price:  1 },
    price_desc:     { price: -1 },
  }
  const sortObj = sortMap[sort] ?? { createdAt: -1 }

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(filter),
  ])

  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    total,
    page,
    pages: Math.ceil(total / limit),
  }
}

async function ProductGrid({ params }: { params: Awaited<PageProps['searchParams']> }) {
  const { products, total, page, pages } = await getProducts(params)
  const hasActiveFilter = !!(params.q || params.category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-masala-900">
          {params.category ? params.category : 'All Products'}
        </h1>
        <span className="text-sm text-masala-500 hidden sm:block">{total} product{total !== 1 ? 's' : ''}</span>
      </div>

      {params.q && (
        <p className="text-masala-500 text-sm -mt-4 mb-6">
          Showing results for &ldquo;{params.q}&rdquo;
        </p>
      )}

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-7xl mb-5 select-none">🌶️</span>
          <h3 className="font-heading font-bold text-masala-900 text-xl mb-2">No products found</h3>
          <p className="text-masala-500 text-sm max-w-xs">
            {hasActiveFilter
              ? 'Try different search terms or clear your filters.'
              : 'Check back soon — more masalas are on the way!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} priority={i < 4} index={i} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={pages} total={total} />
        </>
      )}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="skeleton h-8 w-44 rounded-xl mb-6" />
      <ProductGridSkeleton count={12} />
    </div>
  )
}

export default function ProductsPage({ searchParams }: PageProps) {
  return (
    <>
      {/* Sticky filter bar — client component, reads own URL params */}
      <Suspense fallback={<div className="h-24 bg-white border-b border-masala-200" />}>
        <StickyFilterBar />
      </Suspense>

      {/* Product grid — server component */}
      <Suspense fallback={<GridSkeleton />}>
        {searchParams.then(params => <ProductGrid params={params} />)}
      </Suspense>
    </>
  )
}
