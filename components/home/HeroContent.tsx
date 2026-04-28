'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, MessageCircle, Star, Sparkles, Leaf, ShieldCheck } from 'lucide-react'

/* ── Floating spice particle ── */
function Particle({ x, size, delay, duration }: { x: string; size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width:  size,
        height: size,
        left:   x,
        bottom: '-5%',
        background:
          size > 7
            ? 'radial-gradient(circle, rgba(245,158,11,0.55) 0%, rgba(220,38,38,0.25) 100%)'
            : 'rgba(245,158,11,0.35)',
        filter: 'blur(1px)',
      }}
      animate={{ y: [0, -900], opacity: [0, 0.9, 0.5, 0], rotate: [0, 360] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

const PARTICLES = [
  { x: '8%',  size: 10, delay: 0,   duration: 12 },
  { x: '18%', size: 5,  delay: 1.5, duration: 9  },
  { x: '30%', size: 8,  delay: 3,   duration: 14 },
  { x: '45%', size: 4,  delay: 0.8, duration: 10 },
  { x: '55%', size: 11, delay: 2.2, duration: 13 },
  { x: '68%', size: 6,  delay: 1,   duration: 11 },
  { x: '78%', size: 9,  delay: 3.5, duration: 15 },
  { x: '88%', size: 4,  delay: 0.4, duration: 8  },
  { x: '22%', size: 7,  delay: 4,   duration: 12 },
  { x: '60%', size: 5,  delay: 2.8, duration: 10 },
  { x: '92%', size: 8,  delay: 1.8, duration: 13 },
  { x: '3%',  size: 4,  delay: 3.2, duration: 9  },
]

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
})

const TRUST = [
  { icon: Leaf,        label: '100% Natural' },
  { icon: ShieldCheck, label: 'No Preservatives' },
  { icon: Star,        label: 'Family Recipe' },
]

export function HeroContent({ whatsappUrl }: { whatsappUrl: string }) {
  return (
    <>
      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Badge */}
        <motion.div
          {...fade(0)}
          className="inline-flex items-center gap-2 bg-white/[0.1] backdrop-blur-md text-white/90 px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-white/[0.18]"
        >
          <motion.div
            animate={{ rotate: [0, 15, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
          </motion.div>
          Authentic Family Recipe — Since 1985
          <Star className="w-3 h-3 fill-yellow-200 text-yellow-200" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          {...fade(0.1)}
          className="font-brand text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
        >
          Pure Spices.
          <br />
          <span className="relative inline-block">
            <span className="text-yellow-200">Family Recipe.</span>

            {/* Animated underline */}
            <motion.svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 320 10"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
            >
              <motion.path
                d="M2 6 C60 1, 120 10, 160 5 C200 0, 260 9, 318 4"
                stroke="rgba(253,230,138,0.7)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
              />
            </motion.svg>
          </span>
        </motion.h1>

        {/* Sub-text */}
        <motion.p
          {...fade(0.25)}
          className="text-white/75 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Handcrafted masalas made with love by the HMP family.{' '}
          <span className="text-yellow-200 font-semibold">Fresh ground, no preservatives,</span>{' '}
          shipped straight from our kitchen to yours.
        </motion.p>

        {/* CTA */}
        <motion.div
          {...fade(0.35)}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/products"
            className="group relative inline-flex items-center justify-center gap-2 bg-white text-saffron-600 font-bold px-9 py-4 rounded-full hover:bg-yellow-50 transition-all shadow-2xl shadow-black/25 text-base overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            />
            <span className="relative z-10">Shop Our Collection</span>
            <ChevronRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/[0.1] hover:bg-white/[0.18] text-white border border-white/[0.2] hover:border-white/[0.35] rounded-full font-bold px-9 py-4 transition-all backdrop-blur-xl text-base"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Us
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-14 flex items-center justify-center gap-6 text-white/50 text-sm font-medium flex-wrap"
        >
          {TRUST.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-px h-4 bg-white/20 mr-6" />}
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-300/70 animate-pulse" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  )
}
