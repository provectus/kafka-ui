import React from 'react';
import { propertyLookup } from 'lib/propertyLookup';
import { TableState } from 'lib/table/tableState';

import { isColumnElement } from './TableColumn';

interface SmartTableProps<T, TId extends IdType> {
  tableState: TableState<T, TId>;
  selectable?: boolean;
  className?: string;
}

export const SmartTable = <T, TId extends IdType>({
  children,
  tableState,
  className,
}: React.PropsWithChildren<SmartTableProps<T, TId>>) => {
  const columnHeaderCells = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (!isColumnElement<T, TId>(child)) {
        return child;
      }

      const { headerCell: HeaderCell, title, ...props } = child.props;
      return HeaderCell ? (
        <th style={{ border: '1px solid black' }}>
          <HeaderCell {...props} tableState={tableState} />
        </th>
      ) : (
        <th style={{ border: '1px solid black' }}>{title}</th>
      );
    });
  }, [children, tableState]);

  const getRowCells = React.useCallback(
    (row: T, rowIndex: number) => {
      return React.Children.map(children, (child) => {
        if (!isColumnElement<T, TId>(child)) {
          return child;
        }

        const { cell: Cell, field } = child.props;
        return Cell ? (
          <td style={{ border: '1px solid black' }}>
            <Cell rowIndex={rowIndex} dataItem={row} />
          </td>
        ) : (
          <td style={{ border: '1px solid black' }}>
            {field && propertyLookup(field, row)}
          </td>
        );
      });
    },
    [children]
  );

  const rows = React.useMemo(() => {
    return tableState.data.data.map((dataItem, index) => {
      return (
        <tr key={tableState.dataSource.idSelector(dataItem)}>
          {/* selectable */}
          {getRowCells(dataItem, index)}
        </tr>
      );
    });
  }, [getRowCells, tableState.data.data, tableState.dataSource]);

  return (
    <table style={{ border: '1px solid black' }} className={className}>
      <thead>
        <tr>{columnHeaderCells}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};
