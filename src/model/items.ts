import mongoose from "mongoose";

export interface IItem {
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description?: string;
}

const itemSchema = new mongoose.Schema<IItem>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: {
    type: String,
    default:
      "https://via.placeholder.com/300x200?text=Product",
  },
  description: { type: String, default: "" },
});

export default mongoose.model<IItem>(
  "Item",
  itemSchema
);