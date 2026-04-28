export const PRODUCT_CATEGORIES = [
  'Whole Spices',
  'Grounded Spices',
  'Veg Masala',
  'Non-Veg Masala',
  'Chai Masala',
  'Biryani Masala',
  'Blended Masala',
  'Other',
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

export const CATEGORY_META: Record<string, { emoji: string; description: string }> = {
  'Whole Spices':    { emoji: '🌱', description: 'Cumin, cloves, cardamom, cinnamon, bay leaves' },
  'Grounded Spices': { emoji: '🟡', description: 'Turmeric, red chili, coriander, cumin powder' },
  'Veg Masala':      { emoji: '🥗', description: 'Garam masala, chaat masala, pav bhaji, sambar' },
  'Non-Veg Masala':  { emoji: '🍗', description: 'Chicken masala, meat masala, fish curry powder' },
  'Chai Masala':     { emoji: '☕', description: 'Tea masala, ginger-cardamom blends' },
  'Biryani Masala':  { emoji: '🍚', description: 'Biryani and pulao spice mixes' },
  'Blended Masala':  { emoji: '✨', description: 'Special house blends and signature mixes' },
  'Other':           { emoji: '🌶️', description: 'Specialty and seasonal spice products' },
}
