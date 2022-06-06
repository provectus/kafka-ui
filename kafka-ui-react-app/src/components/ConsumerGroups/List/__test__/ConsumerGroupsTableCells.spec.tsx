import React from 'react';
import { render } from 'lib/testHelpers';
import {
  GroupIDCell,
  StatusCell,
} from 'components/ConsumerGroups/List/ConsumerGroupsTableCells';
import { TableState } from 'lib/hooks/useTableState';
import { ConsumerGroup, ConsumerGroupState } from 'generated-sources';
import { screen } from '@testing-library/react';

describe('Consumer Groups Table Cells', () => {
  const consumerGroup: ConsumerGroup = {
    groupId: 'groupId',
    members: 1,
    topics: 1,
    simple: true,
    state: ConsumerGroupState.STABLE,
    coordinator: {
      id: 6598,
    },
  };
  const mockTableState: TableState<ConsumerGroup, string, never> = {
    data: [consumerGroup],
    selectedIds: new Set([]),
    idSelector: jest.fn(),
    isRowSelectable: jest.fn(),
    selectedCount: 0,
    setRowsSelection: jest.fn(),
    toggleSelection: jest.fn(),
  };

  describe('StatusCell', () => {
    it('should Tag props render normally', () => {
      render(
        <GroupIDCell
          rowIndex={1}
          dataItem={consumerGroup}
          tableState={mockTableState}
        />
      );
      const linkElement = screen.getByRole('link');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', `/${consumerGroup.groupId}`);
    });
  });

  describe('GroupIdCell', () => {
    it('should GroupIdCell props render normally', () => {
      render(
        <StatusCell
          rowIndex={1}
          dataItem={consumerGroup}
          tableState={mockTableState}
        />
      );
      expect(
        screen.getByText(consumerGroup.state as string)
      ).toBeInTheDocument();
    });
  });
});
