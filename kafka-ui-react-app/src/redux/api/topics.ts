import { reduce } from 'lodash';
import {
  TopicName,
  Topic,
  ClusterName,
  TopicDetails,
  TopicConfig,
  TopicFormData,
  TopicFormCustomParam,
} from 'redux/interfaces';
import { BASE_URL, BASE_PARAMS } from 'lib/constants';

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

interface Result {
  [index: string]: string;
}

const parsedCustomParams = (params: {
  [paramIndex: string]: TopicFormCustomParam;
}) =>
  reduce(
    Object.values(params),
    (result: Result, customParam: TopicFormCustomParam) => {
      result[customParam.name] = customParam.value;
      return result;
    },
    {}
  );

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
    customParams,
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
      ...parsedCustomParams(customParams),
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
    name,
    cleanupPolicy,
    retentionBytes,
    retentionMs,
    maxMessageBytes,
    minInSyncReplicas,
    customParams,
  } = form;

  console.log(form);

  const body = JSON.stringify({
    configs: {
      'cleanup.policy': cleanupPolicy,
      'retention.ms': retentionMs,
      'retention.bytes': retentionBytes,
      'max.message.bytes': maxMessageBytes,
      'min.insync.replicas': minInSyncReplicas,
      ...parsedCustomParams(customParams),
    },
  });

  return fetch(`${BASE_URL}/clusters/${clusterName}/topics/${name}`, {
    ...BASE_PARAMS,
    method: 'PATCH',
    body,
  }).then((res) => res.json());
};
