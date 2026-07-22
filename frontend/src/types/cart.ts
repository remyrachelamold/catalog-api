import type { Product } from "./Product";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
}
