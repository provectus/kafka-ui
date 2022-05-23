import React from 'react';
import { useParams } from 'react-router-dom';
import {
  ClusterName,
  ConnectName,
  ConnectorConfig,
  ConnectorName,
} from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Editor from 'components/common/Editor/Editor';
import styled from 'styled-components';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

export interface ConfigProps {
  fetchConfig(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): void;
  isConfigFetching: boolean;
  config: ConnectorConfig | null;
}

const ConnectConfigWrapper = styled.div`
  margin: 16px;
`;

const Config: React.FC<ConfigProps> = ({
  fetchConfig,
  isConfigFetching,
  config,
}) => {
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();

  React.useEffect(() => {
    fetchConfig({ clusterName, connectName, connectorName });
  }, [fetchConfig, clusterName, connectName, connectorName]);

  if (isConfigFetching) {
    return <PageLoader />;
  }

  if (!config) return null;
  return (
    <ConnectConfigWrapper>
      <Editor
        readOnly
        value={JSON.stringify(config, null, '\t')}
        highlightActiveLine={false}
        isFixedHeight
      />
    </ConnectConfigWrapper>
  );
};

export default Config;
