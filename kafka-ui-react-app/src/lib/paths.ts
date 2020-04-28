import { ClusterName, TopicName } from 'redux/interfaces';

const clusterPath = (clusterName: ClusterName) => `/ui/clusters/${clusterName}`;

export const clusterBrokersPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/brokers`;
export const clusterTopicsPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/topics`;
export const clusterTopicNewPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/topics/new`;
export const clusterConsumerGroupsPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/consumer-groups`;

export const clusterTopicPath = (
  clusterName: ClusterName,
  topicName: TopicName
) => `${clusterTopicsPath(clusterName)}/${topicName}`;
export const clusterTopicSettingsPath = (
  clusterName: ClusterName,
  topicName: TopicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/settings`;
export const clusterTopicMessagesPath = (
  clusterName: ClusterName,
  topicName: TopicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/messages`;
