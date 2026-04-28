import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { connection } from 'next/server'
import { Leaf, FlameKindling, ShieldCheck, MessageCircle, ChevronRight } from 'lucide-react'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { HeroContent } from '@/components/home/HeroContent'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import type { IProduct } from '@/types'

const CATEGORIES = [
  { label: 'Whole Spices',    emoji: '🌱' },
  { label: 'Grounded Spices', emoji: '🟡' },
  { label: 'Veg Masala',      emoji: '🥗' },
  { label: 'Non-Veg Masala',  emoji: '🍗' },
  { label: 'Chai Masala',     emoji: '☕' },
  { label: 'Biryani Masala',  emoji: '🍚' },
  { label: 'Blended Masala',  emoji: '✨' },
]

const WHY_CARDS = [
  {
    Icon: Leaf,
    title: '100% Natural',
    desc:  'No artificial colours, preservatives, or additives. Pure spices — nothing else.',
  },
  {
    Icon: FlameKindling,
    title: 'Family Recipe',
    desc:  'Every blend follows a recipe passed down through generations in our family kitchen.',
  },
  {
    Icon: ShieldCheck,
    title: 'Fresh Ground Daily',
    desc:  'We grind our spices fresh in small batches to lock in maximum flavour and aroma.',
  },
]

async function getFeaturedProducts(): Promise<IProduct[]> {
  try {
    await connectDB()
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
    return JSON.parse(JSON.stringify(products))
  } catch {
    return []
  }
}

function ProductCard({ product }: { product: IProduct }) {
  const hasImage = product.images.length > 0
  return (
    <Link
      href={`/products/${product._id}`}
      className="group bg-white rounded-2xl border border-masala-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
    >
      <div className="relative aspect-square bg-masala-50 overflow-hidden">
        {hasImage ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl select-none">
            🌶️
          </div>
        )}
        <span className="absolute top-3 left-3 bg-saffron-100 text-saffron-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {product.category}
        </span>
        {product.stock === 0 && (
          <span className="absolute top-3 right-3 bg-masala-900/70 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-heading font-semibold text-masala-900 line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <p className="text-sm text-masala-600 mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-saffron-600">₹{product.price}</span>
          {product.stock > 0 ? (
            <span className="flex items-center gap-1 text-xs text-cardamom-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cardamom-600" />
              In Stock
            </span>
          ) : (
            <span className="text-xs text-masala-500">Unavailable</span>
          )}
        </div>

        <div className="pt-1">
          <span className="block w-full text-center py-2 rounded-xl bg-saffron-50 text-saffron-700 text-sm font-medium group-hover:bg-saffron-500 group-hover:text-white transition-colors duration-200">
            View Product
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ── Async component — DB access lives here inside Suspense ── */
async function FeaturedGrid() {
  await connection()
  const products = await getFeaturedProducts()

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-masala-500">
        <span className="text-5xl mb-4 block">🌶️</span>
        <p className="font-medium">Products loading soon...</p>
        <p className="text-sm mt-1">Check back after the admin adds products.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      <div className="text-center mt-10 sm:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-saffron-500 text-saffron-600 rounded-xl text-sm font-medium hover:bg-saffron-50 transition-colors"
        >
          View All Products <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  )
}

/* ── Page shell — static, no async, renders immediately ── */
export default function HomePage() {
  const whatsappUrl = `https://wa.me/${process.env.WHATSAPP_NUMBER ?? ''}`

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <section
        className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 60%, #DC2626 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
        <HeroContent whatsappUrl={whatsappUrl} />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/50">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </section>

      {/* ── Category Strip ── */}
      <section className="py-10 bg-white border-b border-masala-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/products?category=${encodeURIComponent(cat.label)}`}
                className="snap-start shrink-0 flex items-center gap-2 px-4 py-2 bg-masala-50 hover:bg-saffron-50 hover:border-saffron-300 border border-masala-200 rounded-full text-sm font-medium text-masala-800 hover:text-saffron-700 transition-all duration-150 whitespace-nowrap"
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-20 bg-masala-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-saffron-600 text-sm font-semibold uppercase tracking-wider mb-2">
                Handpicked for You
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-masala-900">
                Our Bestsellers
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-saffron-600 text-sm font-medium hover:text-saffron-700 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Suspense fallback={<ProductGridSkeleton count={3} />}>
            <FeaturedGrid />
          </Suspense>
        </div>
      </section>

      {/* ── Why HMP Masala ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-saffron-600 text-sm font-semibold uppercase tracking-wider mb-2">
              Why Choose Us
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-masala-900">
              The HMP Masala Difference
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_CARDS.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group text-center p-8 rounded-3xl bg-masala-50 border border-masala-200 hover:border-saffron-200 hover:bg-saffron-50 transition-all duration-200"
              >
                <div className="w-14 h-14 rounded-2xl bg-saffron-100 group-hover:bg-saffron-200 flex items-center justify-center mx-auto mb-5 transition-colors">
                  <Icon className="w-7 h-7 text-saffron-600" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-masala-900 mb-3">{title}</h3>
                <p className="text-masala-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WhatsApp CTA Banner ── */}
      <section className="py-14 bg-cardamom-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <MessageCircle className="w-10 h-10 text-white/70 mx-auto mb-4" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
            Questions? We&apos;re Just a Message Away
          </h2>
          <p className="text-white/80 mb-8 text-sm md:text-base">
            Chat with us on WhatsApp for orders, custom requests, or anything about our masalas.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-cardamom-700 font-semibold px-8 py-3.5 rounded-2xl hover:bg-green-50 transition-colors shadow-md"
          >
            <MessageCircle className="w-5 h-5" />
            Open WhatsApp
          </a>
        </div>
      </section>

    </div>
  )
}
