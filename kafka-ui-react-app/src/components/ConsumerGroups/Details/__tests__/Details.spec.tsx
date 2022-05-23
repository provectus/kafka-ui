import Details from 'components/ConsumerGroups/Details/Details';
import React from 'react';
import fetchMock from 'fetch-mock';
import { createMemoryHistory } from 'history';
import { render } from 'lib/testHelpers';
import { Route, Router } from 'react-router-dom';
import {
  clusterConsumerGroupDetailsPath,
  clusterConsumerGroupResetOffsetsPath,
  clusterConsumerGroupsPath,
} from 'lib/paths';
import { consumerGroupPayload } from 'redux/reducers/consumerGroups/__test__/fixtures';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';

const clusterName = 'cluster1';
const { groupId } = consumerGroupPayload;
const history = createMemoryHistory();

const renderComponent = () => {
  history.push(clusterConsumerGroupDetailsPath(clusterName, groupId));
  render(
    <Router history={history}>
      <Route
        path={clusterConsumerGroupDetailsPath(
          ':clusterName',
          ':consumerGroupID'
        )}
      >
        <Details />
      </Route>
    </Router>
  );
};
describe('Details component', () => {
  afterEach(() => {
    fetchMock.reset();
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
      expect(screen.getAllByRole('columnheader').length).toEqual(2);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles [Reset offset] click', async () => {
      userEvent.click(screen.getByText('Reset offset'));
      expect(history.location.pathname).toEqual(
        clusterConsumerGroupResetOffsetsPath(clusterName, groupId)
      );
    });

    it('shows confirmation modal on consumer group delete', async () => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      userEvent.click(screen.getByText('Delete consumer group'));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).toBeInTheDocument()
      );
      userEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('handles [Delete consumer group] click', async () => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await act(() => {
        userEvent.click(screen.getByText('Delete consumer group'));
      });
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
      const deleteConsumerGroupMock = fetchMock.deleteOnce(
        `/api/clusters/${clusterName}/consumer-groups/${groupId}`,
        200
      );
      await act(() => {
        userEvent.click(screen.getByText('Submit'));
      });
      expect(deleteConsumerGroupMock.called()).toBeTruthy();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(history.location.pathname).toEqual(
        clusterConsumerGroupsPath(clusterName)
      );
    });
  });
});
