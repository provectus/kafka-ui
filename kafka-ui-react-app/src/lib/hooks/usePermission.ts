import { useContext } from 'react';
import { Action, UserPermissionResourceEnum } from 'generated-sources';
import { RolesAccessContext } from 'components/contexts/RolesAccessContext';
import { ClusterNameRoute } from 'lib/paths';
import { isPermitted } from 'lib/permissions';
import useAppParams from 'lib/hooks/useAppParams';

export function usePermission(
  resource: UserPermissionResourceEnum,
  action: Action | Array<Action>,
  value?: string
): boolean {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const roles = useContext(RolesAccessContext);

  return isPermitted({ roles, resource, action, clusterName, value });
}
