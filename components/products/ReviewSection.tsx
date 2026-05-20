'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Star, MessageSquarePlus, LogIn, ShoppingBag, X, CheckCircle,
  EyeOff, Pencil, Trash2, AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/Skeleton'
import type { IReview } from '@/types'

// ── Read-only star row ────────────────────────────────────────────────────────
function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
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

// ── Interactive star picker ───────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  const labels = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent']

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''} — ${labels[n - 1]}`}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            className="p-0.5 rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
          >
            <Star
              size={32}
              className={n <= active ? 'text-yellow-400 fill-yellow-400' : 'text-masala-200 hover:text-yellow-300'}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <span className="text-sm font-medium text-masala-600">{labels[active - 1]}</span>
      )}
    </div>
  )
}

// ── Average rating bar ────────────────────────────────────────────────────────
function RatingBar({ count, max }: { count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex-1 h-1.5 bg-masala-100 rounded-full overflow-hidden">
      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: IReview }) {
  const ini = (review.userName ?? 'C')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex gap-4 py-5 border-b border-masala-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-saffron-100 text-saffron-700 font-bold text-sm flex items-center justify-center shrink-0 select-none">
        {ini}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <span className="font-semibold text-masala-900 text-sm">{review.userName ?? 'Customer'}</span>
          <span className="text-xs text-masala-400">
            {format(new Date(review.createdAt), 'dd MMM yyyy')}
          </span>
        </div>
        <StarDisplay rating={review.rating} size={13} />
        {review.title && (
          <p className="mt-2 text-sm font-semibold text-masala-900">{review.title}</p>
        )}
        {review.comment && (
          <p className="mt-1 text-sm text-masala-600 leading-relaxed">{review.comment}</p>
        )}
      </div>
    </div>
  )
}

// ── Review modal (create + edit) ──────────────────────────────────────────────
interface ReviewModalProps {
  productId:        string
  eligibleOrderId:  string
  initialRating?:   number
  initialTitle?:    string
  initialComment?:  string
  isEdit?:          boolean
  onClose:          () => void
  onSubmitted:      (review: Partial<IReview>) => void
}

function ReviewModal({
  productId, eligibleOrderId, initialRating = 0, initialTitle = '', initialComment = '',
  isEdit = false, onClose, onSubmitted,
}: ReviewModalProps) {
  const [rating,     setRating]     = useState(initialRating)
  const [title,      setTitle]      = useState(initialTitle)
  const [comment,    setComment]    = useState(initialComment)
  const [submitting, setSubmitting] = useState(false)
  const overlayRef   = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => { firstFocusRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          productId,
          orderId: eligibleOrderId,
          rating,
          title:   title.trim(),
          comment: comment.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to submit review'); return }

      toast.success(isEdit ? 'Review updated!' : 'Review submitted — thank you!')
      onSubmitted({
        _id:       json.data._id,
        userId:    '',
        productId,
        orderId:   eligibleOrderId,
        rating,
        title:     title.trim(),
        comment:   comment.trim(),
        isHidden:  false,
        createdAt: new Date(),
        userName:  'You',
      })
      onClose()
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl border border-masala-200 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-masala-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-saffron-100 flex items-center justify-center">
              <MessageSquarePlus className="w-4.5 h-4.5 text-saffron-600" />
            </div>
            <h2 id="review-modal-title" className="font-heading text-lg font-bold text-masala-900">
              {isEdit ? 'Edit Your Review' : 'Write a Review'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-masala-400 hover:bg-masala-100 hover:text-masala-700 transition-colors"
            aria-label="Close review form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto px-6 py-6">
          <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-masala-800 mb-3">
                Your Rating <span className="text-chili-600">*</span>
              </label>
              <div ref={firstFocusRef} tabIndex={-1}>
                <StarPicker value={rating} onChange={setRating} />
              </div>
            </div>

            <div>
              <label htmlFor="review-title" className="block text-sm font-semibold text-masala-800 mb-1.5">
                Review Title <span className="text-masala-400 font-normal">(optional)</span>
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Summarise your experience in a few words"
                className="w-full h-10 border border-masala-200 rounded-xl px-4 text-sm text-masala-900 bg-masala-50 placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 transition-all"
              />
              <p className="text-xs text-masala-400 mt-1 text-right">{title.length}/100</p>
            </div>

            <div>
              <label htmlFor="review-comment" className="block text-sm font-semibold text-masala-800 mb-1.5">
                Your Review <span className="text-masala-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Tell others what you liked or disliked about this product..."
                className="w-full border border-masala-200 rounded-xl px-4 py-3 text-sm text-masala-900 bg-masala-50 placeholder:text-masala-400 focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500 resize-none transition-all"
              />
              <p className="text-xs text-masala-400 mt-1 text-right">{comment.length}/500</p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-masala-100 shrink-0">
          <button type="button" onClick={onClose}
            className="h-10 px-5 rounded-xl border border-masala-200 text-masala-700 text-sm font-medium hover:bg-masala-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            form="review-form"
            disabled={submitting || rating === 0}
            className="h-10 px-6 rounded-xl bg-chili-600 hover:bg-chili-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Star className="w-3.5 h-3.5 fill-white" />
                {isEdit ? 'Save Changes' : 'Submit Review'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
type ReviewEligibility = 'guest' | 'admin' | 'no_order' | 'already_reviewed' | 'eligible'

interface ReviewData {
  reviews:           IReview[]
  userReview:        IReview | null
  canReview:         boolean
  hasReviewed:       boolean
  eligibleOrderId:   string | null
  reviewEligibility: ReviewEligibility
}

export function ReviewSection({ productId }: { productId: string }) {
  const [data, setData]           = useState<ReviewData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editOpen, setEditOpen]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then(({ data: d }) => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  const handleSubmitted = (partial: Partial<IReview>) => {
    setData((prev) => {
      if (!prev) return prev
      const newReview: IReview = {
        _id:       partial._id ?? '',
        userId:    partial.userId ?? '',
        productId: partial.productId ?? productId,
        orderId:   partial.orderId ?? prev.eligibleOrderId ?? '',
        rating:    partial.rating ?? 0,
        title:     partial.title ?? '',
        comment:   partial.comment ?? '',
        isHidden:  prev.userReview?.isHidden ?? false,
        createdAt: partial.createdAt ?? new Date(),
        userName:  partial.userName ?? 'You',
      }
      return {
        ...prev,
        canReview:         false,
        hasReviewed:       true,
        reviewEligibility: 'already_reviewed' as ReviewEligibility,
        userReview:        newReview,
      }
    })
  }

  const handleDeleteReview = async () => {
    if (!data?.userReview) return
    setDeleting(true)
    try {
      const res  = await fetch(`/api/reviews/${data.userReview._id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to delete review'); return }

      toast.success('Review deleted')
      setConfirmDelete(false)
      setData((prev) => prev ? {
        ...prev,
        userReview:        null,
        hasReviewed:       false,
        canReview:         true,
        reviewEligibility: 'eligible' as ReviewEligibility,
        eligibleOrderId:   prev.userReview?.orderId ?? prev.eligibleOrderId,
      } : prev)
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeleting(false)
    }
  }

  const reviewCount  = data?.reviews.length ?? 0
  const avgRating    = reviewCount > 0
    ? data!.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
    : 0

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: data?.reviews.filter((r) => r.rating === star).length ?? 0,
  }))

  return (
    <section id="reviews" className="mt-16 pb-24 sm:pb-0" aria-labelledby="reviews-heading">

      {/* Section header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 id="reviews-heading" className="font-heading text-2xl font-bold text-masala-900">
            Customer Reviews
          </h2>
          {!loading && data && reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <StarDisplay rating={Math.round(avgRating)} size={15} />
              <span className="text-sm text-masala-500">
                {avgRating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>

        {/* Write Review CTA — for eligible buyers who haven't yet reviewed */}
        {!loading && data?.reviewEligibility === 'eligible' && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chili-600 hover:bg-chili-700 active:scale-[0.97] text-white text-sm font-semibold shadow-md shadow-chili-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-600"
          >
            <MessageSquarePlus size={16} />
            Write a Review
          </button>
        )}
      </div>

      {/* Eligibility hints */}
      {!loading && data && (
        data.reviewEligibility === 'guest' ? (
          <div className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-xl bg-masala-50 border border-masala-200 text-sm text-masala-500">
            <LogIn size={15} className="shrink-0 text-masala-400" />
            <span>
              <a href="/login" className="text-chili-600 font-medium hover:underline">Sign in</a>
              {' '}to leave a review — only customers with a delivered order can review products.
            </span>
          </div>
        ) : data.reviewEligibility === 'no_order' ? (
          <div className="flex items-center gap-2.5 mb-6 px-4 py-3 rounded-xl bg-masala-50 border border-masala-200 text-sm text-masala-500">
            <ShoppingBag size={15} className="shrink-0 text-masala-400" />
            <span>Reviews are open to customers who have received a delivered order for this product.</span>
          </div>
        ) : null
      )}

      {/* ── User's own review ── */}
      {!loading && data?.userReview && (
        <div className={`mb-6 rounded-2xl border p-5 ${
          data.userReview.isHidden
            ? 'border-masala-200 bg-masala-50/60'
            : 'border-saffron-200 bg-saffron-50/40'
        }`}>
          {/* Row: "Your Review" label + badges + actions */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-cardamom-600 shrink-0" />
              <span className="text-sm font-semibold text-masala-800">Your Review</span>
            </div>

            {data.userReview.isHidden ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-masala-100 text-masala-600 text-xs font-medium">
                <EyeOff className="w-3 h-3" /> Hidden by Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cardamom-100 text-cardamom-600 text-xs font-medium">
                Visible to everyone
              </span>
            )}

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-masala-600 hover:bg-masala-100 transition-colors"
                aria-label="Edit your review"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-chili-600 hover:bg-chili-100 transition-colors"
                aria-label="Delete your review"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Inline delete confirm */}
          {confirmDelete && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-chili-50 border border-chili-200">
              <AlertTriangle className="w-4 h-4 text-chili-600 shrink-0" />
              <p className="text-sm text-masala-700 flex-1">Delete your review? You can re-review after deletion.</p>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-masala-200 text-masala-600 hover:bg-masala-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-chili-600 text-white hover:bg-chili-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  {deleting
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Trash2 className="w-3 h-3" />}
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Review content */}
          <StarDisplay rating={data.userReview.rating} size={14} />
          {data.userReview.title && (
            <p className="mt-2 text-sm font-semibold text-masala-900">{data.userReview.title}</p>
          )}
          {data.userReview.comment && (
            <p className="mt-1 text-sm text-masala-600 leading-relaxed">{data.userReview.comment}</p>
          )}
          <p className="mt-2 text-xs text-masala-400">
            {format(new Date(data.userReview.createdAt), 'dd MMM yyyy')}
          </p>

          {data.userReview.isHidden && (
            <p className="mt-2 text-xs text-masala-500 italic">
              This review is hidden by the admin and is not visible to other customers.
            </p>
          )}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-1">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 py-5 border-b border-masala-100">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && data && reviewCount > 0 && (
        <>
          {reviewCount >= 3 && (
            <div className="bg-masala-50 rounded-2xl border border-masala-200 p-5 mb-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="text-center shrink-0">
                <p className="text-5xl font-black text-masala-900 leading-none">{avgRating.toFixed(1)}</p>
                <StarDisplay rating={Math.round(avgRating)} size={16} />
                <p className="text-xs text-masala-400 mt-1">{reviewCount} reviews</p>
              </div>
              <div className="flex-1 w-full space-y-1.5">
                {distribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-xs text-masala-500">
                    <span className="w-3 text-right shrink-0">{star}</span>
                    <Star size={11} className="text-yellow-400 fill-yellow-400 shrink-0" />
                    <RatingBar count={count} max={reviewCount} />
                    <span className="w-5 text-right shrink-0">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-masala-200 rounded-2xl shadow-card px-6">
            {data.reviews.map((r) => (
              <ReviewCard key={r._id} review={r} />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && data && reviewCount === 0 && !data.userReview && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={22} className="text-masala-200 mx-0.5" />
            ))}
          </div>
          <p className="text-sm font-medium text-masala-600">No reviews yet for this product.</p>
          {data.reviewEligibility === 'eligible' && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-chili-600 hover:bg-chili-700 text-white text-sm font-semibold shadow-md transition-all"
            >
              <MessageSquarePlus size={15} />
              Be the first to review
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {modalOpen && data?.eligibleOrderId && (
        <ReviewModal
          productId={productId}
          eligibleOrderId={data.eligibleOrderId}
          onClose={() => setModalOpen(false)}
          onSubmitted={handleSubmitted}
        />
      )}

      {editOpen && data?.userReview && data?.eligibleOrderId && (
        <ReviewModal
          productId={productId}
          eligibleOrderId={data.eligibleOrderId}
          initialRating={data.userReview.rating}
          initialTitle={data.userReview.title}
          initialComment={data.userReview.comment}
          isEdit
          onClose={() => setEditOpen(false)}
          onSubmitted={handleSubmitted}
        />
      )}
    </section>
  )
}
