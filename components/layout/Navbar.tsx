import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { getSettings } from '@/lib/settings'
import { NavbarClient } from './NavbarClient'

async function NavbarAuthState() {
  const [session, settings] = await Promise.all([auth(), getSettings()])
  const isAdmin = session?.user?.role === 'admin'
  return (
    <NavbarClient
      userName={session?.user?.name ?? undefined}
      userRole={session?.user?.role ?? undefined}
      darkModeEnabled={isAdmin ? true : settings.darkModeEnabled}
    />
  )
}

function NavbarAuthFallback() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-masala-100 animate-pulse" />
      <div className="hidden md:block w-20 h-8 rounded-xl bg-masala-100 animate-pulse" />
    </div>
  )
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-masala-100/95 backdrop-blur-sm border-b border-masala-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
        {/* Logo — always static, renders instantly */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo/logo_bg_removed.png"
            alt="HMP Masala Logo"
            width={100}
            height={36}
            style={{ width: 'auto', height: '36px' }}
            className="object-contain"
          />
          <span className="text-xl font-brand font-black tracking-tight bg-linear-to-r from-chili-600 to-saffron-500 bg-clip-text text-transparent">
            HMP Masala
          </span>
        </Link>

        {/* Auth-dependent section streams in via Suspense */}
        <Suspense fallback={<NavbarAuthFallback />}>
          <NavbarAuthState />
        </Suspense>
      </div>
    </header>
  )
}
