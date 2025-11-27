import { useAuth } from './use-auth';

/**
 * Hook to access current tokens
 * Returns access token and refresh token
 */
export function useToken() {
  const { tokens } = useAuth();

  return {
    accessToken: tokens?.accessToken || null,
    refreshToken: tokens?.refreshToken || null,
    tokenType: tokens?.tokenType || null,
  };
}
