import React from 'react';
import { ClusterId, BrokerMetrics, ZooKeeperStatus } from 'types';
import useInterval from 'lib/hooks/useInterval';
import formatBytes from 'lib/utils/formatBytes';
import cx from 'classnames';

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

  return (
    <div className="section">
      <div className="box">
        <h5 className="title is-5">Uptime</h5>
        <div className="level">
          <div className="level-item level-left">
            <div>
              <p className="heading">Total Brokers</p>
              <p className="title">{brokerCount}</p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">Active Controllers</p>
              <p className="title">{activeControllers}</p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">Zookeeper Status</p>
              <p className="title">
                {zooKeeperStatus === ZooKeeperStatus.online ? (
                  <span className="tag is-primary">Online</span>
                ) : (
                  <span className="tag is-danger">Offline</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="box">
        <h5 className="title is-5">Partitions</h5>
        <div className="level">
          <div className="level-item level-left">
            <div>
              <p className="heading">Online</p>
              <p>
                <span className={cx('title', {'has-text-danger': offlinePartitionCount !== 0})}>
                  {onlinePartitionCount}
                </span>
                <span className="subtitle"> of {onlinePartitionCount + offlinePartitionCount}</span>
              </p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">Under Replicated</p>
              <p className="title">{underReplicatedPartitionCount}</p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">In Sync Replicas</p>
              <p className="title has-text-grey-lighter">Soon</p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">Out of Sync Replicas</p>
              <p className="title has-text-grey-lighter">Soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="box">
        <h5 className="title is-5">Disk</h5>
        <div className="level">
          <div className="level-item level-left">
            <div>
              <p className="heading">Max usage</p>
              <p>
                <span className="title">{maxDiskUsageValue}</span>
                <span className="subtitle"> {maxDiskUsageSize}</span>
              </p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">Min Usage</p>
              <p>
                <span className="title">{minDiskUsageValue}</span>
                <span className="subtitle"> {minDiskUsageSize}</span>
              </p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">Distribution</p>
              <p className="title is-capitalized">{diskUsageDistribution}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="box">
        <h5 className="title is-5">System</h5>
        <div className="level">
          <div className="level-item level-left">
            <div>
              <p className="heading">Network pool usage</p>
              <p className="title">
                {Math.round(networkPoolUsage * 10000) / 100}
                <span className="subtitle">%</span>
              </p>
            </div>
          </div>
          <div className="level-item level-left">
            <div>
              <p className="heading">Request pool usage</p>
              <p className="title">
                {Math.round(requestPoolUsage * 10000) / 100}
                <span className="subtitle">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topics;
