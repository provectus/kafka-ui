import { DataSource } from './dataSource';

interface TableStateConstructorParams<T, TId extends IdType> {
  dataSource: DataSource<T, TId>;
  pageSize: number;
}

export class TableState<T, TId extends IdType> {
  private innerDataSource: DataSource<T, TId>;

  public selectedIds = new Set<TId>();

  constructor({ dataSource }: TableStateConstructorParams<T, TId>) {
    this.innerDataSource = dataSource;
  }

  get dataSource() {
    return this.innerDataSource;
  }

  get data() {
    return this.dataSource.getData();
  }

  get selectedCount() {
    return this.selectedIds.size;
  }

  setRowsSelection(rows: T[], selected: boolean) {
    rows.forEach((row) => {
      const id = this.dataSource.idSelector(row);
      if (selected) {
        this.selectedIds.add(id);
      } else {
        this.selectedIds.delete(id);
      }
    });
  }

  selectAll() {
    this.setRowsSelection(this.data.data, true);
  }

  deselectAll() {
    this.setRowsSelection(this.data.data, false);
  }

  // addToDataSource(row: T, index?: number) {
  //   this.dataSource.addData(row, index);
  // }

  // removeFromDataSource(id: TId) {
  //   this.dataSource.removeData(id);
  // }
}
