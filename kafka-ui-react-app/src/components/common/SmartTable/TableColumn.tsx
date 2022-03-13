import React from 'react';
import { TableState } from 'lib/hooks/useTableState';
import { SortOrder, TopicColumnsToSort } from 'generated-sources';

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
  hovered?: boolean;
}

interface TableColumnProps<T, TId extends IdType> {
  cell?: React.FC<TableCellProps<T, TId>>;
  children?: React.ReactElement;
  sortable?: boolean;
  headerCell?: React.FC<TableHeaderCellProps<T, TId>>;
  field?: string;
  title?: string;
  width?: string;
  className?: string;
  orderBy?: TopicColumnsToSort | null;
  sortOrder?: SortOrder;
  orderValue?: TopicColumnsToSort | null;
  handleOrderBy?: (orderBy: TopicColumnsToSort | null) => void;
}

export const TableColumn = <T, TId extends IdType>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  props: React.PropsWithChildren<TableColumnProps<T, TId>>
): React.ReactElement => {
  return <td />;
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

interface SelectCellProps {
  selected: boolean;
  selectable: boolean;
  el: 'td' | 'th';
  rowIndex: number;
  onChange: (checked: boolean) => void;
}

export const SelectCell: React.FC<SelectCellProps> = ({
  selected,
  selectable,
  rowIndex,
  onChange,
  el,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const El = el;

  return (
    <El>
      {selectable && (
        <input
          data-row={rowIndex}
          onChange={handleChange}
          type="checkbox"
          checked={selected}
        />
      )}
    </El>
  );
};
