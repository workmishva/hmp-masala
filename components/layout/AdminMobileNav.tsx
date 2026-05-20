'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, MessageSquare, Settings } from 'lucide-react'

const navItems = [
  { href: '/admin',          label: 'Dash',     Icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/orders',   label: 'Orders',   Icon: ShoppingBag },
  { href: '/admin/users',    label: 'Users',    Icon: Users },
  { href: '/admin/reviews',  label: 'Reviews',  Icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
]

export function AdminMobileNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <nav
      className="md:hidden bg-masala-900 border-b border-masala-800 overflow-x-auto scrollbar-hide"
      aria-label="Admin navigation"
    >
      <div className="flex min-w-max px-2">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 px-4 py-3 text-[10px] font-medium transition-colors whitespace-nowrap min-w-16 ${
                active
                  ? 'text-chili-500 border-b-2 border-chili-500'
                  : 'text-masala-400 hover:text-masala-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
