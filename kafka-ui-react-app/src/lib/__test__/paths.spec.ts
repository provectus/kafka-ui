import { GIT_REPO_LINK } from 'lib/constants';
import * as paths from '../paths';

describe('Paths', () => {
  it('gitCommitPath', () => {
    expect(paths.gitCommitPath('1234567gh')).toEqual(
      `${GIT_REPO_LINK}/commit/1234567gh`
    );
  });

  it('clusterBrokersPath', () => {
    expect(paths.clusterBrokersPath('local')).toEqual(
      '/ui/clusters/local/brokers'
    );
  });

  it('clusterConsumerGroupsPath', () => {
    expect(paths.clusterConsumerGroupsPath('local')).toEqual(
      '/ui/clusters/local/consumer-groups'
    );
  });

  it('clusterSchemasPath', () => {
    expect(paths.clusterSchemasPath('local')).toEqual(
      '/ui/clusters/local/schemas'
    );
  });
  it('clusterSchemaNewPath', () => {
    expect(paths.clusterSchemaNewPath('local')).toEqual(
      '/ui/clusters/local/schemas/create_new'
    );
  });
  it('clusterSchemaPath', () => {
    expect(paths.clusterSchemaPath('local', 'schema123')).toEqual(
      '/ui/clusters/local/schemas/schema123/latest'
    );
  });

  it('clusterTopicsPath', () => {
    expect(paths.clusterTopicsPath('local')).toEqual(
      '/ui/clusters/local/topics'
    );
  });
  it('clusterTopicNewPath', () => {
    expect(paths.clusterTopicNewPath('local')).toEqual(
      '/ui/clusters/local/topics/create_new'
    );
  });
  it('clusterTopicPath', () => {
    expect(paths.clusterTopicPath('local', 'topic123')).toEqual(
      '/ui/clusters/local/topics/topic123'
    );
  });
  it('clusterTopicSettingsPath', () => {
    expect(paths.clusterTopicSettingsPath('local', 'topic123')).toEqual(
      '/ui/clusters/local/topics/topic123/settings'
    );
  });
  it('clusterTopicMessagesPath', () => {
    expect(paths.clusterTopicMessagesPath('local', 'topic123')).toEqual(
      '/ui/clusters/local/topics/topic123/messages'
    );
  });
  it('clusterTopicEditPath', () => {
    expect(paths.clusterTopicEditPath('local', 'topic123')).toEqual(
      '/ui/clusters/local/topics/topic123/edit'
    );
  });
  it('clusterConnectorsPath', () => {
    expect(paths.clusterConnectorsPath('local')).toEqual(
      '/ui/clusters/local/connectors'
    );
  });
});
