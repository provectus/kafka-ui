import React from 'react';
import { TableState } from 'lib/table/tableState';

interface TableCellPropsBase<T, TId extends IdType> {
  tableState?: TableState<T, TId>;
}

export interface TableHeaderCellProps<T, TId extends IdType>
  extends TableCellPropsBase<T, TId> {
  sortable?: boolean;
}

export interface TableCellProps<T, TId extends IdType>
  extends TableCellPropsBase<T, TId> {
  rowIndex: number;
  dataItem: T;
}

interface TableColumnProps<T, TId extends IdType> {
  cell?: React.FC<TableCellProps<T, TId>>;
  children?: React.ReactElement;
  sortable?: boolean;
  headerCell?: React.FC<TableHeaderCellProps<T, TId>>;
  field?: string;
  title?: string;
}

export const TableColumn = <T, TId extends IdType>({
  title,
}: TableColumnProps<T, TId>) => {
  return <td>{title}</td>;
};

export function isColumnElement<T, TId extends IdType>(
  element: React.ReactNode
): element is React.ReactElement<TableColumnProps<T, TId>> {
  if (!React.isValidElement(element)) {
    return false;
  }

  const elementType = (element as React.ReactElement).type;
  return (
    elementType === TableColumn ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elementType as any).originalType === TableColumn
  );
}

// export const SelectCell: SelectCellProps
