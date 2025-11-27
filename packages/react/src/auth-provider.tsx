import { useEffect, useRef, useReducer, useCallback } from 'react';
import {
  GoogleOAuthClient,
  TokenManager,
  MemoryTokenStorage,
  getTimeUntilExpiration,
  type AuthTokens,
  type User,
} from '@aieng-auth/core';
import { AuthContext } from './auth-context';
import type { AuthProviderProps, AuthState } from './types';

/**
 * Auth action types
 */
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { tokens: AuthTokens; user: User } }
  | { type: 'LOGIN_ERROR'; payload: Error }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_START' }
  | { type: 'REFRESH_SUCCESS'; payload: AuthTokens }
  | { type: 'REFRESH_ERROR'; payload: Error }
  | { type: 'SET_LOADING'; payload: boolean };

/**
 * Auth reducer
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        tokens: null,
        error: null,
      };
    case 'REFRESH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        tokens: action.payload,
        error: null,
      };
    case 'REFRESH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

/**
 * Initial auth state
 */
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tokens: null,
  error: null,
};

/**
 * AuthProvider component
 * Wraps your app to provide authentication context
 */
export function AuthProvider({
  children,
  config,
  onLoginSuccess,
  onLoginError,
  onLogout,
  autoRefresh = true,
  refreshBufferSeconds = 300,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const clientRef = useRef<GoogleOAuthClient>();
  const tokenManagerRef = useRef<TokenManager>();
  const refreshTimerRef = useRef<NodeJS.Timeout>();

  /**
   * Refresh tokens
   */
  const refreshTokens = useCallback(async () => {
    if (!state.tokens?.refreshToken || !clientRef.current || !tokenManagerRef.current) {
      return;
    }

    dispatch({ type: 'REFRESH_START' });

    try {
      const newTokens = await clientRef.current.refreshTokens(state.tokens.refreshToken);
      await tokenManagerRef.current.setTokens(newTokens);

      dispatch({ type: 'REFRESH_SUCCESS', payload: newTokens });

      // Setup next refresh if autoRefresh is enabled
      // Note: We can't call setupTokenRefresh here as it would create a circular dependency
      // The setupTokenRefresh will be set up when needed in the callback
      if (autoRefresh && newTokens.refreshToken) {
        // Clear existing timer
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }

        const timeUntilExpiry = getTimeUntilExpiration(newTokens.accessToken);
        const refreshTime = Math.max(0, timeUntilExpiry - refreshBufferSeconds) * 1000;

        refreshTimerRef.current = setTimeout(() => {
          void refreshTokens();
        }, refreshTime);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Token refresh failed');
      dispatch({ type: 'REFRESH_ERROR', payload: err });

      // On refresh error, logout user
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Revoke token and clear storage
      if (state.tokens?.accessToken && clientRef.current) {
        await clientRef.current.revokeToken(state.tokens.accessToken);
      }
      if (tokenManagerRef.current) {
        await tokenManagerRef.current.clearTokens();
      }

      dispatch({ type: 'LOGOUT' });

      if (onLogout) {
        await onLogout();
      }
    }
  }, [state.tokens, onLogout, autoRefresh, refreshBufferSeconds]);

  /**
   * Setup automatic token refresh
   */
  const setupTokenRefresh = useCallback(
    (tokens: AuthTokens) => {
      if (!autoRefresh || !tokens.refreshToken) return;

      // Clear existing timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const timeUntilExpiry = getTimeUntilExpiration(tokens.accessToken);
      const refreshTime = Math.max(0, timeUntilExpiry - refreshBufferSeconds) * 1000;

      refreshTimerRef.current = setTimeout(() => {
        void refreshTokens();
      }, refreshTime);
    },
    [autoRefresh, refreshBufferSeconds, refreshTokens]
  );

  // Initialize client and token manager
  useEffect(() => {
    const storage = config.tokenStorage || new MemoryTokenStorage();
    tokenManagerRef.current = new TokenManager(storage);
    clientRef.current = new GoogleOAuthClient(config);

    // Check for existing session
    const initAuth = async () => {
      try {
        if (!tokenManagerRef.current || !clientRef.current) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        const tokens = await tokenManagerRef.current.getTokens();
        if (tokens?.accessToken) {
          const user = await clientRef.current.getUserInfo(tokens.accessToken);
          dispatch({ type: 'LOGIN_SUCCESS', payload: { tokens, user } });

          // Setup auto-refresh if enabled
          if (autoRefresh) {
            setupTokenRefresh(tokens);
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    void initAuth();

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [config, autoRefresh, setupTokenRefresh]);

  /**
   * Handle OAuth callback
   */
  useEffect(() => {
    const handleCallback = async () => {
      // Check if we're on the callback route
      if (!window.location.pathname.includes('callback')) {
        return;
      }

      if (!clientRef.current || !tokenManagerRef.current) {
        return;
      }

      dispatch({ type: 'LOGIN_START' });

      try {
        const tokens = await clientRef.current.handleCallback(window.location.href);
        await tokenManagerRef.current.setTokens(tokens);

        const user = await clientRef.current.getUserInfo(tokens.accessToken);

        dispatch({ type: 'LOGIN_SUCCESS', payload: { tokens, user } });

        if (autoRefresh) {
          setupTokenRefresh(tokens);
        }

        if (onLoginSuccess) {
          await onLoginSuccess(tokens, user);
        }

        // Redirect to home or a success page
        window.history.replaceState({}, document.title, '/');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Authentication failed');
        dispatch({ type: 'LOGIN_ERROR', payload: err });

        if (onLoginError) {
          await onLoginError(err);
        }
      }
    };

    void handleCallback();
  }, [autoRefresh, onLoginSuccess, onLoginError, setupTokenRefresh]);

  /**
   * Login - redirects to Google OAuth
   */
  const login = useCallback(async () => {
    if (!clientRef.current) {
      const err = new Error('Client not initialized');
      dispatch({ type: 'LOGIN_ERROR', payload: err });
      return;
    }

    try {
      await clientRef.current.login();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Login failed');
      dispatch({ type: 'LOGIN_ERROR', payload: err });
      if (onLoginError) {
        await onLoginError(err);
      }
    }
  }, [onLoginError]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      // Clear refresh timer
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Revoke token and clear storage
      if (state.tokens?.accessToken && clientRef.current) {
        await clientRef.current.revokeToken(state.tokens.accessToken);
      }
      if (tokenManagerRef.current) {
        await tokenManagerRef.current.clearTokens();
      }

      dispatch({ type: 'LOGOUT' });

      if (onLogout) {
        await onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if revoke fails
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.tokens, onLogout]);

  const value = {
    ...state,
    login,
    logout,
    refreshTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
