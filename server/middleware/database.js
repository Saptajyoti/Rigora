import mongoose from 'mongoose';

export function requireDatabase(_request, response, next) {
  if (mongoose.connection.readyState !== 1) {
    return response
      .status(503)
      .json({ message: 'Catalog service is temporarily unavailable.' });
  }
  return next();
}
