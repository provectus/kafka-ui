import React from 'react';
import { FullConnectorInfo } from 'generated-sources';
import { useNavigate } from 'react-router-dom';
import { clusterConnectConnectorPath, ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';

const ConnectorCell: React.FC<{ row: FullConnectorInfo }> = ({ row: { original } }) => {
  const navigate = useNavigate();
  const { name, connect } = original;
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const path = clusterConnectConnectorPath(clusterName, connect, name);
  const handleOnClick = () => navigate(path);

  return (
    <div onClick={handleOnClick}> {name} </div>
  );
};

export default ConnectorCell;
