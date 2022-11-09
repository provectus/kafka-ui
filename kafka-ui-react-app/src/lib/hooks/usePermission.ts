import { useContext } from 'react';
import { Action, UserPermissionResourceEnum } from 'generated-sources';
import { RolesAccessContext } from 'components/contexts/RolesAccessContext';
import { ClusterNameRoute } from 'lib/paths';

import useAppParams from './useAppParams';

export function usePermission(
  resource: UserPermissionResourceEnum,
  action: Action,
  value?: string
): boolean {
  const { clusterName } = useAppParams<ClusterNameRoute>();
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
