import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  cancelOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import {
  checkout,
  paymentCancelled,
  verifyRazorpayPayment,
} from '../controllers/checkoutController.js';
import { authorize, protect } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/database.js';
import { validateRequest } from '../middleware/validateRequest.js';
const router = Router();
const address = (name) => body(name).isObject().withMessage(`${name} is required.`);
const statuses = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];
const payments = ['pending', 'paid', 'failed'];
router.use(protect, requireDatabase);
router.post(
  '/checkout',
  [
    address('shippingAddress'),
    address('billingAddress'),
    body('paymentMethod').isIn(['razorpay', 'cod']),
    body('checkoutKey').optional().isUUID(),
  ],
  validateRequest,
  checkout,
);
router.post(
  '/verify-payment',
  [
    body('orderId').isMongoId(),
    body('razorpayOrderId').notEmpty(),
    body('razorpayPaymentId').notEmpty(),
    body('razorpaySignature').notEmpty(),
  ],
  validateRequest,
  verifyRazorpayPayment,
);
router.post(
  '/:id/payment-cancelled',
  [param('id').isMongoId()],
  validateRequest,
  paymentCancelled,
);
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put(
  '/admin/:id',
  authorize('admin'),
  [
    param('id').isMongoId(),
    body('orderStatus').optional().isIn(statuses),
    body('paymentStatus').optional().isIn(payments),
  ],
  validateRequest,
  updateOrderStatus,
);
router.get('/my', getMyOrders);
router.get('/:id', [param('id').isMongoId()], validateRequest, getOrder);
router.put('/:id/cancel', [param('id').isMongoId()], validateRequest, cancelOrder);
export default router;
