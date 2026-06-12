import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  referralCode: string;
  referredBy: mongoose.Types.ObjectId | null;
  hasPaidSignup: boolean;
  signupPaymentRef: string | null;
  subscriptionExpiresAt: Date | null;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  isActive: boolean;
  telegramId: string | null;
  telegramLinked: boolean;
  profileImage: string | null;
  bankDetails: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  } | null;
  signupProductSlug: string | null;
  isSpecialAffiliate: boolean;
  isLifetime: boolean;
  knownDevices: { ip: string; lastSeen: Date }[];
  trustedDevices: { tokenHash: string; createdAt: Date; expiresAt: Date }[];
  twoFAOTP: string | null;
  twoFAOTPExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    referralCode: { type: String, required: true, unique: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    hasPaidSignup: { type: Boolean, default: false },
    signupPaymentRef: { type: String, default: null },
    subscriptionExpiresAt: { type: Date, default: null },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
    telegramId: { type: String, default: null },
    telegramLinked: { type: Boolean, default: false },
    profileImage: { type: String, default: null },
    bankDetails: {
      type: {
        bankName: String,
        bankCode: String,
        accountNumber: String,
        accountName: String,
      },
      default: null,
    },
    signupProductSlug: { type: String, default: null },
    isSpecialAffiliate: { type: Boolean, default: false },
    isLifetime: { type: Boolean, default: false },
    knownDevices: { type: [{ ip: String, lastSeen: Date }], default: [] },
    trustedDevices: {
      type: [{ tokenHash: String, createdAt: Date, expiresAt: Date }],
      default: [],
    },
    twoFAOTP: { type: String, default: null },
    twoFAOTPExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ referredBy: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
