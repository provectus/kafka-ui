import React from 'react';
import { propertyLookup } from 'lib/propertyLookup';
import { TableState } from 'lib/hooks/useTableState';

import { isColumnElement, SelectCell } from './TableColumn';

interface TableRowProps<T, TId extends IdType = never> {
  index: number;
  id?: TId;
  hoverable?: boolean;
  tableState: TableState<T, TId>;
  dataItem: T;
  selectable: boolean;
  onSelectChange?: (row: T, checked: boolean) => void;
}

export const TableRow = <T, TId extends IdType>({
  children,
  hoverable = false,
  id,
  index,
  dataItem,
  selectable,
  tableState,
  onSelectChange,
}: React.PropsWithChildren<TableRowProps<T, TId>>): React.ReactElement => {
  const [hovered, setHovered] = React.useState(false);

  const handleMouseEnter = React.useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setHovered(false);
  }, []);

  const handleSelectChange = React.useCallback(
    (checked: boolean) => {
      onSelectChange?.(dataItem, checked);
    },
    [dataItem, onSelectChange]
  );

  return (
    <tr
      tabIndex={index}
      id={id as string}
      onMouseEnter={hoverable ? handleMouseEnter : undefined}
      onMouseLeave={hoverable ? handleMouseLeave : undefined}
    >
      {selectable && (
        <SelectCell
          rowIndex={index}
          el="td"
          selectable={tableState.isRowSelectable(dataItem)}
          selected={tableState.selectedIds.has(tableState.idSelector(dataItem))}
          onChange={handleSelectChange}
        />
      )}
      {React.Children.map(children, (child) => {
        if (!isColumnElement<T, TId>(child)) {
          return child;
        }
        const { cell: Cell, field, width, className } = child.props;
        return Cell ? (
          <td className={className} style={{ width }}>
            <Cell hovered={hovered} rowIndex={index} dataItem={dataItem} />
          </td>
        ) : (
          <td className={className} style={{ width }}>
            {field && propertyLookup(field, dataItem)}
          </td>
        );
      })}
    </tr>
  );
};
