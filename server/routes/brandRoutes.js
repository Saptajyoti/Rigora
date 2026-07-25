import { Router } from 'express';
import { body, param } from 'express-validator';
import { brandController } from '../controllers/catalogController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireDatabase } from '../middleware/database.js';

const router = Router();
const fields = (optional = false) => [
  optional
    ? body('name').optional().trim().notEmpty().isLength({ max: 80 })
    : body('name').trim().notEmpty().isLength({ max: 80 }),
  body('description').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
  body('logo').optional({ values: 'falsy' }).isURL(),
  body('website').optional({ values: 'falsy' }).isURL(),
  body('isFeatured').optional().isBoolean(),
];
router.get('/', requireDatabase, brandController.list);
router.get('/:slug', requireDatabase, brandController.get);
router.post(
  '/',
  protect,
  authorize('admin'),
  requireDatabase,
  fields(),
  validateRequest,
  brandController.create,
);
router.put(
  '/:id',
  protect,
  authorize('admin'),
  requireDatabase,
  [param('id').isMongoId(), ...fields(true)],
  validateRequest,
  brandController.update,
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  requireDatabase,
  [param('id').isMongoId()],
  validateRequest,
  brandController.remove,
);
export default router;
