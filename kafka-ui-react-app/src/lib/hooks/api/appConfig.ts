import { appConfigApiClient as api } from 'lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApplicationConfigPropertiesKafkaClusters } from 'generated-sources';
import { QUERY_REFETCH_OFF_OPTIONS } from 'lib/constants';

export function useAppInfo() {
  return useQuery(
    ['app', 'info'],
    () => api.getApplicationInfo(),
    QUERY_REFETCH_OFF_OPTIONS
  );
}

export function useAppConfig() {
  return useQuery(['app', 'config'], () => api.getCurrentConfig());
}

export function useUpdateAppConfig({ initialName }: { initialName?: string }) {
  const client = useQueryClient();
  return useMutation(
    async (cluster: ApplicationConfigPropertiesKafkaClusters) => {
      const existingConfig = await api.getCurrentConfig();
      const existingClusters = existingConfig.properties?.kafka?.clusters || [];

      let clusters: ApplicationConfigPropertiesKafkaClusters[] = [];

      if (existingClusters.length > 0) {
        if (!initialName) {
          clusters = [...existingClusters, cluster];
        } else {
          clusters = existingClusters.map((c) =>
            c.name === initialName ? cluster : c
          );
        }
      } else {
        clusters = [cluster];
      }

      const config = {
        ...existingConfig,
        properties: {
          ...existingConfig.properties,
          kafka: { clusters },
        },
      };
      return api.restartWithConfig({ restartRequest: { config } });
    },
    {
      onSuccess: () => client.invalidateQueries(['app', 'config']),
    }
  );
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
  return useMutation((config: ApplicationConfigPropertiesKafkaClusters) =>
    api.validateConfig({
      applicationConfig: { properties: { kafka: { clusters: [config] } } },
    })
  );
}
