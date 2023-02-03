import { appConfigApiClient as api } from 'lib/api';
import { useQuery } from '@tanstack/react-query';

export function useAppConfig() {
  return useQuery(['appConfig'], () => api.getCurrentConfig());
}
