import {
  ClusterName,
  ConnectName,
  ConnectorName,
  SchemaName,
  TopicName,
} from 'redux/interfaces';

import { GIT_REPO_LINK } from './constants';

export const gitCommitPath = (commit: string) =>
  `${GIT_REPO_LINK}/commit/${commit}`;

export const clusterPath = (clusterName: ClusterName) =>
  `/ui/clusters/${clusterName}`;

// Brokers
export const clusterBrokersPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/brokers`;

// Consumer Groups
export const clusterConsumerGroupsPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/consumer-groups`;
export const clusterConsumerGroupDetailsPath = (
  clusterName: ClusterName,
  groupId: string
) => `${clusterPath(clusterName)}/consumer-groups/${groupId}`;
export const clusterConsumerGroupResetOffsetsPath = (
  clusterName: ClusterName,
  groupId: string
) => `${clusterPath(clusterName)}/consumer-groups/${groupId}/reset-offsets`;

// Schemas
export const clusterSchemasPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/schemas`;
export const clusterSchemaNewPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/schemas/create-new`;
export const clusterSchemaPath = (
  clusterName: ClusterName,
  subject: SchemaName
) => `${clusterSchemasPath(clusterName)}/${subject}`;
export const clusterSchemaEditPath = (
  clusterName: ClusterName,
  subject: SchemaName
) => `${clusterSchemasPath(clusterName)}/${subject}/edit`;
export const clusterSchemaSchemaDiffPath = (
  clusterName: ClusterName,
  subject: SchemaName
) => `${clusterSchemaPath(clusterName, subject)}/diff`;

// Topics
export const clusterTopicsPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/topics`;
export const clusterTopicNewPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/topics/create-new`;
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
export const clusterTopicEditPath = (
  clusterName: ClusterName,
  topicName: TopicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/edit`;
export const clusterTopicConsumerGroupsPath = (
  clusterName: ClusterName,
  topicName: TopicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/consumer-groups`;
export const clusterTopicSendMessagePath = (
  clusterName: ClusterName,
  topicName: TopicName
) => `${clusterTopicsPath(clusterName)}/${topicName}/message`;

// Kafka Connect
export const clusterConnectsPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/connects`;
export const clusterConnectorsPath = (clusterName: ClusterName) =>
  `${clusterPath(clusterName)}/connectors`;
export const clusterConnectorNewPath = (clusterName: ClusterName) =>
  `${clusterConnectorsPath(clusterName)}/create-new`;
const clusterConnectConnectorsPath = (
  clusterName: ClusterName,
  connectName: ConnectName
) => `${clusterConnectsPath(clusterName)}/${connectName}/connectors`;
export const clusterConnectConnectorPath = (
  clusterName: ClusterName,
  connectName: ConnectName,
  connectorName: ConnectorName
) =>
  `${clusterConnectConnectorsPath(clusterName, connectName)}/${connectorName}`;
export const clusterConnectConnectorEditPath = (
  clusterName: ClusterName,
  connectName: ConnectName,
  connectorName: ConnectorName
) =>
  `${clusterConnectConnectorsPath(
    clusterName,
    connectName
  )}/${connectorName}/edit`;
export const clusterConnectConnectorTasksPath = (
  clusterName: ClusterName,
  connectName: ConnectName,
  connectorName: ConnectorName
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/tasks`;
export const clusterConnectConnectorConfigPath = (
  clusterName: ClusterName,
  connectName: ConnectName,
  connectorName: ConnectorName
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/config`;

// KsqlDb
export const clusterKsqlDbPath = (clusterName: ClusterName = ':clusterName') =>
  `${clusterPath(clusterName)}/ksql-db`;

export const clusterKsqlDbQueryPath = (
  clusterName: ClusterName = ':clusterName'
) => `${clusterPath(clusterName)}/ksql-db/query`;
