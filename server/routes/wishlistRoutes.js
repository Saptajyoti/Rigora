import { Router } from 'express';
import { body } from 'express-validator';
import { getWishlist, toggleWishlist } from '../controllers/storeController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireDatabase } from '../middleware/database.js';
const router = Router();
router.use(protect);
router.get('/', requireDatabase, getWishlist);
router.post(
  '/toggle',
  requireDatabase,
  [body('productId').isMongoId()],
  validateRequest,
  toggleWishlist,
);
export default router;
