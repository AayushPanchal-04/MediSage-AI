import { ok } from '../utils/apiResponse.js';

export const ping = (_req, res) => ok(res, 'Server is alive', { status: 'UP' });
