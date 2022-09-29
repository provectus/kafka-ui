import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterContext from 'components/contexts/ClusterContext';
import Details from 'components/Topics/Topic/Topic';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterTopicConsumerGroupsPath,
  clusterTopicEditRelativePath,
  clusterTopicMessagesPath,
  clusterTopicPath,
  clusterTopicSettingsPath,
  clusterTopicStatisticsPath,
  getNonExactPath,
} from 'lib/paths';
import { CleanUpPolicy, Topic } from 'generated-sources';
import { externalTopicPayload } from 'lib/fixtures/topics';
import {
  useDeleteTopic,
  useRecreateTopic,
  useTopicDetails,
} from 'lib/hooks/api/topics';
import theme from 'theme/theme';

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

jest.mock('components/Topics/Topic/Overview/Overview', () => () => (
  <>OverviewMock</>
));
jest.mock('components/Topics/Topic/Messages/Messages', () => () => (
  <>MessagesMock</>
));
jest.mock('components/Topics/Topic/SendMessage/SendMessage', () => () => (
  <>SendMessageMock</>
));
jest.mock('components/Topics/Topic/Settings/Settings', () => () => (
  <>SettingsMock</>
));
jest.mock(
  'components/Topics/Topic/ConsumerGroups/TopicConsumerGroups',
  () => () => <>ConsumerGroupsMock</>
);
jest.mock('components/Topics/Topic/Statistics/Statistics', () => () => (
  <>StatisticsMock</>
));

const mockDelete = jest.fn();
const mockRecreate = jest.fn();
const mockClusterName = 'local';
const topic: Topic = {
  ...externalTopicPayload,
  underReplicatedPartitions: 0,
  inSyncReplicas: 1,
  replicas: 2,
  cleanUpPolicy: CleanUpPolicy.DELETE,
};
const defaultPath = clusterTopicPath(mockClusterName, topic.name);

describe('Details', () => {
  const renderComponent = (isReadOnly = false, path = defaultPath) => {
    render(
      <ClusterContext.Provider
        value={{
          isReadOnly,
          hasKafkaConnectConfigured: true,
          hasSchemaRegistryConfigured: true,
          isTopicDeletionAllowed: true,
        }}
      >
        <WithRoute path={getNonExactPath(clusterTopicPath())}>
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
  describe('Action Bar', () => {
    describe('when it has readonly flag', () => {
      it('renders disabled the Action button', () => {
        renderComponent(true);
        expect(
          screen.getByRole('button', { name: 'Produce Message' })
        ).toBeDisabled();
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
      const submitDeleteButton = screen.getByRole('button', {
        name: 'Confirm',
      });
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

    it('is calling recreation function after click on Submit button', async () => {
      renderComponent();
      const recreateTopicButton = screen.getByText(/Recreate topic/i);
      userEvent.click(recreateTopicButton);
      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });

      await waitFor(() => userEvent.click(confirmBtn));
      expect(mockRecreate).toBeCalledTimes(1);
    });

    it('closes popup confirmation window after click on Cancel button', () => {
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

  describe('should render circular alert', () => {
    it('should be in document', () => {
      renderComponent();
      const circles = screen.getAllByRole('circle');
      expect(circles.length).toEqual(2);
    });

    it('should be the appropriate color', () => {
      renderComponent();
      const circles = screen.getAllByRole('circle');

      expect(circles[0]).toHaveStyle(
        `fill: ${theme.circularAlert.color.success}`
      );
      expect(circles[1]).toHaveStyle(
        `fill: ${theme.circularAlert.color.error}`
      );
    });
  });

  describe('Internal routing', () => {
    const itExpectsCorrectPageRendered = (
      path: string,
      tab: string,
      selector: string
    ) => {
      renderComponent(false, path);
      expect(screen.getByText(tab)).toHaveClass('is-active');
      expect(screen.getByText(selector)).toBeInTheDocument();
    };

    it('renders Overview tab by default', () => {
      itExpectsCorrectPageRendered(defaultPath, 'Overview', 'OverviewMock');
    });
    it('renders Messages tabs', () => {
      itExpectsCorrectPageRendered(
        clusterTopicMessagesPath(),
        'Messages',
        'MessagesMock'
      );
    });
    it('renders Consumers tab', () => {
      itExpectsCorrectPageRendered(
        clusterTopicConsumerGroupsPath(),
        'Consumers',
        'ConsumerGroupsMock'
      );
    });
    it('renders Settings tab', () => {
      itExpectsCorrectPageRendered(
        clusterTopicSettingsPath(),
        'Settings',
        'SettingsMock'
      );
    });
    it('renders Statistics tab', () => {
      itExpectsCorrectPageRendered(
        clusterTopicStatisticsPath(),
        'Statistics',
        'StatisticsMock'
      );
    });
  });
});
