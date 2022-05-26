import React from 'react';
import List from 'components/KsqlDb/List/List';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { clusterKsqlDbPath } from 'lib/paths';
import { render } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { screen, waitForElementToBeRemoved } from '@testing-library/dom';

const history = createMemoryHistory();
const clusterName = 'local';

const renderComponent = () => {
  history.push(clusterKsqlDbPath(clusterName));
  render(
    <Router history={history}>
      <Route path={clusterKsqlDbPath(':clusterName')}>
        <List />
      </Route>
    </Router>
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
