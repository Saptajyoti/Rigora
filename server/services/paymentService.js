import Razorpay from 'razorpay';
import crypto from 'node:crypto';

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;
export async function createGatewayOrder({ amount, receipt }) {
  if (!razorpay)
    throw Object.assign(new Error('Razorpay is not configured.'), { statusCode: 503 });
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
  });
}
export function verifyGatewaySignature({ orderId, paymentId, signature }) {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
export const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
