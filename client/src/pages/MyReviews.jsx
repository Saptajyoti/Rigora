import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SiteHeader from '../components/SiteHeader';
import { fetchMyReviews } from '../store/reviewSlice';
import PageIntro from '../components/PageIntro';
export default function MyReviews() {
  const dispatch = useDispatch();
  const { mine, loading } = useSelector((s) => s.reviews);
  useEffect(() => {
    dispatch(fetchMyReviews());
  }, [dispatch]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <PageIntro
          eyebrow="Your feedback"
          title="My reviews"
          description="Review the product feedback you have shared with Rigora."
        />
        {loading ? (
          <p className="mt-6 text-zinc-400">Loading reviews…</p>
        ) : (
          <div className="mt-6 space-y-4">
            {mine.map((review) => (
              <article key={review._id} className="rigora-panel p-5">
                <p className="font-semibold">{review.product?.name}</p>
                <p className="mt-2 text-zinc-300">{review.title}</p>
                <p className="mt-2 text-sm text-zinc-500">Status: {review.status}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
