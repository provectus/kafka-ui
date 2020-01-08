import React from 'react';
import { ClusterId, BrokerMetrics, ZooKeeperStatus } from 'types';
import useInterval from 'lib/hooks/useInterval';
import formatBytes from 'lib/utils/formatBytes';
import cx from 'classnames';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';

interface Props extends BrokerMetrics {
  clusterId: string;
  isFetched: boolean;
  minDiskUsage: number;
  maxDiskUsage: number;
  fetchBrokers: (clusterId: ClusterId) => void;
  fetchBrokerMetrics: (clusterId: ClusterId) => void;
}

const Topics: React.FC<Props> = ({
  clusterId,
  isFetched,
  brokerCount,
  activeControllers,
  zooKeeperStatus,
  onlinePartitionCount,
  offlinePartitionCount,
  underReplicatedPartitionCount,
  diskUsageDistribution,
  minDiskUsage,
  maxDiskUsage,
  networkPoolUsage,
  requestPoolUsage,
  fetchBrokers,
  fetchBrokerMetrics,
}) => {
  React.useEffect(
    () => {
      fetchBrokers(clusterId);
      fetchBrokerMetrics(clusterId);
    },
    [fetchBrokers, fetchBrokerMetrics, clusterId],
  );

  useInterval(() => { fetchBrokerMetrics(clusterId); }, 5000);

  const [minDiskUsageValue, minDiskUsageSize] = formatBytes(minDiskUsage);
  const [maxDiskUsageValue, maxDiskUsageSize] = formatBytes(maxDiskUsage);

  const zkOnline = zooKeeperStatus === ZooKeeperStatus.online;

  return (
    <div className="section">
      <h1 className="title is-5">Brokers overview</h1>

      <MetricsWrapper title="Uptime">
        <Indicator title="Total Brokers">
          {brokerCount}
        </Indicator>
        <Indicator title="Active Controllers">
          {activeControllers}
        </Indicator>
        <Indicator title="Zookeeper Status">
          <span className={cx('tag', zkOnline ? 'is-primary' : 'is-danger')}>
            {zkOnline ? 'Online' : 'Offline'}
          </span>
        </Indicator>
      </MetricsWrapper>

      <MetricsWrapper title="Partitions">
        <Indicator title="Online">
          <span className={cx({'has-text-danger': offlinePartitionCount !== 0})}>
            {onlinePartitionCount}
          </span>
          <span className="subtitle has-text-weight-light"> of {onlinePartitionCount + offlinePartitionCount}</span>
        </Indicator>
        <Indicator title="Under Replicated">
          {underReplicatedPartitionCount}
        </Indicator>
        <Indicator title="In Sync Replicas">
          <span className="has-text-grey-lighter">
            Soon
          </span>
        </Indicator>
        <Indicator title="Out of Sync Replicas">
          <span className="has-text-grey-lighter">
            Soon
          </span>
        </Indicator>
      </MetricsWrapper>

      <MetricsWrapper title="Disk">
        <Indicator title="Max usage">
          {maxDiskUsageValue}
          <span className="subtitle has-text-weight-light"> {maxDiskUsageSize}</span>
        </Indicator>
        <Indicator title="Min usage">
          {minDiskUsageValue}
          <span className="subtitle has-text-weight-light"> {minDiskUsageValue}</span>
        </Indicator>
        <Indicator title="Distribution">
          <span className="is-capitalized">
            {diskUsageDistribution}
          </span>
        </Indicator>
      </MetricsWrapper>

      <MetricsWrapper title="System">
        <Indicator title="Network pool usage">
          {Math.round(networkPoolUsage * 10000) / 100}
          <span className="subtitle has-text-weight-light">%</span>
        </Indicator>
        <Indicator title="Request pool usage">
          {Math.round(requestPoolUsage * 10000) / 100}
          <span className="subtitle has-text-weight-light">%</span>
        </Indicator>
      </MetricsWrapper>
    </div>
  );
}

export default Topics;
