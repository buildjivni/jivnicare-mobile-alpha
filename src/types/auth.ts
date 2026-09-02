export type UserRole = "DOCTOR" | "OPERATOR" | "ADMIN" | "PATIENT";

export interface AuthUser {
  id: string;
  phone?: string;
  name: string;
  email?: string;
  role: UserRole;
  doctorId?: string | null;
  isOperator?: boolean;
  operatorRole?: string | null;
  isActive: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  setInitialized: (initialized: boolean) => void;
}
