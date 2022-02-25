import React from 'react';
import List from 'components/ConsumerGroups/List/List';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { Route, Router } from 'react-router-dom';
import { clusterConsumerGroupsPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { ConsumerGroupOrdering, SortOrder } from 'generated-sources';
import { createMemoryHistory } from 'history';

import {
  noConsumerGroupsResponse,
  searchComnsumerGroupsResponse,
  someComnsumerGroupsResponse,
} from './fixtures';

const clusterName = 'testClusterName';
const consumerGroupsAPIUrl = `/api/clusters/${clusterName}/consumer-groups/paged`;
const historyMock = createMemoryHistory({
  initialEntries: [clusterConsumerGroupsPath(clusterName)],
});

const renderComponent = (history = historyMock) =>
  render(
    <Router history={history}>
      <Route path={clusterConsumerGroupsPath(':clusterName')}>
        <List />
      </Route>
    </Router>
  );

describe('List', () => {
  afterEach(() => {
    fetchMock.reset();
  });

  describe('fetch error', () => {
    it('renders empty table on fetch error', async () => {
      fetchMock.getOnce(consumerGroupsAPIUrl, 404, {
        query: {
          orderBy: ConsumerGroupOrdering.NAME,
          sortOrder: SortOrder.ASC,
        },
      });
      renderComponent();
      await waitFor(() => expect(fetchMock.calls().length).toBe(1));

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('fetch success', () => {
    it('renders empty table on no consumer group response', async () => {
      fetchMock.getOnce(consumerGroupsAPIUrl, noConsumerGroupsResponse, {
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

    it('renders all rows with consumers', async () => {
      fetchMock.getOnce(consumerGroupsAPIUrl, someComnsumerGroupsResponse, {
        query: {
          orderBy: ConsumerGroupOrdering.NAME,
          sortOrder: SortOrder.ASC,
        },
      });

      renderComponent();
      await waitFor(() => expect(fetchMock.calls().length).toBe(1));

      expect(
        screen.getByRole('heading', { name: 'Consumers' })
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Search by Consumer Group ID')
      ).toBeInTheDocument();

      expect(
        screen.getByRole('columnheader', { name: 'Consumer Group ID' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Num Of Members' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Num Of Topics' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Messages Behind' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Coordinator' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'State' })
      ).toBeInTheDocument();

      expect(screen.getByText('group1')).toBeInTheDocument();
      expect(screen.getByText('group2')).toBeInTheDocument();

      expect(
        screen.getByRole('navigation', { name: 'pagination' })
      ).toBeInTheDocument();
    });

    it('renders only searched consumers', async () => {
      const searchText = 'group1';
      fetchMock.getOnce(consumerGroupsAPIUrl, searchComnsumerGroupsResponse, {
        query: {
          orderBy: ConsumerGroupOrdering.NAME,
          sortOrder: SortOrder.ASC,
          search: searchText,
        },
      });

      const mockedHistory = createMemoryHistory({
        initialEntries: [
          `${clusterConsumerGroupsPath(clusterName)}?q=${searchText}`,
        ],
      });
      renderComponent(mockedHistory);

      await waitFor(() => expect(fetchMock.calls().length).toBe(1));

      expect(screen.getByText('group1')).toBeInTheDocument();
      expect(screen.queryByText('group2')).not.toBeInTheDocument();
    });
  });
});
