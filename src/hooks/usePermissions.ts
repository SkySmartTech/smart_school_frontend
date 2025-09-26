import { useEffect, useState, useMemo } from 'react';
import type { PermissionKey } from '../api/userAccessmanagementApi';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);

  // First, call all hooks at the top level
  const permissionsSet = useMemo(() => new Set(permissions), [permissions]);

  useEffect(() => {
    const loadPermissions = () => {
      try {
        const permissionsStr = localStorage.getItem('userPermissions');
        if (permissionsStr) {
          const permissionsArray = JSON.parse(permissionsStr);
          setPermissions(permissionsArray);
          return;
        }

        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.access && user.access.length > 0) {
            const permissionsArray = JSON.parse(user.access[0]);
            setPermissions(permissionsArray);
            localStorage.setItem('userPermissions', JSON.stringify(permissionsArray));
          }
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions([]);
      }
    };

    loadPermissions();
  }, []);

  // Define hasPermission as a regular function since we already have permissionsSet memoized
  const hasPermission = (permission: PermissionKey): boolean => {
    return permissionsSet.has(permission);
  };

  return {
    hasPermission,
    permissions
  };
};