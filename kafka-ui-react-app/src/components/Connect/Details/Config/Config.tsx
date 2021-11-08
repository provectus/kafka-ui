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
import styled from 'styled-components';
import { Colors } from 'theme/theme';

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

const ConnectConfigWrapper = styled.div`
  padding: 16px;
  margin: 16px;
  border: 1px solid ${Colors.neutral[10]};
  border-radius: 8px;
`;

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
    <ConnectConfigWrapper>
      <JSONEditor
        readOnly
        value={JSON.stringify(config, null, '\t')}
        highlightActiveLine={false}
        isFixedHeight
      />
    </ConnectConfigWrapper>
  );
};

export default Config;
