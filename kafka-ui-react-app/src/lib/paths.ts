import { Broker, Connect, Connector } from 'generated-sources';
import { ClusterName, SchemaName, TopicName } from 'redux/interfaces';

import { GIT_REPO_LINK } from './constants';
import { ConsumerGroupID } from './hooks/api/consumers';

export const gitCommitPath = (commit: string) =>
  `${GIT_REPO_LINK}/commit/${commit}`;

export enum RouteParams {
  clusterName = ':clusterName',
  consumerGroupID = ':consumerGroupID',
  subject = ':subject',
  topicName = ':topicName',
  connectName = ':connectName',
  connectorName = ':connectorName',
  brokerId = ':brokerId',
}

export const getNonExactPath = (path: string) => `${path}/*`;

export const errorPage = '/404';
export const accessErrorPage = '/403';

export const clusterPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `/ui/clusters/${clusterName}`;

export type ClusterNameRoute = { clusterName: ClusterName };

// Brokers
export const clusterBrokerRelativePath = 'brokers';
export const clusterBrokerMetricsRelativePath = 'metrics';
export const clusterBrokerConfigsRelativePath = 'configs';

export const clusterBrokersPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/${clusterBrokerRelativePath}`;

export const clusterBrokerPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  brokerId: Broker['id'] | string = RouteParams.brokerId
) => `${clusterBrokersPath(clusterName)}/${brokerId}`;
export const clusterBrokerMetricsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  brokerId: Broker['id'] | string = RouteParams.brokerId
) =>
  `${clusterBrokerPath(
    clusterName,
    brokerId
  )}/${clusterBrokerMetricsRelativePath}`;

export const clusterBrokerConfigsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  brokerId: Broker['id'] | string = RouteParams.brokerId
) =>
  `${clusterBrokerPath(
    clusterName,
    brokerId
  )}/${clusterBrokerConfigsRelativePath}`;

export type ClusterBrokerParam = {
  clusterName: ClusterName;
  brokerId: string;
};

// Consumer Groups
export const clusterConsumerGroupsRelativePath = 'consumer-groups';
export const clusterConsumerGroupResetRelativePath = 'reset-offsets';
export const clusterConsumerGroupResetOffsetsRelativePath = `${RouteParams.consumerGroupID}/${clusterConsumerGroupResetRelativePath}`;
export const clusterConsumerGroupsPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/${clusterConsumerGroupsRelativePath}`;
export const clusterConsumerGroupDetailsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  groupId: string = RouteParams.consumerGroupID
) => `${clusterConsumerGroupsPath(clusterName)}/${groupId}`;
export const clusterConsumerGroupResetOffsetsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  groupId: string = RouteParams.consumerGroupID
) =>
  `${clusterConsumerGroupDetailsPath(
    clusterName,
    groupId
  )}/${clusterConsumerGroupResetRelativePath}`;
export type ClusterGroupParam = {
  consumerGroupID: ConsumerGroupID;
  clusterName: ClusterName;
};

// Schemas
export const clusterSchemasRelativePath = 'schemas';
export const clusterSchemaNewRelativePath = 'create-new';
export const clusterSchemaEditPageRelativePath = `edit`;
export const clusterSchemaSchemaComparePageRelativePath = `compare`;
export const clusterSchemaEditRelativePath = `${RouteParams.subject}/${clusterSchemaEditPageRelativePath}`;
export const clusterSchemaSchemaDiffRelativePath = `${RouteParams.subject}/${clusterSchemaSchemaComparePageRelativePath}`;
export const clusterSchemasPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/schemas`;
export const clusterSchemaNewPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterSchemasPath(clusterName)}/${clusterSchemaNewRelativePath}`;
export const clusterSchemaPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  subject: SchemaName = RouteParams.subject
) => {
  let subjectName = subject;
  if (subject !== ':subject') subjectName = encodeURIComponent(subject);
  return `${clusterSchemasPath(clusterName)}/${subjectName}`;
};
export const clusterSchemaEditPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  subject: SchemaName = RouteParams.subject
) => {
  let subjectName = subject;
  if (subject !== ':subject') subjectName = encodeURIComponent(subject);
  return `${clusterSchemasPath(clusterName)}/${subjectName}/edit`;
};
export const clusterSchemaComparePath = (
  clusterName: ClusterName = RouteParams.clusterName,
  subject: SchemaName = RouteParams.subject
) => `${clusterSchemaPath(clusterName, subject)}/compare`;

export type ClusterSubjectParam = {
  subject: string;
  clusterName: ClusterName;
};

// Topics
export const clusterTopicsRelativePath = 'all-topics';
export const clusterTopicNewRelativePath = 'create-new-topic';
export const clusterTopicCopyRelativePath = 'copy';
export const clusterTopicsPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/${clusterTopicsRelativePath}`;
export const clusterTopicNewPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterTopicsPath(clusterName)}/${clusterTopicNewRelativePath}`;
export const clusterTopicCopyPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterTopicsPath(clusterName)}/${clusterTopicCopyRelativePath}`;

// Topics topic
export const clusterTopicSettingsRelativePath = 'settings';
export const clusterTopicMessagesRelativePath = 'messages';
export const clusterTopicConsumerGroupsRelativePath = 'consumer-groups';
export const clusterTopicStatisticsRelativePath = 'statistics';
export const clusterTopicEditRelativePath = 'edit';
export const clusterTopicPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) => `${clusterTopicsPath(clusterName)}/${topicName}`;
export const clusterTopicSettingsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) =>
  `${clusterTopicPath(
    clusterName,
    topicName
  )}/${clusterTopicSettingsRelativePath}`;
export const clusterTopicMessagesPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) =>
  `${clusterTopicPath(
    clusterName,
    topicName
  )}/${clusterTopicMessagesRelativePath}`;
export const clusterTopicEditPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) =>
  `${clusterTopicPath(clusterName, topicName)}/${clusterTopicEditRelativePath}`;
export const clusterTopicConsumerGroupsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) =>
  `${clusterTopicPath(
    clusterName,
    topicName
  )}/${clusterTopicConsumerGroupsRelativePath}`;
export const clusterTopicStatisticsPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  topicName: TopicName = RouteParams.topicName
) =>
  `${clusterTopicPath(
    clusterName,
    topicName
  )}/${clusterTopicStatisticsRelativePath}`;

export type RouteParamsClusterTopic = {
  clusterName: ClusterName;
  topicName: TopicName;
};

// Kafka Connect
export const clusterConnectsRelativePath = 'connects';
export const clusterConnectorsRelativePath = 'connectors';
export const clusterConnectorNewRelativePath = 'create-new';
export const clusterConnectConnectorsRelativePath = `${RouteParams.connectName}/connectors`;
export const clusterConnectConnectorRelativePath = `${clusterConnectConnectorsRelativePath}/${RouteParams.connectorName}`;
const clusterConnectConnectorTasksRelativePath = 'tasks';
export const clusterConnectConnectorConfigRelativePath = 'config';

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
  connectName: Connect['name'] = RouteParams.connectName
) => `${clusterConnectsPath(clusterName)}/${connectName}/connectors`;
export const clusterConnectConnectorPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: Connect['name'] = RouteParams.connectName,
  connectorName: Connector['name'] = RouteParams.connectorName
) =>
  `${clusterConnectConnectorsPath(clusterName, connectName)}/${connectorName}`;
export const clusterConnectConnectorEditPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: Connect['name'] = RouteParams.connectName,
  connectorName: Connector['name'] = RouteParams.connectorName
) =>
  `${clusterConnectConnectorsPath(
    clusterName,
    connectName
  )}/${connectorName}/edit`;
export const clusterConnectConnectorTasksPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: Connect['name'] = RouteParams.connectName,
  connectorName: Connector['name'] = RouteParams.connectorName
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/${clusterConnectConnectorTasksRelativePath}`;
export const clusterConnectConnectorConfigPath = (
  clusterName: ClusterName = RouteParams.clusterName,
  connectName: Connect['name'] = RouteParams.connectName,
  connectorName: Connector['name'] = RouteParams.connectorName
) =>
  `${clusterConnectConnectorPath(
    clusterName,
    connectName,
    connectorName
  )}/${clusterConnectConnectorConfigRelativePath}`;

export type RouterParamsClusterConnectConnector = {
  clusterName: ClusterName;
  connectName: Connect['name'];
  connectorName: Connector['name'];
};

// KsqlDb
export const clusterKsqlDbRelativePath = 'ksqldb';
export const clusterKsqlDbQueryRelativePath = 'query';
export const clusterKsqlDbTablesRelativePath = 'tables';
export const clusterKsqlDbStreamsRelativePath = 'streams';

export const clusterKsqlDbPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/${clusterKsqlDbRelativePath}`;
export const clusterKsqlDbQueryPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterKsqlDbPath(clusterName)}/${clusterKsqlDbQueryRelativePath}`;
export const clusterKsqlDbTablesPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterKsqlDbPath(clusterName)}/${clusterKsqlDbTablesRelativePath}`;
export const clusterKsqlDbStreamsPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterKsqlDbPath(clusterName)}/${clusterKsqlDbStreamsRelativePath}`;

// Cluster Config
export const clusterConfigRelativePath = 'config';
export const clusterConfigPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/${clusterConfigRelativePath}`;

const clusterNewConfigRelativePath = 'create-new-cluster';
export const clusterNewConfigPath = `/ui/clusters/${clusterNewConfigRelativePath}`;

// ACL
export const clusterAclRelativePath = 'acl';
export const clusterAclNewRelativePath = 'create-new-acl';
export const clusterACLPath = (
  clusterName: ClusterName = RouteParams.clusterName
) => `${clusterPath(clusterName)}/${clusterAclRelativePath}`;
