import type { Product } from "../types/Product";
import type { SortOption } from "../types/filters";
import { ALL_CATEGORIES } from "../types/filters";

export function getUniqueCategories(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.category))].sort();
}

export function filterAndSortProducts(
  products: Product[],
  searchQuery: string,
  category: string,
  sortOption: SortOption
): Product[] {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  let filtered = products.filter((product) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      category === ALL_CATEGORIES || product.category === category;

    return matchesSearch && matchesCategory;
  });

  filtered = [...filtered].sort((left, right) => {
    switch (sortOption) {
      case "price-asc":
        return left.price - right.price;
      case "price-desc":
        return right.price - left.price;
      case "name-asc":
        return left.name.localeCompare(right.name);
      case "name-desc":
        return right.name.localeCompare(left.name);
      default:
        return 0;
    }
  });

  return filtered;
}

export function getRelatedProducts(
  products: Product[],
  currentProduct: Product,
  limit = 4
): Product[] {
  return products
    .filter(
      (product) =>
        product._id !== currentProduct._id &&
        product.category === currentProduct.category
    )
    .slice(0, limit);
}
