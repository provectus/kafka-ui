import { Broker, ClusterName, BrokerMetrics } from 'redux/interfaces';
import { BASE_URL, BASE_PARAMS } from 'lib/constants';

export const getBrokers = (clusterName: ClusterName): Promise<Broker[]> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/brokers`, {
    ...BASE_PARAMS,
  }).then((res) => res.json());

export const getBrokerMetrics = (
  clusterName: ClusterName
): Promise<BrokerMetrics> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/metrics`, {
    ...BASE_PARAMS,
  }).then((res) => res.json());
