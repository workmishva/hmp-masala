'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
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

  const clearAll    = () => router.push(pathname)
  const hasFilters  = !!(currentQ || currentCategory)

  return (
    <div className="sticky top-16 z-20 border-b border-masala-200 bg-white/80 backdrop-blur-md shadow-sm px-4 py-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Top row: search + sort + clear ── */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          {/* Search — rounded-full, muted bg (old-project style) */}
          <div className="relative w-full max-w-md md:mr-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-masala-400" aria-hidden="true" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              defaultValue={currentQ}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search masalas by name..."
              className="block w-full py-3 pl-12 pr-10 text-sm text-masala-900 bg-masala-100 border border-masala-200 rounded-full focus:ring-saffron-500 focus:border-saffron-500 outline-none transition-all placeholder:text-masala-400"
              aria-label="Search products"
            />
            {currentQ && (
              <button
                type="button"
                onClick={() => update('q', '')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-masala-400 hover:text-masala-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort + clear filters */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-masala-400" />
            <select
              value={currentSort}
              onChange={(e) => update('sort', e.target.value)}
              className="h-10 border border-masala-200 rounded-xl px-3 text-sm text-masala-800 bg-white focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 cursor-pointer"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {total !== undefined && (
              <span className="hidden sm:block text-sm text-masala-400 font-medium">{total} found</span>
            )}

            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-sm text-chili-600 hover:text-chili-700 font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Category pill group — old-project style ──
            All buttons sit inside one rounded-full bg-masala-100 p-1 container.
            Active pill floats with bg-saffron-500 + shadow-lg; inactive is ghost text. */}
        <div className="mt-3 flex overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex rounded-full bg-masala-100 p-1 shrink-0">

            <button
              onClick={() => update('category', '')}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all whitespace-nowrap ${
                !currentCategory
                  ? 'bg-saffron-500 text-white shadow-lg'
                  : 'text-masala-500 hover:text-masala-900'
              }`}
            >
              All
            </button>

            {PRODUCT_CATEGORIES.map((cat) => {
              const meta   = CATEGORY_META[cat]
              const active = currentCategory === cat
              const Icon   = meta?.icon
              return (
                <button
                  key={cat}
                  onClick={() => update('category', active ? '' : cat)}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-saffron-500 text-white shadow-lg'
                      : 'text-masala-500 hover:text-masala-900'
                  }`}
                >
                  {Icon && <Icon size={14} strokeWidth={2} />}
                  {cat}
                </button>
              )
            })}

          </div>
        </div>

      </div>
    </div>
  )
}
