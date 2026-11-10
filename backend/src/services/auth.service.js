// Port of service/AuthService.java
import bcrypt from 'bcryptjs';
import { User, Patient, Doctor, Role, AuditAction } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { badRequest, unauthorized } from '../utils/errors.js';
import { validateLogin, validateRegister } from '../utils/validators.js';
import * as audit from './audit.service.js';

const BCRYPT_ROUNDS = 12; // new BCryptPasswordEncoder(12)
// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', BCRYPT_ROUNDS);

const authResponse = (user, profileId) => ({
  token: generateToken(user.email, user.role),
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  profileId: profileId ? String(profileId) : null,
});

export async function register(body) {
  const req = validateRegister(body);

  if (await User.exists({ email: req.email })) {
    throw badRequest('Email already registered');
  }

  const passwordHash = await bcrypt.hash(req.password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await User.create({
      fullName: req.fullName,
      email: req.email,
      password: passwordHash,
      role: req.role,
    });
  } catch (err) {
    if (err?.code === 11000) throw badRequest('Email already registered'); // race on unique index
    throw err;
  }

  // The Java version used @Transactional. Standalone MongoDB has no multi-document transactions,
  // so undo the partial writes by hand if anything after the user insert fails.
  let profile = null;
  try {
    if (user.role === Role.PATIENT) {
      profile = await Patient.create({
        user: user._id,
        dateOfBirth: req.dateOfBirth,
        bloodGroup: req.bloodGroup,
        allergies: req.allergies,
      });
    } else if (user.role === Role.DOCTOR) {
      profile = await Doctor.create({
        user: user._id,
        specialization: req.specialization,
        licenseNumber: req.licenseNumber,
        hospitalAffiliation: req.hospitalAffiliation,
      });
    }
    await audit.log(user, AuditAction.LOGIN, null, 'User registered');
  } catch (err) {
    await Promise.allSettled([
      profile ? profile.deleteOne() : null,
      User.deleteOne({ _id: user._id }),
    ]);
    throw err;
  }

  return authResponse(user, profile?._id);
}

export async function login(body) {
  const req = validateLogin(body);

  // authManager.authenticate(...) -> BadCredentialsException -> 401 "Invalid email or password"
  const user = await User.findOne({ email: req.email });
  const passwordOk = await bcrypt.compare(req.password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordOk) throw unauthorized('Invalid email or password');

  await audit.log(user, AuditAction.LOGIN, null, 'User logged in');

  let profileId = null;
  if (user.role === Role.PATIENT) {
    profileId = (await Patient.findOne({ user: user._id }).select('_id'))?._id ?? null;
  } else if (user.role === Role.DOCTOR) {
    profileId = (await Doctor.findOne({ user: user._id }).select('_id'))?._id ?? null;
  }

  return authResponse(user, profileId);
}
