import React from 'react';
import { render, WithRoute } from 'lib/testHelpers';
import { clusterKsqlDbTablesPath } from 'lib/paths';
import KsqlDbItem, {
  KsqlDbItemProps,
  KsqlDbItemType,
} from 'components/KsqlDb/List/KsqlDbItem/KsqlDbItem';
import { screen } from '@testing-library/dom';
import { headers, accessors } from 'components/KsqlDb/List/List';

describe('KsqlDbItem', () => {
  const tablesPathname = clusterKsqlDbTablesPath();

  const component = (props: Partial<KsqlDbItemProps> = {}) => (
    <WithRoute path={tablesPathname}>
      <KsqlDbItem
        headers={headers}
        accessors={accessors}
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
  it('show no tables found text if there are no tables', () => {
    render(component(), {
      initialEntries: [clusterKsqlDbTablesPath()],
    });
    expect(screen.getByText('No tables found')).toBeInTheDocument();
  });
  it('show no streams found text if there are no streams', () => {
    render(
      component({
        type: KsqlDbItemType.Streams,
      }),
      {
        initialEntries: [clusterKsqlDbTablesPath()],
      }
    );
    expect(screen.getByText('No streams found')).toBeInTheDocument();
  });
});
