import axios from "axios";
import { getAuthToken } from "./authApi";
import type {
  OrderCreatePayload,
  OrderResponse,
  OrdersResponse,
} from "../types/order";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function createOrder(
  payload: OrderCreatePayload
): Promise<OrderResponse> {
  const response = await apiClient.post<OrderResponse>("/orders", payload);
  return response.data;
}

export async function fetchOrders(): Promise<OrdersResponse> {
  const response = await apiClient.get<OrdersResponse>("/orders");
  return response.data;
}

export async function fetchOrderById(id: string): Promise<OrderResponse> {
  const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
  return response.data;
}
