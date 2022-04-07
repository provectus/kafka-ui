import React from 'react';
import { TableState } from 'lib/hooks/useTableState';
import { SortOrder } from 'generated-sources';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import { DefaultTheme, StyledComponent } from 'styled-components';

export interface OrderableProps<OT> {
  orderBy: OT | null;
  sortOrder: SortOrder;
  handleOrderBy: (orderBy: OT | null) => void;
}

interface TableCellPropsBase<T, TId extends IdType, OT = never> {
  tableState: TableState<T, TId, OT>;
}

export interface TableHeaderCellProps<T, TId extends IdType, OT = never>
  extends TableCellPropsBase<T, TId, OT> {
  orderable?: OrderableProps<OT>;
  orderValue?: OT;
}

export interface TableCellProps<T, TId extends IdType, OT = never>
  extends TableCellPropsBase<T, TId, OT> {
  rowIndex: number;
  dataItem: T;
  hovered?: boolean;
}

interface TableColumnProps<T, TId extends IdType, OT = never> {
  cell?: React.FC<TableCellProps<T, TId>>;
  children?: React.ReactElement;
  headerCell?: React.FC<TableHeaderCellProps<T, TId, OT>>;
  field?: string;
  title?: string;
  maxWidth?: string;
  className?: string;
  orderValue?: OT;
}

export const TableColumn = <T, TId extends IdType, OT = never>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  props: React.PropsWithChildren<TableColumnProps<T, TId, OT>>
): React.ReactElement => {
  return <td />;
};

export function isColumnElement<T, TId extends IdType, OT = never>(
  element: React.ReactNode
): element is React.ReactElement<TableColumnProps<T, TId, OT>> {
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

  let El: 'td' | StyledComponent<'th', DefaultTheme>;
  if (el === 'th') {
    El = S.TableHeaderCell;
  } else {
    El = el;
  }

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
