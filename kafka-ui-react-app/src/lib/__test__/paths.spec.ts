import { GIT_REPO_LINK } from 'lib/constants';
import * as paths from 'lib/paths';

const clusterName = 'test-cluster-name';
const groupId = 'test-group-id';
const schemaId = 'test-schema-id';
const topicId = 'test-topic-id';
const connectName = 'test-connect-name';
const connectorName = 'test-connector-name';

describe('Paths', () => {
  it('gitCommitPath', () => {
    expect(paths.gitCommitPath('1234567gh')).toEqual(
      `${GIT_REPO_LINK}/commit/1234567gh`
    );
  });
  it('clusterPath', () => {
    expect(paths.clusterPath(clusterName)).toEqual(
      `/ui/clusters/${clusterName}`
    );
  });
  it('clusterBrokersPath', () => {
    expect(paths.clusterBrokersPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/brokers`
    );
  });
  it('clusterConsumerGroupsPath', () => {
    expect(paths.clusterConsumerGroupsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/consumer-groups`
    );
  });
  it('clusterConsumerGroupDetailsPath', () => {
    expect(paths.clusterConsumerGroupDetailsPath(clusterName, groupId)).toEqual(
      `${paths.clusterConsumerGroupsPath(clusterName)}/${groupId}`
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
  });

  it('clusterSchemasPath', () => {
    expect(paths.clusterSchemasPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/schemas`
    );
  });
  it('clusterSchemaNewPath', () => {
    expect(paths.clusterSchemaNewPath(clusterName)).toEqual(
      `${paths.clusterSchemasPath(clusterName)}/create-new`
    );
  });
  it('clusterSchemaPath', () => {
    expect(paths.clusterSchemaPath(clusterName, schemaId)).toEqual(
      `${paths.clusterSchemasPath(clusterName)}/${schemaId}`
    );
  });
  it('clusterSchemaEditPath', () => {
    expect(paths.clusterSchemaEditPath(clusterName, schemaId)).toEqual(
      `${paths.clusterSchemaPath(clusterName, schemaId)}/edit`
    );
  });

  it('clusterTopicsPath', () => {
    expect(paths.clusterTopicsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/topics`
    );
  });
  it('clusterTopicNewPath', () => {
    expect(paths.clusterTopicNewPath(clusterName)).toEqual(
      `${paths.clusterTopicsPath(clusterName)}/create-new`
    );
  });
  it('clusterTopicPath', () => {
    expect(paths.clusterTopicPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicsPath(clusterName)}/${topicId}`
    );
  });
  it('clusterTopicSettingsPath', () => {
    expect(paths.clusterTopicSettingsPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/settings`
    );
  });
  it('clusterTopicConsumerGroupsPath', () => {
    expect(paths.clusterTopicConsumerGroupsPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/consumer-groups`
    );
  });
  it('clusterTopicMessagesPath', () => {
    expect(paths.clusterTopicMessagesPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/messages`
    );
  });
  it('clusterTopicSendMessagePath', () => {
    expect(paths.clusterTopicSendMessagePath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/message`
    );
  });
  it('clusterTopicEditPath', () => {
    expect(paths.clusterTopicEditPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/edit`
    );
  });

  it('clusterConnectsPath', () => {
    expect(paths.clusterConnectsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/connects`
    );
  });
  it('clusterConnectorsPath', () => {
    expect(paths.clusterConnectorsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/connectors`
    );
  });
  it('clusterConnectorNewPath', () => {
    expect(paths.clusterConnectorNewPath(clusterName)).toEqual(
      `${paths.clusterConnectorsPath(clusterName)}/create-new`
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
  });

  it('clusterKsqlDbPath', () => {
    expect(paths.clusterKsqlDbPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/ksqldb`
    );
  });
  it('clusterKsqlDbPath with default value', () => {
    expect(paths.clusterKsqlDbPath()).toEqual(
      `${paths.clusterPath(':clusterName')}/ksqldb`
    );
  });
  it('clusterKsqlDbQueryPath', () => {
    expect(paths.clusterKsqlDbQueryPath(clusterName)).toEqual(
      `${paths.clusterKsqlDbPath(clusterName)}/query`
    );
  });
  it('clusterKsqlDbQueryPath with default value', () => {
    expect(paths.clusterKsqlDbQueryPath()).toEqual(
      `${paths.clusterKsqlDbPath(':clusterName')}/query`
    );
  });
});
