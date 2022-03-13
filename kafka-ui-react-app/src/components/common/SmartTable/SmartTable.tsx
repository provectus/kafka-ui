import React from 'react';
import Pagination from 'components/common/Pagination/Pagination';
import { Table } from 'components/common/table/Table/Table.styled';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { TableState } from 'lib/hooks/useTableState';

import { isColumnElement, SelectCell } from './TableColumn';
import { TableRow } from './TableRow';

interface SmartTableProps<T, TId extends IdType> {
  tableState: TableState<T, TId>;
  allSelectable?: boolean;
  selectable?: boolean;
  className?: string;
  placeholder?: string;
  isFullwidth?: boolean;
  paginated?: boolean;
  hoverable?: boolean;
}

export const SmartTable = <T, TId extends IdType>({
  children,
  tableState,
  selectable = false,
  allSelectable = false,
  placeholder = 'No Data Found',
  isFullwidth = false,
  paginated = false,
  hoverable = false,
}: React.PropsWithChildren<SmartTableProps<T, TId>>) => {
  const handleRowSelection = React.useCallback(
    (row: T, checked: boolean) => {
      tableState.setRowsSelection([row], checked);
    },
    [tableState]
  );

  const headerRow = React.useMemo(() => {
    const headerCells = React.Children.map(children, (child) => {
      if (!isColumnElement<T, TId>(child)) {
        return child;
      }

      const { headerCell: HeaderCell, title, ...props } = child.props;

      return HeaderCell ? (
        <th>
          <HeaderCell {...props} tableState={tableState} />
        </th>
      ) : (
        <TableHeaderCell {...props} title={title} />
      );
    });
    return (
      <tr>
        {allSelectable ? (
          <SelectCell
            rowIndex={-1}
            el="th"
            selectable
            selected={tableState.selectedCount() === tableState.data.length}
            onChange={tableState.toggleSelection}
          />
        ) : (
          <S.TableHeaderCell />
        )}
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
