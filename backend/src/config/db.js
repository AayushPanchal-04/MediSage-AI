import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongodbUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[db] MongoDB connected (${mongoose.connection.name})`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
