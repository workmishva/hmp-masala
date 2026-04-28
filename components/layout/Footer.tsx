import Link from 'next/link'
import { MessageCircle, Leaf } from 'lucide-react'

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ?? ''
const CURRENT_YEAR = 2025

export function Footer() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <footer className="bg-masala-900 text-masala-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-saffron-500" />
              <span className="text-xl font-brand font-bold text-white">HMP Masala</span>
            </div>
            <p className="text-sm text-masala-400 leading-relaxed">
              Handcrafted masalas made with love. Authentic family recipes, freshly ground and packed for your kitchen.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cardamom-600 text-white text-sm font-medium rounded-xl hover:bg-cardamom-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/',          label: 'Home' },
                { href: '/products',  label: 'Products' },
                { href: '/my-orders', label: 'My Orders' },
                { href: '/profile',   label: 'My Profile' },
                { href: '/cart',      label: 'Cart' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-masala-400 hover:text-saffron-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Our Masalas</h3>
            <ul className="space-y-2.5">
              {['Garam Masala', 'Chai Masala', 'Biryani Masala', 'Pav Bhaji Masala', 'Sambar Masala'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="text-sm text-masala-400 hover:text-saffron-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-8 border-masala-800" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-masala-500">
          <p>© {CURRENT_YEAR} HMP Masala. All rights reserved.</p>
          <p>Pure Spices. Family Recipe. Made with ❤️</p>
        </div>
      </div>
    </footer>
  )
}
