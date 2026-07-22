import type { Product, ProductFormValues } from "../types/Product";

export function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    price: String(product.price),
    category: product.category,
    imageUrl: product.imageUrl ?? "",
    description: product.description ?? "",
  };
}

export function parseProductForm(values: ProductFormValues): {
  data: {
    name: string;
    price: number;
    category: string;
    imageUrl?: string;
    description?: string;
  } | null;
  error: string | null;
} {
  const name = values.name.trim();
  const category = values.category.trim();
  const imageUrl = values.imageUrl.trim();
  const description = values.description.trim();
  const price = Number(values.price);

  if (!name) {
    return { data: null, error: "Product name is required." };
  }

  if (!category) {
    return { data: null, error: "Category is required." };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return { data: null, error: "Price must be a positive number." };
  }

  return {
    data: {
      name,
      price,
      category,
      ...(imageUrl ? { imageUrl } : {}),
      ...(description ? { description } : {}),
    },
    error: null,
  };
}
