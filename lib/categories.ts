import { Sprout, Wheat, Leaf, Bone, Gem } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const PRODUCT_CATEGORIES = [
  'Whole Spices',
  'Grounded',
  'Veg',
  'Non-Veg',
  'Namak',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

export const CATEGORY_META: Record<string, { icon: LucideIcon; description: string }> = {
  'Whole Spices': { icon: Sprout, description: 'Cumin, coriander, fenugreek, fennel, carom seeds' },
  'Grounded':     { icon: Wheat,  description: 'Turmeric, red chili, coriander-cumin powder' },
  'Veg':          { icon: Leaf,   description: 'Garam masala, chaat masala, pav bhaji, sambar' },
  'Non-Veg':      { icon: Bone,   description: 'Chicken masala, meat masala, fish curry powder' },
  'Namak':        { icon: Gem,    description: 'Rock salt, black salt' },
}
