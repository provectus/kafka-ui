import { useQuery } from '@tanstack/react-query';
import { AccessApiClient } from 'lib/api';
import { UserPermission, UserPermissionResourceEnum } from 'generated-sources';

export function useRoleBasedAccess() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: AccessApiClient.getPermissions,
  });
}

export function useRoleBasedAccessMock() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: (): Promise<Array<UserPermission>> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          return resolve([
            {
              resource: UserPermissionResourceEnum.TOPIC,
              value: 'sss',
              actions: ['delete'],
            },
            {
              resource: UserPermissionResourceEnum.CLUSTER,
              actions: ['create'],
            },
          ]);
        });
      });
    },
  });
}
