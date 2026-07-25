export function notFound(request, response) {
  response
    .status(404)
    .json({ message: `Route ${request.method} ${request.originalUrl} was not found.` });
}

export function errorHandler(error, _request, response, _next) {
  void _next;
  if (error.name === 'MulterError') {
    return response
      .status(400)
      .json({ message: 'Image upload failed. Images must be 5 MB or smaller.' });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern ?? {})[0] || 'field';
    return response.status(409).json({ message: `This ${field} is already in use.` });
  }

  if (error.name === 'CastError')
    return response.status(400).json({ message: 'Invalid request data.' });

  if (error.statusCode) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  return response
    .status(500)
    .json({ message: 'Something went wrong. Please try again.' });
}
