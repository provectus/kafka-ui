import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  Row,
  SortingState,
  OnChangeFn,
  PaginationState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { PER_PAGE } from 'lib/constants';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';

import * as S from './Table.styled';
import updateSortingState from './utils/updateSortingState';
import updatePaginationState from './utils/updatePaginationState';
import ExpanderCell from './ExpanderCell';
import SelectRowCell from './SelectRowCell';
import SelectRowHeader from './SelectRowHeader';

export interface TableProps<TData> {
  data: TData[];
  pageCount?: number;
  columns: ColumnDef<TData>[];
  renderSubComponent?: React.FC<{ row: Row<TData> }>;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  serverSideProcessing?: boolean;
  enableSorting?: boolean;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  batchActionsBar?: React.FC<{ rows: Row<TData>[]; resetRowSelection(): void }>;
  emptyMessage?: string;
}

type UpdaterFn<T> = (previousState: T) => T;

const getPaginationFromSearchParams = (searchParams: URLSearchParams) => {
  const page = searchParams.get('page');
  const perPage = searchParams.get('perPage');
  const pageIndex = page ? Number(page) - 1 : 0;
  return {
    pageIndex,
    pageSize: Number(perPage || PER_PAGE),
  };
};

const getSortingFromSearchParams = (searchParams: URLSearchParams) => {
  const sortBy = searchParams.get('sortBy');
  const sortDirection = searchParams.get('sortDirection');
  if (!sortBy) return [];
  return [{ id: sortBy, desc: sortDirection === 'desc' }];
};

/**
 * Table component that uses the react-table library to render a table.
 * https://tanstack.com/table/v8
 *
 * The most important props are:
 *  - `data`: the data to render in the table
 *  - `columns`: ColumnsDef. You can finde more info about it on https://tanstack.com/table/v8/docs/guide/column-defs
 *  - `emptyMessage`: the message to show when there is no data to render
 *
 * Usecases:
 * 1. Sortable table
 *    - set `enableSorting` property of component to true. It will enable sorting for all columns.
 *      If you want to disable sorting for some particular columns you can pass
 *     `enableSorting = false` to the column def.
 *    - table component stores the sorting state in URLSearchParams. Use `sortBy` and `sortDirection`
 *      search param to set default sortings.
 *
 * 2. Pagination
 *    - pagination enabled by default.
 *    - use `perPage` search param to manage default page size.
 *    - use `page` search param to manage default page index.
 *    - use `pageCount` prop to set the total number of pages only in case of server side processing.
 *
 * 3. Expandable rows
 *    - use `getRowCanExpand` prop to set a function that returns true if the row can be expanded.
 *    - use `renderSubComponent` prop to provide a sub component for each expanded row.
 *
 * 4. Row selection
 *    - use `enableRowSelection` prop to enable row selection. This prop can be a boolean or
 *      a function that returns true if the particular row can be selected.
 *    - use `batchActionsBar` prop to provide a component that will be rendered at the top of the table
 *      when row selection is enabled and there are selected rows.
 *
 * 5. Server side processing:
 *    - set `serverSideProcessing` to true
 *    - set `pageCount` to the total number of pages
 *    - use URLSearchParams to get the pagination and sorting state from the url for your server side processing.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Table: React.FC<TableProps<any>> = ({
  data,
  pageCount,
  columns,
  getRowCanExpand,
  renderSubComponent,
  serverSideProcessing = false,
  enableSorting = false,
  enableRowSelection = false,
  batchActionsBar,
  emptyMessage,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rowSelection, setRowSelection] = React.useState({});
  const onSortingChange = React.useCallback(
    (updater: UpdaterFn<SortingState>) => {
      const newState = updateSortingState(updater, searchParams);
      setSearchParams(searchParams);
      return newState;
    },
    [searchParams]
  );
  const onPaginationChange = React.useCallback(
    (updater: UpdaterFn<PaginationState>) => {
      const newState = updatePaginationState(updater, searchParams);
      setSearchParams(searchParams);
      return newState;
    },
    [searchParams]
  );

  React.useEffect(() => {
    setRowSelection({});
  }, [searchParams]);

  const table = useReactTable({
    data,
    pageCount,
    columns,
    state: {
      sorting: getSortingFromSearchParams(searchParams),
      pagination: getPaginationFromSearchParams(searchParams),
      rowSelection,
    },
    onSortingChange: onSortingChange as OnChangeFn<SortingState>,
    onPaginationChange: onPaginationChange as OnChangeFn<PaginationState>,
    onRowSelectionChange: setRowSelection,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: serverSideProcessing,
    manualPagination: serverSideProcessing,
    enableSorting,
    autoResetPageIndex: false,
    enableRowSelection,
  });

  const Bar = batchActionsBar;

  return (
    <>
      {table.getSelectedRowModel().flatRows.length > 0 && Bar && (
        <S.TableActionsBar>
          <Bar
            rows={table.getSelectedRowModel().flatRows}
            resetRowSelection={table.resetRowSelection}
          />
        </S.TableActionsBar>
      )}
      <S.Table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {!!enableRowSelection && (
                <S.Th key={`${headerGroup.id}-select`}>
                  {flexRender(
                    SelectRowHeader,
                    headerGroup.headers[0].getContext()
                  )}
                </S.Th>
              )}
              {table.getCanSomeRowsExpand() && (
                <S.Th expander key={`${headerGroup.id}-expander`} />
              )}
              {headerGroup.headers.map((header) => (
                <S.Th
                  key={header.id}
                  colSpan={header.colSpan}
                  sortable={header.column.getCanSort()}
                  sortOrder={header.column.getIsSorted()}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                </S.Th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <S.Row
                expandable={row.getCanExpand()}
                expanded={row.getIsExpanded()}
                onClick={() => row.getCanExpand() && row.toggleExpanded()}
              >
                {!!enableRowSelection && (
                  <td key={`${row.id}-select`}>
                    {flexRender(
                      SelectRowCell,
                      row.getVisibleCells()[0].getContext()
                    )}
                  </td>
                )}
                {row.getCanExpand() && (
                  <td key={`${row.id}-expander`}>
                    {flexRender(
                      ExpanderCell,
                      row.getVisibleCells()[0].getContext()
                    )}
                  </td>
                )}
                {row
                  .getVisibleCells()
                  .map(({ id, getContext, column: { columnDef } }) => (
                    <td key={id}>{flexRender(columnDef.cell, getContext())}</td>
                  ))}
              </S.Row>
              {row.getIsExpanded() && renderSubComponent && (
                <S.Row expanded>
                  <td colSpan={row.getVisibleCells().length + 2}>
                    <S.ExpandedRowInfo>
                      {renderSubComponent({ row })}
                    </S.ExpandedRowInfo>
                  </td>
                </S.Row>
              )}
            </React.Fragment>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <S.Row>
              <S.EmptyTableMessageCell colSpan={100}>
                {emptyMessage || 'No rows found'}
              </S.EmptyTableMessageCell>
            </S.Row>
          )}
        </tbody>
      </S.Table>
      {table.getPageCount() > 1 && (
        <S.Pagination>
          <S.Pages>
            <Button
              buttonType="secondary"
              buttonSize="M"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              ⇤
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="M"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              ← Previous
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="M"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next →
            </Button>
            <Button
              buttonType="secondary"
              buttonSize="M"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              ⇥
            </Button>

            <S.GoToPage>
              <span>Go to page:</span>
              <Input
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                inputSize="M"
                max={table.getPageCount()}
                min={1}
                onChange={({ target: { value } }) => {
                  const index = value ? Number(value) - 1 : 0;
                  table.setPageIndex(index);
                }}
              />
            </S.GoToPage>
          </S.Pages>
          <S.PageInfo>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}{' '}
            </span>
          </S.PageInfo>
        </S.Pagination>
      )}
    </>
  );
};

export default Table;
