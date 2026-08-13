import crypto from 'node:crypto';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookie, sendAuthResponse } from '../utils/token.js';

export const register = asyncHandler(async (request, response) => {
  const { firstName, lastName, username, email, password, phone } = request.body;
  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (existingUser) {
    const field = existingUser.email === normalizedEmail ? 'email' : 'username';
    return response.status(409).json({ message: `This ${field} is already in use.` });
  }

  const user = await User.create({
    firstName,
    lastName,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    phone,
  });
  return sendAuthResponse(response, 201, user);
});

export const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return response.status(401).json({ message: 'Invalid email or password.' });
  }
  return sendAuthResponse(response, 200, user);
});

export const adminLogin = asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return response.status(401).json({ message: 'Invalid email or password.' });
  }
  if (user.role !== 'admin') {
    return response.status(403).json({ message: 'Administrative access is required.' });
  }

  return sendAuthResponse(response, 200, user);
});

export function logout(_request, response) {
  clearAuthCookie(response);
  return response.status(200).json({ message: 'Logged out successfully.' });
}

export const forgotPassword = asyncHandler(async (request, response) => {
  const user = await User.findOne({ email: request.body.email.toLowerCase() }).select(
    '+passwordResetToken +passwordResetExpires',
  );
  if (!user)
    return response
      .status(200)
      .json({ message: 'If the email exists, a reset link has been sent.' });

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  // Replace this with a mail provider integration when one is configured.
  console.info(`Password reset link for ${user.email}: ${resetUrl}`);
  return response.status(200).json({
    message: 'If the email exists, a reset link has been sent.',
    ...(process.env.NODE_ENV !== 'production' && { resetToken }),
  });
});

export const resetPassword = asyncHandler(async (request, response) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(request.body.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user)
    return response
      .status(400)
      .json({ message: 'This password reset link is invalid or has expired.' });
  user.password = request.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  return sendAuthResponse(response, 200, user);
});
