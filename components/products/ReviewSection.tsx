'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/Skeleton'
import type { IReview } from '@/types'

// ── Read-only star display ────────────────────────────────────────────────────
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-masala-200'}
        />
      ))}
    </div>
  )
}

// ── Interactive star input ────────────────────────────────────────────────────
function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="p-0.5 rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
        >
          <Star
            size={28}
            className={n <= active ? 'text-yellow-400 fill-yellow-400' : 'text-masala-300'}
          />
        </button>
      ))}
    </div>
  )
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: IReview }) {
  const initials = (review.userName ?? 'C').slice(0, 2).toUpperCase()

  return (
    <div className="flex gap-4 py-5 border-b border-masala-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-saffron-100 text-saffron-700 font-bold text-sm flex items-center justify-center shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
          <span className="font-medium text-masala-900 text-sm">{review.userName ?? 'Customer'}</span>
          <span className="text-xs text-masala-400">
            {format(new Date(review.createdAt), 'dd MMM yyyy')}
          </span>
        </div>
        <StarDisplay rating={review.rating} size={14} />
        {review.comment && (
          <p className="mt-2 text-sm text-masala-700 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────────
interface ReviewData {
  reviews:         IReview[]
  canReview:       boolean
  hasReviewed:     boolean
  eligibleOrderId: string | null
}

export function ReviewSection({ productId }: { productId: string }) {
  const [data, setData]             = useState<ReviewData | null>(null)
  const [loading, setLoading]       = useState(true)
  const [rating, setRating]         = useState(0)
  const [comment, setComment]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then(({ data: d }) => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data?.eligibleOrderId) return
    if (rating === 0) { toast.error('Please select a star rating'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          productId,
          orderId: data.eligibleOrderId,
          rating,
          comment: comment.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? 'Failed to submit review')
        return
      }
      toast.success('Review submitted — thank you!')
      setData((prev) => prev ? {
        ...prev,
        canReview:   false,
        hasReviewed: true,
        reviews: [
          {
            _id:       json.data._id,
            userId:    '',
            productId,
            orderId:   data.eligibleOrderId!,
            rating,
            comment:   comment.trim(),
            createdAt: new Date(),
            userName:  'You',
          },
          ...prev.reviews,
        ],
      } : prev)
      setRating(0)
      setComment('')
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = data && data.reviews.length > 0
    ? data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length
    : 0

  return (
    <section id="reviews" className="mt-16 pb-24 sm:pb-0" aria-labelledby="reviews-heading">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 id="reviews-heading" className="font-heading text-2xl font-bold text-masala-900">
            Customer Reviews
          </h2>
          {!loading && data && (
            <div className="flex items-center gap-3 mt-1.5">
              {data.reviews.length > 0 ? (
                <>
                  <StarDisplay rating={Math.round(avgRating)} />
                  <span className="text-sm text-masala-500">
                    {avgRating.toFixed(1)} · {data.reviews.length}{' '}
                    {data.reviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                </>
              ) : (
                <span className="text-sm text-masala-400">No reviews yet — be the first!</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="space-y-1">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 py-5 border-b border-masala-100">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && data && (
        <>
          {/* Review form — only for eligible users */}
          {data.canReview && (
            <div className="bg-saffron-50 border border-saffron-200 rounded-2xl p-6 mb-8">
              <h3 className="font-heading font-semibold text-masala-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-saffron-600" />
                Share Your Experience
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-masala-800 mb-2 block">
                    Your Rating <span className="text-chili-600">*</span>
                  </label>
                  <StarInput value={rating} onChange={setRating} />
                </div>
                <div>
                  <label htmlFor="review-comment" className="text-sm font-medium text-masala-800 mb-1.5 block">
                    Comment <span className="text-masala-400">(optional)</span>
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="What did you think about this product?"
                    className="w-full border border-masala-200 rounded-xl px-4 py-3 text-sm text-masala-900 bg-white placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 resize-none"
                  />
                  <p className="text-xs text-masala-400 mt-1 text-right">{comment.length}/500</p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Already reviewed */}
          {data.hasReviewed && (
            <div className="bg-cardamom-100 text-cardamom-600 rounded-2xl px-5 py-4 mb-8 text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 fill-cardamom-600" />
              You have already reviewed this product — thank you!
            </div>
          )}

          {/* Review list */}
          {data.reviews.length > 0 ? (
            <div className="bg-white border border-masala-200 rounded-2xl shadow-card px-6">
              {data.reviews.map((r) => (
                <ReviewCard key={r._id} review={r} />
              ))}
            </div>
          ) : (
            !data.canReview && (
              <div className="text-center py-12 text-masala-400">
                <Star className="w-10 h-10 mx-auto mb-3 text-masala-200" />
                <p className="text-sm">No reviews yet for this product.</p>
              </div>
            )
          )}
        </>
      )}
    </section>
  )
}
