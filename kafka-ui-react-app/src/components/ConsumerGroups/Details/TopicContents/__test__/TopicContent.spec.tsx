import React from 'react';
import { clusterConsumerGroupDetailsPath } from 'lib/paths';
import { screen } from '@testing-library/react';
import TopicContent from 'components/ConsumerGroups/Details/TopicContents/TopicContents';
import { consumerGroupPayload } from 'redux/reducers/consumerGroups/__test__/fixtures';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router';
import fetchMock from 'fetch-mock';
import { ConsumerGroupTopicPartition } from 'generated-sources';

const clusterName = 'cluster1';

const renderComponent = (consumers: ConsumerGroupTopicPartition[] = []) =>
  render(
    <Route
      path={clusterConsumerGroupDetailsPath(':clusterName', ':consumerGroupID')}
    >
      <TopicContent consumers={consumers} />
    </Route>,
    {
      pathname: clusterConsumerGroupDetailsPath(
        clusterName,
        consumerGroupPayload.groupId
      ),
    }
  );

describe('TopicContent', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('renders empty table', () => {
    renderComponent();
    const table = screen.getByRole('table');
    expect(table.getElementsByTagName('td').length).toBe(0);
  });

  it('renders table with content', () => {
    renderComponent(consumerGroupPayload.partitions);
    const table = screen.getByRole('table');
    expect(table.getElementsByTagName('td').length).toBe(
      consumerGroupPayload.partitions.length * 6
    );
  });
});
