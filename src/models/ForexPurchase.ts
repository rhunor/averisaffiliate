import mongoose, { Schema, Document, Model } from "mongoose";

export interface IForexPurchase extends Document {
  email: string;
  firstName: string;
  lastName: string;
  affiliateUserId: mongoose.Types.ObjectId | null;
  paymentReference: string;
  paid: boolean;
  amount: number;
  commissionCredited: boolean;
  commissionOrderId: string | null;
  accessEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ForexPurchaseSchema = new Schema<IForexPurchase>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    affiliateUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    paymentReference: { type: String, required: true, unique: true },
    paid: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    commissionCredited: { type: Boolean, default: false },
    commissionOrderId: { type: String, default: null },
    accessEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ForexPurchaseSchema.index({ email: 1 });
ForexPurchaseSchema.index({ paymentReference: 1 });

const ForexPurchase: Model<IForexPurchase> =
  mongoose.models.ForexPurchase ||
  mongoose.model<IForexPurchase>("ForexPurchase", ForexPurchaseSchema);

export default ForexPurchase;
