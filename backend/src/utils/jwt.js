// Port of Security/JwtUtil.java: subject = email, claim "role", HS256, 24h default.
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateToken(email, role) {
  return jwt.sign({ role }, env.jwtSecret, {
    subject: email,
    algorithm: 'HS256',
    expiresIn: Math.floor(env.jwtExpirationMs / 1000),
  });
}

/** Returns the decoded payload or throws (bad signature / expired / malformed). */
export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
}
