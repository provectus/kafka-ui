import React from 'react';
import { render } from 'lib/testHelpers';
import {
  StatusCell,
  GroupIDCell,
  CoordinatorCell,
} from 'components/ConsumerGroups/List/ConsumerGroupsTableCells';
import { TableState } from 'lib/hooks/useTableState';
import { ConsumerGroup } from 'generated-sources';

describe('Consumer Groups Table Cells', () => {
  const consumerGroup: ConsumerGroup = {
    groupId: 'groupId',
    members: 1,
    topics: 1,
    simple: true,
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
    });
  });
  describe('CoordinatorCell', () => {
    it('should GroupIdCell props render normally', () => {
      render(
        <CoordinatorCell
          rowIndex={1}
          dataItem={consumerGroup}
          tableState={mockTableState}
        />
      );
    });
  });
});
