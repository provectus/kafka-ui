import React from 'react';
import { TopicColumnsToSort } from 'generated-sources';
import cx from 'classnames';

export interface ListHeaderProps {
  value: TopicColumnsToSort;
  title: string;
  orderBy: TopicColumnsToSort | null;
  setOrderBy: React.Dispatch<React.SetStateAction<TopicColumnsToSort | null>>;
}

const ListHeaderCell: React.FC<ListHeaderProps> = ({
  value,
  title,
  orderBy,
  setOrderBy,
}) => {
  return (
    <th
      className={cx('is-clickable', orderBy === value && 'has-text-link-dark')}
      onClick={() => setOrderBy(value)}
    >
      {title}
      <span className="icon is-small">
        {orderBy === value ? <i className="fas fa-sort" /> : ''}
      </span>
    </th>
  );
};

export default ListHeaderCell;
