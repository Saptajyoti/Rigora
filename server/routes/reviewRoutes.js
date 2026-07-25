import { Router } from 'express';
import { body, param } from 'express-validator';
import { upload } from '../config/upload.js';
import {
  adminDeleteReview,
  adminReviews,
  createReview,
  deleteReview,
  listProductReviews,
  moderateReview,
  myReviews,
  toggleHelpful,
  updateReview,
} from '../controllers/reviewController.js';
import { authorize, protect } from '../middleware/auth.js';
import { requireDatabase } from '../middleware/database.js';
import { validateRequest } from '../middleware/validateRequest.js';
const router = Router();
const fields = (optional = false) => [
  optional
    ? body('rating').optional().isInt({ min: 1, max: 5 })
    : body('rating').isInt({ min: 1, max: 5 }),
  optional
    ? body('title').optional().trim().isLength({ min: 3, max: 120 })
    : body('title').trim().isLength({ min: 3, max: 120 }),
  optional
    ? body('comment').optional().trim().isLength({ min: 10, max: 2000 })
    : body('comment').trim().isLength({ min: 10, max: 2000 }),
];
router.get('/me', protect, requireDatabase, myReviews);
router.get('/admin', protect, authorize('admin'), requireDatabase, adminReviews);
router.put(
  '/admin/:reviewId/status',
  protect,
  authorize('admin'),
  requireDatabase,
  [param('reviewId').isMongoId(), body('status').isIn(['approved', 'rejected'])],
  validateRequest,
  moderateReview,
);
router.delete(
  '/admin/:reviewId',
  protect,
  authorize('admin'),
  requireDatabase,
  [param('reviewId').isMongoId()],
  validateRequest,
  adminDeleteReview,
);
router.put(
  '/:reviewId',
  protect,
  requireDatabase,
  upload.array('images', 4),
  [param('reviewId').isMongoId(), ...fields(true)],
  validateRequest,
  updateReview,
);
router.delete(
  '/:reviewId',
  protect,
  requireDatabase,
  [param('reviewId').isMongoId()],
  validateRequest,
  deleteReview,
);
router.post(
  '/:reviewId/helpful',
  protect,
  requireDatabase,
  [param('reviewId').isMongoId()],
  validateRequest,
  toggleHelpful,
);
export const productReviewRouter = Router();
productReviewRouter.get(
  '/:productId/reviews',
  requireDatabase,
  [param('productId').isMongoId()],
  validateRequest,
  listProductReviews,
);
productReviewRouter.post(
  '/:productId/reviews',
  protect,
  requireDatabase,
  upload.array('images', 4),
  [param('productId').isMongoId(), ...fields()],
  validateRequest,
  createReview,
);
export default router;
