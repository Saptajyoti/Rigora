import { Router } from 'express';
import { getCurrentUser } from '../controllers/userController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.get('/me', protect, getCurrentUser);
router.get('/admin-check', protect, authorize('admin'), (_request, response) => {
  response.status(200).json({ message: 'Admin access granted.' });
});

export default router;
