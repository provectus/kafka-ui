import React from 'react';
import ListItem from 'components/ConsumerGroups/List/ListItem';
import { ConsumerGroupState, ConsumerGroup } from 'generated-sources';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('List', () => {
  const mockConsumerGroup = {
    groupId: 'groupId',
    members: 0,
    topics: 1,
    simple: false,
    partitionAssignor: '',
    coordinator: {
      id: 1,
      host: 'host',
    },
    partitions: [
      {
        consumerId: null,
        currentOffset: 0,
        endOffset: 0,
        host: null,
        messagesBehind: 0,
        partition: 1,
        topic: 'topic',
      },
    ],
  };
  const setupWrapper = (consumerGroup: ConsumerGroup) => (
    <table>
      <tbody>
        <ListItem consumerGroup={consumerGroup} />
      </tbody>
    </table>
  );

  const getCell = () => screen.getAllByRole('cell')[5];

  it('render empty ListItem', () => {
    render(setupWrapper(mockConsumerGroup));
    expect(screen.getByRole('row')).toBeInTheDocument();
  });

  it('renders item with stable status', () => {
    render(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.STABLE,
      })
    );
    expect(screen.getByRole('row')).toHaveTextContent(
      ConsumerGroupState.STABLE
    );
  });

  it('renders item with dead status', () => {
    render(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.DEAD,
      })
    );
    expect(getCell()).toHaveTextContent(ConsumerGroupState.DEAD);
  });

  it('renders item with empty status', () => {
    render(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.EMPTY,
      })
    );
    expect(getCell()).toHaveTextContent(ConsumerGroupState.EMPTY);
  });

  it('renders item with empty-string status', () => {
    render(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.UNKNOWN,
      })
    );
    expect(getCell()).toHaveTextContent(ConsumerGroupState.UNKNOWN);
  });
});
