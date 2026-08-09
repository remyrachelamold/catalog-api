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

export async function processPayment(payload: {
  paymentMethod: "card" | "upi" | "netbanking" | "cod";
  simulate?: "success" | "failure";
  cardLast4?: string;
  upiId?: string;
  bank?: string;
}) {
  const response = await apiClient.post("/payments/process", payload);
  return response.data;
}
