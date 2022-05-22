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

export const clusterNameParam: ClusterName = ':clusterName';
export const clusterPath = (clusterName: ClusterName = clusterNameParam) =>
  `/ui/clusters/${clusterName}`;

// Brokers
export const clusterBrokersPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/brokers`;

// Consumer Groups
export const consumerGroupIDParam = ':consumerGroupID';
export const clusterConsumerGroupsPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/consumer-groups`;
export const clusterConsumerGroupDetailsPath = (
  clusterName: ClusterName = clusterNameParam,
  groupId: string = consumerGroupIDParam
) => `${clusterPath(clusterName)}/consumer-groups/${groupId}`;
export const clusterConsumerGroupResetOffsetsPath = (
  clusterName: ClusterName = clusterNameParam,
  groupId: string = consumerGroupIDParam
) => `${clusterPath(clusterName)}/consumer-groups/${groupId}/reset-offsets`;

// Schemas
export const schemaSubjectParams = ':subject';
export const clusterSchemasPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/schemas`;
export const clusterSchemaNewPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/schemas/create-new`;
export const clusterSchemaPath = (
  clusterName: ClusterName = clusterNameParam,
  subject: SchemaName = schemaSubjectParams
) => `${clusterSchemasPath(clusterName)}/${subject}`;
export const clusterSchemaEditPath = (
  clusterName: ClusterName = clusterNameParam,
  subject: SchemaName = schemaSubjectParams
) => `${clusterSchemasPath(clusterName)}/${subject}/edit`;
export const clusterSchemaSchemaDiffPath = (
  clusterName: ClusterName = clusterNameParam,
  subject: SchemaName = schemaSubjectParams
) => `${clusterSchemaPath(clusterName, subject)}/diff`;

// Topics
export const topicNameParam = ':topicName';
export const clusterTopicsPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/topics`;
export const clusterTopicNewPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/topics/create-new`;
export const clusterTopicCopyPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/topics/copy`;
export const clusterTopicPath = (
  clusterName: ClusterName = clusterNameParam,
  topicName: TopicName = topicNameParam
) => `${clusterTopicsPath(clusterName)}/${topicName}`;
export const clusterTopicSettingsPath = (
  clusterName: ClusterName = clusterNameParam,
  topicName: TopicName = topicNameParam
) => `${clusterTopicsPath(clusterName)}/${topicName}/settings`;
export const clusterTopicMessagesPath = (
  clusterName: ClusterName = clusterNameParam,
  topicName: TopicName = topicNameParam
) => `${clusterTopicsPath(clusterName)}/${topicName}/messages`;
export const clusterTopicEditPath = (
  clusterName: ClusterName = clusterNameParam,
  topicName: TopicName = topicNameParam
) => `${clusterTopicsPath(clusterName)}/${topicName}/edit`;
export const clusterTopicConsumerGroupsPath = (
  clusterName: ClusterName = clusterNameParam,
  topicName: TopicName = topicNameParam
) => `${clusterTopicsPath(clusterName)}/${topicName}/consumer-groups`;
export const clusterTopicSendMessagePath = (
  clusterName: ClusterName = clusterNameParam,
  topicName: TopicName = topicNameParam
) => `${clusterTopicsPath(clusterName)}/${topicName}/message`;
export interface RouteParamsClusterTopic {
  clusterName: ClusterName;
  topicName: TopicName;
}

// Kafka Connect
export const connectNameParam = ':connectName';
export const connectorNameParam = ':connectorName';
export const clusterConnectsPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/connects`;
export const clusterConnectorsPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/connectors`;
export const clusterConnectorNewPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterConnectorsPath(clusterName)}/create-new`;
export const clusterConnectConnectorsPath = (
  clusterName: ClusterName = clusterNameParam,
  connectName: ConnectName = connectNameParam
) => `${clusterConnectsPath(clusterName)}/${connectName}/connectors`;
export const clusterConnectConnectorPath = (
  clusterName: ClusterName = clusterNameParam,
  connectName: ConnectName = connectNameParam,
  connectorName: ConnectorName = connectorNameParam
) =>
  `${clusterConnectConnectorsPath(clusterName, connectName)}/${connectorName}`;
export const clusterConnectConnectorEditPath = (
  clusterName: ClusterName = clusterNameParam,
  connectName: ConnectName = connectNameParam,
  connectorName: ConnectorName = connectorNameParam
) =>
  `${clusterConnectConnectorsPath(
    clusterName,
    connectName
  )}/${connectorName}/edit`;
export const clusterConnectConnectorTasksPath = (
  clusterName: ClusterName = clusterNameParam,
  connectName: ConnectName = connectNameParam,
  connectorName: ConnectorName = connectorNameParam
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/tasks`;
export const clusterConnectConnectorConfigPath = (
  clusterName: ClusterName = clusterNameParam,
  connectName: ConnectName = connectNameParam,
  connectorName: ConnectorName = connectorNameParam
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/config`;
export interface RouterParamsClusterConnectConnector {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

// KsqlDb
export const clusterKsqlDbPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/ksqldb`;

export const clusterKsqlDbQueryPath = (
  clusterName: ClusterName = clusterNameParam
) => `${clusterPath(clusterName)}/ksqldb/query`;
