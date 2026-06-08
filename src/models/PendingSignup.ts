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
    signupToken: { type: String, default: null, unique: true, sparse: true },
    paid: { type: Boolean, default: false },
    used: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

PendingSignupSchema.index({ email: 1 });
PendingSignupSchema.index({ signupToken: 1 });
PendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingSignup: Model<IPendingSignup> =
  mongoose.models.PendingSignup ||
  mongoose.model<IPendingSignup>("PendingSignup", PendingSignupSchema);
export default PendingSignup;
