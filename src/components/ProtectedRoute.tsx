import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import type { PermissionKey } from '../api/userAccessmanagementApi';
import PageLoader from './PageLoader';
import { useCurrentUser } from '../hooks/useCurrentUser';

interface ProtectedRouteProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

const ProtectedRoute = ({ permission, children }: ProtectedRouteProps) => {
  const { hasPermission } = usePermissions();
  const { isAuthenticated, isLoading } = useCurrentUser();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;