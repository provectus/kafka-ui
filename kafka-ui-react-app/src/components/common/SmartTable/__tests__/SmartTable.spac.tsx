import React from 'react';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/dom';
import { Route } from 'react-router';
import { clusterBrokersPath } from 'lib/paths';
import fetchMock from 'fetch-mock';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableState } from 'lib/hooks/useTableState';

describe('SmartTable Component', () => {
  afterEach(() => fetchMock.reset());

  const clusterName = 'local';
  const renderComponent = (tableState: TableState<string, IdType>) => {
    render(
      <Route path={clusterBrokersPath(':clusterName')}>
        <SmartTable
          selectable={!false}
          tableState={tableState}
          placeholder="No topics found"
          isFullwidth
          paginated
          hoverable
        />
      </Route>,
      {
        pathname: clusterBrokersPath(clusterName),
      }
    );
  };

  describe('SmartTable', () => {
    it('renders', async () => {
      renderComponent({
        data: [],
        selectedIds: new Set<IdType>(),
        idSelector: () => {
          return '';
        },
        isRowSelectable: () => {
          return false;
        },
        selectedCount: 0,
        setRowsSelection: () => {},
        toggleSelection: () => {},
      });
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
