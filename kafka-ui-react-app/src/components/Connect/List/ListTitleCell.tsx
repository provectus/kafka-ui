import React from 'react';
import { CellContext } from '@tanstack/react-table';
import { FullConnectorInfo } from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import { clusterConnectConnectorPath, ClusterNameRoute } from 'lib/paths';
import { NavLink } from 'react-router-dom';

export const ListTitleCell: React.FC<
  CellContext<FullConnectorInfo, unknown>
> = ({ row: { original } }) => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const { connect, name } = original;
  return (
    <NavLink
      to={clusterConnectConnectorPath(clusterName, connect, name)}
      title={name}
    >
      {name}
    </NavLink>
  );
};
