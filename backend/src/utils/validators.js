// Ports of the Jakarta Bean Validation annotations on the Java DTOs.
// Messages are the same as Spring produced: "field: message, field: message".
import { Role } from '../models/enums.js';
import { badRequest } from './errors.js';
import { parseDateOnly } from './dates.js';

// Permissive, Hibernate-Validator-like email check.
const EMAIL_RE =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*$/;

const str = (v) => (v === undefined || v === null ? null : typeof v === 'string' ? v : String(v));
const isBlank = (v) => v === null || v.trim().length === 0;

function checkNotBlank(errors, field, v) {
  if (isBlank(v)) errors.push(`${field}: must not be blank`);
}
function checkEmail(errors, field, v) {
  // @Email treats null/"" as valid (NotBlank reports those).
  if (v !== null && v !== '' && !EMAIL_RE.test(v)) {
    errors.push(`${field}: must be a well-formed email address`);
  }
}

function throwIfErrors(errors) {
  if (errors.length) throw badRequest(errors.join(', '));
}

/** RegisterRequest */
export function validateRegister(body = {}) {
  const errors = [];
  const fullName = str(body.fullName);
  const email = str(body.email);
  const password = str(body.password);

  checkNotBlank(errors, 'fullName', fullName);
  checkNotBlank(errors, 'email', email);
  checkEmail(errors, 'email', email);
  checkNotBlank(errors, 'password', password);
  if (password !== null && password.length < 8) {
    errors.push('password: Password must be at least 8 characters');
  }

  let role = Role.PATIENT; // role == null -> PATIENT
  if (body.role !== undefined && body.role !== null && body.role !== '') {
    if (!Object.values(Role).includes(body.role)) {
      errors.push(`role: must be one of ${Object.values(Role).join(', ')}`);
    } else {
      role = body.role;
    }
  }
  throwIfErrors(errors);

  return {
    fullName,
    email,
    password,
    role,
    dateOfBirth: parseDateOnly(body.dateOfBirth, 'dateOfBirth'), // '' -> null, like Jackson
    bloodGroup: str(body.bloodGroup),
    allergies: str(body.allergies),
    specialization: str(body.specialization),
    licenseNumber: str(body.licenseNumber),
    hospitalAffiliation: str(body.hospitalAffiliation),
  };
}

/** LoginRequest */
export function validateLogin(body = {}) {
  const errors = [];
  const email = str(body.email);
  const password = str(body.password);
  checkEmail(errors, 'email', email);
  checkNotBlank(errors, 'email', email);
  checkNotBlank(errors, 'password', password);
  throwIfErrors(errors);
  return { email, password };
}

/** ChatRequest */
export function validateChat(body = {}) {
  const errors = [];
  const message = str(body.message);
  checkNotBlank(errors, 'message', message);
  throwIfErrors(errors);
  return { message };
}
