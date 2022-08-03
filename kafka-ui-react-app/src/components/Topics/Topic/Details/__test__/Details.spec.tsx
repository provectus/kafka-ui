import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterContext from 'components/contexts/ClusterContext';
import Details from 'components/Topics/Topic/Details/Details';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterTopicEditRelativePath, clusterTopicPath } from 'lib/paths';
import { CleanUpPolicy, Topic } from 'generated-sources';
import { externalTopicPayload } from 'lib/fixtures/topics';
import {
  useDeleteTopic,
  useRecreateTopic,
  useTopicDetails,
} from 'lib/hooks/api/topics';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('lib/hooks/api/topics', () => ({
  useTopicDetails: jest.fn(),
  useDeleteTopic: jest.fn(),
  useRecreateTopic: jest.fn(),
}));

const mockUnwrap = jest.fn();
const useDispatchMock = () => jest.fn(() => ({ unwrap: mockUnwrap }));

jest.mock('lib/hooks/redux', () => ({
  ...jest.requireActual('lib/hooks/redux'),
  useAppDispatch: useDispatchMock,
}));

const mockDelete = jest.fn();
const mockRecreate = jest.fn();

describe('Details', () => {
  const mockClusterName = 'local';

  const topic: Topic = {
    ...externalTopicPayload,
    cleanUpPolicy: CleanUpPolicy.DELETE,
  };

  const renderComponent = (isReadOnly = false) => {
    const path = clusterTopicPath(mockClusterName, topic.name);
    render(
      <ClusterContext.Provider
        value={{
          isReadOnly,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed: true,
        }}
      >
        <WithRoute path={clusterTopicPath()}>
          <Details />
        </WithRoute>
      </ClusterContext.Provider>,
      { initialEntries: [path] }
    );
  };

  beforeEach(async () => {
    (useTopicDetails as jest.Mock).mockImplementation(() => ({
      data: topic,
    }));
    (useDeleteTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockDelete,
    }));
    (useRecreateTopic as jest.Mock).mockImplementation(() => ({
      mutateAsync: mockRecreate,
    }));
  });

  describe('when it has readonly flag', () => {
    it('does not render the Action button a Topic', () => {
      renderComponent(true);
      expect(screen.queryByText('Produce Message')).not.toBeInTheDocument();
    });
  });

  describe('when remove topic modal is open', () => {
    beforeEach(() => {
      renderComponent();
      const openModalButton = screen.getAllByText('Remove Topic')[0];
      userEvent.click(openModalButton);
    });

    it('calls deleteTopic on confirm', async () => {
      const submitButton = screen.getAllByRole('button', {
        name: 'Confirm',
      })[0];
      await act(() => userEvent.click(submitButton));
      expect(mockDelete).toHaveBeenCalledWith(topic.name);
    });
    it('closes the modal when cancel button is clicked', async () => {
      const cancelButton = screen.getAllByText('Cancel')[0];
      await waitFor(() => userEvent.click(cancelButton));
      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when clear messages modal is open', () => {
    beforeEach(async () => {
      await renderComponent();
      const confirmButton = screen.getAllByText('Clear messages')[0];
      await act(() => userEvent.click(confirmButton));
    });

    it('it calls clearTopicMessages on confirm', async () => {
      const submitButton = screen.getAllByRole('button', {
        name: 'Confirm',
      })[0];
      await waitFor(() => userEvent.click(submitButton));
      expect(mockUnwrap).toHaveBeenCalledTimes(1);
    });

    it('closes the modal when cancel button is clicked', async () => {
      const cancelButton = screen.getAllByText('Cancel')[0];
      await waitFor(() => userEvent.click(cancelButton));

      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when edit settings is clicked', () => {
    it('redirects to the edit page', () => {
      renderComponent();
      const button = screen.getAllByText('Edit settings')[0];
      userEvent.click(button);
      expect(mockNavigate).toHaveBeenCalledWith(clusterTopicEditRelativePath);
    });
  });

  it('redirects to the correct route if topic is deleted', async () => {
    renderComponent();
    const deleteTopicButton = screen.getByText(/Remove topic/i);
    await waitFor(() => userEvent.click(deleteTopicButton));
    const submitDeleteButton = screen.getByRole('button', { name: 'Confirm' });
    await act(() => userEvent.click(submitDeleteButton));
    expect(mockNavigate).toHaveBeenCalledWith('../..');
  });

  it('shows a confirmation popup on deleting topic messages', () => {
    renderComponent();
    const clearMessagesButton = screen.getAllByText(/Clear messages/i)[0];
    userEvent.click(clearMessagesButton);

    expect(
      screen.getByText(/Are you sure want to clear topic messages?/i)
    ).toBeInTheDocument();
  });

  it('shows a confirmation popup on recreating topic', () => {
    renderComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);
    expect(
      screen.getByText(/Are you sure want to recreate topic?/i)
    ).toBeInTheDocument();
  });

  it('calling recreation function after click on Submit button', async () => {
    renderComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });

    await waitFor(() => userEvent.click(confirmBtn));
    expect(mockRecreate).toBeCalledTimes(1);
  });

  it('close popup confirmation window after click on Cancel button', () => {
    renderComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    userEvent.click(cancelBtn);
    expect(
      screen.queryByText(/Are you sure want to recreate topic?/i)
    ).not.toBeInTheDocument();
  });
});
