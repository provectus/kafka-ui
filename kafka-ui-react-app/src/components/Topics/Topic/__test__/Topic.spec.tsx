import React from 'react';
import { screen, waitFor } from '@testing-library/react';
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
import { usePermission } from 'lib/hooks/usePermission';
import { getDefaultActionMessage } from 'components/common/ActionComponent/ActionComponent';

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

jest.mock('lib/hooks/usePermission', () => ({
  usePermission: jest.fn(),
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
    (usePermission as jest.Mock).mockImplementation(() => true);
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
      beforeEach(async () => {
        renderComponent();
        const openModalButton = screen.getAllByText('Remove Topic')[0];
        await userEvent.click(openModalButton);
      });

      it('calls deleteTopic on confirm', async () => {
        const submitButton = screen.getAllByRole('button', {
          name: 'Confirm',
        })[0];
        await userEvent.click(submitButton);
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
        await userEvent.click(confirmButton);
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
      it('redirects to the edit page', async () => {
        renderComponent();
        const button = screen.getAllByText('Edit settings')[0];
        await userEvent.click(button);
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
      await userEvent.click(submitDeleteButton);
      expect(mockNavigate).toHaveBeenCalledWith('../..');
    });

    it('shows a confirmation popup on deleting topic messages', async () => {
      renderComponent();
      const clearMessagesButton = screen.getAllByText(/Clear messages/i)[0];
      await userEvent.click(clearMessagesButton);

      expect(
        screen.getByText(/Are you sure want to clear topic messages?/i)
      ).toBeInTheDocument();
    });

    it('shows a confirmation popup on recreating topic', async () => {
      renderComponent();
      const recreateTopicButton = screen.getByText(/Recreate topic/i);
      await userEvent.click(recreateTopicButton);
      expect(
        screen.getByText(/Are you sure want to recreate topic?/i)
      ).toBeInTheDocument();
    });

    it('is calling recreation function after click on Submit button', async () => {
      renderComponent();
      const recreateTopicButton = screen.getByText(/Recreate topic/i);
      await userEvent.click(recreateTopicButton);
      const confirmBtn = screen.getByRole('button', { name: /Confirm/i });

      await waitFor(() => userEvent.click(confirmBtn));
      expect(mockRecreate).toBeCalledTimes(1);
    });

    it('closes popup confirmation window after click on Cancel button', async () => {
      renderComponent();
      const recreateTopicButton = screen.getByText(/Recreate topic/i);
      await userEvent.click(recreateTopicButton);
      const cancelBtn = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelBtn);
      expect(
        screen.queryByText(/Are you sure want to recreate topic?/i)
      ).not.toBeInTheDocument();
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

  describe('Permissions', () => {
    it('checks the create Schema button is disable when there is not permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => false);
      renderComponent();
      expect(
        screen.getByRole('button', {
          name: /Produce Message/i,
        })
      ).toBeDisabled();
    });

    it('checks the add Schema button is enable when there is permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => true);
      renderComponent();
      expect(
        screen.getByRole('button', {
          name: /Produce Message/i,
        })
      ).toBeEnabled();
    });

    it('checks the Edit messages show the tooltip when there is no permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => false);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Edit settings/i);

      await userEvent.hover(dropItem);

      expect(screen.getByText(getDefaultActionMessage())).toBeInTheDocument();
    });

    it('checks the Edit messages does not show the tooltip when there is permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => true);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Edit settings/i);

      await userEvent.hover(dropItem);

      expect(
        screen.queryByText(getDefaultActionMessage())
      ).not.toBeInTheDocument();
    });

    it('checks the Clear messages show the tooltip when there is no permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => false);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Clear messages/i);

      await userEvent.hover(dropItem);

      expect(screen.getByText(getDefaultActionMessage())).toBeInTheDocument();
    });

    it('checks the Clear messages does not show the tooltip when there is permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => true);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Clear messages/i);

      await userEvent.hover(dropItem);

      expect(
        screen.queryByText(getDefaultActionMessage())
      ).not.toBeInTheDocument();
    });

    it('checks the Remove Topic show the tooltip when there is no permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => false);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Remove Topic/i);

      await userEvent.hover(dropItem);

      expect(screen.getByText(getDefaultActionMessage())).toBeInTheDocument();
    });

    it('checks the Remove Topic does not show the tooltip when there is permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => true);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Remove Topic/i);

      await userEvent.hover(dropItem);

      expect(
        screen.queryByText(getDefaultActionMessage())
      ).not.toBeInTheDocument();
    });

    it('checks the Recreate Topic show the tooltip when there is no permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => false);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Recreate Topic/i);

      await userEvent.hover(dropItem);

      expect(screen.getByText(getDefaultActionMessage())).toBeInTheDocument();
    });

    it('checks the Recreate Topic does not show the tooltip when there is permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => true);

      renderComponent();

      const dropdown = screen.getByRole('button', {
        name: 'Dropdown Toggle',
      });

      await userEvent.click(dropdown);

      const dropItem = screen.getByText(/Recreate Topic/i);

      await userEvent.hover(dropItem);

      expect(
        screen.queryByText(getDefaultActionMessage())
      ).not.toBeInTheDocument();
    });

    it('checks the Messages NavLink does not show the tooltip when there is no permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => false);

      renderComponent();

      await userEvent.hover(
        screen.getByRole('link', {
          name: 'Messages',
        })
      );

      expect(screen.getByText(getDefaultActionMessage())).toBeInTheDocument();
    });

    it('checks the Messages NavLink show the tooltip when there is permission', async () => {
      (usePermission as jest.Mock).mockImplementation(() => true);

      renderComponent();

      await userEvent.hover(
        screen.getByRole('link', {
          name: 'Messages',
        })
      );

      expect(
        screen.queryByText(getDefaultActionMessage())
      ).not.toBeInTheDocument();
    });
  });
});
