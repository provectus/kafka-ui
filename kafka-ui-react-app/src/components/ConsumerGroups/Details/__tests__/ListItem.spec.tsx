import React from 'react';
import { clusterConsumerGroupDetailsPath } from 'lib/paths';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListItem from 'components/ConsumerGroups/Details/ListItem';
import { consumerGroupPayload } from 'redux/reducers/consumerGroups/__test__/fixtures';
import { render } from 'lib/testHelpers';
import { Route } from 'react-router-dom';
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
  beforeEach(() => renderComponent(consumerGroupPayload.partitions));

  it('should renders list item with topic content closed and check if element exists', () => {
    expect(screen.getByRole('row')).toBeInTheDocument();
  });

  it('should renders list item with topic content open', () => {
    userEvent.click(screen.getAllByRole('cell')[0].children[0]);
    expect(screen.getByText('Consumer ID')).toBeInTheDocument();
  });
});
