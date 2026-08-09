import mongoose, { type Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  isDisabled: boolean;
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  isDisabled: { type: Boolean, default: false },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Item", default: [] }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", userSchema);
