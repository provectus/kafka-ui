import { KsqlDescription } from 'redux/interfaces/ksqlDb';
import { KsqlTableState } from 'components/KsqlDb/List/KsqlDbItem/KsqlDbItem';

export const ksqlRowData = (data: KsqlDescription): KsqlTableState => {
  return {
    name: data.name || '',
    topic: data.topic || '',
    keyFormat: data.keyFormat || '',
    valueFormat: data.valueFormat || '',
    isWindowed: 'isWindowed' in data ? String(data.isWindowed) : '-',
  };
};
