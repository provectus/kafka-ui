import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterContext from 'components/contexts/ClusterContext';
import Details from 'components/Topics/Topic/Details/Details';
import {
  getTopicStateFixtures,
  internalTopicPayload,
} from 'redux/reducers/topics/__test__/fixtures';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterTopicEditRelativePath, clusterTopicPath } from 'lib/paths';
import { CleanUpPolicy, Topic } from 'generated-sources';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Details', () => {
  const mockDelete = jest.fn();
  const mockClusterName = 'local';
  const mockClearTopicMessages = jest.fn();
  const mockRecreateTopic = jest.fn();

  const topic: Topic = {
    ...internalTopicPayload,
    cleanUpPolicy: CleanUpPolicy.DELETE,
    internal: false,
  };

  const mockTopicsState = getTopicStateFixtures([topic]);

  const setupComponent = (props = {}) =>
    render(
      <ClusterContext.Provider
        value={{
          isReadOnly: false,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed: true,
        }}
      >
        <WithRoute path={clusterTopicPath()}>
          <Details
            deleteTopic={mockDelete}
            recreateTopic={mockRecreateTopic}
            clearTopicMessages={mockClearTopicMessages}
            isDeleted={false}
            {...props}
          />
        </WithRoute>
      </ClusterContext.Provider>,
      {
        initialEntries: [
          clusterTopicPath(mockClusterName, internalTopicPayload.name),
        ],
        preloadedState: {
          topics: mockTopicsState,
        },
      }
    );

  afterEach(() => {
    mockNavigate.mockClear();
    mockDelete.mockClear();
    mockClearTopicMessages.mockClear();
    mockRecreateTopic.mockClear();
  });

  describe('when it has readonly flag', () => {
    it('does not render the Action button a Topic', () => {
      render(
        <ClusterContext.Provider
          value={{
            isReadOnly: true,
            hasKafkaConnectConfigured: true,
            hasSchemaRegistryConfigured: true,
            isTopicDeletionAllowed: true,
          }}
        >
          <Details
            deleteTopic={mockDelete}
            recreateTopic={mockRecreateTopic}
            clearTopicMessages={mockClearTopicMessages}
            isDeleted={false}
          />
        </ClusterContext.Provider>
      );

      expect(screen.queryByText('Produce Message')).not.toBeInTheDocument();
    });
  });

  describe('when remove topic modal is open', () => {
    beforeEach(() => {
      setupComponent();

      const openModalButton = screen.getAllByText('Remove topic')[0];
      userEvent.click(openModalButton);
    });

    it('calls deleteTopic on confirm', () => {
      const submitButton = screen.getAllByText('Submit')[0];
      userEvent.click(submitButton);

      expect(mockDelete).toHaveBeenCalledWith({
        clusterName: mockClusterName,
        topicName: internalTopicPayload.name,
      });
    });

    it('closes the modal when cancel button is clicked', () => {
      const cancelButton = screen.getAllByText('Cancel')[0];
      userEvent.click(cancelButton);

      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when clear messages modal is open', () => {
    beforeEach(() => {
      setupComponent();

      const confirmButton = screen.getAllByText('Clear messages')[0];
      userEvent.click(confirmButton);
    });

    it('it calls clearTopicMessages on confirm', () => {
      const submitButton = screen.getAllByText('Submit')[0];
      userEvent.click(submitButton);

      expect(mockClearTopicMessages).toHaveBeenCalledWith({
        clusterName: mockClusterName,
        topicName: internalTopicPayload.name,
      });
    });

    it('closes the modal when cancel button is clicked', () => {
      const cancelButton = screen.getAllByText('Cancel')[0];
      userEvent.click(cancelButton);

      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when edit settings is clicked', () => {
    it('redirects to the edit page', () => {
      setupComponent();

      const button = screen.getAllByText('Edit settings')[0];
      userEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith(clusterTopicEditRelativePath);
    });
  });

  it('redirects to the correct route if topic is deleted', () => {
    setupComponent({ isDeleted: true });

    expect(mockNavigate).toHaveBeenCalledWith('../..');
  });

  it('shows a confirmation popup on deleting topic messages', () => {
    setupComponent();
    const clearMessagesButton = screen.getAllByText(/Clear messages/i)[0];
    userEvent.click(clearMessagesButton);

    expect(
      screen.getByText(/Are you sure want to clear topic messages?/i)
    ).toBeInTheDocument();
  });

  it('shows a confirmation popup on recreating topic', () => {
    setupComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);

    expect(
      screen.getByText(/Are you sure want to recreate topic?/i)
    ).toBeInTheDocument();
  });

  it('calling recreation function after click on Submit button', () => {
    setupComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);
    const confirmBtn = screen.getByRole('button', { name: /submit/i });
    userEvent.click(confirmBtn);
    expect(mockRecreateTopic).toBeCalledTimes(1);
  });

  it('close popup confirmation window after click on Cancel button', () => {
    setupComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    userEvent.click(cancelBtn);
    expect(
      screen.queryByText(/Are you sure want to recreate topic?/i)
    ).not.toBeInTheDocument();
  });
});
