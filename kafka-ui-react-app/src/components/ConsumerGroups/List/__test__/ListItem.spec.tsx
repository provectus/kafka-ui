import React from 'react';
import ListItem from 'components/ConsumerGroups/List/ListItem';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { StaticRouter } from 'react-router';
import { ConsumerGroupState, ConsumerGroup } from 'generated-sources';
import { render, screen } from '@testing-library/react';

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
  const component = render(
    <StaticRouter>
      <ThemeProvider theme={theme}>
        <table>
          <tbody>
            <ListItem consumerGroup={mockConsumerGroup} />
          </tbody>
        </table>
      </ThemeProvider>
    </StaticRouter>
  );

  const setupWrapper = (consumerGroup: ConsumerGroup) => (
    <StaticRouter>
      <ThemeProvider theme={theme}>
        <table>
          <tbody>
            <ListItem consumerGroup={consumerGroup} />
          </tbody>
        </table>
      </ThemeProvider>
    </StaticRouter>
  );

  const getCell = () => screen.getAllByRole('cell')[5];

  it('render empty ListItem', () => {
    expect(component.getByRole('row')).toBeInTheDocument();
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
