import mongoose, { type Document } from "mongoose";

export interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface IOrderShipping {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  shipping: IOrderShipping;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod?: "card" | "upi" | "netbanking" | "cod";
  paymentStatus?: "pending" | "paid" | "failed";
  transactionId?: string;
  paidAt?: Date;
  createdAt: Date;
}

const orderProductSchema = new mongoose.Schema<IOrderProduct>({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Item" },
  name: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderShippingSchema = new mongoose.Schema<IOrderShipping>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema<IOrder>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    products: { type: [orderProductSchema], required: true },
    shipping: { type: orderShippingSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "cod"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: { type: String },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IOrder>("Order", orderSchema);
