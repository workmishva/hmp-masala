'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { PRODUCT_CATEGORIES, CATEGORY_META } from '@/lib/categories'

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest' },
  { value: 'price_asc',      label: 'Price ↑' },
  { value: 'price_desc',     label: 'Price ↓' },
  { value: 'createdAt_asc',  label: 'Oldest' },
]

export function StickyFilterBar({ total }: { total?: number }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const timerRef     = useRef<ReturnType<typeof setTimeout>>(null)

  const currentQ        = searchParams.get('q')        ?? ''
  const currentCategory = searchParams.get('category') ?? ''
  const currentSort     = searchParams.get('sort')     ?? 'createdAt_desc'

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const handleSearch = useCallback((val: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => update('q', val), 350)
  }, [update])

  const clearAll = () => router.push(pathname)
  const hasFilters = !!(currentQ || currentCategory)

  return (
    <div className="sticky top-16 z-20 bg-white/95 dark:bg-masala-100/95 backdrop-blur-md border-b border-masala-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Top row: search + sort + clear */}
        <div className="flex items-center gap-3 py-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-masala-400 pointer-events-none" />
            <input
              type="search"
              defaultValue={currentQ}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search masalas, spices..."
              className="w-full h-10 pl-10 pr-10 border border-masala-200 rounded-xl text-sm bg-white dark:bg-masala-200 text-masala-900 placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 transition-all"
              aria-label="Search products"
            />
            {currentQ && (
              <button
                onClick={() => update('q', '')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-masala-400" />
            <select
              value={currentSort}
              onChange={(e) => update('sort', e.target.value)}
              className="h-10 border border-masala-200 rounded-xl px-3 text-sm text-masala-800 bg-white dark:bg-masala-200 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 cursor-pointer"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Count + clear */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 text-sm text-masala-500">
            {total !== undefined && <span>{total} found</span>}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-chili-600 hover:text-chili-700 font-medium"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide snap-x">
          <button
            onClick={() => update('category', '')}
            className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
              !currentCategory
                ? 'bg-saffron-500 text-white border-saffron-500 shadow-sm'
                : 'bg-white dark:bg-masala-200 text-masala-700 border-masala-200 hover:border-saffron-300 hover:text-saffron-700'
            }`}
          >
            🌶️ All
          </button>
          {PRODUCT_CATEGORIES.map((cat) => {
            const meta   = CATEGORY_META[cat]
            const active = currentCategory === cat
            return (
              <button
                key={cat}
                onClick={() => update('category', active ? '' : cat)}
                className={`snap-start shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border whitespace-nowrap ${
                  active
                    ? 'bg-saffron-500 text-white border-saffron-500 shadow-sm'
                    : 'bg-white dark:bg-masala-200 text-masala-700 border-masala-200 hover:border-saffron-300 hover:text-saffron-700'
                }`}
              >
                {meta?.emoji ?? ''} {cat}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
