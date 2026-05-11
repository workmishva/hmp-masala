'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages:  number
  total:       number
}

export function Pagination({ currentPage, totalPages, total }: PaginationProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  )

  return (
    <div className="flex items-center justify-between mt-10">
      <p className="text-sm text-masala-500">{total} products total</p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-masala-200 text-masala-700 hover:bg-masala-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((page, i) => {
          const prev = pages[i - 1]
          return (
            <div key={page} className="flex items-center gap-1">
              {prev && page - prev > 1 && (
                <span className="px-2 text-masala-400 text-sm">…</span>
              )}
              <button
                onClick={() => goTo(page)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-chili-600 text-white'
                    : 'border border-masala-200 text-masala-700 hover:bg-masala-100'
                }`}
              >
                {page}
              </button>
            </div>
          )
        })}

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-masala-200 text-masala-700 hover:bg-masala-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
