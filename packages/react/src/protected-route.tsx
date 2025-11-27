import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './use-auth';

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo = '/',
  loadingComponent = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
