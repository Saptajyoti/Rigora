import { Router } from 'express';
import { body, param } from 'express-validator';
import { upload } from '../config/upload.js';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '../controllers/catalogController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireDatabase } from '../middleware/database.js';
import { productReviewRouter } from './reviewRoutes.js';
import { recommendations } from '../controllers/recommendationController.js';

const router = Router();
const fields = (optional = false) => {
  const field = (name) => (optional ? body(name).optional() : body(name));
  return [
    field('name').trim().notEmpty().isLength({ max: 160 }),
    field('description').trim().notEmpty().isLength({ max: 10000 }),
    field('category').isMongoId(),
    field('brand').isMongoId(),
    field('sku').trim().notEmpty().isLength({ max: 80 }),
    field('price').isFloat({ min: 0 }),
    field('stock').isInt({ min: 0 }),
  ];
};
router.get('/', requireDatabase, listProducts);
router.get(
  '/:productId/recommendations',
  requireDatabase,
  [param('productId').isMongoId()],
  validateRequest,
  recommendations,
);
router.use(productReviewRouter);
router.get('/:slug', requireDatabase, getProduct);
router.post(
  '/',
  protect,
  authorize('admin'),
  requireDatabase,
  upload.array('images', 6),
  fields(),
  validateRequest,
  createProduct,
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  requireDatabase,
  upload.array('images', 6),
  [param('id').isMongoId(), ...fields(true)],
  validateRequest,
  updateProduct,
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  requireDatabase,
  [param('id').isMongoId()],
  validateRequest,
  deleteProduct,
);
export default router;
