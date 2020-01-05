import {
  TopicName,
  Topic,
  Broker,
  ClusterId,
} from 'types';
import {
  BASE_URL,
  BASE_PARAMS,
} from 'lib/constants';

export const getTopic = (name: TopicName): Promise<Topic> =>
  fetch(`${BASE_URL}/topics/${name}`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopics = (clusterId: ClusterId): Promise<Topic[]> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/topics`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getBrokers = (clusterId: ClusterId): Promise<{ brokers: Broker[] }> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/brokers`, { ...BASE_PARAMS })
    .then(res => res.json());
