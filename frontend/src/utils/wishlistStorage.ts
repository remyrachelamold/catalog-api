import type { Product } from "../types/Product";

const WISHLIST_STORAGE_KEY = "catalog-wishlist";

export function loadWishlistFromStorage(): Product[] {
  try {
    const stored = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWishlistToStorage(items: Product[]): void {
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}
