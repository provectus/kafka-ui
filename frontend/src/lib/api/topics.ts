import {
  TopicName,
  Topic,
  ClusterId,
  TopicDetails,
  TopicConfigs,
} from 'types';
import {
  BASE_URL,
  BASE_PARAMS,
} from 'lib/constants';

export const getTopicConfig = (clusterId: ClusterId, topicName: TopicName): Promise<TopicConfigs> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/topics/${topicName}/config`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopicDetails = (clusterId: ClusterId, topicName: TopicName): Promise<TopicDetails> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/topics/${topicName}`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopics = (clusterId: ClusterId): Promise<Topic[]> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/topics`, { ...BASE_PARAMS })
    .then(res => res.json());
