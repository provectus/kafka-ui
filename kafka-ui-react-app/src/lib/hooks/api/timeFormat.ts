import { useQuery } from '@tanstack/react-query';
import { timerStampFormatApiClient as api } from 'lib/api';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

export function useTimeFormat() {
  return useQuery(
    ['settings', 'timestampformat'],
    () => api.getTimeStampFormatISO(),
    QUERY_REFETCH_OFF_OPTIONS
  );
}
