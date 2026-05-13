'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export function MobileNav() {
  const pathname      = usePathname()
  const { count }     = useCart()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const tabs = [
    { href: '/',         label: 'Home',     Icon: Home },
    { href: '/products', label: 'Products', Icon: ShoppingBag },
    { href: '/cart',     label: 'Cart',     Icon: ShoppingCart, badge: count },
    { href: '/profile',  label: 'Profile',  Icon: User },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-masala-200 pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map(({ href, label, Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors min-h-[2.75rem] ${
                active ? 'text-chili-600' : 'text-masala-500'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={badge ? `${label}, ${badge} item${badge !== 1 ? 's' : ''}` : label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${active ? 'fill-chili-100' : ''}`}
                  strokeWidth={active ? 2.5 : 1.75}
                />
                {!!badge && (
                  <span className="absolute -top-1 -right-1.5 bg-chili-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
