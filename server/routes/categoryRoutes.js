import { Router } from 'express';
import { body, param } from 'express-validator';
import { categoryController } from '../controllers/catalogController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireDatabase } from '../middleware/database.js';

const router = Router();
const fields = (optional = false) => [
  optional
    ? body('name').optional().trim().notEmpty().isLength({ max: 80 })
    : body('name').trim().notEmpty().isLength({ max: 80 }),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('image').optional({ values: 'falsy' }).isURL(),
  body('isFeatured').optional().isBoolean(),
];
router.get('/', requireDatabase, categoryController.list);
router.get('/:slug', requireDatabase, categoryController.get);
router.post(
  '/',
  protect,
  authorize('admin'),
  requireDatabase,
  fields(),
  validateRequest,
  categoryController.create,
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  requireDatabase,
  [param('id').isMongoId(), ...fields(true)],
  validateRequest,
  categoryController.update,
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  requireDatabase,
  [param('id').isMongoId()],
  validateRequest,
  categoryController.remove,
);
export default router;
