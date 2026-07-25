import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendAuthResponse } from '../utils/token.js';

export function getCurrentUser(request, response) {
  return response.status(200).json({ user: request.user });
}

export const updateProfile = asyncHandler(async (request, response) => {
  const fields = ['firstName', 'lastName', 'username', 'email', 'phone', 'avatar'];
  const updates = Object.fromEntries(
    fields
      .filter((field) => request.body[field] !== undefined)
      .map((field) => [field, request.body[field]]),
  );
  if (updates.email) updates.email = updates.email.toLowerCase();
  if (updates.username) updates.username = updates.username.toLowerCase();

  const user = await User.findByIdAndUpdate(request.user.id, updates, {
    new: true,
    runValidators: true,
  });
  return response.status(200).json({ user });
});

export const changePassword = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user.id).select('+password');
  if (!(await user.comparePassword(request.body.currentPassword))) {
    return response.status(401).json({ message: 'Your current password is incorrect.' });
  }
  user.password = request.body.newPassword;
  await user.save();
  return sendAuthResponse(response, 200, user);
});
