import axios from "axios";
import { getAuthToken } from "./authApi";

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

export async function fetchAdminDashboard() {
  const response = await apiClient.get("/admin/dashboard");
  return response.data;
}

export async function fetchAdminProducts() {
  const response = await apiClient.get("/admin/products");
  return response.data;
}

export async function fetchAdminOrders() {
  const response = await apiClient.get("/admin/orders");
  return response.data;
}

export async function fetchAdminUsers() {
  const response = await apiClient.get("/admin/users");
  return response.data;
}

export async function updateAdminUserRole(id: string, role: string) {
  const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
  return response.data;
}

export async function toggleAdminUserStatus(id: string, isDisabled: boolean) {
  const response = await apiClient.patch(`/admin/users/${id}/status`, { isDisabled });
  return response.data;
}

export async function updateAdminOrderStatus(id: string, status: string) {
  const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
}
