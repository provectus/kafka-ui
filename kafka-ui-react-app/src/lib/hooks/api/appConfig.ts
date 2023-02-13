import { appConfigApiClient as api } from 'lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ApplicationConfigPropertiesKafkaClustersInner } from 'generated-sources';

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

export function useValidateAppConfig() {
  return useMutation((config: ApplicationConfigPropertiesKafkaClustersInner) =>
    api.validateConfig({
      applicationConfig: { properties: { kafka: { clusters: [config] } } },
    })
  );
}
