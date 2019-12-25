import {
  Cluster,
} from 'types';
import {
  BASE_URL,
  BASE_PARAMS,
} from 'lib/constants';

export const getClusters = (): Promise<Cluster[]> =>
  fetch(`${BASE_URL}/clusters`, { ...BASE_PARAMS })
    .then(res => res.json());
