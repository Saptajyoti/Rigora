import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import CartSummary from '../components/CartSummary';
import { loadRazorpay } from '../lib/razorpay';
import { api } from '../lib/api';
import { checkout, verifyRazorpayPayment } from '../store/orderSlice';
import { loadStore } from '../store/storeSlice';
const blank = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};
export default function Checkout() {
  const [shipping, setShipping] = useState(blank);
  const [billing, setBilling] = useState(blank);
  const [sameBilling, setSameBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const { cart, totals } = useSelector((s) => s.store);
  const { loading, error } = useSelector((s) => s.orders);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = cart?.items || [];
  const setAddress = (setter) => (event) =>
    setter((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      shippingAddress: shipping,
      billingAddress: sameBilling ? shipping : billing,
      paymentMethod,
      checkoutKey: crypto.randomUUID(),
    };
    try {
      const result = await dispatch(checkout(payload)).unwrap();
      if (paymentMethod === 'cod') {
        await dispatch(loadStore());
        navigate(`/orders/success/${result.order._id}`);
        return;
      }
      if (!(await loadRazorpay())) throw new Error('Unable to load Razorpay.');
      const instance = new window.Razorpay({
        key: result.keyId,
        amount: result.razorpayOrder.amount,
        currency: 'INR',
        name: 'Rigora',
        description: 'Premium hardware order',
        order_id: result.razorpayOrder.id,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}` : '',
          email: user?.email,
          contact: shipping.phone,
        },
        handler: async (payment) => {
          try {
            await dispatch(
              verifyRazorpayPayment({
                orderId: result.order._id,
                razorpayOrderId: payment.razorpay_order_id,
                razorpayPaymentId: payment.razorpay_payment_id,
                razorpaySignature: payment.razorpay_signature,
              }),
            ).unwrap();
            await dispatch(loadStore());
            navigate(`/orders/success/${result.order._id}`);
          } catch {
            navigate(`/orders/failure/${result.order._id}`);
          }
        },
        modal: {
          ondismiss: async () => {
            await api
              .post(`/orders/${result.order._id}/payment-cancelled`)
              .catch(() => {});
            navigate(`/orders/failure/${result.order._id}`);
          },
        },
      });
      instance.open();
    } catch {
      /* Redux state shows the error. */
    }
  };
  if (!items.length)
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-5 py-14 text-center text-zinc-400">
          Your cart is empty.
        </main>
      </>
    );
  const AddressFields = ({ title, value, setter }) => (
    <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Object.entries(value).map(([name, field]) => (
          <input
            key={name}
            required={name !== 'line2'}
            name={name}
            value={field}
            onChange={setAddress(setter)}
            placeholder={name.replace(/([A-Z])/g, ' $1')}
            className="input"
          />
        ))}
      </div>
    </section>
  );
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-semibold">Secure checkout</h1>
        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <AddressFields
              title="Shipping address"
              value={shipping}
              setter={setShipping}
            />{' '}
            <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sameBilling}
                  onChange={(event) => setSameBilling(event.target.checked)}
                />{' '}
                Billing address is the same
              </label>
              {!sameBilling && (
                <div className="mt-5">
                  <AddressFields
                    title="Billing address"
                    value={billing}
                    setter={setBilling}
                  />
                </div>
              )}
            </section>
            <section className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
              <h2 className="font-semibold">Payment method</h2>
              <label className="mt-4 flex gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />{' '}
                Razorpay (UPI, card, net banking)
              </label>
              <label className="mt-3 flex gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />{' '}
                Cash on Delivery
              </label>
            </section>
            {error && <p className="text-rose-300">{error}</p>}
            <button
              disabled={loading}
              className="w-full rounded-xl bg-cyan-300 py-3 font-semibold text-zinc-950 disabled:opacity-50"
            >
              {loading
                ? 'Processing…'
                : paymentMethod === 'cod'
                  ? 'Place COD order'
                  : 'Pay securely'}
            </button>
          </div>
          <CartSummary totals={totals} />
        </form>
      </main>
    </>
  );
}
