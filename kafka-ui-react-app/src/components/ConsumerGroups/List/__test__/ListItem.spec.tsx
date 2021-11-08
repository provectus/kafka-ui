import React from 'react';
import { mount } from 'enzyme';
import ListItem from 'components/ConsumerGroups/List/ListItem';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { StaticRouter } from 'react-router';

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
  const component = mount(
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

  it('render empty ListItem', () => {
    expect(component.exists('tr')).toBeTruthy();
  });
});
