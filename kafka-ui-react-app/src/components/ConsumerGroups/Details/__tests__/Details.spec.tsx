import Details from 'components/ConsumerGroups/Details/Details';
import React from 'react';
import fetchMock from 'fetch-mock';
import { render, WithRoute } from 'lib/testHelpers';
import {
  clusterConsumerGroupDetailsPath,
  clusterConsumerGroupResetRelativePath,
} from 'lib/paths';
import { consumerGroupPayload } from 'redux/reducers/consumerGroups/__test__/fixtures';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

const clusterName = 'cluster1';
const { groupId } = consumerGroupPayload;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderComponent = () => {
  render(
    <WithRoute path={clusterConsumerGroupDetailsPath()}>
      <Details />
    </WithRoute>,
    { initialEntries: [clusterConsumerGroupDetailsPath(clusterName, groupId)] }
  );
};
describe('Details component', () => {
  afterEach(() => {
    fetchMock.reset();
    mockNavigate.mockClear();
  });

  describe('when consumer groups are NOT fetched', () => {
    it('renders progress bar for initial state', () => {
      fetchMock.getOnce(
        `/api/clusters/${clusterName}/consumer-groups/${groupId}`,
        404
      );
      renderComponent();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('when consumer gruops are fetched', () => {
    beforeEach(async () => {
      const fetchConsumerGroupMock = fetchMock.getOnce(
        `/api/clusters/${clusterName}/consumer-groups/${groupId}`,
        consumerGroupPayload
      );
      renderComponent();
      await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));
      await waitFor(() => expect(fetchConsumerGroupMock.called()).toBeTruthy());
    });

    it('renders component', () => {
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText(groupId)).toBeInTheDocument();

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader').length).toEqual(3);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles [Reset offset] click', async () => {
      await userEvent.click(screen.getByText('Reset offset'));
      expect(mockNavigate).toHaveBeenLastCalledWith(
        clusterConsumerGroupResetRelativePath
      );
    });

    it('renders search input', async () => {
      await renderComponent();
      expect(
        screen.getByPlaceholderText('Search by Topic Name')
      ).toBeInTheDocument();
    });

    it('shows confirmation modal on consumer group delete', async () => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await userEvent.click(screen.getByText('Delete consumer group'));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).toBeInTheDocument()
      );
      await userEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles [Delete consumer group] click', async () => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      await userEvent.click(screen.getByText('Delete consumer group'));

      expect(screen.queryByRole('dialog')).toBeInTheDocument();
      const deleteConsumerGroupMock = fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/consumer-groups/${groupId}`,
        200
      );
      await waitFor(() => {
        userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      });
      expect(deleteConsumerGroupMock.called()).toBeTruthy();

      await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
      await waitFor(() => expect(mockNavigate).toHaveBeenLastCalledWith('../'));
    });
  });
});
