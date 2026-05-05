'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { PRODUCT_CATEGORIES, CATEGORY_META } from '@/lib/categories'

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'price_asc',      label: 'Price: Low to High' },
  { value: 'price_desc',     label: 'Price: High to Low' },
  { value: 'createdAt_asc',  label: 'Oldest First' },
]

export function ProductFilters() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') ?? ''
  const currentSort     = searchParams.get('sort') ?? 'createdAt_desc'

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const clearAll = () => router.push(pathname)
  const hasFilters = !!currentCategory

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-masala-900 mb-3">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full h-10 border border-masala-200 rounded-xl px-3 text-sm text-masala-800 bg-white dark:bg-masala-100 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-sm font-semibold text-masala-900 mb-3">Category</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
              !currentCategory
                ? 'bg-saffron-100 text-saffron-700 font-semibold'
                : 'text-masala-700 hover:bg-masala-100'
            }`}
          >
            All Products
          </button>
          {PRODUCT_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            const Icon = meta?.icon
            return (
              <button
                key={cat}
                onClick={() => updateParam('category', currentCategory === cat ? '' : cat)}
                className={`flex items-center gap-2 w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                  currentCategory === cat
                    ? 'bg-saffron-100 text-saffron-700 font-semibold'
                    : 'text-masala-700 hover:bg-masala-100'
                }`}
              >
                {Icon && <Icon size={14} strokeWidth={2} className="shrink-0" />}
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-sm text-chili-600 hover:text-chili-700 font-medium"
        >
          <X className="w-3.5 h-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  )
}

/* Mobile bottom-sheet trigger button */
export function FiltersMobileButton({ count }: { count: number }) {
  return (
    <div className="text-sm text-masala-600">
      {count} product{count !== 1 ? 's' : ''} found
    </div>
  )
}
