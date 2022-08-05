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

interface TableProps<TData> {
  data: TData[];
  pageCount?: number;
  columns: ColumnDef<TData>[];
  renderSubComponent?: React.FC<{ row: Row<TData> }>;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  serverSideProcessing?: boolean;
  enableSorting?: boolean;
}

type UpdaterFn<T> = (previousState: T) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Table: React.FC<TableProps<any>> = ({
  data,
  pageCount,
  columns,
  getRowCanExpand,
  renderSubComponent,
  serverSideProcessing = false,
  enableSorting = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: PER_PAGE,
    });

  const onSortingChange = React.useCallback(
    (updater: UpdaterFn<SortingState>) => {
      const previousState: SortingState = [
        {
          id: searchParams.get('sortBy') || '',
          desc: searchParams.get('sortDirection') === 'desc',
        },
      ];
      const newState = updater(previousState);

      if (newState.length > 0) {
        const { id, desc } = newState[0];
        searchParams.set('sortBy', id);
        searchParams.set('sortDirection', desc ? 'desc' : 'asc');
      } else {
        searchParams.delete('sortBy');
        searchParams.delete('sortDirection');
      }
      setSearchParams(searchParams);
      setSorting(newState);
      return newState;
    },
    [searchParams]
  );

  const onPaginationChange = React.useCallback(
    (updater: UpdaterFn<PaginationState>) => {
      const previousState: PaginationState = {
        pageIndex: Number(searchParams.get('page') || 0),
        pageSize: Number(searchParams.get('perPage') || PER_PAGE),
      };
      const newState = updater(previousState);
      if (newState.pageIndex !== 0) {
        searchParams.set('page', newState.pageIndex.toString());
      } else {
        searchParams.delete('page');
      }

      if (newState.pageSize !== PER_PAGE) {
        searchParams.set('perPage', newState.pageSize.toString());
      } else {
        searchParams.delete('perPage');
      }

      setSearchParams(searchParams);

      setPagination(newState);
      return newState;
    },
    [searchParams]
  );

  React.useEffect(() => {
    const sortBy = searchParams.get('sortBy');
    const sortDirection = searchParams.get('sortDirection');
    const page = searchParams.get('page');
    const perPage = searchParams.get('perPage');

    if (sortBy) {
      setSorting([
        {
          id: sortBy,
          desc: sortDirection === 'desc',
        },
      ]);
    } else {
      setSorting([]);
    }
    if (page) {
      setPagination({
        pageIndex: Number(page || 1),
        pageSize: Number(perPage || PER_PAGE),
      });
    }
  }, []);

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data,
    pageCount,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: onSortingChange as OnChangeFn<SortingState>,
    onPaginationChange: onPaginationChange as OnChangeFn<PaginationState>,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: serverSideProcessing,
    manualPagination: serverSideProcessing,
    enableSorting,
  });

  return (
    <>
      <S.Table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
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
                onClick={() => row.toggleExpanded()}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </S.Row>
              {row.getIsExpanded() && renderSubComponent && (
                <S.Row expanded>
                  <td colSpan={row.getVisibleCells().length}>
                    <S.ExpandedRowInfo>
                      {renderSubComponent({ row })}
                    </S.ExpandedRowInfo>
                  </td>
                </S.Row>
              )}
            </React.Fragment>
          ))}
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
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
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
