/**
 * Mirrors the AverisSubscriber collection managed by the Primetrex bot.
 * Used by the Averis Academy web app to sync subscription expiryDate after
 * web payments so the bot's cron reads accurate data.
 */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAverisSubscriber extends Document {
  telegramId: string;
  averisUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  groupId: string;
  expiryDate: Date;
  status: "active" | "expired";
  remindersSent: string[];
  removedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const AverisSubscriberSchema = new Schema<IAverisSubscriber>(
  {
    telegramId: { type: String, required: true, unique: true },
    averisUserId: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    groupId: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "expired"], default: "active" },
    remindersSent: { type: [String], default: [] },
    removedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

AverisSubscriberSchema.index({ averisUserId: 1 });

const AverisSubscriber: Model<IAverisSubscriber> =
  mongoose.models.AverisSubscriber ||
  mongoose.model<IAverisSubscriber>("AverisSubscriber", AverisSubscriberSchema);

export default AverisSubscriber;
