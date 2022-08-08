import React from 'react';
import { render } from 'lib/testHelpers';
import {
  MessagesCell,
  OutOfSyncReplicasCell,
  TitleCell,
  TopicSizeCell,
} from 'components/Topics/List/TopicsTableCells';
import { TableState } from 'lib/hooks/useTableState';
import { screen } from '@testing-library/react';
import { Topic } from 'generated-sources';
import { topicsPayload } from 'lib/fixtures/topics';

describe('TopicsTableCells Components', () => {
  const mockTableState: TableState<Topic, string> = {
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

  describe('TopicSizeCell Component', () => {
    const currentData = topicsPayload[1];
    it('should check the TopicSizeCell component Render', () => {
      render(
        <TopicSizeCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('1KB')).toBeInTheDocument();
    });
  });

  describe('OutOfSyncReplicasCell Component', () => {
    it('returns 0 if no partition is empty array', () => {
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

    it('returns 0 if no partition is found', () => {
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

    it('returns number of out of sync partitions', () => {
      const currentData = {
        ...topicsPayload[1],
        partitions: [
          {
            partition: 0,
            leader: 1,
            replicas: [{ broker: 1, leader: false, inSync: false }],
            offsetMax: 0,
            offsetMin: 0,
          },
        ],
      };
      render(
        <OutOfSyncReplicasCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('1')).toBeInTheDocument();
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
    it('returns 0 if partition is empty array ', () => {
      render(
        <MessagesCell
          rowIndex={1}
          dataItem={{ ...topicsPayload[0], partitions: [] }}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('returns 0 if no partition is found', () => {
      render(
        <MessagesCell
          rowIndex={1}
          dataItem={{ ...topicsPayload[0], partitions: undefined }}
          tableState={mockTableState}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('returns the correct messages number', () => {
      const offsetMax = 10034;
      const offsetMin = 345;
      const currentData = {
        ...topicsPayload[0],
        partitions: [
          {
            partition: 0,
            leader: 1,
            replicas: [{ broker: 1, leader: false, inSync: false }],
            offsetMax,
            offsetMin,
          },
        ],
      };
      render(
        <MessagesCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
        />
      );
      expect(offsetMax - offsetMin).toEqual(9689);
      expect(screen.getByText(offsetMax - offsetMin)).toBeInTheDocument();
    });
  });
});
