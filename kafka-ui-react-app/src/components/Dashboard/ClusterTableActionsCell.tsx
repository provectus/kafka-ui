import React from 'react';
import { Cluster } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { Button } from 'components/common/Button/Button';
import { clusterConfigPath } from 'lib/paths';

type Props = CellContext<Cluster, unknown>;

const ClusterTableActionsCell: React.FC<Props> = ({ row }) => {
  const { name } = row.original;
  return (
    <Button buttonType="secondary" buttonSize="S" to={clusterConfigPath(name)}>
      Configure
    </Button>
  );
};

export default ClusterTableActionsCell;
