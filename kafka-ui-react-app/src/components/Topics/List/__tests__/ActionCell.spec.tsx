import React from 'react';
import { render } from 'lib/testHelpers';
import { TableState } from 'lib/hooks/useTableState';
import { act, screen, waitFor } from '@testing-library/react';
import { CleanUpPolicy, Topic } from 'generated-sources';
import { topicsPayload } from 'lib/fixtures/topics';
import ActionsCell from 'components/Topics/List/ActionsCell';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';
import { useDeleteTopic, useRecreateTopic } from 'lib/hooks/api/topics';

const mockUnwrap = jest.fn();
const useDispatchMock = () => jest.fn(() => ({ unwrap: mockUnwrap }));

jest.mock('lib/hooks/redux', () => ({
  ...jest.requireActual('lib/hooks/redux'),
  useAppDispatch: useDispatchMock,
}));

jest.mock('lib/hooks/api/topics', () => ({
  ...jest.requireActual('lib/hooks/api/topics'),
  useDeleteTopic: jest.fn(),
  useRecreateTopic: jest.fn(),
}));

const deleteTopicMock = jest.fn();
const recreateTopicMock = jest.fn();

describe('ActionCell Components', () => {
  beforeEach(() => {
    (useDeleteTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: deleteTopicMock,
    }));
    (useRecreateTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: recreateTopicMock,
    }));
  });

  const mockTableState: TableState<Topic, string> = {
    data: topicsPayload,
    selectedIds: new Set([]),
    idSelector: jest.fn(),
    isRowSelectable: jest.fn(),
    selectedCount: 0,
    setRowsSelection: jest.fn(),
    toggleSelection: jest.fn(),
  };

  const renderComponent = (
    currentData: Topic,
    isReadOnly = false,
    hovered = true,
    isTopicDeletionAllowed = true
  ) => {
    return render(
      <ClusterContext.Provider
        value={{
          isReadOnly,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed,
        }}
      >
        <ActionsCell
          rowIndex={1}
          dataItem={currentData}
          tableState={mockTableState}
          hovered={hovered}
        />
      </ClusterContext.Provider>
    );
  };

  const expectCellIsEmpty = () => {
    expect(
      screen.queryByRole('button', { name: 'Dropdown Toggle' })
    ).not.toBeInTheDocument();
  };

  const expectDropdownExists = () => {
    const btn = screen.getByRole('button', { name: 'Dropdown Toggle' });
    expect(btn).toBeInTheDocument();
    userEvent.click(btn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  };

  describe('is empty', () => {
    it('for internal topic', () => {
      renderComponent(topicsPayload[0]);
      expectCellIsEmpty();
    });
    it('for readonly cluster', () => {
      renderComponent(topicsPayload[1], true);
      expectCellIsEmpty();
    });
    it('for non-hovered row', () => {
      renderComponent(topicsPayload[1], false, false);
      expectCellIsEmpty();
    });
  });

  describe('is not empty', () => {
    it('for external topic', async () => {
      renderComponent(topicsPayload[1]);
      expectDropdownExists();
    });
    describe('and clear messages action', () => {
      it('is visible for topic with CleanUpPolicy.DELETE', async () => {
        renderComponent({
          ...topicsPayload[1],
          cleanUpPolicy: CleanUpPolicy.DELETE,
        });
        expectDropdownExists();
        expect(screen.getByText('Clear Messages')).toBeInTheDocument();
      });
      it('is hidden for topic without CleanUpPolicy.DELETE', async () => {
        renderComponent({
          ...topicsPayload[1],
          cleanUpPolicy: CleanUpPolicy.COMPACT,
        });
        expectDropdownExists();
        expect(screen.queryByText('Clear Messages')).not.toBeInTheDocument();
      });
      it('works as expected', async () => {
        renderComponent({
          ...topicsPayload[1],
          cleanUpPolicy: CleanUpPolicy.DELETE,
        });
        expectDropdownExists();
        userEvent.click(screen.getByText('Clear Messages'));
        expect(
          screen.getByText('Are you sure want to clear topic messages?')
        ).toBeInTheDocument();
        await act(() =>
          userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
        );
        expect(mockUnwrap).toHaveBeenCalled();
      });
    });

    describe('and remove topic action', () => {
      it('is visible only when topic deletion allowed for cluster', async () => {
        renderComponent(topicsPayload[1]);
        expectDropdownExists();
        expect(screen.getByText('Remove Topic')).toBeInTheDocument();
      });
      it('is hidden when topic deletion is not allowed for cluster', async () => {
        renderComponent(topicsPayload[1], false, true, false);
        expectDropdownExists();
        expect(screen.queryByText('Remove Topic')).not.toBeInTheDocument();
      });
      it('works as expected', async () => {
        renderComponent(topicsPayload[1]);
        expectDropdownExists();
        userEvent.click(screen.getByText('Remove Topic'));
        expect(screen.getByText('Confirm the action')).toBeInTheDocument();
        expect(screen.getByText('external.topic')).toBeInTheDocument();
        await waitFor(() =>
          userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
        );
        await waitFor(() => expect(deleteTopicMock).toHaveBeenCalled());
      });
    });

    describe('and recreate topic action', () => {
      it('works as expected', async () => {
        renderComponent(topicsPayload[1]);
        expectDropdownExists();
        userEvent.click(screen.getByText('Recreate Topic'));
        expect(screen.getByText('Confirm the action')).toBeInTheDocument();
        expect(screen.getByText('external.topic')).toBeInTheDocument();
        await waitFor(() =>
          userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
        );
        await waitFor(() => expect(recreateTopicMock).toHaveBeenCalled());
      });
    });
  });
});
