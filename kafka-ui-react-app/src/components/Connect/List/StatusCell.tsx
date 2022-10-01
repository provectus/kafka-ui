import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import getTagColor from 'components/common/Tag/getTagColor';
import { Tag } from 'components/common/Tag/Tag.styled';

const StatusCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { status } = row.original;

  if (!status) {
    return null;
  }

  return <Tag color={getTagColor(status.state)}>{status.state}</Tag>;
};

export default StatusCell;
