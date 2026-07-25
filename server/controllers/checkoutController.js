import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createGatewayOrder,
  razorpayKeyId,
  verifyGatewaySignature,
} from '../services/paymentService.js';

async function getCheckoutItems(userId) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart?.items.length)
    throw Object.assign(new Error('Your cart is empty.'), { statusCode: 400 });
  const items = cart.items.map((item) => {
    if (
      !item.product?.isActive ||
      item.quantity < 1 ||
      item.quantity > item.product.stock
    )
      throw Object.assign(
        new Error(`Insufficient stock for ${item.product?.name || 'a product'}.`),
        { statusCode: 400 },
      );
    return {
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || '',
      price: item.product.price,
      quantity: item.quantity,
    };
  });
  return {
    cart,
    items,
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}
async function confirmStockAndClear(order) {
  for (const item of order.items) {
    const product = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true },
    );
    if (!product)
      throw Object.assign(new Error(`Stock is no longer available for ${item.name}.`), {
        statusCode: 409,
      });
  }
  await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });
}
export const checkout = asyncHandler(async (req, res) => {
  const { items, subtotal } = await getCheckoutItems(req.user.id);
  const grandTotal = subtotal;
  if (req.body.checkoutKey && (await Order.exists({ checkoutKey: req.body.checkoutKey })))
    return res
      .status(409)
      .json({ message: 'This checkout request has already been processed.' });
  const order = await Order.create({
    user: req.user.id,
    items,
    shippingAddress: req.body.shippingAddress,
    billingAddress: req.body.billingAddress,
    subtotal,
    grandTotal,
    paymentMethod: req.body.paymentMethod,
    paymentStatus: 'pending',
    orderStatus: req.body.paymentMethod === 'cod' ? 'confirmed' : 'pending',
    checkoutKey: req.body.checkoutKey || undefined,
  });
  if (order.paymentMethod === 'cod') {
    await confirmStockAndClear(order);
    return res.status(201).json({ order });
  }
  const gatewayOrder = await createGatewayOrder({
    amount: grandTotal,
    receipt: order.id,
  });
  order.razorpay.orderId = gatewayOrder.id;
  await order.save();
  return res
    .status(201)
    .json({ order, razorpayOrder: gatewayOrder, keyId: razorpayKeyId });
});
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.body.orderId, user: req.user.id });
  if (!order || order.paymentMethod !== 'razorpay')
    return res.status(404).json({ message: 'Payment order not found.' });
  if (order.paymentStatus === 'paid')
    return res.status(409).json({ message: 'This payment has already been verified.' });
  if (
    order.razorpay.orderId !== req.body.razorpayOrderId ||
    !verifyGatewaySignature({
      orderId: req.body.razorpayOrderId,
      paymentId: req.body.razorpayPaymentId,
      signature: req.body.razorpaySignature,
    })
  ) {
    order.paymentStatus = 'failed';
    await order.save();
    return res.status(400).json({ message: 'Payment verification failed.' });
  }
  await confirmStockAndClear(order);
  order.paymentStatus = 'paid';
  order.orderStatus = 'confirmed';
  order.razorpay.paymentId = req.body.razorpayPaymentId;
  order.razorpay.signature = req.body.razorpaySignature;
  await order.save();
  return res.status(200).json({ order });
});
export const paymentCancelled = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
    paymentStatus: 'pending',
  });
  if (!order) return res.status(404).json({ message: 'Pending order not found.' });
  order.paymentStatus = 'failed';
  await order.save();
  res.status(200).json({ order });
});
