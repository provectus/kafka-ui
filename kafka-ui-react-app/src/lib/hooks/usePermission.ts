import { useContext } from 'react';
import { Action, ResourceType } from 'generated-sources';
import { UserInfoRolesAccessContext } from 'components/contexts/UserInfoRolesAccessContext';
import { ClusterNameRoute } from 'lib/paths';
import { isPermitted } from 'lib/permissions';
import useAppParams from 'lib/hooks/useAppParams';

export function usePermission(
  resource: ResourceType,
  action: Action | Array<Action>,
  value?: string
): boolean {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const { roles, rbacFlag } = useContext(UserInfoRolesAccessContext);

  return isPermitted({ roles, resource, action, clusterName, value, rbacFlag });
}
