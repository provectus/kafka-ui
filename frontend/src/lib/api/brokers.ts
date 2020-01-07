import {
  Broker,
  ClusterId,
  BrokerMetrics,
} from 'types';
import {
  BASE_URL,
  BASE_PARAMS,
} from 'lib/constants';

export const getBrokers = (clusterId: ClusterId): Promise<{ brokers: Broker[] }> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/brokers`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getBrokerMetrics = (clusterId: ClusterId): Promise<BrokerMetrics> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/metrics/broker`, { ...BASE_PARAMS })
    .then(res => res.json());
