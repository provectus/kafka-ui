import React from 'react';
import { clusterConsumerGroupDetailsPath } from 'lib/paths';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListItem from 'components/ConsumerGroups/Details/ListItem';
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
      <table>
        <tbody>
          <ListItem
            clusterName={clusterName}
            name={clusterName}
            consumers={consumers}
          />
        </tbody>
      </table>
    </Route>,
    {
      pathname: clusterConsumerGroupDetailsPath(
        clusterName,
        consumerGroupPayload.groupId
      ),
    }
  );

describe('ListItem', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  it('renders list item with topic content closed', () => {
    renderComponent(consumerGroupPayload.partitions);
    const listItem = screen.queryByTestId('consumer-group-list-item');
    expect(listItem).toBeInTheDocument();
  });

  it('renders list item with topic content open', async () => {
    renderComponent(consumerGroupPayload.partitions);
    const listItem = screen.queryByTestId('consumer-group-list-item');
    expect(listItem).toBeInTheDocument();

    await waitFor(() => {
      userEvent.click(screen.getByTestId('consumer-group-list-item-toggle'));
    });

    expect(screen.queryByText('Consumer ID')).toBeInTheDocument();
  });
});
