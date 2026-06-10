import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPendingSignup extends Document {
  email: string;
  firstName: string;
  lastName: string;
  affiliateUserId: mongoose.Types.ObjectId | null;
  paymentReference: string;
  signupToken: string | null;
  paid: boolean;
  used: boolean;
  amount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PendingSignupSchema = new Schema<IPendingSignup>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    affiliateUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    paymentReference: { type: String, required: true, unique: true },
    // signupToken is null until payment is verified. No unique index — the token
    // is crypto.randomBytes(32) (256-bit entropy) so collisions are cryptographically
    // impossible. A regular index is sufficient for the register-paid lookup.
    signupToken: { type: String, default: null },
    paid: { type: Boolean, default: false },
    used: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

PendingSignupSchema.index({ email: 1 });
PendingSignupSchema.index({ signupToken: 1 }); // query index (non-unique)
PendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

const PendingSignup: Model<IPendingSignup> =
  mongoose.models.PendingSignup ||
  mongoose.model<IPendingSignup>("PendingSignup", PendingSignupSchema);

export default PendingSignup;
