import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId | null;
  status: "pending" | "active" | "inactive" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ referredUserId: 1 });

const Referral: Model<IReferral> =
  mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema);
export default Referral;
