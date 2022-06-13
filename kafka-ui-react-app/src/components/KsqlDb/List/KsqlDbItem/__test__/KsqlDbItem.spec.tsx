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

  const component = (props: Partial<KsqlDbItemProps> = {}) => (
    <WithRoute path={tablesPathname}>
      <KsqlDbItem
        type={KsqlDbItemType.Tables}
        fetching={false}
        rows={{ tables: [], streams: [] }}
        {...props}
      />
    </WithRoute>
  );

  it('renders progressbar when fetching tables and streams', () => {
    render(component({ fetching: true }), {
      initialEntries: [clusterKsqlDbTablesPath()],
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  it('show no text if no data found', () => {
    render(component({}), {
      initialEntries: [clusterKsqlDbTablesPath()],
    });
    expect(screen.getByText('No tables or streams found')).toBeInTheDocument();
  });
  it('renders with tables', () => {
    render(
      component({
        rows: {
          tables: fetchKsqlDbTablesPayload.tables,
          streams: [],
        },
      }),
      {
        initialEntries: [clusterKsqlDbTablesPath()],
      }
    );
    expect(screen.getByRole('table').querySelectorAll('td')).toHaveLength(10);
  });
  it('renders with streams', () => {
    render(
      component({
        type: KsqlDbItemType.Streams,
        rows: {
          tables: [],
          streams: fetchKsqlDbTablesPayload.streams,
        },
      }),
      {
        initialEntries: [clusterKsqlDbTablesPath()],
      }
    );
    expect(screen.getByRole('table').querySelectorAll('td')).toHaveLength(10);
  });
});
