'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PRODUCT_CATEGORIES, CATEGORY_META } from '@/lib/categories'

const ACCENT: Record<string, string> = {
  'Whole Spices': 'bg-cardamom-600',
  'Grounded':     'bg-saffron-500',
  'Veg':          'bg-cardamom-600',
  'Non-Veg':      'bg-chili-600',
  'Namak':        'bg-blue-500',
}

const ICON_BG: Record<string, string> = {
  'Whole Spices': 'bg-cardamom-100',
  'Grounded':     'bg-saffron-100',
  'Veg':          'bg-cardamom-100',
  'Non-Veg':      'bg-chili-100',
  'Namak':        'bg-blue-50',
}

const ICON_COLOR: Record<string, string> = {
  'Whole Spices': 'text-cardamom-600',
  'Grounded':     'text-saffron-600',
  'Veg':          'text-cardamom-600',
  'Non-Veg':      'text-chili-600',
  'Namak':        'text-blue-500',
}

const HOVER_RING: Record<string, string> = {
  'Whole Spices': 'hover:border-cardamom-600/40',
  'Grounded':     'hover:border-saffron-500/40',
  'Veg':          'hover:border-cardamom-600/40',
  'Non-Veg':      'hover:border-chili-600/40',
  'Namak':        'hover:border-blue-400/40',
}

const container: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export function CategoryStrip() {
  return (
    <section className="py-16 bg-masala-50">
      <div className="max-w-7xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-saffron-600 text-sm font-semibold uppercase tracking-wider mb-2">
            Browse by Category
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-masala-900">
            Find Your Spice
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {PRODUCT_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat]
            const Icon = meta.icon
            return (
              <motion.div key={cat} variants={item}>
                <Link
                  href={`/products?category=${encodeURIComponent(cat)}`}
                  className={`group flex flex-col overflow-hidden rounded-3xl bg-white border border-masala-200 shadow-card hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 ${HOVER_RING[cat]}`}
                >
                  {/* top accent bar */}
                  <div className={`h-1 w-full ${ACCENT[cat]}`} />

                  <div className="p-5 flex flex-col items-center text-center gap-3 flex-1">
                    <div className={`w-14 h-14 rounded-2xl ${ICON_BG[cat]} flex items-center justify-center`}>
                      <Icon size={28} className={ICON_COLOR[cat]} strokeWidth={1.75} />
                    </div>

                    <div>
                      <h3 className="font-heading font-semibold text-masala-900 text-base leading-tight">
                        {cat}
                      </h3>
                      <p className="text-masala-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
                        {meta.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-1 flex items-center gap-1 text-saffron-600 text-xs font-semibold group-hover:gap-2 transition-all">
                      Browse
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}
