import React from 'react';
import List, { Props } from 'components/ConsumerGroups/List/List';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { consumerGroups as consumerGroupMock } from 'redux/reducers/consumerGroups/__test__/fixtures';
import { ConsumerGroupOrdering, SortOrder } from 'generated-sources';
import theme from 'theme/theme';

describe('List', () => {
  const setUpComponent = (props: Partial<Props> = {}) => {
    const {
      consumerGroups,
      orderBy,
      sortOrder,
      totalPages,
      setConsumerGroupsSortOrderBy,
    } = props;
    return render(
      <List
        consumerGroups={consumerGroups || []}
        orderBy={orderBy || ConsumerGroupOrdering.NAME}
        sortOrder={sortOrder || SortOrder.ASC}
        setConsumerGroupsSortOrderBy={setConsumerGroupsSortOrderBy || jest.fn()}
        totalPages={totalPages || 1}
        isFetched={'isFetched' in props ? !!props.isFetched : true}
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

    describe('Testing the Ordering', () => {
      it('should test the sort order functionality', async () => {
        const thElement = screen.getByText(/consumer group id/i);
        expect(thElement).toBeInTheDocument();
        expect(thElement).toHaveStyle(`color:${theme.table.th.color.active}`);
      });
    });
  });

  describe('consumerGroups are fetched with custom parameters', () => {
    it('should test the order by functionality of another element', async () => {
      const sortOrder = jest.fn();
      setUpComponent({
        consumerGroups: consumerGroupMock,
        setConsumerGroupsSortOrderBy: sortOrder,
      });
      const thElement = screen.getByText(/num of members/i);
      expect(thElement).toBeInTheDocument();

      userEvent.click(thElement);
      expect(sortOrder).toBeCalled();
    });

    it('should view the ordered list with the right prop', () => {
      setUpComponent({
        consumerGroups: consumerGroupMock,
        orderBy: ConsumerGroupOrdering.MEMBERS,
      });
      expect(screen.getByText(/num of members/i)).toHaveStyle(
        `color:${theme.table.th.color.active}`
      );
    });
  });
});
