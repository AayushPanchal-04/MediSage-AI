import fs from 'node:fs';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

async function main() {
  fs.mkdirSync(env.uploadDir, { recursive: true }); // file.upload-dir
  await connectDB();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[server] MediSage API listening on http://localhost:${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
