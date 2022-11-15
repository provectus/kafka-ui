import { useQuery } from '@tanstack/react-query';
import { AccessApiClient } from 'lib/api';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';
import {
  Action,
  UserPermission,
  UserPermissionResourceEnum,
} from 'generated-sources';

export function useRoleBasedAccess() {
  return useQuery(
    ['roles'],
    () => AccessApiClient.getPermissions(),
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
            clusters: ['local'],
            resource: UserPermissionResourceEnum.KSQL,
            actions: [Action.EXECUTE],
          },
          {
            clusters: ['local', 'dev'],
            resource: UserPermissionResourceEnum.SCHEMA,
            actions: [Action.CREATE],
          },
          {
            clusters: ['local'],
            resource: UserPermissionResourceEnum.CONNECT,
            actions: [Action.CREATE],
          },
          {
            clusters: ['local'],
            resource: UserPermissionResourceEnum.TOPIC,
            actions: [
              Action.EDIT,
              Action.MESSAGES_DELETE,
              Action.DELETE,
              Action.VIEW,
            ],
            value: '123.*',
          },
          {
            clusters: ['local'],
            resource: UserPermissionResourceEnum.TOPIC,
            actions: [Action.CREATE],
          },
          {
            clusters: ['local'],
            resource: UserPermissionResourceEnum.SCHEMA,
            actions: [Action.EDIT, Action.DELETE],
            value: '111.*',
          },
          {
            clusters: ['local'],
            resource: UserPermissionResourceEnum.CLUSTERCONFIG,
            actions: [Action.EDIT],
          },
        ]);
      });
    });
  });
}

export function useUserInfo() {
  return useQuery(['user-info'], (): Promise<{ username: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        return resolve({ username: 'Misho Yamaha' });
      });
    });
  });
}
