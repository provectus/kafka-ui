import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterContext from 'components/contexts/ClusterContext';
import Details from 'components/Topics/Topic/Details/Details';
import { internalTopicPayload } from 'redux/reducers/topics/__test__/fixtures';
import { render } from 'lib/testHelpers';
import {
  clusterTopicEditPath,
  clusterTopicPath,
  clusterTopicsPath,
} from 'lib/paths';

describe('Details', () => {
  const mockDelete = jest.fn();
  const mockClusterName = 'local';
  const mockClearTopicMessages = jest.fn();
  const mockInternalTopicPayload = internalTopicPayload.internal;
  const mockRecreateTopic = jest.fn();
  const defaultPathname = clusterTopicPath(
    mockClusterName,
    internalTopicPayload.name
  );
  const setupComponent = (pathname = defaultPathname, props = {}) =>
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
          {...props}
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

  describe('when remove topic modal is open', () => {
    beforeEach(async () => {
      setupComponent();
      const openModalButton = screen.getAllByText('Remove topic')[0];
      await waitFor(() => userEvent.click(openModalButton));
    });

    it('calls deleteTopic on confirm', async () => {
      const submitButton = screen.getAllByText('Submit')[0];
      await waitFor(() => userEvent.click(submitButton));
      expect(mockDelete).toHaveBeenCalledWith(
        mockClusterName,
        internalTopicPayload.name
      );
    });

    it('closes the modal when cancel button is clicked', async () => {
      const cancelButton = screen.getAllByText('Cancel')[0];
      await waitFor(() => userEvent.click(cancelButton));
      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when clear messages modal is open', () => {
    beforeEach(async () => {
      setupComponent();
      const confirmButton = screen.getAllByText('Clear messages')[0];
      await waitFor(() => userEvent.click(confirmButton));
    });

    it('it calls clearTopicMessages on confirm', async () => {
      const submitButton = screen.getAllByText('Submit')[0];
      await waitFor(() => userEvent.click(submitButton));
      expect(mockClearTopicMessages).toHaveBeenCalledWith(
        mockClusterName,
        internalTopicPayload.name
      );
    });

    it('closes the modal when cancel button is clicked', async () => {
      const cancelButton = screen.getAllByText('Cancel')[0];
      await waitFor(() => userEvent.click(cancelButton));
      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe('when edit settings is clicked', () => {
    xit('redirects to the edit page', async () => {
      setupComponent();
      const button = screen.getAllByText('Edit settings')[0];
      await waitFor(() => userEvent.click(button));

      const redirectRoute = clusterTopicEditPath(
        mockClusterName,
        internalTopicPayload.name
      );

      expect(mockHistory.push).toHaveBeenCalledWith(redirectRoute);
    });
  });

  xit('redirects to the correct route if topic is deleted', () => {
    setupComponent(defaultPathname, mockHistory, { isDeleted: true });
    const redirectRoute = clusterTopicsPath(mockClusterName);

    expect(mockHistory.push).toHaveBeenCalledWith(redirectRoute);
  });

  it('shows a confirmation popup on deleting topic messages', async () => {
    setupComponent();
    const { getByText } = screen;
    const clearMessagesButton = getByText(/Clear messages/i);
    await waitFor(() => userEvent.click(clearMessagesButton));

    expect(
      getByText(/Are you sure want to clear topic messages?/i)
    ).toBeInTheDocument();
  });

  it('shows a confirmation popup on recreating topic', async () => {
    setupComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    await waitFor(() => userEvent.click(recreateTopicButton));

    expect(
      screen.getByText(/Are you sure want to recreate topic?/i)
    ).toBeInTheDocument();
  });

  it('calling recreation function after click on Submit button', async () => {
    setupComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    await waitFor(() => userEvent.click(recreateTopicButton));
    const confirmBtn = screen.getByRole('button', { name: /submit/i });
    await waitFor(() => userEvent.click(confirmBtn));
    expect(mockRecreateTopic).toBeCalledTimes(1);
  });

  it('close popup confirmation window after click on Cancel button', async () => {
    setupComponent();
    const recreateTopicButton = screen.getByText(/Recreate topic/i);
    await waitFor(() => userEvent.click(recreateTopicButton));
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await waitFor(() => userEvent.click(cancelBtn));
    expect(
      screen.queryByText(/Are you sure want to recreate topic?/i)
    ).not.toBeInTheDocument();
  });
});
