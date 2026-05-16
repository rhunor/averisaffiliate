/**
 * Seed script: create the initial admin user.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Reads MONGODB_URI from .env.local or environment.
 */

import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { generateReferralCode } from "../src/lib/utils";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Create .env.local first.");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "user" },
  referralCode: { type: String, unique: true },
  isActive: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  subscriptionExpiresAt: { type: Date, default: null },
  bankDetails: { type: mongoose.Schema.Types.Mixed, default: null },
  knownDevices: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@averisacademy.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  const ADMIN_FIRST = process.env.ADMIN_FIRST || "Admin";
  const ADMIN_LAST = process.env.ADMIN_LAST || "User";

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const referralCode = generateReferralCode("AVR");

  await User.create({
    firstName: ADMIN_FIRST,
    lastName: ADMIN_LAST,
    email: ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    referralCode,
    isActive: true,
    isEmailVerified: true,
    subscriptionExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000), // 100 years
  });

  console.log(`Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("Change the password after first login!");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
