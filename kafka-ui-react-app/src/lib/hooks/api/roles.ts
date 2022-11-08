import { useQuery } from '@tanstack/react-query';
import { AccessApiClient } from 'lib/api';
import { UserPermission, UserPermissionResourceEnum } from 'generated-sources';
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
            resource: UserPermissionResourceEnum.TOPIC,
            value: 'sss',
            actions: ['delete'],
          },
          {
            resource: UserPermissionResourceEnum.SCHEMA,
            actions: ['create'],
          },
          {
            resource: UserPermissionResourceEnum.TOPIC,
            actions: ['create'],
          },
        ]);
      }, 5000);
    });
  });
}
