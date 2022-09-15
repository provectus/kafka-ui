import { timerStampFormat as api } from 'lib/api';
import { useQuery } from '@tanstack/react-query';

export function useTimeFormatStats() {
  return useQuery(['timestampformat'], () => api.getTimeStampFormat());
}
