import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  addCartItem,
  getCart,
  mergeGuestCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/storeController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireDatabase } from '../middleware/database.js';
const router = Router();
router.use(protect);
router.get('/', requireDatabase, getCart);
router.post(
  '/items',
  requireDatabase,
  [body('productId').isMongoId(), body('quantity').optional().isInt({ min: 1 })],
  validateRequest,
  addCartItem,
);
router.put(
  '/items/:itemId',
  requireDatabase,
  [param('itemId').isMongoId(), body('quantity').isInt({ min: 1 })],
  validateRequest,
  updateCartItem,
);
router.delete(
  '/items/:itemId',
  requireDatabase,
  [param('itemId').isMongoId()],
  validateRequest,
  removeCartItem,
);
router.post(
  '/merge',
  requireDatabase,
  [
    body('items').isArray(),
    body('items.*.productId').isMongoId(),
    body('items.*.quantity').isInt({ min: 1 }),
  ],
  validateRequest,
  mergeGuestCart,
);
export default router;
