import * as authService from '../services/auth.service.js';
import { ok } from '../utils/apiResponse.js';

export const register = async (req, res) =>
  ok(res, 'Registration successful', await authService.register(req.body ?? {}));

export const login = async (req, res) =>
  ok(res, 'Login successful', await authService.login(req.body ?? {}));
