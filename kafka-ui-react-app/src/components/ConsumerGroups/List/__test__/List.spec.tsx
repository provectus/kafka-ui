import React from 'react';
import List, { ListProps } from 'components/ConsumerGroups/List/List';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { fireEvent, render, waitFor } from '@testing-library/react';

const setupWrapper = (props?: Partial<ListProps>) => (
  <ThemeProvider theme={theme}>
    <List
      consumerGroups={[
        {
          groupId: 'groupId1',
          members: 0,
          topics: 1,
          simple: false,
          partitionAssignor: '',
          coordinator: {
            id: 1,
            host: 'host',
          },
        },
        {
          groupId: 'groupId2',
          members: 0,
          topics: 1,
          simple: false,
          partitionAssignor: '',
          coordinator: {
            id: 1,
            host: 'host',
          },
        },
      ]}
      clusterName="cluster"
      {...props}
    />
  </ThemeProvider>
);

describe('List', () => {
  it('renders all rows with consumers', async () => {
    const component = render(setupWrapper());
    expect(await component.findByText('groupId1')).toBeTruthy();
    expect(await component.findByText('groupId2')).toBeTruthy();
  });

  describe('when searched', () => {
    it('renders only searched consumers', async () => {
      const component = render(setupWrapper());
      const input = await component.findByPlaceholderText('Search');
      fireEvent.change(input, { target: { value: 'groupId1' } });
      await waitFor(async () => {
        expect(await component.findByText('groupId1')).toBeTruthy();
        expect(await component.findByText('groupId2')).toBeTruthy();
      });
    });
  });
});
