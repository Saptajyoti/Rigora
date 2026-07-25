import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const details = (query) =>
  query
    .populate('user', 'firstName lastName email phone')
    .populate('items.product', 'slug brand');
export const getMyOrders = asyncHandler(async (req, res) =>
  res.status(200).json({
    orders: await details(Order.find({ user: req.user.id }).sort({ createdAt: -1 })),
  }),
);
export const getOrder = asyncHandler(async (req, res) => {
  const order = await details(Order.findOne({ _id: req.params.id, user: req.user.id }));
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.status(200).json({ order });
});
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (!['pending', 'confirmed', 'processing'].includes(order.orderStatus))
    return res.status(400).json({ message: 'This order can no longer be cancelled.' });
  order.orderStatus = 'cancelled';
  await order.save();
  res.status(200).json({ order });
});
export const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.search) filter._id = req.query.search;
  res.status(200).json({
    orders: await details(Order.find(filter).sort({ createdAt: -1 }).limit(200)),
  });
});
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };
  if (
    req.body.orderStatus &&
    !transitions[order.orderStatus].includes(req.body.orderStatus)
  )
    return res.status(400).json({ message: 'Invalid order status transition.' });
  if (req.body.orderStatus) order.orderStatus = req.body.orderStatus;
  if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
  await order.save();
  res.status(200).json({ order });
});
