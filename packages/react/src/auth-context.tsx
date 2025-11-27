import { createContext } from 'react';
import type { AuthContextValue } from './types';

/**
 * Authentication context
 * Use useAuth() hook to access this context
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

AuthContext.displayName = 'AuthContext';
