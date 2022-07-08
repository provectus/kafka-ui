import React, { useCallback } from 'react';
import { OrderableProps } from 'components/common/SmartTable/TableColumn';

export interface TableState<T, TId extends IdType> {
  data: T[];
  selectedIds: Set<TId>;
  totalPages?: number;
  idSelector: (row: T) => TId;
  isRowSelectable: (row: T) => boolean;
  selectedCount: number;
  setRowsSelection: (rows: T[], selected: boolean) => void;
  toggleSelection: (selected: boolean) => void;
  orderable?: OrderableProps;
}

export const useTableState = <T, TId extends IdType>(
  data: T[],
  options: {
    totalPages: number;
    isRowSelectable?: (row: T) => boolean;
    idSelector: (row: T) => TId;
  },
  orderable?: OrderableProps
): TableState<T, TId> => {
  const [selectedIds, setSelectedIds] = React.useState(new Set<TId>());

  const { idSelector, totalPages, isRowSelectable = () => true } = options;

  const selectedCount = selectedIds.size;

  const setRowsSelection = useCallback(
    (rows: T[], selected: boolean) => {
      rows.forEach((row) => {
        const id = idSelector(row);
        const newSet = new Set(selectedIds);
        if (selected) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        setSelectedIds(newSet);
      });
    },
    [idSelector, selectedIds]
  );

  const toggleSelection = useCallback(
    (selected: boolean) => {
      const newSet = new Set(selected ? data.map((r) => idSelector(r)) : []);
      setSelectedIds(newSet);
    },
    [data, idSelector]
  );

  return React.useMemo<TableState<T, TId>>(() => {
    return {
      data,
      totalPages,
      selectedIds,
      orderable,
      selectedCount,
      idSelector,
      isRowSelectable,
      setRowsSelection,
      toggleSelection,
    };
  }, [
    data,
    orderable,
    selectedIds,
    totalPages,
    selectedCount,
    idSelector,
    isRowSelectable,
    setRowsSelection,
    toggleSelection,
  ]);
};
