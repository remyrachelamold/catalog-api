import mongoose from "mongoose";
import Item from "./model/items";

const SEED_ITEMS = [
  { _id: new mongoose.Types.ObjectId("68b930e4e3744bf8d629c7fe"), name: "Smartphone", price: 20000, category: "Electronics" },
  { _id: new mongoose.Types.ObjectId("68b9311ae3744bf8d629c800"), name: "Headphones", price: 1200, category: "Electronics" },
  { name: "The Alchemist", price: 500, category: "Books" },
  { name: "Atomic Habits", price: 450, category: "Books" },
];

export async function seedCatalog(): Promise<void> {
  await Item.deleteMany({});
  await Item.insertMany(SEED_ITEMS);
}
