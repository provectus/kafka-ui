import { useQuery } from '@tanstack/react-query';
import { authApiClient } from 'lib/api';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

export function useGetUserInfo() {
  return useQuery(
    ['userInfo'],
    () => authApiClient.getUserAuthInfo(),
    QUERY_REFETCH_OFF_OPTIONS
  );
}
