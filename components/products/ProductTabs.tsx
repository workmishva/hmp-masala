'use client'

import { useState } from 'react'

type Tab = 'Description' | 'Ingredients' | 'How to Use'
const TABS: Tab[] = ['Description', 'Ingredients', 'How to Use']

const HOW_TO_USE =
  'Use 1–2 teaspoons per serving. Add to hot oil or ghee and fry briefly before adding other ingredients. Adjust quantity to taste. Store in a cool, dry place away from direct sunlight.'

interface ProductTabsProps {
  description: string
}

export function ProductTabs({ description }: ProductTabsProps) {
  const [active, setActive] = useState<Tab>('Description')

  const content: Record<Tab, string> = {
    'Description': description,
    'Ingredients': description,
    'How to Use':  HOW_TO_USE,
  }

  return (
    <div className="mt-8">
      <div className="border-b border-masala-200 flex" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === tab
                ? 'border-saffron-500 text-saffron-700'
                : 'border-transparent text-masala-500 hover:text-masala-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="py-5 text-masala-700 text-sm leading-relaxed">
        <p>{content[active]}</p>
      </div>
    </div>
  )
}
