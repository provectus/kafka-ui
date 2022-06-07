import React from 'react';
import { render } from 'lib/testHelpers';
import {
  MessagesCell,
  OutOfSyncReplicasCell,
  TitleCell,
} from 'components/Topics/List/TopicsTableCells';
import { TableState } from 'lib/hooks/useTableState';
import { screen } from '@testing-library/react';
import { Topic } from 'generated-sources';
import { topicsPayload } from 'redux/reducers/topics/__test__/fixtures';

describe('TopicsTableCells Components', () => {
  const mockTableState: TableState<Topic, string, never> = {
    data: topicsPayload,
    selectedIds: new Set([]),
    idSelector: jest.fn(),
    isRowSelectable: jest.fn(),
    selectedCount: 0,
    setRowsSelection: jest.fn(),
    toggleSelection: jest.fn(),
  };

  describe('TitleCell Component', () => {
    it('should check the TitleCell component Render without the internal option', () => {
      const currentData = topicsPayload[1];
      render(
        <TitleCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(screen.queryByText('IN')).not.toBeInTheDocument();
      expect(screen.getByText(currentData.name)).toBeInTheDocument();
    });

    it('should check the TitleCell component Render without the internal option', () => {
      const currentData = topicsPayload[0];
      render(
        <TitleCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('IN')).toBeInTheDocument();
      expect(screen.getByText(currentData.name)).toBeInTheDocument();
    });
  });

  describe('OutOfSyncReplicasCell Component', () => {
    it('should check the content of the OutOfSyncReplicasCell to return 0 if no partition is empty array', () => {
      const currentData = topicsPayload[0];
      currentData.partitions = [];
      render(
        <OutOfSyncReplicasCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should check the content of the OutOfSyncReplicasCell to return 0 if no partition is found', () => {
      const currentData = topicsPayload[1];
      currentData.partitions = undefined;
      render(
        <OutOfSyncReplicasCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should check the content of the OutOfSyncReplicasCell with the correct partition number', () => {
      const currentData = topicsPayload[0];
      const partitionNumber = currentData.partitions?.reduce(
        (memo, { replicas }) => {
          const outOfSync = replicas?.filter(({ inSync }) => !inSync);
          return memo + (outOfSync?.length || 0);
        },
        0
      );

      render(
        <OutOfSyncReplicasCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(
        screen.getByText(partitionNumber ? partitionNumber.toString() : '0')
      ).toBeInTheDocument();
    });
  });

  describe('MessagesCell Component', () => {
    it('should check the content of the MessagesCell to return 0 if no partition is empty array ', () => {
      const currentData = topicsPayload[0];
      currentData.partitions = [];
      render(
        <MessagesCell
          rowIndex={1}
          dataItem={topicsPayload[0]}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should check the content of the MessagesCell to return 0 if no partition is found', () => {
      const currentData = topicsPayload[0];
      currentData.partitions = undefined;
      render(
        <MessagesCell
          rowIndex={1}
          dataItem={topicsPayload[0]}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should check the content of the MessagesCell with the correct partition number', () => {
      const currentData = topicsPayload[0];
      const partitionNumber = currentData.partitions?.reduce(
        (memo, { offsetMax, offsetMin }) => {
          return memo + (offsetMax - offsetMin);
        },
        0
      );
      render(
        <MessagesCell
          rowIndex={1}
          dataItem={topicsPayload[0]}
          tableState={mockTableState}
        />
      );
      expect(
        screen.getByText(partitionNumber ? partitionNumber.toString() : '0')
      ).toBeInTheDocument();
    });
  });
});
