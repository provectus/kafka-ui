import React from 'react';
import { mount } from 'enzyme';
import ListItem from 'components/ConsumerGroups/List/ListItem';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { StaticRouter } from 'react-router';
import { ConsumerGroupState, ConsumerGroup } from 'generated-sources';

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

  it('render empty ListItem', () => {
    expect(component.exists('tr')).toBeTruthy();
  });

  it('renders item with stable status', () => {
    const wrapper = mount(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.STABLE,
      })
    );

    expect(wrapper.find('td').at(5).text()).toBe(ConsumerGroupState.STABLE);
  });

  it('renders item with dead status', () => {
    const wrapper = mount(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.DEAD,
      })
    );

    expect(wrapper.find('td').at(5).text()).toBe(ConsumerGroupState.DEAD);
  });

  it('renders item with empty status', () => {
    const wrapper = mount(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.EMPTY,
      })
    );

    expect(wrapper.find('td').at(5).text()).toBe(ConsumerGroupState.EMPTY);
  });

  it('renders item with empty-string status', () => {
    const wrapper = mount(
      setupWrapper({
        ...mockConsumerGroup,
        state: ConsumerGroupState.UNKNOWN,
      })
    );

    expect(wrapper.find('td').at(5).text()).toBe(ConsumerGroupState.UNKNOWN);
  });
});
