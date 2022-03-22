import React from 'react';
import List, { Props } from 'components/ConsumerGroups/List/List';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { consumerGroups as consumerGroupMock } from 'redux/reducers/consumerGroups/__test__/fixtures';
import { SortOrder } from 'generated-sources';

describe('List', () => {
  const setUpComponent = (props: Partial<Props> = {}) => {
    const { consumerGroups, orderBy, sortOrder, totalPages } = props;
    return render(
      <List
        consumerGroups={consumerGroups || []}
        orderBy={orderBy || null}
        sortOrder={sortOrder || SortOrder.ASC}
        setConsumerGroupsSortOrderBy={jest.fn()}
        totalPages={totalPages || 1}
      />
    );
  };

  it('renders empty table', () => {
    setUpComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('No active consumer groups')).toBeInTheDocument();
  });

  describe('consumerGroups are fetched', () => {
    beforeEach(() => setUpComponent({ consumerGroups: consumerGroupMock }));

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
