import axios from "axios";
import type {
  Product,
  ProductInput,
  ProductMutationResponse,
} from "../types/Product";
import type { ReviewListResponse, ReviewResponse } from "../types/review";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await apiClient.get<Product[]>("/catalogs");
  return response.data;
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiClient.get<Product>(`/catalogs/${id}`);
  return response.data;
}

export async function createProduct(
  input: ProductInput
): Promise<ProductMutationResponse> {
  const response = await apiClient.post<ProductMutationResponse>(
    "/catalogs",
    input
  );
  return response.data;
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ProductMutationResponse> {
  const response = await apiClient.put<ProductMutationResponse>(
    `/catalogs/${id}`,
    input
  );
  return response.data;
}

export async function deleteProduct(
  id: string
): Promise<ProductMutationResponse> {
  const response = await apiClient.delete<ProductMutationResponse>(
    `/catalogs/${id}`
  );
  return response.data;
}

export async function fetchWishlist(): Promise<{ products: Product[] }> {
  const response = await apiClient.get<{ products: Product[] }>("/wishlist");
  return response.data;
}

export async function addToWishlist(productId: string): Promise<{ products: Product[] }> {
  const response = await apiClient.post<{ products: Product[] }>(
    "/wishlist",
    { productId }
  );
  return response.data;
}

export async function removeFromWishlist(productId: string): Promise<{ products: Product[] }> {
  const response = await apiClient.delete<{ products: Product[] }>(
    `/wishlist/${productId}`
  );
  return response.data;
}

export async function fetchReviews(productId: string): Promise<ReviewListResponse> {
  const response = await apiClient.get<ReviewListResponse>(
    `/catalogs/${productId}/reviews`
  );
  return response.data;
}

export async function createReview(
  productId: string,
  rating: number,
  comment: string
): Promise<ReviewResponse> {
  const response = await apiClient.post<ReviewResponse>(
    `/catalogs/${productId}/reviews`,
    { rating, comment }
  );
  return response.data;
}

export async function updateReview(
  productId: string,
  reviewId: string,
  rating: number,
  comment: string
): Promise<ReviewResponse> {
  const response = await apiClient.put<ReviewResponse>(
    `/catalogs/${productId}/reviews/${reviewId}`,
    { rating, comment }
  );
  return response.data;
}

export async function deleteReview(
  productId: string,
  reviewId: string
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/catalogs/${productId}/reviews/${reviewId}`
  );
  return response.data;
}
