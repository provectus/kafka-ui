import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { act, screen, waitFor, within } from '@testing-library/react';
import { CleanUpPolicy, TopicsResponse } from 'generated-sources';
import { externalTopicPayload, topicsPayload } from 'lib/fixtures/topics';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';
import {
  useDeleteTopic,
  useRecreateTopic,
  useTopics,
} from 'lib/hooks/api/topics';
import TopicTable from 'components/Topics/List/TopicTable';
import { clusterTopicsPath } from 'lib/paths';

const clusterName = 'test-cluster';
const mockUnwrap = jest.fn();
const useDispatchMock = () => jest.fn(() => ({ unwrap: mockUnwrap }));

const getButtonByName = (name: string) => screen.getByRole('button', { name });

jest.mock('lib/hooks/redux', () => ({
  ...jest.requireActual('lib/hooks/redux'),
  useAppDispatch: useDispatchMock,
}));

jest.mock('lib/hooks/api/topics', () => ({
  ...jest.requireActual('lib/hooks/api/topics'),
  useDeleteTopic: jest.fn(),
  useRecreateTopic: jest.fn(),
  useTopics: jest.fn(),
}));

const deleteTopicMock = jest.fn();
const recreateTopicMock = jest.fn();

describe('TopicTable Components', () => {
  beforeEach(() => {
    (useDeleteTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: deleteTopicMock,
    }));
    (useRecreateTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: recreateTopicMock,
    }));
  });

  const renderComponent = (
    currentData: TopicsResponse | undefined = undefined,
    isReadOnly = false,
    isTopicDeletionAllowed = true
  ) => {
    (useTopics as jest.Mock).mockImplementation(() => ({
      data: currentData,
    }));

    return render(
      <ClusterContext.Provider
        value={{
          isReadOnly,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed,
        }}
      >
        <WithRoute path={clusterTopicsPath()}>
          <TopicTable />
        </WithRoute>
      </ClusterContext.Provider>,
      { initialEntries: [clusterTopicsPath(clusterName)] }
    );
  };

  describe('without data', () => {
    it('renders empty table when payload is undefined', () => {
      renderComponent();
      expect(
        screen.getByRole('row', { name: 'No topics found' })
      ).toBeInTheDocument();
    });

    it('renders empty table when payload is empty', () => {
      renderComponent({ topics: [] });
      expect(
        screen.getByRole('row', { name: 'No topics found' })
      ).toBeInTheDocument();
    });
  });
  describe('with topics', () => {
    it('renders correct rows', () => {
      renderComponent({ topics: topicsPayload, pageCount: 1 });
      expect(
        screen.getByRole('link', { name: '__internal.topic' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('row', { name: '__internal.topic 1 0 1 0 0 Bytes' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'external.topic' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('row', { name: 'external.topic 1 0 1 0 1 KB' })
      ).toBeInTheDocument();

      expect(screen.getAllByRole('checkbox').length).toEqual(3);
    });
    describe('Selectable rows', () => {
      it('renders selectable rows', () => {
        renderComponent({ topics: topicsPayload, pageCount: 1 });
        expect(screen.getAllByRole('checkbox').length).toEqual(3);
        // Disable checkbox for internal topic
        expect(screen.getAllByRole('checkbox')[1]).toBeDisabled();
        // Disable checkbox for external topic
        expect(screen.getAllByRole('checkbox')[2]).toBeEnabled();
      });
      it('does not render selectable rows for read-only cluster', () => {
        renderComponent({ topics: topicsPayload, pageCount: 1 }, true);
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      });
      describe('Batch actions bar', () => {
        beforeEach(() => {
          const payload = {
            topics: [
              externalTopicPayload,
              { ...externalTopicPayload, name: 'test-topic' },
            ],
            totalPages: 1,
          };
          renderComponent(payload);
          expect(screen.getAllByRole('checkbox').length).toEqual(3);
          expect(screen.getAllByRole('checkbox')[1]).toBeEnabled();
          expect(screen.getAllByRole('checkbox')[2]).toBeEnabled();
        });
        describe('when only one topic is selected', () => {
          beforeEach(async () => {
            await userEvent.click(screen.getAllByRole('checkbox')[1]);
          });
          it('renders batch actions bar', () => {
            expect(getButtonByName('Delete selected topics')).toBeEnabled();
            expect(getButtonByName('Copy selected topic')).toBeEnabled();
            expect(
              getButtonByName('Purge messages of selected topics')
            ).toBeEnabled();
          });
        });
        describe('when more then one topics are selected', () => {
          beforeEach(async () => {
            await userEvent.click(screen.getAllByRole('checkbox')[1]);
            await userEvent.click(screen.getAllByRole('checkbox')[2]);
          });
          it('renders batch actions bar', () => {
            expect(getButtonByName('Delete selected topics')).toBeEnabled();
            expect(getButtonByName('Copy selected topic')).toBeDisabled();
            expect(
              getButtonByName('Purge messages of selected topics')
            ).toBeEnabled();
          });
          it('handels delete button click', async () => {
            const button = getButtonByName('Delete selected topics');
            await act(() => userEvent.click(button));
            expect(
              screen.getByText(
                'Are you sure you want to remove selected topics?'
              )
            ).toBeInTheDocument();
            const confirmBtn = getButtonByName('Confirm');
            expect(confirmBtn).toBeInTheDocument();
            expect(deleteTopicMock).not.toHaveBeenCalled();
            await act(() => userEvent.click(confirmBtn));
            expect(deleteTopicMock).toHaveBeenCalledTimes(2);
            expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
            expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
          });
          it('handels purge messages button click', async () => {
            const button = getButtonByName('Purge messages of selected topics');
            await act(() => userEvent.click(button));
            expect(
              screen.getByText(
                'Are you sure you want to purge messages of selected topics?'
              )
            ).toBeInTheDocument();
            const confirmBtn = getButtonByName('Confirm');
            expect(confirmBtn).toBeInTheDocument();
            expect(mockUnwrap).not.toHaveBeenCalled();
            await act(() => userEvent.click(confirmBtn));
            expect(mockUnwrap).toHaveBeenCalledTimes(2);
            expect(screen.getAllByRole('checkbox')[1]).not.toBeChecked();
            expect(screen.getAllByRole('checkbox')[2]).not.toBeChecked();
          });
        });
      });
    });
    describe('Action buttons', () => {
      const expectDropdownExists = async () => {
        const btn = screen.getByRole('button', {
          name: 'Dropdown Toggle',
        });
        expect(btn).toBeEnabled();
        await userEvent.click(btn);
        expect(screen.getByRole('menu')).toBeInTheDocument();
      };
      it('renders disable action buttons for read-only cluster', () => {
        renderComponent({ topics: topicsPayload, pageCount: 1 }, true);
        const btns = screen.getAllByRole('button', { name: 'Dropdown Toggle' });
        expect(btns[0]).toBeDisabled();
        expect(btns[1]).toBeDisabled();
      });
      it('renders action buttons', async () => {
        renderComponent({ topics: topicsPayload, pageCount: 1 });
        expect(
          screen.getAllByRole('button', { name: 'Dropdown Toggle' }).length
        ).toEqual(2);
        // Internal topic action buttons are disabled
        const internalTopicRow = screen.getByRole('row', {
          name: '__internal.topic 1 0 1 0 0 Bytes',
        });
        expect(internalTopicRow).toBeInTheDocument();
        expect(
          within(internalTopicRow).getByRole('button', {
            name: 'Dropdown Toggle',
          })
        ).toBeDisabled();
        // External topic action buttons are enabled
        const externalTopicRow = screen.getByRole('row', {
          name: 'external.topic 1 0 1 0 1 KB',
        });
        expect(externalTopicRow).toBeInTheDocument();
        const extBtn = within(externalTopicRow).getByRole('button', {
          name: 'Dropdown Toggle',
        });
        expect(extBtn).toBeEnabled();
        await userEvent.click(extBtn);
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
      describe('and clear messages action', () => {
        it('is visible for topic with CleanUpPolicy.DELETE', async () => {
          renderComponent({
            topics: [
              {
                ...topicsPayload[1],
                cleanUpPolicy: CleanUpPolicy.DELETE,
              },
            ],
          });
          await expectDropdownExists();
          const actionBtn = screen.getAllByRole('menuitem');
          expect(actionBtn[0]).toHaveTextContent('Clear Messages');
          expect(actionBtn[0]).not.toHaveAttribute('aria-disabled');
        });
        it('is disabled for topic without CleanUpPolicy.DELETE', async () => {
          renderComponent({
            topics: [
              {
                ...topicsPayload[1],
                cleanUpPolicy: CleanUpPolicy.COMPACT,
              },
            ],
          });
          await expectDropdownExists();
          const actionBtn = screen.getAllByRole('menuitem');
          expect(actionBtn[0]).toHaveTextContent('Clear Messages');
          expect(actionBtn[0]).toHaveAttribute('aria-disabled');
        });
        it('works as expected', async () => {
          renderComponent({
            topics: [
              {
                ...topicsPayload[1],
                cleanUpPolicy: CleanUpPolicy.DELETE,
              },
            ],
          });
          await expectDropdownExists();
          await userEvent.click(screen.getByText('Clear Messages'));
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
          renderComponent({ topics: [topicsPayload[1]] });
          await expectDropdownExists();
          const actionBtn = screen.getAllByRole('menuitem');
          expect(actionBtn[2]).toHaveTextContent('Remove Topic');
          expect(actionBtn[2]).not.toHaveAttribute('aria-disabled');
        });
        it('is disabled when topic deletion is not allowed for cluster', async () => {
          renderComponent({ topics: [topicsPayload[1]] }, false, false);
          await expectDropdownExists();
          const actionBtn = screen.getAllByRole('menuitem');
          expect(actionBtn[2]).toHaveTextContent('Remove Topic');
          expect(actionBtn[2]).toHaveAttribute('aria-disabled');
        });
        it('works as expected', async () => {
          renderComponent({ topics: [topicsPayload[1]] });
          await expectDropdownExists();
          await userEvent.click(screen.getByText('Remove Topic'));
          expect(screen.getByText('Confirm the action')).toBeInTheDocument();
          await waitFor(() =>
            userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
          );
          await waitFor(() => expect(deleteTopicMock).toHaveBeenCalled());
        });
      });
      describe('and recreate topic action', () => {
        it('works as expected', async () => {
          renderComponent({ topics: [topicsPayload[1]] });
          await expectDropdownExists();
          await userEvent.click(screen.getByText('Recreate Topic'));
          expect(screen.getByText('Confirm the action')).toBeInTheDocument();
          await waitFor(() =>
            userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
          );
          await waitFor(() => expect(recreateTopicMock).toHaveBeenCalled());
        });
      });
    });
  });
});
