import { useQuery } from '@tanstack/react-query';
import { AccessApiClient } from 'lib/api';
import {
  Action,
  UserPermission,
  UserPermissionResourceEnum,
} from 'generated-sources';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

export function useRoleBasedAccess() {
  return useQuery(
    ['roles'],
    AccessApiClient.getPermissions,
    QUERY_REFETCH_OFF_OPTIONS
  );
}

export function useRoleBasedAccessMock() {
  return useQuery(['roles'], (): Promise<Array<UserPermission>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve([
          {
            clusters: ['local'],
            resource: UserPermissionResourceEnum.TOPIC,
            value: 'sss',
            actions: [Action.DELETE, Action.CREATE],
          },
          {
            clusters: ['local', 'dev'],
            resource: UserPermissionResourceEnum.SCHEMA,
            actions: [Action.CREATE],
          },
          {
            clusters: ['local'],
            resource: UserPermissionResourceEnum.TOPIC,
            value: 'topic',
            actions: [Action.CREATE],
          },
        ]);
      }, 5000);
    });
  });
}
