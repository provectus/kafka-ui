import { clustersApiClient } from 'lib/api';
import { useQuery } from 'react-query';

export default function useClusters() {
  return useQuery(['clusters'], () => clustersApiClient.getClusters(), {
    suspense: true,
  });
}
