import React from 'react';
import List from 'components/ConsumerGroups/List/List';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { store } from 'redux/store';
import { fetchConsumerGroups } from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { consumerGroups } from 'redux/reducers/consumerGroups/__test__/fixtures';

describe('List', () => {
  beforeEach(() => render(<List />, { store }));

  it('renders empty table', () => {
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('No active consumer groups')).toBeInTheDocument();
  });

  describe('consumerGroups are fecthed', () => {
    beforeEach(() => {
      store.dispatch({
        type: fetchConsumerGroups.fulfilled.type,
        payload: consumerGroups,
      });
    });

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
});
