export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role?: "admin" | "customer";
  isDisabled?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface AuthProfileResponse {
  user: AuthUser;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
