'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, Users, Settings } from 'lucide-react'

const navItems = [
  { href: '/admin',          label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products',  Icon: Package },
  { href: '/admin/orders',   label: 'Orders',    Icon: ShoppingBag },
  { href: '/admin/users',    label: 'Users',     Icon: Users },
  { href: '/admin/settings', label: 'Settings',  Icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <nav className="flex-1 py-6 px-3 space-y-1" aria-label="Admin navigation">
      {navItems.map(({ href, label, Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? 'bg-chili-600 text-white'
                : 'text-masala-300 hover:bg-masala-800 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
