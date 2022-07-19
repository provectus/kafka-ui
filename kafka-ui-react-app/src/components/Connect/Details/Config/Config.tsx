import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import Editor from 'components/common/Editor/Editor';
import { RouterParamsClusterConnectConnector } from 'lib/paths';
import { useConnectorConfig } from 'lib/hooks/api/kafkaConnect';

const Config: React.FC = () => {
  const routerProps = useAppParams<RouterParamsClusterConnectConnector>();
  const { data: config } = useConnectorConfig(routerProps);

  if (!config) return null;

  return (
    <Editor
      readOnly
      value={JSON.stringify(config, null, '\t')}
      highlightActiveLine={false}
      isFixedHeight
      style={{ margin: '16px' }}
    />
  );
};

export default Config;
