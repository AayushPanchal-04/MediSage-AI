// Java's LocalDate is a date-only value ("2026-03-15"). We store it as a UTC-midnight Date
// and always read/write it as YYYY-MM-DD so there is no timezone drift.
import { badRequest } from './errors.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** '' / null / undefined -> null. Otherwise must be a real YYYY-MM-DD calendar date. */
export function parseDateOnly(value, fieldName = 'date') {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    throw badRequest(`${fieldName}: must be a valid date in YYYY-MM-DD format`);
  }
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw badRequest(`${fieldName}: must be a valid date in YYYY-MM-DD format`);
  }
  return d;
}

/** LocalDate.now() equivalent (server-local calendar date, stored as UTC midnight). */
export function todayDateOnly() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return new Date(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T00:00:00.000Z`);
}

export const formatDateOnly = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
