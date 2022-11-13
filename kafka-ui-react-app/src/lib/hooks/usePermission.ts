import { useContext } from 'react';
import { Action, UserPermissionResourceEnum } from 'generated-sources';
import { RolesAccessContext } from 'components/contexts/RolesAccessContext';
import { ClusterNameRoute } from 'lib/paths';

import useAppParams from './useAppParams';

// TODO just write tests
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
    cluster.findIndex((item) => {
      let valueCheck = true;
      if (item.value) {
        valueCheck = false;

        if (value) valueCheck = new RegExp(item.value).test(value);
      }

      return (
        item.resource === resource &&
        valueCheck &&
        item.actions.includes(action)
      );
    }) !== -1
  );
}
