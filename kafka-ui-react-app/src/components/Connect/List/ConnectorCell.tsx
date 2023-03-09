import React from 'react';
import { CellContext } from '@tanstack/react-table';
import {FullConnectorInfo} from 'generated-sources';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { clusterConnectConnectorPath, ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { LinkCell } from 'components/common/NewTable';


const ConnectorCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row: { original },
}) => {
  const navigate = useNavigate();
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const { name, connect } = original;
  const path = clusterConnectConnectorPath(clusterName, connect, name);
  return (
    <LinkCell
      onClick={() => navigate(path)}
      value={name}
      to={path}
    />
    // <div title={name} onClick={() => navigate(path)}>
    //   {name}
    // </div>
  );
};

export default ConnectorCell;
