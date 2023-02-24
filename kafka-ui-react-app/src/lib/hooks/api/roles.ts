import { useQuery } from '@tanstack/react-query';
import { AuthorizationApiClient } from 'lib/api';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

export function useGetUserInfo() {
  return useQuery(
    ['userInfo'],
    () => AuthorizationApiClient.getUserAuthInfo(),
    QUERY_REFETCH_OFF_OPTIONS
  );
}
