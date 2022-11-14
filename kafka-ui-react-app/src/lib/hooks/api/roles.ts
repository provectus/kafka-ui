import { useQuery } from '@tanstack/react-query';
import { AccessApiClient } from 'lib/api';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

export function useRoleBasedAccess() {
  return useQuery(
    ['roles'],
    () => AccessApiClient.getPermissions(),
    QUERY_REFETCH_OFF_OPTIONS
  );
}
