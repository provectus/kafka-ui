import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { act, screen, within } from '@testing-library/react';
import { externalTopicPayload } from 'lib/fixtures/topics';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';
import { useDeleteTopic, useTopics } from 'lib/hooks/api/topics';
import TopicsTable from 'components/Topics/List/TopicsTable';
import { clusterTopicsPath } from 'lib/paths';

const mockUnwrap = jest.fn();
const useDispatchMock = () => jest.fn(() => ({ unwrap: mockUnwrap }));

jest.mock('lib/hooks/redux', () => ({
  ...jest.requireActual('lib/hooks/redux'),
  useAppDispatch: useDispatchMock,
}));

jest.mock('lib/hooks/api/topics', () => ({
  ...jest.requireActual('lib/hooks/api/topics'),
  useDeleteTopic: jest.fn(),
  useTopics: jest.fn(),
}));

const deleteTopicMock = jest.fn();
const refetchMock = jest.fn();

const clusterName = 'test-cluster';

const getCheckboxInput = (at: number) => {
  const rows = screen.getAllByRole('row');
  return within(rows[at + 1]).getByRole('checkbox');
};

describe('TopicsTable Component', () => {
  beforeEach(() => {
    (useDeleteTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: deleteTopicMock,
    }));
    (useTopics as jest.Mock).mockImplementation(() => ({
      data: {
        topics: [
          externalTopicPayload,
          { ...externalTopicPayload, name: 'test-topic' },
        ],
        totalPages: 1,
      },
      refetch: refetchMock,
    }));
  });

  const renderComponent = () => {
    return render(
      <ClusterContext.Provider
        value={{
          isReadOnly: false,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed: true,
        }}
      >
        <WithRoute path={clusterTopicsPath()}>
          <TopicsTable />
        </WithRoute>
      </ClusterContext.Provider>,
      { initialEntries: [clusterTopicsPath(clusterName)] }
    );
  };

  beforeEach(() => {
    renderComponent();
  });

  const getButtonByName = (name: string) =>
    screen.getByRole('button', { name });

  const queryButtonByName = (name: string) =>
    screen.queryByRole('button', { name });

  it('renders the table', () => {
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders batch actions bar', () => {
    expect(screen.getByRole('table')).toBeInTheDocument();

    // check batch actions bar is hidden
    const firstCheckbox = getCheckboxInput(0);
    expect(firstCheckbox).not.toBeChecked();
    expect(queryButtonByName('Delete selected topics')).not.toBeInTheDocument();

    // select firsr row
    userEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    // check batch actions bar is shown
    expect(getButtonByName('Delete selected topics')).toBeInTheDocument();
    expect(getButtonByName('Copy selected topic')).toBeInTheDocument();
    expect(
      getButtonByName('Purge messages of selected topics')
    ).toBeInTheDocument();

    // select second row
    const secondCheckbox = getCheckboxInput(1);
    expect(secondCheckbox).not.toBeChecked();
    userEvent.click(secondCheckbox);
    expect(secondCheckbox).toBeChecked();

    // check batch actions bar is still shown
    expect(getButtonByName('Delete selected topics')).toBeInTheDocument();
    expect(
      getButtonByName('Purge messages of selected topics')
    ).toBeInTheDocument();

    // check Copy button is hidden
    expect(queryButtonByName('Copy selected topic')).not.toBeInTheDocument();
  });

  describe('', () => {
    beforeEach(() => {
      userEvent.click(getCheckboxInput(0));
      userEvent.click(getCheckboxInput(1));
    });

    it('handels delete button click', async () => {
      const button = getButtonByName('Delete selected topics');
      expect(button).toBeInTheDocument();

      await act(() => userEvent.click(button));

      expect(
        screen.getByText('Are you sure you want to remove selected topics?')
      ).toBeInTheDocument();

      const confirmBtn = getButtonByName('Confirm');
      expect(confirmBtn).toBeInTheDocument();
      expect(deleteTopicMock).not.toHaveBeenCalled();
      await act(() => userEvent.click(confirmBtn));

      expect(deleteTopicMock).toHaveBeenCalledTimes(2);

      expect(getCheckboxInput(0)).not.toBeChecked();
      expect(getCheckboxInput(1)).not.toBeChecked();
    });

    it('handels purge messages button click', async () => {
      const button = getButtonByName('Purge messages of selected topics');
      expect(button).toBeInTheDocument();

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

      expect(getCheckboxInput(0)).not.toBeChecked();
      expect(getCheckboxInput(1)).not.toBeChecked();
    });
  });
});
