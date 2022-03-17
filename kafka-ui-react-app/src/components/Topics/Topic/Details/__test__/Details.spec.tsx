import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterContext from 'components/contexts/ClusterContext';
import Details from 'components/Topics/Topic/Details/Details';
import { internalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import { render } from 'lib/testHelpers';
import { clusterTopicPath } from 'lib/paths';

describe('Details', () => {
  const mockDelete = jest.fn();
  const mockClusterName = 'local';
  const mockClearTopicMessages = jest.fn();
  const mockInternalTopicPayload = internalTopicPayload.internal;
  const mockRecreateTopic = jest.fn();

  const setupComponent = (pathname: string) =>
    render(
      <ClusterContext.Provider
        value={{
          isReadOnly: false,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed: true,
        }}
      >
        <Details
          clusterName={mockClusterName}
          topicName={internalTopicPayload.name}
          name={internalTopicPayload.name}
          isInternal={false}
          deleteTopic={mockDelete}
          recreateTopic={mockRecreateTopic}
          clearTopicMessages={mockClearTopicMessages}
          isDeleted={false}
          isDeletePolicy
        />
      </ClusterContext.Provider>,
      { pathname }
    );

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
            clusterName={mockClusterName}
            topicName={internalTopicPayload.name}
            name={internalTopicPayload.name}
            isInternal={mockInternalTopicPayload}
            deleteTopic={mockDelete}
            recreateTopic={mockRecreateTopic}
            clearTopicMessages={mockClearTopicMessages}
            isDeleted={false}
            isDeletePolicy
          />
        </ClusterContext.Provider>
      );

      expect(screen.queryByText('Produce Message')).not.toBeInTheDocument();
    });
  });

  it('shows a confirmation popup on deleting topic messages', () => {
    setupComponent(
      clusterTopicPath(mockClusterName, internalTopicPayload.name)
    );
    const { getByText } = screen;
    const clearMessagesButton = getByText(/Clear messages/i);
    userEvent.click(clearMessagesButton);

    expect(
      getByText(/Are you sure want to clear topic messages?/i)
    ).toBeInTheDocument();
  });

  it('shows a confirmation popup on recreating topic', () => {
    setupComponent(
      clusterTopicPath(mockClusterName, internalTopicPayload.name)
    );
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);

    expect(
      screen.getByText(/Are you sure want to recreate topic?/i)
    ).toBeInTheDocument();
  });

  it('calling recreation function after click on Submit button', () => {
    setupComponent(
      clusterTopicPath(mockClusterName, internalTopicPayload.name)
    );
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);
    const confirmBtn = screen.getByRole('button', { name: /submit/i });
    userEvent.click(confirmBtn);
    expect(mockRecreateTopic).toBeCalledTimes(1);
  });

  it('close popup confirmation window after click on Cancel button', () => {
    setupComponent(
      clusterTopicPath(mockClusterName, internalTopicPayload.name)
    );
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    userEvent.click(recreateTopicButton);
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    userEvent.click(cancelBtn);
    expect(
      screen.queryByText(/Are you sure want to recreate topic?/i)
    ).not.toBeInTheDocument();
  });
});
