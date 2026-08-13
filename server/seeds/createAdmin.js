import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import User from '../models/User.js';

const seedDirectory = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(seedDirectory, '../.env') });

const requiredVariables = [
  'MONGODB_URI',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'ADMIN_USERNAME',
  'ADMIN_FIRST_NAME',
  'ADMIN_LAST_NAME',
];

async function createAdmin() {
  const missing = requiredVariables.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}.`);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const email = process.env.ADMIN_EMAIL.toLowerCase();
  const username = process.env.ADMIN_USERNAME.toLowerCase();
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    if (existingUser.role !== 'admin') {
      throw new Error('An existing non-admin user already uses this email or username.');
    }

    console.log(`Admin account already exists for ${existingUser.email}.`);
    return;
  }

  const admin = await User.create({
    firstName: process.env.ADMIN_FIRST_NAME,
    lastName: process.env.ADMIN_LAST_NAME,
    username,
    email,
    password: process.env.ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log(`Admin account created for ${admin.email}.`);
}

createAdmin()
  .catch((error) => {
    console.error('Admin account creation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
