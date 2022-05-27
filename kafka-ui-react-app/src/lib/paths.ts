import {
  ClusterName,
  ConnectName,
  ConnectorName,
  ConsumerGroupID,
  SchemaName,
  TopicName,
} from 'redux/interfaces';

import { GIT_REPO_LINK } from './constants';

export const gitCommitPath = (commit: string) =>
  `${GIT_REPO_LINK}/commit/${commit}`;

export enum RouteParams {
  clusterName = ':clusterName',
  consumerGroupID = ':consumerGroupID',
  subject = ':subject',
  topicName = ':topicName',
  connectName = ':connectName',
  connectorName = ':connectorName',
}

export const getNonExactPath = (path: string) => `${path}/*`;

export const clusterPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `/ui/clusters/${clusterName}`;

export type ClusterNameRoute = { clusterName: ClusterName };

// Brokers
export const clusterBrokerRelativePath = 'brokers';
export const clusterBrokersPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/brokers`;

// Consumer Groups
export const clusterConsumerGroupsRelativePath = 'consumer-groups';
export const clusterConsumerGroupsPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/consumer-groups`;
export const clusterConsumerGroupDetailsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  groupId: string = RouteParams.consumerGroupID
) => `${clusterConsumerGroupsPath(clusterName)}/${groupId}`;
export const clusterConsumerGroupResetOffsetsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  groupId: string = RouteParams.consumerGroupID
) => `${clusterConsumerGroupDetailsPath(clusterName, groupId)}/reset-offsets`;
export type ClusterGroupParam = {
  consumerGroupID: ConsumerGroupID;
  clusterName: ClusterName;
};

// Schemas
export const clusterSchemasRelativePath = 'schemas';
export const clusterSchemasPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/schemas`;
export const clusterSchemaNewPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterSchemasPath(clusterName)}/create-new`;
export const clusterSchemaPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  subject: SchemaName = RouteParams.subject
) => `${clusterSchemasPath(clusterName)}/${subject}`;
export const clusterSchemaEditPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  subject: SchemaName = RouteParams.subject
) => `${clusterSchemasPath(clusterName)}/${subject}/edit`;
export const clusterSchemaSchemaDiffPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  subject: SchemaName = RouteParams.subject
) => `${clusterSchemaPath(clusterName, subject)}/diff`;

export type ClusterSubjectParam = {
  subject: string;
  clusterName: ClusterName;
};

// Topics
export const clusterTopicsRelativePath = 'topics';
export const clusterTopicsPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/${clusterTopicsRelativePath}`;

export const clusterTopicNewPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/topics/create-new`;

export const clusterTopicCopyPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/topics/copy`;

export const clusterTopicPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) => `${clusterTopicsPath(clusterName)}/${topicName}`;

export const clusterTopicSettingsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/settings`;

export const clusterTopicMessagesPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/messages`;

export const clusterTopicEditPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/edit`;

export const clusterTopicConsumerGroupsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/consumer-groups`;

export const clusterTopicSendMessagePath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/message`;

export type RouteParamsClusterTopic = {
  clusterName: ClusterName;
  topicName: TopicName;
};

// Kafka Connect
export const clusterConnectsRelativePath = 'connects';
export const clusterConnectorsRelativePath = 'connectors';
export const clusterConnectsPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/connects`;
export const clusterConnectorsPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/connectors`;
export const clusterConnectorNewPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterConnectorsPath(clusterName)}/create-new`;
export const clusterConnectConnectorsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: ConnectName = RouteParams.connectName
) => `${clusterConnectsPath(clusterName)}/${connectName}/connectors`;
export const clusterConnectConnectorPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: ConnectName = RouteParams.connectName,
  connectorName: ConnectorName = RouteParams.connectorName
) =>
  `${clusterConnectConnectorsPath(clusterName, connectName)}/${connectorName}`;
export const clusterConnectConnectorEditPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: ConnectName = RouteParams.connectName,
  connectorName: ConnectorName = RouteParams.connectorName
) =>
  `${clusterConnectConnectorsPath(
    clusterName,
    connectName
  )}/${connectorName}/edit`;
export const clusterConnectConnectorTasksPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: ConnectName = RouteParams.connectName,
  connectorName: ConnectorName = RouteParams.connectorName
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/tasks`;
export const clusterConnectConnectorConfigPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: ConnectName = RouteParams.connectName,
  connectorName: ConnectorName = RouteParams.connectorName
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/config`;
export type RouterParamsClusterConnectConnector = {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
};

// KsqlDb
export const clusterKsqlDbRelativePath = 'ksqldb';
export const clusterKsqlDbPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/ksqldb`;

export const clusterKsqlDbQueryPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/ksqldb/query`;
