'use client'

import { ThemeProvider } from 'next-themes'
import { CartProvider } from '@/context/CartContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  )
}
