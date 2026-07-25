import { Router } from 'express';
import { body } from 'express-validator';
import {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
} from '../controllers/authController.js';
import {
  changePassword,
  getCurrentUser,
  updateProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = Router();
const password = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters.');
const email = body('email')
  .isEmail()
  .withMessage('Enter a valid email address.')
  .normalizeEmail();

router.post(
  '/register',
  [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required.')
      .isLength({ max: 50 }),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required.')
      .isLength({ max: 50 }),
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3–30 characters.')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username may only contain letters, numbers, and underscores.'),
    email,
    password,
    body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
  ],
  validateRequest,
  register,
);
router.post(
  '/login',
  [email, body('password').notEmpty().withMessage('Password is required.')],
  validateRequest,
  login,
);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);
router.put(
  '/profile',
  protect,
  [
    body('firstName').optional().trim().notEmpty().isLength({ max: 50 }),
    body('lastName').optional().trim().notEmpty().isLength({ max: 50 }),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
    body('avatar')
      .optional({ values: 'falsy' })
      .trim()
      .isURL()
      .withMessage('Avatar must be a valid URL.'),
  ],
  validateRequest,
  updateProfile,
);
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters.'),
  ],
  validateRequest,
  changePassword,
);
router.post('/forgot-password', [email], validateRequest, forgotPassword);
router.post(
  '/reset-password',
  [
    body('token')
      .isHexadecimal()
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid password reset token.'),
    password,
  ],
  validateRequest,
  resetPassword,
);

export default router;
