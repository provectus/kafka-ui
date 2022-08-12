import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import TopicConsumerGroups from 'components/Topics/Topic/ConsumerGroups/TopicConsumerGroups';
import { clusterTopicConsumerGroupsPath } from 'lib/paths';
import { useTopicConsumerGroups } from 'lib/hooks/api/topics';
import { ConsumerGroup } from 'generated-sources';
import { topicConsumerGroups } from 'lib/fixtures/topics';

const clusterName = 'local';
const topicName = 'my-topicName';
const path = clusterTopicConsumerGroupsPath(clusterName, topicName);

jest.mock('lib/hooks/api/topics', () => ({
  useTopicConsumerGroups: jest.fn(),
}));

describe('TopicConsumerGroups', () => {
  const renderComponent = async (payload?: ConsumerGroup[]) => {
    (useTopicConsumerGroups as jest.Mock).mockImplementation(() => ({
      data: payload,
    }));

    render(
      <WithRoute path={clusterTopicConsumerGroupsPath()}>
        <TopicConsumerGroups />
      </WithRoute>,
      { initialEntries: [path] }
    );
  };

  it('renders empty table if consumer groups payload is empty', async () => {
    await renderComponent([]);
    expect(screen.getByText('No active consumer groups')).toBeInTheDocument();
  });

  it('renders empty table if consumer groups payload is undefined', async () => {
    await renderComponent();
    expect(screen.getByText('No active consumer groups')).toBeInTheDocument();
  });

  it('renders table of consumer groups', async () => {
    await renderComponent(topicConsumerGroups);
    const groupIds = topicConsumerGroups.map(({ groupId }) => groupId);
    groupIds.forEach((groupId) =>
      expect(screen.getByText(groupId)).toBeInTheDocument()
    );
  });
});
