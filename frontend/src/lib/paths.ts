import { ClusterId, TopicName } from "types";

const clusterPath = (clusterId: ClusterId) => `/clusters/${clusterId}`;

export const clusterBrokersPath = (clusterId: ClusterId) => `${clusterPath(clusterId)}/brokers`;

export const clusterTopicsPath = (clusterId: ClusterId) => `${clusterPath(clusterId)}/topics`;
export const clusterTopicNewPath = (clusterId: ClusterId) => `${clusterPath(clusterId)}/topics/new`;

export const clusterTopicPath = (clusterId: ClusterId, topicName: TopicName) => `${clusterTopicsPath(clusterId)}/${topicName}`;
export const clusterTopicSettingsPath = (clusterId: ClusterId, topicName: TopicName) => `${clusterTopicsPath(clusterId)}/${topicName}/settings`;
export const clusterTopicMessagesPath = (clusterId: ClusterId, topicName: TopicName) => `${clusterTopicsPath(clusterId)}/${topicName}/messages`;
