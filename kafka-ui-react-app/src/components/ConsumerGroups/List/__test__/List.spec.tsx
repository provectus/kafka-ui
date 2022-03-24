import React from 'react';
import List from 'components/ConsumerGroups/List/List';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { consumerGroups } from 'redux/reducers/consumerGroups/__test__/fixtures';

describe('List', () => {
  it('renders empty table', () => {
    render(<List consumerGroups={[]} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('No active consumer groups')).toBeInTheDocument();
  });

  describe('consumerGroups are fetched', () => {
    beforeEach(() => render(<List consumerGroups={consumerGroups} />));

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
