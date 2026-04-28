'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

interface CartContextValue {
  count: number
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue>({
  count: 0,
  refresh: async () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const { data } = await res.json()
        const total = (data?.items ?? []).reduce(
          (sum: number, item: { qty: number }) => sum + item.qty,
          0
        )
        setCount(total)
      } else {
        setCount(0)
      }
    } catch {
      setCount(0)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <CartContext.Provider value={{ count, refresh }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
