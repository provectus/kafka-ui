import React from 'react';
import * as C from 'components/common/Tag/Tag.styled';
import * as Metrics from 'components/common/Metrics';
import getTagColor from 'components/common/Tag/getTagColor';
import { RouterParamsClusterConnectConnector } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { useConnector, useConnectorTasks } from 'lib/hooks/api/kafkaConnect';

import getTaskMetrics from './getTaskMetrics';

const Overview: React.FC = () => {
  const routerProps = useAppParams<RouterParamsClusterConnectConnector>();

  const { data: connector } = useConnector(routerProps);
  const { data: tasks } = useConnectorTasks(routerProps);

  if (!connector) {
    return null;
  }

  const { running, failed } = getTaskMetrics(tasks);

  return (
    <Metrics.Wrapper>
      <Metrics.Section>
        {connector.status?.workerId && (
          <Metrics.Indicator label="Worker">
            {connector.status.workerId}
          </Metrics.Indicator>
        )}
        <Metrics.Indicator label="Type">{connector.type}</Metrics.Indicator>
        {connector.config['connector.class'] && (
          <Metrics.Indicator label="Class">
            {connector.config['connector.class']}
          </Metrics.Indicator>
        )}
        <Metrics.Indicator label="State">
          <C.Tag color={getTagColor(connector.status.state)}>
            {connector.status.state}
          </C.Tag>
        </Metrics.Indicator>
        <Metrics.Indicator label="Tasks Running">{running}</Metrics.Indicator>
        <Metrics.Indicator
          label="Tasks Failed"
          isAlert
          alertType={failed > 0 ? 'error' : 'success'}
        >
          {failed}
        </Metrics.Indicator>
      </Metrics.Section>
    </Metrics.Wrapper>
  );
};

export default Overview;
