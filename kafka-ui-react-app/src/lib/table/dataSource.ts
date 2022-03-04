import cloneDeep from 'lodash/cloneDeep';

interface IDataSource<T, TId extends IdType> {
  idSelector: (row: T) => TId;
  addData(row: T, index?: number): T;
  updateData(id: TId, changes: Partial<T>): void;
  removeData(id: TId): void;
}

interface DataResult<T> {
  data: T[];
  total: number;
}

export class DataSource<T, TId extends IdType> implements IDataSource<T, TId> {
  idSelector: (row: T) => TId;

  private data: T[];

  private total: number;

  constructor(data: T[], total: number, idSelector: (row: T) => TId) {
    this.data = cloneDeep(data);
    this.total = total;
    this.idSelector = idSelector;
  }

  getData(): DataResult<T> {
    return {
      data: this.data,
      total: this.total,
    };
  }

  addData(row: T, index?: number): T {
    const clonned = cloneDeep(row);
    if (index) {
      this.data.splice(index, 0, clonned);
    } else {
      this.data.push(clonned);
    }
    return clonned;
  }

  updateData(id: TId, changes: Partial<T>): void {
    const row = this.data.find((r) => this.idSelector(r) === id);
    if (row) {
      Object.assign(row, changes);
    }
  }

  removeData(id: TId): void {
    const index = this.data.findIndex((r) => this.idSelector(r) === id);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }
}
