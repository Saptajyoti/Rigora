import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SiteHeader from '../components/SiteHeader';
import { fetchAdminReviews, moderateReview } from '../store/reviewSlice';
export default function AdminReviews() {
  const dispatch = useDispatch();
  const { admin, loading } = useSelector((s) => s.reviews);
  useEffect(() => {
    dispatch(fetchAdminReviews());
  }, [dispatch]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <h1 className="text-3xl font-semibold">Review moderation</h1>
        {loading ? (
          <p className="mt-6 text-zinc-400">Loading reviews…</p>
        ) : (
          <div className="mt-6 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-zinc-500">
                  <th className="p-3">Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {admin.map((review) => (
                  <tr key={review._id} className="border-t border-white/10">
                    <td className="p-3">{review.product?.name}</td>
                    <td>{review.user?.email || review.user?.username}</td>
                    <td>{review.rating}/5</td>
                    <td>{review.status}</td>
                    <td className="space-x-2">
                      <button
                        onClick={() =>
                          dispatch(moderateReview({ id: review._id, status: 'approved' }))
                        }
                        className="text-cyan-300"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          dispatch(moderateReview({ id: review._id, status: 'rejected' }))
                        }
                        className="text-rose-300"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
