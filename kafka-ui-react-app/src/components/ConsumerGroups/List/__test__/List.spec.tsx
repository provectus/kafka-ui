import React from 'react';
import List, { ListProps } from 'components/ConsumerGroups/List/List';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { render, screen } from '@testing-library/react';
import { StaticRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

const setupWrapper = (props?: Partial<ListProps>) => (
  <StaticRouter>
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
  </StaticRouter>
);

describe('List', () => {
  beforeEach(() => render(setupWrapper()));

  it('renders all rows with consumers', () => {
    expect(screen.getByText('groupId1')).toBeInTheDocument();
    expect(screen.getByText('groupId2')).toBeInTheDocument();
  });

  describe('when searched', () => {
    it('renders only searched consumers', () => {
      userEvent.type(screen.getByPlaceholderText('Search'), 'groupId1');
      expect(screen.getByText('groupId1')).toBeInTheDocument();
      expect(screen.getByText('groupId2')).toBeInTheDocument();
    });
  });
});
