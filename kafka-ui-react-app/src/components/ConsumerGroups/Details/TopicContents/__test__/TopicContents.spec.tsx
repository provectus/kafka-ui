import React from 'react';
import { clusterConsumerGroupDetailsPath } from 'lib/paths';
import { screen } from '@testing-library/react';
import TopicContents from 'components/ConsumerGroups/Details/TopicContents/TopicContents';
import { consumerGroupPayload } from 'redux/reducers/consumerGroups/__test__/fixtures';
import { render, WithRoute } from 'lib/testHelpers';
import { ConsumerGroupTopicPartition } from 'generated-sources';

const clusterName = 'cluster1';

const renderComponent = (consumers: ConsumerGroupTopicPartition[] = []) =>
  render(
    <WithRoute path={clusterConsumerGroupDetailsPath()}>
      <table>
        <tbody>
          <TopicContents consumers={consumers} />
        </tbody>
      </table>
    </WithRoute>,
    {
      initialEntries: [
        clusterConsumerGroupDetailsPath(
          clusterName,
          consumerGroupPayload.groupId
        ),
      ],
    }
  );

describe('TopicContent', () => {
  it('renders empty table', () => {
    renderComponent();
    const table = screen.getAllByRole('table')[1];
    expect(table.getElementsByTagName('td').length).toBe(0);
  });

  it('renders table with content', () => {
    renderComponent(consumerGroupPayload.partitions);
    const table = screen.getAllByRole('table')[1];
    expect(table.getElementsByTagName('td').length).toBe(
      consumerGroupPayload.partitions.length * 6
    );
  });
});
