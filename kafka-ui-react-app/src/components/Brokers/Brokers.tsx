import React from 'react';
import { ClusterName, ZooKeeperStatus } from 'redux/interfaces';
import { ClusterStats } from 'generated-sources';
import useInterval from 'lib/hooks/useInterval';
import cx from 'classnames';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { useParams } from 'react-router';

interface Props extends ClusterStats {
  isFetched: boolean;
  fetchClusterStats: (clusterName: ClusterName) => void;
  fetchBrokers: (clusterName: ClusterName) => void;
}

const Brokers: React.FC<Props> = ({
  brokerCount,
  activeControllers,
  zooKeeperStatus,
  onlinePartitionCount,
  offlinePartitionCount,
  inSyncReplicasCount,
  outOfSyncReplicasCount,
  underReplicatedPartitionCount,
  diskUsage,
  fetchClusterStats,
  fetchBrokers,
  version,
}) => {
  const { clusterName } = useParams<{ clusterName: ClusterName }>();

  React.useEffect(() => {
    fetchClusterStats(clusterName);
    fetchBrokers(clusterName);
  }, [fetchClusterStats, fetchBrokers, clusterName]);

  useInterval(() => {
    fetchClusterStats(clusterName);
  }, 5000);

  const zkOnline = zooKeeperStatus === ZooKeeperStatus.online;

  return (
    <div className="section">
      <Breadcrumb>Brokers overview</Breadcrumb>
      <MetricsWrapper title="Uptime">
        <Indicator className="is-one-third" label="Total Brokers">
          {brokerCount}
        </Indicator>
        <Indicator className="is-one-third" label="Active Controllers">
          {activeControllers}
        </Indicator>
        <Indicator className="is-one-third" label="Zookeeper Status">
          <span className={cx('tag', zkOnline ? 'is-success' : 'is-danger')}>
            {zkOnline ? 'Online' : 'Offline'}
          </span>
        </Indicator>
        <Indicator className="is-one-third" label="Version">
          {version}
        </Indicator>
      </MetricsWrapper>
      <MetricsWrapper title="Partitions">
        <Indicator label="Online">
          <span
            className={cx({ 'has-text-danger': offlinePartitionCount !== 0 })}
          >
            {onlinePartitionCount}
          </span>
          <span className="subtitle has-text-weight-light">
            {' '}
            of
            {(onlinePartitionCount || 0) + (offlinePartitionCount || 0)}
          </span>
        </Indicator>
        <Indicator label="URP" title="Under replicated partitions">
          {underReplicatedPartitionCount}
        </Indicator>
        <Indicator label="In Sync Replicas">{inSyncReplicasCount}</Indicator>
        <Indicator label="Out of Sync Replicas">
          {outOfSyncReplicasCount}
        </Indicator>
      </MetricsWrapper>
      <MetricsWrapper multiline title="Disk Usage">
        {diskUsage?.map((brokerDiskUsage) => (
          <React.Fragment key={brokerDiskUsage.brokerId}>
            <Indicator className="is-one-third" label="Broker">
              {brokerDiskUsage.brokerId}
            </Indicator>
            <Indicator className="is-one-third" label="Segment Size" title="">
              <BytesFormatted value={brokerDiskUsage.segmentSize} />
            </Indicator>
            <Indicator className="is-one-third" label="Segment count">
              {brokerDiskUsage.segmentCount}
            </Indicator>
          </React.Fragment>
        ))}
      </MetricsWrapper>
    </div>
  );
};

export default Brokers;
