import React from 'react';
import { clusterConsumerGroupsPath } from 'lib/paths';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import ConsumerGroups from 'components/ConsumerGroups/ConsumerGroups';
import {
  consumerGroups,
  noConsumerGroupsResponse,
} from 'redux/reducers/consumerGroups/__test__/fixtures';
import { render } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { Route, Router } from 'react-router';
import { ConsumerGroupOrdering, SortOrder } from 'generated-sources';
import { createMemoryHistory } from 'history';

const clusterName = 'cluster1';

const historyMock = createMemoryHistory({
  initialEntries: [clusterConsumerGroupsPath(clusterName)],
});

const renderComponent = (history = historyMock) =>
  render(
    <Router history={history}>
      <Route path={clusterConsumerGroupsPath(':clusterName')}>
        <ConsumerGroups />
      </Route>
    </Router>,
    {
      pathname: clusterConsumerGroupsPath(clusterName),
    }
  );

describe('ConsumerGroups', () => {
  it('renders with initial state', async () => {
    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  describe('Default Route and Fetching Consumer Groups', () => {
    const url = `/api/clusters/${clusterName}/consumer-groups/paged`;
    afterEach(() => {
      fetchMock.reset();
    });

    it('renders empty table on no consumer group response', async () => {
      fetchMock.getOnce(url, noConsumerGroupsResponse, {
        query: {
          orderBy: ConsumerGroupOrdering.NAME,
          sortOrder: SortOrder.ASC,
        },
      });

      renderComponent();
      await waitFor(() => expect(fetchMock.calls().length).toBe(1));

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('No active consumer groups')).toBeInTheDocument();
    });

    it('renders with 404 from consumer groups', async () => {
      const consumerGroupsMock = fetchMock.getOnce(url, 404, {
        query: {
          orderBy: ConsumerGroupOrdering.NAME,
          sortOrder: SortOrder.ASC,
        },
      });

      renderComponent();

      await waitFor(() => expect(consumerGroupsMock.called()).toBeTruthy());

      expect(screen.queryByText('Consumers')).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('renders with 200 from consumer groups', async () => {
      const consumerGroupsMock = fetchMock.getOnce(
        url,
        {
          pagedCount: 1,
          consumerGroups,
        },
        {
          query: {
            orderBy: ConsumerGroupOrdering.NAME,
            sortOrder: SortOrder.ASC,
          },
        }
      );

      renderComponent();

      await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));
      await waitFor(() => expect(consumerGroupsMock.called()).toBeTruthy());

      expect(screen.getByText('Consumers')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText(consumerGroups[0].groupId)).toBeInTheDocument();
      expect(screen.getByText(consumerGroups[1].groupId)).toBeInTheDocument();
    });

    it('renders with 200 from consumer groups with Searched Query ', async () => {
      const searchResult = consumerGroups[0];
      const searchText = searchResult.groupId;

      const consumerGroupsMock = fetchMock.getOnce(
        url,
        {
          pagedCount: 1,
          consumerGroups: [searchResult],
        },
        {
          query: {
            orderBy: ConsumerGroupOrdering.NAME,
            sortOrder: SortOrder.ASC,
            search: searchText,
          },
        }
      );

      const mockedHistory = createMemoryHistory({
        initialEntries: [
          `${clusterConsumerGroupsPath(clusterName)}?q=${searchText}`,
        ],
      });
      renderComponent(mockedHistory);

      await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));
      await waitFor(() => expect(consumerGroupsMock.called()).toBeTruthy());

      expect(screen.getByText(searchText)).toBeInTheDocument();
      expect(
        screen.queryByText(consumerGroups[1].groupId)
      ).not.toBeInTheDocument();
    });
  });
});
