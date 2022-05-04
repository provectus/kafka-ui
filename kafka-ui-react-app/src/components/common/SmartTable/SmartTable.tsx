import React from 'react';
import Pagination from 'components/common/Pagination/Pagination';
import { Table } from 'components/common/table/Table/Table.styled';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { TableState } from 'lib/hooks/useTableState';

import {
  isColumnElement,
  SelectCell,
  TableHeaderCellProps,
} from './TableColumn';
import { TableRow } from './TableRow';

interface SmartTableProps<T, TId extends IdType, OT = never> {
  tableState: TableState<T, TId, OT>;
  allSelectable?: boolean;
  selectable?: boolean;
  className?: string;
  placeholder?: string;
  isFullwidth?: boolean;
  paginated?: boolean;
  hoverable?: boolean;
}

export const SmartTable = <T, TId extends IdType, OT = never>({
  children,
  tableState,
  selectable = false,
  allSelectable = false,
  placeholder = 'No Data Found',
  isFullwidth = false,
  paginated = false,
  hoverable = false,
}: React.PropsWithChildren<SmartTableProps<T, TId, OT>>) => {
  const handleRowSelection = React.useCallback(
    (row: T, checked: boolean) => {
      tableState.setRowsSelection([row], checked);
    },
    [tableState]
  );

  const headerRow = React.useMemo(() => {
    const headerCells = React.Children.map(children, (child) => {
      if (!isColumnElement<T, TId, OT>(child)) {
        return child;
      }

      const { headerCell, title, orderValue } = child.props;

      const HeaderCell = headerCell as React.FC<
        TableHeaderCellProps<T, TId, OT>
      >;
      return HeaderCell ? (
        <S.TableHeaderCell>
          <HeaderCell
            orderValue={orderValue}
            orderable={tableState.orderable}
            tableState={tableState}
          />
        </S.TableHeaderCell>
      ) : (
        // TODO types will be changed after fixing TableHeaderCell
        <TableHeaderCell
          {...(tableState.orderable as never)}
          orderValue={orderValue as never}
          title={title}
        />
      );
    });
    let checkboxElement = null;

    if (selectable) {
      checkboxElement = allSelectable ? (
        <SelectCell
          rowIndex={-1}
          el="th"
          selectable
          selected={tableState.selectedCount === tableState.data.length}
          onChange={tableState.toggleSelection}
        />
      ) : (
        <S.TableHeaderCell />
      );
    }

    return (
      <tr>
        {checkboxElement}
        {headerCells}
      </tr>
    );
  }, [children, allSelectable, tableState]);

  const bodyRows = React.useMemo(() => {
    if (tableState.data.length === 0) {
      const colspan = React.Children.count(children) + +selectable;
      return (
        <tr>
          <td colSpan={colspan}>{placeholder}</td>
        </tr>
      );
    }
    return tableState.data.map((dataItem, index) => {
      return (
        <TableRow
          key={tableState.idSelector(dataItem)}
          index={index}
          hoverable={hoverable}
          dataItem={dataItem}
          tableState={tableState}
          selectable={selectable}
          onSelectChange={handleRowSelection}
        >
          {children}
        </TableRow>
      );
    });
  }, [
    children,
    handleRowSelection,
    hoverable,
    placeholder,
    selectable,
    tableState,
  ]);

  return (
    <>
      <Table isFullwidth={isFullwidth}>
        <thead>{headerRow}</thead>
        <tbody>{bodyRows}</tbody>
      </Table>
      {paginated && tableState.totalPages !== undefined && (
        <Pagination totalPages={tableState.totalPages} />
      )}
    </>
  );
};
