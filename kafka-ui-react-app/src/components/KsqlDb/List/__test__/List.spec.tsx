import React from 'react';
import List from 'components/KsqlDb/List/List';
import { render, WithRoute } from 'lib/testHelpers';
import fetchMock from 'fetch-mock';
import { screen } from '@testing-library/dom';

const clusterName = 'local';

const renderComponent = () => {
  render(
    <WithRoute path="/*">
      <List />
    </WithRoute>,
    { initialEntries: ['/*'] }
  );
};

describe('KsqlDb List', () => {
  afterEach(() => fetchMock.reset());
  it('renders zeros if no data received for tables and streams', async () => {
    fetchMock.post(
      {
        url: `/api/clusters/${clusterName}/ksql`,
      },
      { data: [] }
    );
    renderComponent();

    const StreamsSpan = screen
      .getByTitle('Streams')
      .querySelector('span') as HTMLSpanElement;
    const TablesSpan = screen
      .getByTitle('Tables')
      .querySelector('span') as HTMLSpanElement;

    expect(StreamsSpan).toHaveTextContent('0');
    expect(TablesSpan).toHaveTextContent('0');
  });
});
