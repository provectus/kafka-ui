import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { Tag } from 'components/common/Tag/Tag.styled';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClusterName: React.FC<CellContext<any, unknown>> = ({ row }) => {
  return (
    <>
      {row.original.readOnly && <Tag color="blue">readonly</Tag>}
      {row.original.name}
    </>
  );
};

export default ClusterName;
