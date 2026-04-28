import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center bg-masala-50 px-6">
        <div className="text-center max-w-md">
          <p className="text-8xl mb-6 select-none">🌶️</p>
          <h1 className="font-heading text-4xl font-bold text-masala-900 mb-3">Page Not Found</h1>
          <p className="text-masala-600 mb-8 leading-relaxed">
            Looks like this page wandered off. Head back to our store and explore our fresh masalas.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-2.5 bg-saffron-500 text-white font-medium rounded-xl hover:bg-saffron-600 transition-colors shadow-md"
            >
              Go Home
            </Link>
            <Link
              href="/products"
              className="px-6 py-2.5 border border-saffron-500 text-saffron-600 font-medium rounded-xl hover:bg-saffron-50 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
