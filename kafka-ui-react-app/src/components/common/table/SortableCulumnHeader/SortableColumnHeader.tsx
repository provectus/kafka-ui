/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import cx from 'classnames';

import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';

export interface ListHeaderProps {
  value: any;
  title: string;
  orderBy: any;
  setOrderBy: React.Dispatch<React.SetStateAction<any>>;
}

const ListHeaderCell: React.FC<ListHeaderProps> = ({
  value,
  title,
  orderBy,
  setOrderBy,
}) => (
  <th
    className={cx('is-clickable', orderBy === value && 'has-text-link-dark')}
    onClick={() => setOrderBy(value)}
  >
    {title}
    <S.SortIcon />
  </th>
);

export default ListHeaderCell;
