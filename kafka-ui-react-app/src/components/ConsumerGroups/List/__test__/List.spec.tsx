import React from 'react';
import List, { Props } from 'components/ConsumerGroups/List/List';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { consumerGroups as consumerGroupMock } from 'redux/reducers/consumerGroups/__test__/fixtures';
import { clusterConsumerGroupDetailsPath } from 'lib/paths';
import userEvent from '@testing-library/user-event';
import ListContainer from 'components/ConsumerGroups/List/ListContainer';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
}));

describe('ListContainer', () => {
  it('renders correctly', () => {
    render(<ListContainer />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

describe('List', () => {
  const renderComponent = (props: Partial<Props> = {}) => {
    const { consumerGroups, totalPages } = props;
    return render(
      <List
        consumerGroups={consumerGroups || []}
        totalPages={totalPages || 1}
      />
    );
  };

  it('renders empty table', () => {
    renderComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByText('No active consumer groups found')
    ).toBeInTheDocument();
  });

  describe('consumerGroups are fetched', () => {
    beforeEach(() => renderComponent({ consumerGroups: consumerGroupMock }));

    it('renders all rows with consumers', () => {
      expect(screen.getByText('groupId1')).toBeInTheDocument();
      expect(screen.getByText('groupId2')).toBeInTheDocument();
    });

    it('handles onRowClick', async () => {
      const row = screen.getByRole('row', { name: 'groupId1 0 1 1' });
      expect(row).toBeInTheDocument();
      await userEvent.click(row);
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        clusterConsumerGroupDetailsPath(':clusterName', 'groupId1')
      );
    });
  });
});
