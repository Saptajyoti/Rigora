import { Star, ThumbsUp, Trash2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview, deleteReview, toggleHelpful } from '../store/reviewSlice';
import { getMotionVariants, viewportOptions } from '../motion/variants';

function ReviewSkeleton() {
  return (
    <div className="rigora-panel space-y-4 p-5" aria-hidden="true">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="rigora-product-skeleton h-5 w-44 rounded" />
          <div className="rigora-product-skeleton h-3 w-24 rounded" />
        </div>
        <div className="rigora-product-skeleton h-4 w-20 rounded" />
      </div>
      <div className="space-y-2">
        <div className="rigora-product-skeleton h-3 w-full rounded" />
        <div className="rigora-product-skeleton h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}
export function StarRating({ value, onChange, label = 'Rating' }) {
  return (
    <div role={onChange ? 'radiogroup' : 'img'} aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange(star)}
          className="disabled:cursor-default"
        >
          <Star
            size={18}
            fill={star <= value ? 'currentColor' : 'none'}
            className={star <= value ? 'text-amber-300' : 'text-zinc-600'}
          />
        </button>
      ))}
    </div>
  );
}
export function RatingSummary({ product }) {
  const d = product.ratingDistribution || {};
  return (
    <section className="rigora-panel p-5">
      <div className="flex items-center gap-4">
        <span className="text-4xl font-semibold">
          {Number(product.averageRating || 0).toFixed(1)}
        </span>
        <div>
          <StarRating value={Math.round(product.averageRating || 0)} />
          <p className="mt-1 text-sm text-zinc-400">
            {product.reviewCount || 0} approved reviews
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-3 text-xs">
            <span>{rating}</span>
            <div className="h-2 flex-1 overflow-hidden rounded bg-white/10">
              <div
                className="h-full bg-amber-300"
                style={{
                  width: `${product.reviewCount ? ((d[['one', 'two', 'three', 'four', 'five'][rating - 1]] || 0) / product.reviewCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export function ReviewForm({ productId }) {
  const dispatch = useDispatch();
  const { mutationLoading } = useSelector((s) => s.reviews);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData();
    form.set('rating', rating);
    form.set('title', title);
    form.set('comment', comment);
    await dispatch(createReview({ productId, form }));
    setTitle('');
    setComment('');
  };
  return (
    <form onSubmit={submit} className="rigora-panel mt-6 p-5">
      <h3 className="font-semibold">Write a review</h3>
      <div className="mt-3">
        <StarRating value={rating} onChange={setRating} />
      </div>
      <input
        required
        minLength="3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title"
        className="input mt-3 w-full"
      />
      <textarea
        required
        minLength="10"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience"
        className="input mt-3 min-h-28 w-full"
      />
      <button
        disabled={mutationLoading}
        className="rigora-primary-action mt-3 px-4 py-2 text-sm"
      >
        Submit review
      </button>
    </form>
  );
}
export function ReviewList() {
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const { reviews, loading, error } = useSelector((s) => s.reviews);
  const user = useSelector((s) => s.auth.user);
  if (loading)
    return (
      <div className="mt-6 space-y-4" aria-label="Loading reviews">
        <ReviewSkeleton />
        <ReviewSkeleton />
      </div>
    );
  if (error) return <p className="mt-6 text-rose-300">{error}</p>;
  if (!reviews.length)
    return <p className="mt-6 text-zinc-400">No approved reviews yet.</p>;
  return (
    <div className="mt-6 space-y-4">
      {reviews.map((review) => (
        <motion.article
          key={review._id}
          className="rigora-panel p-5"
          variants={variants.fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-semibold">{review.title}</p>
              <StarRating value={review.rating} />
              <p className="mt-2 text-sm text-zinc-400">
                {review.user?.firstName}{' '}
                {review.isVerifiedPurchase && (
                  <span className="text-cyan-300">Verified purchase</span>
                )}
              </p>
            </div>
            {user?.id === review.user?._id && (
              <button
                onClick={() => dispatch(deleteReview(review._id))}
                aria-label="Delete review"
                className="text-rose-300"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">{review.comment}</p>
          {user?.id !== review.user?._id && (
            <button
              onClick={() => dispatch(toggleHelpful(review._id))}
              className="mt-4 flex items-center gap-2 text-sm text-zinc-400"
            >
              <ThumbsUp size={15} /> Helpful ({review.helpfulUsers?.length || 0})
            </button>
          )}
        </motion.article>
      ))}
    </div>
  );
}
