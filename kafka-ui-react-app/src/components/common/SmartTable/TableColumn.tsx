import React from 'react';
import { TableState } from 'lib/hooks/useTableState';
import { SortOrder } from 'generated-sources';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import { DefaultTheme, StyledComponent } from 'styled-components';
import { ActionsCellProps } from 'components/Topics/List/ActionsCell/ActionsCell';

export interface OrderableProps {
  orderBy: string | null;
  sortOrder: SortOrder;
  handleOrderBy: (orderBy: string | null) => void;
}

interface TableCellPropsBase<T, TId extends IdType> {
  tableState: TableState<T, TId>;
}

export interface TableHeaderCellProps<T, TId extends IdType>
  extends TableCellPropsBase<T, TId> {
  orderable?: OrderableProps;
  orderValue?: string;
}

export interface TableCellProps<T, TId extends IdType>
  extends TableCellPropsBase<T, TId> {
  rowIndex: number;
  dataItem: T;
  hovered?: boolean;
}

interface TableColumnProps<T, TId extends IdType> {
  cell?: React.FC<TableCellProps<T, TId> & ActionsCellProps>;
  children?: React.ReactElement;
  headerCell?: React.FC<TableHeaderCellProps<T, TId>>;
  field?: string;
  title?: string;
  maxWidth?: string;
  className?: string;
  orderValue?: string;
  customTd?: typeof S.Td;
}

export const TableColumn = <T, TId extends IdType>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: React.PropsWithChildren<TableColumnProps<T, TId>>
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
