// ================================================================
// Custom errors for API handler responses
// ================================================================

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Wrap API handler to catch errors consistently
 */
export function errorHandler(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { success: false, message: error.message },
      { status: error.status }
    );
  }

  const err = error as any;
  console.error('API Error:', err);

  // Prisma errors
  if (err.code?.startsWith('P')) {
    if (err.code === 'P2002') {
      return Response.json(
        { success: false, message: 'A record with this value already exists.' },
        { status: 409 }
      );
    }
    if (err.code === 'P2025') {
      return Response.json(
        { success: false, message: 'Record not found.' },
        { status: 404 }
      );
    }
    return Response.json(
      { success: false, message: 'Database error occurred.' },
      { status: 500 }
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return Response.json(
      { success: false, message: 'Invalid or expired token.' },
      { status: 401 }
    );
  }

  return Response.json(
    { success: false, message: err.message || 'Internal server error.' },
    { status: err.status || 500 }
  );
}
