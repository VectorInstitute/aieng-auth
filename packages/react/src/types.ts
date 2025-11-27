import type { AuthConfig, AuthTokens, User } from '@vector-institute/aieng-auth-core';

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  error: Error | null;
}

/**
 * Authentication context value with actions
 */
export interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

/**
 * AuthProvider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
  config: AuthConfig;
  onLoginSuccess?: (tokens: AuthTokens, user: User) => void | Promise<void>;
  onLoginError?: (error: Error) => void | Promise<void>;
  onLogout?: () => void | Promise<void>;
  autoRefresh?: boolean;
  refreshBufferSeconds?: number;
}
