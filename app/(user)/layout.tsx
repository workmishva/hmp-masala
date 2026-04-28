import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
      <ScrollToTop />
    </>
  )
}
