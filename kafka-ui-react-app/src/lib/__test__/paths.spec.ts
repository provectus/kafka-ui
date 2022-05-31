import { GIT_REPO_LINK } from 'lib/constants';
import * as paths from 'lib/paths';
import {
  clusterNameParam,
  connectNameParam,
  connectorNameParam,
  consumerGroupIDParam,
  schemaSubjectParams,
  topicNameParam,
} from 'lib/paths';

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
    expect(paths.clusterPath()).toEqual(paths.clusterPath(clusterNameParam));
  });
  it('clusterBrokersPath', () => {
    expect(paths.clusterBrokersPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/brokers`
    );
    expect(paths.clusterBrokersPath()).toEqual(
      paths.clusterBrokersPath(clusterNameParam)
    );
  });
  it('clusterConsumerGroupsPath', () => {
    expect(paths.clusterConsumerGroupsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/consumer-groups`
    );
    expect(paths.clusterConsumerGroupsPath()).toEqual(
      paths.clusterConsumerGroupsPath(clusterNameParam)
    );
  });
  it('clusterConsumerGroupDetailsPath', () => {
    expect(paths.clusterConsumerGroupDetailsPath(clusterName, groupId)).toEqual(
      `${paths.clusterConsumerGroupsPath(clusterName)}/${groupId}`
    );
    expect(paths.clusterConsumerGroupDetailsPath()).toEqual(
      paths.clusterConsumerGroupDetailsPath(
        clusterNameParam,
        consumerGroupIDParam
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
        clusterNameParam,
        consumerGroupIDParam
      )
    );
  });

  it('clusterSchemasPath', () => {
    expect(paths.clusterSchemasPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/schemas`
    );
    expect(paths.clusterSchemasPath()).toEqual(
      paths.clusterSchemasPath(clusterNameParam)
    );
  });
  it('clusterSchemaNewPath', () => {
    expect(paths.clusterSchemaNewPath(clusterName)).toEqual(
      `${paths.clusterSchemasPath(clusterName)}/create-new`
    );
    expect(paths.clusterSchemaNewPath()).toEqual(
      paths.clusterSchemaNewPath(clusterNameParam)
    );
  });
  it('clusterSchemaPath', () => {
    expect(paths.clusterSchemaPath(clusterName, schemaId)).toEqual(
      `${paths.clusterSchemasPath(clusterName)}/${schemaId}`
    );
    expect(paths.clusterSchemaPath()).toEqual(
      paths.clusterSchemaPath(clusterNameParam, schemaSubjectParams)
    );
  });
  it('clusterSchemaEditPath', () => {
    expect(paths.clusterSchemaEditPath(clusterName, schemaId)).toEqual(
      `${paths.clusterSchemaPath(clusterName, schemaId)}/edit`
    );
    expect(paths.clusterSchemaEditPath()).toEqual(
      paths.clusterSchemaEditPath(clusterNameParam, schemaSubjectParams)
    );
  });

  it('clusterTopicsPath', () => {
    expect(paths.clusterTopicsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/topics`
    );
    expect(paths.clusterTopicsPath()).toEqual(
      paths.clusterTopicsPath(clusterNameParam)
    );
  });
  it('clusterTopicNewPath', () => {
    expect(paths.clusterTopicNewPath(clusterName)).toEqual(
      `${paths.clusterTopicsPath(clusterName)}/create-new`
    );
    expect(paths.clusterTopicNewPath()).toEqual(
      paths.clusterTopicNewPath(clusterNameParam)
    );
  });
  it('clusterTopicPath', () => {
    expect(paths.clusterTopicPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicsPath(clusterName)}/${topicId}`
    );
    expect(paths.clusterTopicPath()).toEqual(
      paths.clusterTopicPath(clusterNameParam, topicNameParam)
    );
  });
  it('clusterTopicSettingsPath', () => {
    expect(paths.clusterTopicSettingsPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/settings`
    );
    expect(paths.clusterTopicSettingsPath()).toEqual(
      paths.clusterTopicSettingsPath(clusterNameParam, topicNameParam)
    );
  });
  it('clusterTopicConsumerGroupsPath', () => {
    expect(paths.clusterTopicConsumerGroupsPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/consumer-groups`
    );
    expect(paths.clusterTopicConsumerGroupsPath()).toEqual(
      paths.clusterTopicConsumerGroupsPath(clusterNameParam, topicNameParam)
    );
  });
  it('clusterTopicMessagesPath', () => {
    expect(paths.clusterTopicMessagesPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/messages`
    );
    expect(paths.clusterTopicMessagesPath()).toEqual(
      paths.clusterTopicMessagesPath(clusterNameParam, topicNameParam)
    );
  });
  it('clusterTopicSendMessagePath', () => {
    expect(paths.clusterTopicSendMessagePath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/message`
    );
    expect(paths.clusterTopicSendMessagePath()).toEqual(
      paths.clusterTopicSendMessagePath(clusterNameParam, topicNameParam)
    );
  });
  it('clusterTopicEditPath', () => {
    expect(paths.clusterTopicEditPath(clusterName, topicId)).toEqual(
      `${paths.clusterTopicPath(clusterName, topicId)}/edit`
    );
    expect(paths.clusterTopicEditPath()).toEqual(
      paths.clusterTopicEditPath(clusterNameParam, topicNameParam)
    );
  });

  it('clusterConnectsPath', () => {
    expect(paths.clusterConnectsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/connects`
    );
    expect(paths.clusterConnectsPath()).toEqual(
      paths.clusterConnectsPath(clusterNameParam)
    );
  });
  it('clusterConnectorsPath', () => {
    expect(paths.clusterConnectorsPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/connectors`
    );
    expect(paths.clusterConnectorsPath()).toEqual(
      paths.clusterConnectorsPath(clusterNameParam)
    );
  });
  it('clusterConnectorNewPath', () => {
    expect(paths.clusterConnectorNewPath(clusterName)).toEqual(
      `${paths.clusterConnectorsPath(clusterName)}/create-new`
    );
    expect(paths.clusterConnectorNewPath()).toEqual(
      paths.clusterConnectorNewPath(clusterNameParam)
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
        clusterNameParam,
        connectNameParam,
        connectorNameParam
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
        clusterNameParam,
        connectNameParam,
        connectorNameParam
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
        clusterNameParam,
        connectNameParam,
        connectorNameParam
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
        clusterNameParam,
        connectNameParam,
        connectorNameParam
      )
    );
  });

  it('clusterKsqlDbPath', () => {
    expect(paths.clusterKsqlDbPath(clusterName)).toEqual(
      `${paths.clusterPath(clusterName)}/ksqldb`
    );
    expect(paths.clusterKsqlDbPath()).toEqual(
      paths.clusterKsqlDbPath(clusterNameParam)
    );
  });
  it('clusterKsqlDbQueryPath', () => {
    expect(paths.clusterKsqlDbQueryPath(clusterName)).toEqual(
      `${paths.clusterKsqlDbPath(clusterName)}/query`
    );
    expect(paths.clusterKsqlDbQueryPath()).toEqual(
      paths.clusterKsqlDbQueryPath(clusterNameParam)
    );
  });
});
