import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterKsqlDbTablesPath } from 'lib/paths';
import KsqlDbItem, {
  KsqlDbItemProps,
  KsqlDbItemType,
} from 'components/KsqlDb/List/KsqlDbItem/KsqlDbItem';
import { screen } from '@testing-library/dom';
import { fetchKsqlDbTablesPayload } from 'redux/reducers/ksqlDb/__test__/fixtures';

describe('KsqlDbItem', () => {
  const tablesPathname = clusterKsqlDbTablesPath();
  const renderComponent = (props: Partial<KsqlDbItemProps> = {}) => {
    render(
      <WithRoute path={tablesPathname}>
        <KsqlDbItem
          type={KsqlDbItemType.Tables}
          fetching={false}
          rows={{ tables: [], streams: [] }}
          {...props}
        />
      </WithRoute>,
      {
        initialEntries: [clusterKsqlDbTablesPath()],
      }
    );
  };

  it('renders progressbar when fetching tables and streams', () => {
    renderComponent({ fetching: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('show no text if no data found', () => {
    renderComponent({});
    expect(screen.getByText('No tables or streams found')).toBeInTheDocument();
  });

  it('renders with tables', () => {
    renderComponent({
      rows: {
        tables: fetchKsqlDbTablesPayload.tables,
        streams: [],
      },
    });

    expect(screen.getByRole('table').querySelectorAll('td')).toHaveLength(10);
  });
  it('renders with streams', () => {
    renderComponent({
      type: KsqlDbItemType.Streams,
      rows: {
        tables: [],
        streams: fetchKsqlDbTablesPayload.streams,
      },
    });
    expect(screen.getByRole('table').querySelectorAll('td')).toHaveLength(10);
  });
});
