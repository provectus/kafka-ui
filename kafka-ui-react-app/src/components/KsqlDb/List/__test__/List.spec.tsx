import React from 'react';
import List from 'components/KsqlDb/List/List';
import { clusterKsqlDbPath } from 'lib/paths';
import { render, WithRoute } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { screen, waitForElementToBeRemoved } from '@testing-library/dom';

const clusterName = 'local';

const renderComponent = () => {
  render(
    <WithRoute path={clusterKsqlDbPath()}>
      <List />
    </WithRoute>,
    { initialEntries: [clusterKsqlDbPath(clusterName)] }
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
