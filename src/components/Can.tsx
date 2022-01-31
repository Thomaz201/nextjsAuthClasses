import { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';

interface CanProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export function Can({ permissions, roles, children }: CanProps) {
  const userCanSeeComponent = usePermission({
    permissions,
    roles,
  });

  if (!userCanSeeComponent) {
    return null;
  }

  return <>{children}</>;
}
