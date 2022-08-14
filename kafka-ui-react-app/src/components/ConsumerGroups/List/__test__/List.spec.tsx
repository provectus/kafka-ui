import React from 'react';
import List, { Props } from 'components/ConsumerGroups/List/List';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { consumerGroups as consumerGroupMock } from 'redux/reducers/consumerGroups/__test__/fixtures';

describe('List', () => {
  const setUpComponent = (props: Partial<Props> = {}) => {
    const { consumerGroups, totalPages } = props;
    return render(
      <List
        consumerGroups={consumerGroups || []}
        totalPages={totalPages || 1}
      />
    );
  };

  it('renders empty table', () => {
    setUpComponent();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByText('No active consumer groups found')
    ).toBeInTheDocument();
  });

  describe('consumerGroups are fetched', () => {
    beforeEach(() => setUpComponent({ consumerGroups: consumerGroupMock }));

    it('renders all rows with consumers', () => {
      expect(screen.getByText('groupId1')).toBeInTheDocument();
      expect(screen.getByText('groupId2')).toBeInTheDocument();
    });
  });
});
