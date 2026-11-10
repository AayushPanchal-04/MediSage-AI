import mongoose from 'mongoose';
import { Role } from './enums.js';

// users table -> users collection. createdAt/updatedAt = @CreationTimestamp/@UpdateTimestamp.
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // BCrypt hash
    role: { type: String, enum: Object.values(Role), required: true },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
