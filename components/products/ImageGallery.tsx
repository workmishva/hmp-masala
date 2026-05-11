'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images:      string[]
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [active, setActive] = useState(0)

  const hasImages = images.length > 0

  if (!hasImages) {
    return (
      <div className="aspect-square bg-masala-50 rounded-3xl flex items-center justify-center text-8xl select-none border border-masala-200">
        🌶️
      </div>
    )
  }

  const prev = () => setActive((a) => (a === 0 ? images.length - 1 : a - 1))
  const next = () => setActive((a) => (a === images.length - 1 ? 0 : a + 1))

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square bg-masala-50 rounded-3xl overflow-hidden border border-masala-200 group">
        <Image
          src={images[active]}
          alt={`${productName} — image ${active + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-masala-800" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-masala-800" />
            </button>
            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === active ? 'bg-chili-600 w-4' : 'bg-white/70'
                  }`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === active ? 'border-saffron-500' : 'border-masala-200 hover:border-saffron-300'
              }`}
              aria-label={`Select image ${i + 1}`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
