import { TopicColumnsToSort } from 'generated-sources';
import React from 'react';
import cx from 'classnames';

export interface ListHeaderProps {
  orderBy: TopicColumnsToSort | undefined;
  setOrderBy: React.Dispatch<
    React.SetStateAction<TopicColumnsToSort | undefined>
  >;
}

const ListHeader: React.FC<ListHeaderProps> = ({ orderBy, setOrderBy }) => {
  return (
    <tr>
      <th
        className={cx(
          'is-clickable',
          orderBy === TopicColumnsToSort.NAME && 'has-text-link-dark'
        )}
        onClick={() => setOrderBy(TopicColumnsToSort.NAME)}
      >
        Topic Name{' '}
        <span className="icon is-small">
          {orderBy === TopicColumnsToSort.NAME ? (
            <i className="fas fa-caret-up" />
          ) : (
            <i className="fas fa-caret-down" />
          )}
        </span>
      </th>
      <th
        className={cx(
          'is-clickable',
          orderBy === TopicColumnsToSort.TOTAL_PARTITIONS &&
            'has-text-link-dark'
        )}
        onClick={() => setOrderBy(TopicColumnsToSort.TOTAL_PARTITIONS)}
      >
        Total Partitions{' '}
        <span className="icon is-small">
          {orderBy === TopicColumnsToSort.TOTAL_PARTITIONS ? (
            <i className="fas fa-caret-up" />
          ) : (
            <i className="fas fa-caret-down" />
          )}
        </span>
      </th>
      <th
        className={cx(
          'is-clickable',
          orderBy === TopicColumnsToSort.OUT_OF_SYNC_REPLICAS &&
            'has-text-link-dark'
        )}
        onClick={() => setOrderBy(TopicColumnsToSort.OUT_OF_SYNC_REPLICAS)}
      >
        Out of sync replicas{' '}
        <span className="icon is-small">
          {orderBy === TopicColumnsToSort.OUT_OF_SYNC_REPLICAS ? (
            <i className="fas fa-caret-up" />
          ) : (
            <i className="fas fa-caret-down" />
          )}
        </span>
      </th>
      <th>Type</th>
      <th> </th>
    </tr>
  );
};

export default ListHeader;
