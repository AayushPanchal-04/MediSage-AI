// Port of JwtAuthFilter + SecurityConfig's authorizeHttpRequests rules.
import { User } from '../models/index.js';
import { verifyToken } from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden, unauthorized } from '../utils/errors.js';

/**
 * JwtAuthFilter: if a valid "Bearer <jwt>" is present, load the user and attach it as req.user.
 * An invalid/expired token never fails here — the request simply proceeds unauthenticated and the
 * guards below decide (public routes still work).
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(header.slice(7));
      const user = payload.sub ? await User.findOne({ email: payload.sub }) : null;
      if (user) req.user = user;
    } catch (err) {
      console.error('JWT processing failed:', err.message);
    }
  }
  next();
});

/** .anyRequest().authenticated() */
export const requireAuth = (req, _res, next) => {
  if (!req.user) return next(unauthorized('Authentication required'));
  next();
};

/** hasRole / hasAnyRole — roles are PATIENT | DOCTOR | ADMIN. */
export const requireRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized('Authentication required'));
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
