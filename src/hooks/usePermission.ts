import { useAuthenticationContext } from '../contexts/AuthContext';
import { validateUserPermissions } from '../utils/validateUserPermissions';

type UsePermissionParams = {
  permissions?: string[];
  roles?: string[];
};

export function usePermission({
  permissions = [],
  roles = [],
}: UsePermissionParams) {
  const { user, isAuthenticated } = useAuthenticationContext();

  if (!isAuthenticated) {
    return false;
  }

  if (user) {
    const userHasValidPermissions = validateUserPermissions({
      user,
      roles,
      permissions,
    });

    return userHasValidPermissions;
  }

  return false;
}
