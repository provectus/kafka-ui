import {
  TopicName,
  Topic,
  ClusterName,
  TopicDetails,
  TopicConfig,
  TopicFormData,
} from 'redux/interfaces';
import { BASE_URL, BASE_PARAMS } from 'lib/constants';
import { snakeCase } from 'lodash';

interface TopicFormParams {
  [name: string]: string;
}

const formatParams = (params: TopicFormData, omittedFields: string[] = []) => {
  return Object.keys(params).reduce((result, paramName) => {
    if (
      ['name', 'partitions', 'replicationFactor', ...omittedFields].includes(
        paramName
      )
    ) {
      return result;
    }
    result[snakeCase(paramName).replace(/_/g, '.')] = params[
      paramName
    ] as string;
    return result;
  }, {} as TopicFormParams);
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
  const { name, partitions, replicationFactor } = form;

  const body = JSON.stringify({
    name,
    partitions,
    replicationFactor,
    configs: formatParams(form, ['customParams']),
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
  const body = JSON.stringify({
    configs: formatParams(form, [
      'name',
      'partitions',
      'replicationFactor',
      'customParams',
    ]),
  });

  return fetch(`${BASE_URL}/clusters/${clusterName}/topics/${form.name}`, {
    ...BASE_PARAMS,
    method: 'PATCH',
    body,
  }).then((res) => res.json());
};
