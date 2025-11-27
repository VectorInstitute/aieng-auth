// Export components
export { AuthProvider } from './auth-provider';
export { ProtectedRoute } from './protected-route';

// Export hooks
export { useAuth } from './use-auth';
export { useToken } from './use-token';

// Export types
export type { AuthState, AuthContextValue, AuthProviderProps } from './types';
export type { ProtectedRouteProps } from './protected-route';

// Re-export core types for convenience
export type { AuthConfig, AuthTokens, User, PKCEChallenge } from '@aieng-auth/core';
