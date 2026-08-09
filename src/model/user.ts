import mongoose, { type Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  isDisabled: boolean;
  wishlist: mongoose.Types.ObjectId[];
  // Preferences and notification settings
  appearance?: "system" | "light" | "dark";
  notifications?: {
    orders?: boolean;
    shipping?: boolean;
    delivery?: boolean;
    promotional?: boolean;
    wishlist?: boolean;
    email?: boolean;
  };
  shoppingPreferences?: {
    currency?: string;
    language?: string;
  };
  // For logout-all-devices support
  tokenVersion?: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  isDisabled: { type: Boolean, default: false },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Item", default: [] }],
  appearance: { type: String, enum: ["system", "light", "dark"], default: "system" },
  notifications: {
    orders: { type: Boolean, default: true },
    shipping: { type: Boolean, default: true },
    delivery: { type: Boolean, default: true },
    promotional: { type: Boolean, default: false },
    wishlist: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
  },
  shoppingPreferences: {
    currency: { type: String, default: "INR" },
    language: { type: String, default: "en" },
  },
  tokenVersion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", userSchema);
