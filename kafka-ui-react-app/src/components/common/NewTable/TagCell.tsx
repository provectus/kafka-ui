import { CellContext } from '@tanstack/react-table';
import React from 'react';
import getTagColor from 'components/common/Tag/getTagColor';
import { Tag } from 'components/common/Tag/Tag.styled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TagCell: React.FC<CellContext<any, unknown>> = ({ getValue }) => {
  const value = getValue<string>();
  return <Tag color={getTagColor(value)}>{value}</Tag>;
};

export default TagCell;
