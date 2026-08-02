/**
 * Tracks Telegram subscribers for the "FIB Copy Trade By Averis Academy"
 * forex-signals channel — completely independent from AverisSubscriber.
 * Kept as a separate collection (rather than reusing AverisSubscriber) because
 * AverisSubscriber.telegramId has a global unique index, but a person can be
 * subscribed8 to both the Averis Academy community and FIB Copy Trade at once.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFibSubscriber extends Document {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  channelId: string;
  startDate: Date;
  expiryDate: Date;
  status: "active" | "expired";
  remindersSent: string[];
  addedBy: "manual" | "payment";
  inviteSentAt: Date | null;
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FibSubscriberSchema = new Schema<IFibSubscriber>(
  {
    telegramId: { type: String, required: true, unique: true },
    username: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    channelId: { type: String, required: true },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired"], default: "active" },
    remindersSent: { type: [String], default: [] },
    addedBy: { type: String, enum: ["manual", "payment"], required: true },
    inviteSentAt: { type: Date, default: null },
    removedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

FibSubscriberSchema.index({ status: 1, expiryDate: 1 });

const FibSubscriber: Model<IFibSubscriber> =
  mongoose.models.FibSubscriber ||
  mongoose.model<IFibSubscriber>("FibSubscriber", FibSubscriberSchema);

export default FibSubscriber;
