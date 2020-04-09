import {
  TopicName,
  Topic,
  ClusterName,
  TopicDetails,
  TopicConfig,
  TopicFormData,
} from 'redux/interfaces';
import {
  BASE_URL,
  BASE_PARAMS,
} from 'lib/constants';

export const getTopicConfig = (clusterName: ClusterName, topicName: TopicName): Promise<TopicConfig[]> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/topics/${topicName}/config`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopicDetails = (clusterName: ClusterName, topicName: TopicName): Promise<TopicDetails> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/topics/${topicName}`, { ...BASE_PARAMS })
    .then(res => res.json());

export const getTopics = (clusterName: ClusterName): Promise<Topic[]> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/topics`, { ...BASE_PARAMS })
    .then(res => res.json());

export const postTopic = (clusterName: ClusterName, form: TopicFormData): Promise<Topic> => {
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
  return fetch(`${BASE_URL}/clusters/${clusterName}/topics`, {
    ...BASE_PARAMS,
    method: 'POST',
    body,
  }).then(res => res.json());
};
