import { appConfigApiClient as api } from 'lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useAppConfig() {
  return useQuery(['appConfig'], () => api.getCurrentConfig());
}

export function useAppConfigFilesUpload() {
  return useMutation((payload: FormData) =>
    fetch('/api/config/relatedfiles', {
      method: 'POST',
      body: payload,
    }).then((res) => res.json())
  );
}
