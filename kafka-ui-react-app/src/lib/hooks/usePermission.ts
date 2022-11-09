import { useContext } from 'react';
import { Action, UserPermissionResourceEnum } from 'generated-sources';
import { RolesAccessContext } from 'components/contexts/RolesAccessContext';

export function usePermission(
  clusterName: string,
  resource: UserPermissionResourceEnum,
  action: Action,
  value?: string
): boolean {
  const roles = useContext(RolesAccessContext);
  if (!roles) return false;

  const cluster = roles.get(clusterName);
  if (!cluster) return false;

  return (
    cluster.findIndex(
      (item) =>
        item.resource === resource &&
        item.value === value &&
        item.actions.includes(action)
    ) !== -1
  );
}
