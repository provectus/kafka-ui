import {
  TopicName,
  Topic,
  ClusterName,
  TopicDetails,
  TopicConfig,
  TopicFormData,
  TopicFormCustomParam,
  TopicFormFormattedParams,
  TopicFormCustomParams,
} from 'redux/interfaces';
import { BASE_URL, BASE_PARAMS } from 'lib/constants';

const formatCustomParams = (
  customParams: TopicFormCustomParams
): TopicFormFormattedParams => {
  return Object.values(customParams || {}).reduce(
    (result: TopicFormFormattedParams, customParam: TopicFormCustomParam) => {
      return {
        ...result,
        [customParam.name]: customParam.value,
      };
    },
    {} as TopicFormFormattedParams
  );
};

export const getTopicConfig = (
  clusterName: ClusterName,
  topicName: TopicName
): Promise<TopicConfig[]> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/topics/${topicName}/config`, {
    ...BASE_PARAMS,
  }).then((res) => res.json());

export const getTopicDetails = (
  clusterName: ClusterName,
  topicName: TopicName
): Promise<TopicDetails> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/topics/${topicName}`, {
    ...BASE_PARAMS,
  }).then((res) => res.json());

export const getTopics = (clusterName: ClusterName): Promise<Topic[]> =>
  fetch(`${BASE_URL}/clusters/${clusterName}/topics`, {
    ...BASE_PARAMS,
  }).then((res) => res.json());

export const postTopic = (
  clusterName: ClusterName,
  form: TopicFormData
): Promise<Topic> => {
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
      ...formatCustomParams(form.customParams),
    },
  });

  return fetch(`${BASE_URL}/clusters/${clusterName}/topics`, {
    ...BASE_PARAMS,
    method: 'POST',
    body,
  }).then((res) => res.json());
};

export const patchTopic = (
  clusterName: ClusterName,
  form: TopicFormData
): Promise<Topic> => {
  const {
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInSyncReplicas,
  } = form;

  const body = JSON.stringify({
    configs: {
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs,
      'retention.bytes': retentionBytes,
      'max.message.bytes': maxMessageBytes,
      'min.insync.replicas': minInSyncReplicas,
      ...formatCustomParams(form.customParams),
    },
  });

  return fetch(`${BASE_URL}/clusters/${clusterName}/topics/${form.name}`, {
    ...BASE_PARAMS,
    method: 'PATCH',
    body,
  }).then((res) => res.json());
};
