import { validationResult } from 'express-validator';

export function validateRequest(request, response, next) {
  const errors = validationResult(request);
  if (errors.isEmpty()) return next();

  return response.status(422).json({
    message: 'Validation failed.',
    errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
  });
}
