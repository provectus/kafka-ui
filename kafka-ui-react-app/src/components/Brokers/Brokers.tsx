import React from 'react';
import { ClusterName, BrokerMetrics, ZooKeeperStatus } from 'redux/interfaces';
import useInterval from 'lib/hooks/useInterval';
import formatBytes from 'lib/utils/formatBytes';
import cx from 'classnames';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

interface Props extends BrokerMetrics {
  clusterName: ClusterName;
  isFetched: boolean;
  minDiskUsage: number;
  maxDiskUsage: number;
  fetchBrokers: (clusterName: ClusterName) => void;
  fetchBrokerMetrics: (clusterName: ClusterName) => void;
}

const Topics: React.FC<Props> = ({
  clusterName,
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
      fetchBrokers(clusterName);
      fetchBrokerMetrics(clusterName);
    },
    [fetchBrokers, fetchBrokerMetrics, clusterName],
  );

  useInterval(() => { fetchBrokerMetrics(clusterName); }, 5000);

  const [minDiskUsageValue, minDiskUsageSize] = formatBytes(minDiskUsage);
  const [maxDiskUsageValue, maxDiskUsageSize] = formatBytes(maxDiskUsage);

  const zkOnline = zooKeeperStatus === ZooKeeperStatus.online;

  return (
    <div className="section">
      <Breadcrumb>Brokers overview</Breadcrumb>

      <MetricsWrapper title="Uptime">
        <Indicator label="Total Brokers">
          {brokerCount}
        </Indicator>
        <Indicator label="Active Controllers">
          {activeControllers}
        </Indicator>
        <Indicator label="Zookeeper Status">
          <span className={cx('tag', zkOnline ? 'is-primary' : 'is-danger')}>
            {zkOnline ? 'Online' : 'Offline'}
          </span>
        </Indicator>
      </MetricsWrapper>

      <MetricsWrapper title="Partitions">
        <Indicator label="Online">
          <span className={cx({'has-text-danger': offlinePartitionCount !== 0})}>
            {onlinePartitionCount}
          </span>
          <span className="subtitle has-text-weight-light"> of {onlinePartitionCount + offlinePartitionCount}</span>
        </Indicator>
        <Indicator label="URP" title="Under replicated partitions">
          {underReplicatedPartitionCount}
        </Indicator>
        <Indicator label="In Sync Replicas">
          <span className="has-text-grey-lighter">
            Soon
          </span>
        </Indicator>
        <Indicator label="Out of Sync Replicas">
          <span className="has-text-grey-lighter">
            Soon
          </span>
        </Indicator>
      </MetricsWrapper>

      <MetricsWrapper title="Disk">
        <Indicator label="Max usage">
          {maxDiskUsageValue}
          <span className="subtitle has-text-weight-light"> {maxDiskUsageSize}</span>
        </Indicator>
        <Indicator label="Min usage">
          {minDiskUsageValue}
          <span className="subtitle has-text-weight-light"> {minDiskUsageSize}</span>
        </Indicator>
        <Indicator label="Distribution">
          <span className="is-capitalized">
            {diskUsageDistribution}
          </span>
        </Indicator>
      </MetricsWrapper>

      <MetricsWrapper title="System">
        <Indicator label="Network pool usage">
          {Math.round(networkPoolUsage * 10000) / 100}
          <span className="subtitle has-text-weight-light">%</span>
        </Indicator>
        <Indicator label="Request pool usage">
          {Math.round(requestPoolUsage * 10000) / 100}
          <span className="subtitle has-text-weight-light">%</span>
        </Indicator>
      </MetricsWrapper>
    </div>
  );
};

export default Topics;
