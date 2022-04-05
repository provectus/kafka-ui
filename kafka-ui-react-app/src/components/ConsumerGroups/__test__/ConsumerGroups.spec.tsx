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
import { Route } from 'react-router';
import { ConsumerGroupOrdering, SortOrder } from 'generated-sources';

const clusterName = 'cluster1';

const renderComponent = () =>
  render(
    <Route path={clusterConsumerGroupsPath(':clusterName')}>
      <ConsumerGroups />
    </Route>,
    {
      pathname: clusterConsumerGroupsPath(clusterName),
    }
  );

describe('ConsumerGroup', () => {
  it('renders with initial state', async () => {
    renderComponent();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  describe('Fetching Mock', () => {
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
    });
  });
});
