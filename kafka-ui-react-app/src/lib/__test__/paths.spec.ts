import { GIT_REPO_LINK } from 'lib/constants';
import * as paths from 'lib/paths';
import { RouteParams } from 'lib/paths';

const clusterName = 'test-cluster-name';
const groupId = 'test-group-id';
const schemaId = 'test-schema-id';
const schemaIdWithNonAsciiChars = 'test/test';
const schemaIdWithNonAsciiCharsEncoded = 'test%2Ftest';
const topicId = 'test-topic-id';
const brokerId = 'test-Broker-id';
const connectName = 'test-connect-name';
const connectorName = 'test-connector-name';

describe('Paths', () => {
  it('gitCommitPath', () => {
    expect(paths.gitCommitPath('1234567gh')).toEqual(
      `${GIT_REPO_LINK}/commit/1234567gh`
    );
  });
  it('getNonExactPath', () => {
    expect(paths.getNonExactPath('')).toEqual('/*');
    expect(paths.getNonExactPath('/clusters')).toEqual('/clusters/*');
  });
  it('clusterPath', () => {
    expect(paths.clusterPath(clusterName)).toEqual(
      `/ui/clusters/${clusterName}`
    );
    expect(paths.clusterPath()).toEqual(
      paths.clusterPath(RouteParams.clusterName)
    );
  });
  it('clusterBrokersPath', () => {
    expect(paths.clusterBrokersPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/brokers`
    );
    expect(paths.clusterBrokersPath()).toEqual(
      paths.clusterBrokersPath(RouteParams.clusterName)
    );

    expect(paths.clusterBrokerPath(clusterName, brokerId)).toEqual(
      `${paths.clusterPath(clusterName)}/brokers/${brokerId}`
    );
    expect(paths.clusterBrokerPath()).toEqual(
      paths.clusterBrokerPath(RouteParams.clusterName, RouteParams.brokerId)
    );

    expect(paths.clusterBrokerMetricsPath(clusterName, brokerId)).toEqual(
      `${paths.clusterPath(clusterName)}/brokers/${brokerId}/metrics`
    );
    expect(paths.clusterBrokerMetricsPath()).toEqual(
      paths.clusterBrokerMetricsPath(
        RouteParams.clusterName,
        RouteParams.brokerId
      )
    );
  });
  it('clusterConsumerGroupsPath', () => {
    expect(paths.clusterConsumerGroupsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/consumer-groups`
    );
    expect(paths.clusterConsumerGroupsPath()).toEqual(
      paths.clusterConsumerGroupsPath(RouteParams.clusterName)
    );
  });
  it('clusterConsumerGroupDetailsPath', () => {
    expect(paths.clusterConsumerGroupDetailsPath(clusterName, groupId)).toEqual(
      `${paths.clusterConsumerGroupsPath(clusterName)}/${groupId}`
    );
    expect(paths.clusterConsumerGroupDetailsPath()).toEqual(
      paths.clusterConsumerGroupDetailsPath(
        RouteParams.clusterName,
        RouteParams.consumerGroupID
      )
    );
  });
  it('clusterConsumerGroupResetOffsetsPath', () => {
    expect(
      paths.clusterConsumerGroupResetOffsetsPath(clusterName, groupId)
    ).toEqual(
      `${paths.clusterConsumerGroupDetailsPath(
        clusterName,
        groupId
      )}/reset-offsets`
    );
    expect(paths.clusterConsumerGroupResetOffsetsPath()).toEqual(
      paths.clusterConsumerGroupResetOffsetsPath(
        RouteParams.clusterName,
        RouteParams.consumerGroupID
      )
    );
  });

  it('clusterSchemasPath', () => {
    expect(paths.clusterSchemasPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/schemas`
    );
    expect(paths.clusterSchemasPath()).toEqual(
      paths.clusterSchemasPath(RouteParams.clusterName)
    );
  });
  it('clusterSchemaNewPath', () => {
    expect(paths.clusterSchemaNewPath(clusterName)).toEqual(
      `${paths.clusterSchemasPath(clusterName)}/create-new`
    );
    expect(paths.clusterSchemaNewPath()).toEqual(
      paths.clusterSchemaNewPath(RouteParams.clusterName)
    );
  });
  it('clusterSchemaPath', () => {
    expect(paths.clusterSchemaPath(clusterName, schemaId)).toEqual(
      `${paths.clusterSchemasPath(clusterName)}/${schemaId}`
    );
    expect(paths.clusterSchemaPath()).toEqual(
      paths.clusterSchemaPath(RouteParams.clusterName, RouteParams.subject)
    );
    expect(
      paths.clusterSchemaPath(clusterName, schemaIdWithNonAsciiChars)
    ).toEqual(
      `${paths.clusterSchemasPath(
        clusterName
      )}/${schemaIdWithNonAsciiCharsEncoded}`
    );
  });
  it('clusterSchemaEditPath', () => {
    expect(paths.clusterSchemaEditPath(clusterName, schemaId)).toEqual(
      `${paths.clusterSchemaPath(clusterName, schemaId)}/edit`
    );
    expect(paths.clusterSchemaEditPath()).toEqual(
      paths.clusterSchemaEditPath(RouteParams.clusterName, RouteParams.subject)
    );
    expect(
      paths.clusterSchemaEditPath(clusterName, schemaIdWithNonAsciiChars)
    ).toEqual(
      `${paths.clusterSchemaPath(clusterName, schemaIdWithNonAsciiChars)}/edit`
    );
  });
  it('clusterSchemaComparePath', () => {
    expect(paths.clusterSchemaComparePath(clusterName, schemaId)).toEqual(
      `${paths.clusterSchemaPath(clusterName, schemaId)}/compare`
    );
    expect(paths.clusterSchemaComparePath()).toEqual(
      paths.clusterSchemaComparePath(
        RouteParams.clusterName,
        RouteParams.subject
      )
    );
  });

  it('clusterTopicsPath', () => {
    expect(paths.clusterTopicsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/all-topics`
    );
    expect(paths.clusterTopicsPath()).toEqual(
      paths.clusterTopicsPath(RouteParams.clusterName)
    );
  });
  it('clusterTopicNewPath', () => {
    expect(paths.clusterTopicNewPath(clusterName)).toEqual(
      `${paths.clusterTopicsPath(clusterName)}/create-new-topic`
    );
    expect(paths.clusterTopicNewPath()).toEqual(
      paths.clusterTopicNewPath(RouteParams.clusterName)
    );
  });
  it('clusterTopicPath', () => {
    expect(paths.clusterTopicPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicsPath(clusterName)}/${topicId}`
    );
    expect(paths.clusterTopicPath()).toEqual(
      paths.clusterTopicPath(RouteParams.clusterName, RouteParams.topicName)
    );
  });
  it('clusterTopicSettingsPath', () => {
    expect(paths.clusterTopicSettingsPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/settings`
    );
    expect(paths.clusterTopicSettingsPath()).toEqual(
      paths.clusterTopicSettingsPath(
        RouteParams.clusterName,
        RouteParams.topicName
      )
    );
  });
  it('clusterTopicConsumerGroupsPath', () => {
    expect(paths.clusterTopicConsumerGroupsPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/consumer-groups`
    );
    expect(paths.clusterTopicConsumerGroupsPath()).toEqual(
      paths.clusterTopicConsumerGroupsPath(
        RouteParams.clusterName,
        RouteParams.topicName
      )
    );
  });
  it('clusterTopicMessagesPath', () => {
    expect(paths.clusterTopicMessagesPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/messages`
    );
    expect(paths.clusterTopicMessagesPath()).toEqual(
      paths.clusterTopicMessagesPath(
        RouteParams.clusterName,
        RouteParams.topicName
      )
    );
  });
  it('clusterTopicEditPath', () => {
    expect(paths.clusterTopicEditPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/edit`
    );
    expect(paths.clusterTopicEditPath()).toEqual(
      paths.clusterTopicEditPath(RouteParams.clusterName, RouteParams.topicName)
    );
  });
  it('clusterTopicCopyPath', () => {
    expect(paths.clusterTopicCopyPath(clusterName)).toEqual(
      `${paths.clusterTopicsPath(clusterName)}/copy`
    );
    expect(paths.clusterTopicCopyPath()).toEqual(
      paths.clusterTopicCopyPath(RouteParams.clusterName)
    );
  });
  it('clusterTopicStatisticsPath', () => {
    expect(paths.clusterTopicStatisticsPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/statistics`
    );
    expect(paths.clusterTopicStatisticsPath()).toEqual(
      paths.clusterTopicStatisticsPath(
        RouteParams.clusterName,
        RouteParams.topicName
      )
    );
  });

  it('clusterConnectsPath', () => {
    expect(paths.clusterConnectsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/connects`
    );
    expect(paths.clusterConnectsPath()).toEqual(
      paths.clusterConnectsPath(RouteParams.clusterName)
    );
  });
  it('clusterConnectorsPath', () => {
    expect(paths.clusterConnectorsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/connectors`
    );
    expect(paths.clusterConnectorsPath()).toEqual(
      paths.clusterConnectorsPath(RouteParams.clusterName)
    );
  });
  it('clusterConnectorNewPath', () => {
    expect(paths.clusterConnectorNewPath(clusterName)).toEqual(
      `${paths.clusterConnectorsPath(clusterName)}/create-new`
    );
    expect(paths.clusterConnectorNewPath()).toEqual(
      paths.clusterConnectorNewPath(RouteParams.clusterName)
    );
  });
  it('clusterConnectConnectorPath', () => {
    expect(
      paths.clusterConnectConnectorPath(clusterName, connectName, connectorName)
    ).toEqual(
      `${paths.clusterConnectsPath(
        clusterName
      )}/${connectName}/connectors/${connectorName}`
    );
    expect(paths.clusterConnectConnectorPath()).toEqual(
      paths.clusterConnectConnectorPath(
        RouteParams.clusterName,
        RouteParams.connectName,
        RouteParams.connectorName
      )
    );
  });
  it('clusterConnectConnectorsPath', () => {
    expect(
      paths.clusterConnectConnectorsPath(clusterName, connectName)
    ).toEqual(
      `${paths.clusterConnectsPath(clusterName)}/${connectName}/connectors`
    );
    expect(paths.clusterConnectConnectorsPath()).toEqual(
      paths.clusterConnectConnectorsPath(
        RouteParams.clusterName,
        RouteParams.connectName
      )
    );
  });
  it('clusterConnectConnectorEditPath', () => {
    expect(
      paths.clusterConnectConnectorEditPath(
        clusterName,
        connectName,
        connectorName
      )
    ).toEqual(
      `${paths.clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      )}/edit`
    );
    expect(paths.clusterConnectConnectorEditPath()).toEqual(
      paths.clusterConnectConnectorEditPath(
        RouteParams.clusterName,
        RouteParams.connectName,
        RouteParams.connectorName
      )
    );
  });
  it('clusterConnectConnectorTasksPath', () => {
    expect(
      paths.clusterConnectConnectorTasksPath(
        clusterName,
        connectName,
        connectorName
      )
    ).toEqual(
      `${paths.clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      )}/tasks`
    );
    expect(paths.clusterConnectConnectorTasksPath()).toEqual(
      paths.clusterConnectConnectorTasksPath(
        RouteParams.clusterName,
        RouteParams.connectName,
        RouteParams.connectorName
      )
    );
  });
  it('clusterConnectConnectorConfigPath', () => {
    expect(
      paths.clusterConnectConnectorConfigPath(
        clusterName,
        connectName,
        connectorName
      )
    ).toEqual(
      `${paths.clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      )}/config`
    );
    expect(paths.clusterConnectConnectorConfigPath()).toEqual(
      paths.clusterConnectConnectorConfigPath(
        RouteParams.clusterName,
        RouteParams.connectName,
        RouteParams.connectorName
      )
    );
  });

  it('clusterKsqlDbPath', () => {
    expect(paths.clusterKsqlDbPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/ksqldb`
    );
    expect(paths.clusterKsqlDbPath()).toEqual(
      paths.clusterKsqlDbPath(RouteParams.clusterName)
    );
  });
  it('clusterKsqlDbQueryPath', () => {
    expect(paths.clusterKsqlDbQueryPath(clusterName)).toEqual(
      `${paths.clusterKsqlDbPath(clusterName)}/query`
    );
    expect(paths.clusterKsqlDbQueryPath()).toEqual(
      paths.clusterKsqlDbQueryPath(RouteParams.clusterName)
    );
  });
  it('clusterKsqlDbTablesPath', () => {
    expect(paths.clusterKsqlDbTablesPath(clusterName)).toEqual(
      `${paths.clusterKsqlDbPath(clusterName)}/tables`
    );
    expect(paths.clusterKsqlDbTablesPath()).toEqual(
      paths.clusterKsqlDbTablesPath(RouteParams.clusterName)
    );
  });
  it('clusterKsqlDbStreamsPath', () => {
    expect(paths.clusterKsqlDbStreamsPath(clusterName)).toEqual(
      `${paths.clusterKsqlDbPath(clusterName)}/streams`
    );
    expect(paths.clusterKsqlDbStreamsPath()).toEqual(
      paths.clusterKsqlDbStreamsPath(RouteParams.clusterName)
    );
  });
});
