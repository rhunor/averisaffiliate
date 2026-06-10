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
// signupToken_1 is already declared as unique+sparse on the field above — no standalone re-declaration.
PendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const isNew = !mongoose.models.PendingSignup;

const PendingSignup: Model<IPendingSignup> = isNew
  ? mongoose.model<IPendingSignup>("PendingSignup", PendingSignupSchema)
  : (mongoose.models.PendingSignup as Model<IPendingSignup>);

// On first model registration in this process, sync indexes so any stale
// non-sparse signupToken_1 index in the DB is dropped and recreated correctly.
if (isNew) {
  PendingSignup.syncIndexes().catch((e) =>
    console.error("[PendingSignup] syncIndexes:", e)
  );
}

export default PendingSignup;
