import { useDispatch, useSelector } from 'react-redux';
import SiteHeader from '../components/SiteHeader';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import EmptyState from '../components/EmptyState';
import PageIntro from '../components/PageIntro';
import { clearGuestCart, loadStore, removeCart, updateCart } from '../store/storeSlice';
import { Link } from 'react-router-dom';
export default function Cart() {
  const { cart, guest, totals, loading, error } = useSelector((s) => s.store);
  const dispatch = useDispatch();
  const items =
    cart?.items ||
    guest.map((item) => ({ ...item, _id: item.productId, product: item.product }));
  const guestTotals = {
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    estimatedTotal: items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    ),
  };
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <PageIntro
          eyebrow="Order workspace"
          title="Your cart"
          description="Review selected components before moving to secure checkout."
          action={
            !cart &&
            guest.length > 0 && (
              <button
                onClick={() => dispatch(clearGuestCart())}
                className="text-sm text-rose-300"
              >
                Clear guest cart
              </button>
            )
          }
        />
        {error && (
          <div className="mt-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
            {error}{' '}
            <button onClick={() => dispatch(loadStore())} className="ml-2 underline">
              Retry
            </button>
          </div>
        )}
        {!items.length ? (
          <div className="mt-8">
            <EmptyState
              title="Your cart is ready when you are"
              text="Add the components that power your next build."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <section className={loading ? 'pointer-events-none opacity-60' : ''}>
              {items.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdate={(id, quantity) =>
                    dispatch(updateCart({ itemId: id, quantity }))
                  }
                  onRemove={(id) => dispatch(removeCart(id))}
                />
              ))}
            </section>
            <aside className="space-y-4">
              <CartSummary totals={cart ? totals : guestTotals} />
              <Link
                to="/checkout"
                className="rigora-primary-action block px-4 py-3 text-center"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
