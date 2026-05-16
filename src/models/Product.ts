import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  commissionAmount: number;
  renewalCommissionAmount: number;
  price: number;
  renewalPrice: number;
  slug: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    commissionAmount: { type: Number, required: true },
    renewalCommissionAmount: { type: Number, required: true },
    price: { type: Number, required: true },
    renewalPrice: { type: Number, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
