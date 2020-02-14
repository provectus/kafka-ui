import {
  TopicName,
  Topic,
  ClusterId,
  TopicDetails,
  TopicConfig,
  TopicFormData,
} from 'redux/interfaces';
import {
  BASE_URL,
  BASE_PARAMS,
} from 'lib/constants';

export const getTopicConfig = (clusterId: ClusterId, topicName: TopicName): Promise<TopicConfig[]> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/topics/${topicName}/config`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopicDetails = (clusterId: ClusterId, topicName: TopicName): Promise<TopicDetails> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/topics/${topicName}`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopics = (clusterId: ClusterId): Promise<Topic[]> =>
  fetch(`${BASE_URL}/clusters/${clusterId}/topics`, { ...BASE_PARAMS })
    .then(res => res.json());

export const postTopic = (clusterId: ClusterId, form: TopicFormData): Promise<Response> => {
  const {
    name,
    partitions,
    replicationFactor,
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInSyncReplicas,
  } = form;
  const body = JSON.stringify({
    name,
    partitions,
    replicationFactor,
    configs: {
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs,
      'retention.bytes': retentionBytes,
      'max.message.bytes': maxMessageBytes,
      'min.insync.replicas': minInSyncReplicas,
    }
  });
  return fetch(`${BASE_URL}/clusters/${clusterId}/topics`, {
    ...BASE_PARAMS,
    method: 'POST',
    body,
  });
}
