'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { CartProvider } from '@/context/CartContext'

interface ProvidersProps {
  children: React.ReactNode
  darkModeEnabled?: boolean
}

export function Providers({ children, darkModeEnabled = true }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        forcedTheme={darkModeEnabled ? undefined : 'light'}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
