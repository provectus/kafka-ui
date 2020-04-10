import { ClusterName } from '../interfaces/cluster';
import { ConsumerGroup } from '../interfaces/consumerGroup';
import { BASE_PARAMS, BASE_URL } from '../../lib/constants';


export const getConsumerGroups = (clusterName: ClusterName): Promise<ConsumerGroup[]> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/consumerGroups`, { ...BASE_PARAMS })
    .then(res => res.json());
