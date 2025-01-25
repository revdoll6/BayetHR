import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage, type PersistOptions } from 'zustand/middleware';
import axios, { AxiosError } from 'axios';
import { QueryClient } from '@tanstack/react-query';

export type Role = 'candidate' | 'admin';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status?: 'ACTIVE' | 'INACTIVE'; // Removed PENDING since admin will be pre-configured
}

export interface AdminUser extends User {
  role: 'admin';
  permissions?: string[]; // Optional permissions array for future use
}

export interface CandidateUser extends User {
  role: 'candidate';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  login: (credentials: LoginCredentials, role: Role) => Promise<void>;
  signup: (credentials: SignupCredentials, role: Role) => Promise<void>;
  logout: (onLogoutComplete?: () => void) => Promise<void>;
  clearError: () => void;
  setHydrated: (state: boolean) => void;
  isAdmin: () => boolean;
}

type AuthPersist = (
  config: StateCreator<AuthState>,
  options: PersistOptions<AuthState, Pick<AuthState, 'user'>>
) => StateCreator<AuthState>;

// Create the store with persist middleware
export const useAuthStore = create<AuthState>()(
  (persist as AuthPersist)(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isHydrated: false,
      login: async (credentials: LoginCredentials, role: Role) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post<{ user: User }>(`/api/auth/${role}/login`, credentials);

          if (response.data.user) {
            const user = response.data.user;

            // For admin users, check if they are active
            if (role === 'admin' && user.status !== 'ACTIVE') {
              throw new Error('Admin account is pending approval or inactive');
            }

            set({ user, error: null, isHydrated: true });
            document.cookie = `user=${JSON.stringify(user)}; path=/`;
          } else {
            throw new Error('Login response missing user data');
          }
        } catch (error) {
          const errorMessage =
            error instanceof AxiosError
              ? error.response?.data?.error || 'Login failed'
              : 'An unexpected error occurred';
          set({ error: errorMessage, user: null });
        } finally {
          set({ isLoading: false });
        }
      },
      signup: async (credentials: SignupCredentials, role: Role) => {
        // Only allow candidate signup
        if (role === 'admin') {
          set({ error: 'Admin signup is not allowed' });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          await axios.post(`/api/auth/${role}/signup`, credentials);
          set({ error: null, user: null });
        } catch (error) {
          const errorMessage =
            error instanceof AxiosError
              ? error.response?.data?.error || 'Signup failed'
              : 'An unexpected error occurred';
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },
      logout: async (onLogoutComplete?: () => void) => {
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to logout');
          }

          set({ user: null, error: null, isHydrated: true });
          localStorage.clear();
          document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

          const queryClient = new QueryClient();
          queryClient.clear();

          onLogoutComplete?.();
        } catch (error) {
          set({ user: null, error: 'Failed to completely logout', isHydrated: true });
          localStorage.clear();
          document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          onLogoutComplete?.();
        }
      },
      clearError: () => set({ error: null }),
      setHydrated: (state: boolean) => {
        set({ isHydrated: state });
      },
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AuthState) => ({ user: state.user }),
      onRehydrateStorage: () => (state: unknown) => {
        // Always set hydrated to true after rehydration attempt
        setTimeout(() => {
          useAuthStore.setState({ isHydrated: true });

          // If we have state and a user, update the cookie
          const typedState = state as { user: User | null } | null;
          if (typedState?.user) {
            document.cookie = `user=${JSON.stringify(typedState.user)}; path=/`;
          }
        }, 0);
      },
    }
  )
);
