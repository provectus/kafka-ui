import React from 'react';
import { useParams } from 'react-router';
import {
  ClusterName,
  ConnectName,
  ConnectorConfig,
  ConnectorName,
} from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

export interface ConfigProps {
  fetchConfig(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName,
    silent?: boolean
  ): void;
  isConfigFetching: boolean;
  config: ConnectorConfig | null;
}

const Config: React.FC<ConfigProps> = ({
  fetchConfig,
  isConfigFetching,
  config,
}) => {
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();

  React.useEffect(() => {
    fetchConfig(clusterName, connectName, connectorName, true);
  }, [fetchConfig, clusterName, connectName, connectorName]);

  if (isConfigFetching) {
    return <PageLoader />;
  }

  if (!config) return null;

  return (
    <JSONEditor
      readOnly
      value={JSON.stringify(config, null, '\t')}
      showGutter={false}
      highlightActiveLine={false}
      isFixedHeight
    />
  );
};

export default Config;
