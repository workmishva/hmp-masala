'use client'

import { CheckCircle2 } from 'lucide-react'

export interface WeightOption {
  id:         string
  label:      string
  desc:       string
  multiplier: number
}

export const WEIGHT_OPTIONS: WeightOption[] = [
  { id: '50g',  label: '50g',  desc: 'Sample / gifting',   multiplier: 0.35 },
  { id: '100g', label: '100g', desc: 'Small household',    multiplier: 0.60 },
  { id: '250g', label: '250g', desc: 'Standard pack',      multiplier: 1.0  },
  { id: '500g', label: '500g', desc: 'Family / bulk pack', multiplier: 1.75 },
]

interface WeightSelectorProps {
  basePrice: number
  selected:  WeightOption
  onChange:  (option: WeightOption) => void
}

export function WeightSelector({ basePrice, selected, onChange }: WeightSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-masala-800">Select Weight</label>
      <div className="grid grid-cols-2 gap-2">
        {WEIGHT_OPTIONS.map((opt) => {
          const isSelected = selected.id === opt.id
          const price      = Math.round(basePrice * opt.multiplier)
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt)}
              aria-pressed={isSelected}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-600 ${
                isSelected
                  ? 'border-chili-600 bg-chili-100 shadow-sm'
                  : 'border-masala-200 hover:border-chili-600/30 hover:bg-chili-100/30'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="w-4 h-4 text-chili-600 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-masala-300 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-chili-600' : 'text-masala-900'}`}>
                    {opt.label}
                  </span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-chili-600' : 'text-masala-600'}`}>
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-masala-500 truncate leading-tight">{opt.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
