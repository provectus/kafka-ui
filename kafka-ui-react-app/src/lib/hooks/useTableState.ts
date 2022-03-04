import { DataSource } from 'lib/table/dataSource';
import { TableState } from 'lib/table/tableState';

export const useTableState = <T, TId extends IdType>(
  data: T[],
  options: {
    pageSize: number;
    totalCount: number;
    idSelector: (row: T) => TId;
  }
) => {
  const dataSource = new DataSource(
    data,
    options.totalCount,
    options.idSelector
  );
  return new TableState({ dataSource, pageSize: options.pageSize });
};
