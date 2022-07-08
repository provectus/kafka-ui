import React from 'react';
import { Connector } from 'generated-sources';
import * as C from 'components/common/Tag/Tag.styled';
import * as Metrics from 'components/common/Metrics';
import getTagColor from 'components/common/Tag/getTagColor';

export interface OverviewProps {
  connector: Connector | null;
  runningTasksCount: number;
  failedTasksCount: number;
}

const Overview: React.FC<OverviewProps> = ({
  connector,
  runningTasksCount,
  failedTasksCount,
}) => {
  if (!connector) return null;

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
          <C.Tag color={getTagColor(connector.status)}>
            {connector.status.state}
          </C.Tag>
        </Metrics.Indicator>
        <Metrics.Indicator label="Tasks Running">
          {runningTasksCount}
        </Metrics.Indicator>
        <Metrics.Indicator
          label="Tasks Failed"
          isAlert
          alertType={failedTasksCount > 0 ? 'error' : 'success'}
        >
          {failedTasksCount}
        </Metrics.Indicator>
      </Metrics.Section>
    </Metrics.Wrapper>
  );
};

export default Overview;
