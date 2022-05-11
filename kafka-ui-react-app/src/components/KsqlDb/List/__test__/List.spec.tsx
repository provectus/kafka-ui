import React from 'react';
import List from 'components/KsqlDb/List/List';
import { Route } from 'react-router-dom';
import { clusterKsqlDbPath } from 'lib/paths';
import { render } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { screen, waitForElementToBeRemoved } from '@testing-library/dom';

const clusterName = 'local';

const renderComponent = () => {
  render(
    <Route path={clusterKsqlDbPath(':clusterName')}>
      <List />
    </Route>,
    { pathname: clusterKsqlDbPath(clusterName) }
  );
};

describe('KsqlDb List', () => {
  afterEach(() => fetchMock.reset());
  it('renders placeholder on empty data', async () => {
    fetchMock.post(
      {
        url: `/api/clusters/${clusterName}/ksql`,
      },
      { data: [] }
    );
    renderComponent();
    await waitForElementToBeRemoved(() => screen.getByRole('progressbar'));
    expect(screen.getByText('No tables or streams found')).toBeInTheDocument();
  });
});
