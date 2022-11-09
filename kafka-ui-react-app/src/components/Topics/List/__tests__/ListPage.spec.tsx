import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import ClusterContext from 'components/contexts/ClusterContext';
import userEvent from '@testing-library/user-event';
import { clusterTopicsPath } from 'lib/paths';
import ListPage from 'components/Topics/List/ListPage';
import { usePermission } from 'lib/hooks/usePermission';

const clusterName = 'test-cluster';

jest.mock('components/Topics/List/TopicTable', () => () => <>TopicTableMock</>);

jest.mock('lib/hooks/usePermission', () => ({
  usePermission: jest.fn(),
}));

describe('ListPage Component', () => {
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
          <ListPage />
        </WithRoute>
      </ClusterContext.Provider>,
      { initialEntries: [clusterTopicsPath(clusterName)] }
    );
  };

  describe('Component Render', () => {
    beforeEach(() => {
      renderComponent();
    });
    it('handles switch of Internal Topics visibility', async () => {
      const switchInput = screen.getByLabelText('Show Internal Topics');
      expect(switchInput).toBeInTheDocument();

      expect(global.localStorage.getItem('hideInternalTopics')).toBeNull();
      await userEvent.click(switchInput);
      expect(global.localStorage.getItem('hideInternalTopics')).toBeTruthy();
      await userEvent.click(switchInput);
      expect(global.localStorage.getItem('hideInternalTopics')).toBeNull();
    });

    it('renders the TopicsTable', () => {
      expect(screen.getByText('TopicTableMock')).toBeInTheDocument();
    });
  });

  describe('Permissions', () => {
    it('checks the add Topic button is disable when there is not permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => false);
      renderComponent();
      expect(screen.getByText(/Add a Topic/i)).toBeDisabled();
    });

    it('checks the add Topic button is enable when there is permission', () => {
      (usePermission as jest.Mock).mockImplementation(() => true);
      renderComponent();
      expect(screen.getByText(/Add a Topic/i)).toBeEnabled();
    });
  });
});
