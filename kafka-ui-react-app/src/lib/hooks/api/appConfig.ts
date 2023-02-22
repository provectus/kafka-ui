import { appConfigApiClient as api } from 'lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApplicationConfigPropertiesKafkaClustersInner } from 'generated-sources';
import { showAlert } from 'lib/errorHandling';

export function useAppConfig() {
  return useQuery(['appConfig'], () => api.getCurrentConfig());
}

export function useUpdateAppConfig({ initialName }: { initialName?: string }) {
  const client = useQueryClient();
  return useMutation(
    async (cluster: ApplicationConfigPropertiesKafkaClustersInner) => {
      const existingConfig = await api.getCurrentConfig();
      const existingClusters = existingConfig.properties?.kafka?.clusters || [];

      let clusters: ApplicationConfigPropertiesKafkaClustersInner[] = [];

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
      onSuccess: () => client.invalidateQueries(['appConfig']),
      onError() {
        showAlert('error', {
          id: 'app-config-update-error',
          title: 'Error updating application config',
          message: 'There was an error updating the application config',
        });
      },
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
  return useMutation((config: ApplicationConfigPropertiesKafkaClustersInner) =>
    api.validateConfig({
      applicationConfig: { properties: { kafka: { clusters: [config] } } },
    })
  );
}
