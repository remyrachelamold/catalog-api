import axios from "axios";
import type { AuthProfileResponse, AuthResponse, LoginFormValues, RegisterFormValues } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("catalog-auth-token");
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem("catalog-auth-token", token);
    return;
  }

  window.localStorage.removeItem("catalog-auth-token");
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function registerUser(payload: RegisterFormValues): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload: LoginFormValues): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function fetchProfile(): Promise<AuthProfileResponse> {
  const response = await apiClient.get<AuthProfileResponse>("/auth/profile");
  return response.data;
}
