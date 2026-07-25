import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cookieName } from '../utils/token.js';

export const protect = asyncHandler(async (request, response, next) => {
  const authorization = request.headers.authorization;
  const bearerToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;
  const token = request.cookies[cookieName] || bearerToken;

  if (!token)
    return response.status(401).json({ message: 'Authentication is required.' });

  try {
    const { sub } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(sub);
    if (!user)
      return response.status(401).json({ message: 'Authentication is required.' });
    request.user = user;
    return next();
  } catch {
    return response.status(401).json({ message: 'Authentication is required.' });
  }
});

export const authorize =
  (...roles) =>
  (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return response
        .status(403)
        .json({ message: 'You do not have permission to access this resource.' });
    }
    return next();
  };
