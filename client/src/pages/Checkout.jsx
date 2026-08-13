import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartSummary from '../components/CartSummary';
import PageIntro from '../components/PageIntro';
import SiteHeader from '../components/SiteHeader';
import { api } from '../lib/api';
import { loadRazorpay } from '../lib/razorpay';
import { getMotionVariants } from '../motion/variants';
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
  const { cart, totals } = useSelector((state) => state.store);
  const { loading, error } = useSelector((state) => state.orders);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
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

  const AddressFields = ({ title, value, setter }) => (
    <motion.section className="rigora-panel p-5" variants={variants.staggerItem}>
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
            className="input invalid:border-rose-400/70 invalid:focus:ring-rose-400/20"
          />
        ))}
      </div>
    </motion.section>
  );

  if (!items.length)
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-5 py-14 text-center text-zinc-400">
          Your cart is empty.
        </main>
      </>
    );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <PageIntro
          eyebrow="Secure checkout"
          title="Complete your order"
          description="Your address and payment details are handled securely."
        />
        <motion.form
          onSubmit={submit}
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]"
          variants={variants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-6">
            <AddressFields
              title="Shipping address"
              value={shipping}
              setter={setShipping}
            />
            <motion.section className="rigora-panel p-5" variants={variants.staggerItem}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sameBilling}
                  onChange={(event) => setSameBilling(event.target.checked)}
                />
                Billing address is the same
              </label>
              <AnimatePresence initial={false} mode="wait">
                {!sameBilling && (
                  <motion.div
                    key="billing-address"
                    className="mt-5"
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <AddressFields
                      title="Billing address"
                      value={billing}
                      setter={setBilling}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
            <motion.section className="rigora-panel p-5" variants={variants.staggerItem}>
              <h2 className="font-semibold">Payment method</h2>
              <label className="mt-4 flex gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                Razorpay (UPI, card, net banking)
              </label>
              <label className="mt-3 flex gap-3">
                <input
                  type="radio"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                Cash on Delivery
              </label>
            </motion.section>
            {error && (
              <motion.p className="text-rose-300" variants={variants.staggerItem}>
                {error}
              </motion.p>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              variants={variants.staggerItem}
              className="rigora-primary-action w-full py-3 disabled:opacity-50"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={loading ? 'processing' : paymentMethod}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.14 }}
                  className="inline-flex items-center justify-center gap-2"
                >
                  {loading && <LoaderCircle className="animate-spin" size={17} />}
                  {loading
                    ? 'Processing…'
                    : paymentMethod === 'cod'
                      ? 'Place COD order'
                      : 'Pay securely'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
          <motion.div variants={variants.staggerItem}>
            <CartSummary totals={totals} />
          </motion.div>
        </motion.form>
      </main>
    </>
  );
}
