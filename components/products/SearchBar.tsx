'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'

export function SearchBar() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const timerRef     = useRef<ReturnType<typeof setTimeout>>(null)

  const currentQ = searchParams.get('q') ?? ''

  const handleChange = useCallback((value: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set('q', value)
      else params.delete('q')
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 350)
  }, [router, pathname, searchParams])

  const clear = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-masala-400" />
      <input
        type="search"
        defaultValue={currentQ}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search masalas..."
        className="w-full h-11 pl-10 pr-10 border border-masala-200 rounded-xl text-sm bg-white text-masala-900 placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500"
        aria-label="Search products"
      />
      {currentQ && (
        <button
          onClick={clear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-masala-400 hover:text-masala-700"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
