export default function errorHandler(err, req, res, next) {
  console.error("Error encountered:", err);

  // Zod Validation Error handling
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const fields = err.meta?.target?.join(', ') || 'field';
    return res.status(409).json({
      error: `Conflict: Unique constraint violated on ${fields}`
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Requested record was not found'
    });
  }

  // General server error fallback
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message
  });
}
