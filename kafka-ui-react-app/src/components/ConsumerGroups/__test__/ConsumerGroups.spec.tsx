import React from 'react';
import { clusterConsumerGroupsPath, getNonExactPath } from 'lib/paths';
import {
  act,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import ConsumerGroups from 'components/ConsumerGroups/ConsumerGroups';
import {
  consumerGroups,
  noConsumerGroupsResponse,
} from 'redux/reducers/consumerGroups/__test__/fixtures';
import { render, WithRoute } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { ConsumerGroupOrdering, SortOrder } from 'generated-sources';

const clusterName = 'cluster1';

const renderComponent = (path?: string) =>
  render(
    <WithRoute path={getNonExactPath(clusterConsumerGroupsPath())}>
      <ConsumerGroups />
    </WithRoute>,
    {
      initialEntries: [path || clusterConsumerGroupsPath(clusterName)],
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
      await act(() => {
        renderComponent();
      });
      expect(fetchMock.calls().length).toBe(1);
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

      renderComponent(
        `${clusterConsumerGroupsPath(clusterName)}?q=${searchText}`
      );

      await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));
      await waitFor(() => expect(consumerGroupsMock.called()).toBeTruthy());

      expect(screen.getByText(searchText)).toBeInTheDocument();
      expect(
        screen.queryByText(consumerGroups[1].groupId)
      ).not.toBeInTheDocument();
    });
  });
});
