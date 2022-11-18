import { useQuery } from '@tanstack/react-query';
import { AccessApiClient } from 'lib/api';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

export function useGetUserInfo() {
  return useQuery(
    ['roles'],
    () => AccessApiClient.getUserAuthInfo(),
    QUERY_REFETCH_OFF_OPTIONS
  );
}
