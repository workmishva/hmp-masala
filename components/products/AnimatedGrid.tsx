'use client'

import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
}

export function AnimatedGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children }: { children: React.ReactNode }) {
  return <motion.div variants={item}>{children}</motion.div>
}
