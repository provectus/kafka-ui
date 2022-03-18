import React from 'react';
import List from 'components/ConsumerGroups/List/List';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { store } from 'redux/store';
import { fetchConsumerGroupsPaged } from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { consumerGroupsPage } from 'redux/reducers/consumerGroups/__test__/fixtures';

describe('List', () => {
  beforeEach(() => render(<List />, { store }));

  it('renders empty table', () => {
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('No active consumer groups')).toBeInTheDocument();
  });

  describe('consumerGroups are fetched', () => {
    beforeEach(() => {
      store.dispatch({
        type: fetchConsumerGroupsPaged.fulfilled.type,
        payload: consumerGroupsPage,
      });
    });

    it('renders all rows with consumers', () => {
      expect(screen.getByText('groupId1')).toBeInTheDocument();
      expect(screen.getByText('groupId2')).toBeInTheDocument();
    });

    describe('when searched', () => {
      it('renders only searched consumers', async () => {
        await waitFor(() => {
          userEvent.type(
            screen.getByPlaceholderText('Search by Consumer Group ID'),
            'groupId1'
          );
        });

        expect(screen.getByText('groupId1')).toBeInTheDocument();
        expect(screen.getByText('groupId2')).toBeInTheDocument();
      });
    });
  });
});
