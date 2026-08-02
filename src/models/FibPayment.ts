/**
 * Korapay payment records for the FIB Copy Trade Telegram channel.
 * Kept separate from Transaction (which requires a web User) since FIB
 * customers are Telegram-only and may have no Averis Academy account.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFibPayment extends Document {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  reference: string;
  amount: number;
  status: "pending" | "successful" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const FibPaymentSchema = new Schema<IFibPayment>(
  {
    telegramId: { type: String, required: true },
    username: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
  },
  { timestamps: true }
);

FibPaymentSchema.index({ telegramId: 1, status: 1, createdAt: -1 });

const FibPayment: Model<IFibPayment> =
  mongoose.models.FibPayment ||
  mongoose.model<IFibPayment>("FibPayment", FibPaymentSchema);

export default FibPayment;
