import { Router } from 'express';
import { body } from 'express-validator';
import { planPcBuild } from '../controllers/buildPlannerController.js';
import { requireDatabase } from '../middleware/database.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();

router.post(
  '/pc-build',
  requireDatabase,
  [
    body('budget').isFloat({ min: 25000, max: 500000 }),
    body('purpose').optional().isIn(['gaming', 'creator', 'workstation', 'balanced']),
  ],
  validateRequest,
  planPcBuild,
);

export default router;
