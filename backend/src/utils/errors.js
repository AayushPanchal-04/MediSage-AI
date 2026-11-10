// Replaces ResourceNotFoundException / IllegalArgumentException / BadCredentialsException / AccessDeniedException.
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const notFound = (message) => new AppError(404, message); // ResourceNotFoundException
export const badRequest = (message) => new AppError(400, message); // IllegalArgumentException
export const unauthorized = (message) => new AppError(401, message); // BadCredentialsException
export const forbidden = (message = 'Access denied') => new AppError(403, message); // AccessDeniedException
