export type Role = 'candidate' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
