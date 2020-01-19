import React from 'react';
import { ClusterId, Topic, TopicDetails, TopicName } from 'lib/interfaces';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';

interface Props extends Topic, TopicDetails {
  isFetched: boolean;
  clusterId: ClusterId;
  topicName: TopicName;
  fetchTopicDetails: (clusterId: ClusterId, topicName: TopicName) => void;
}

const Overview: React.FC<Props> = ({
  isFetched,
  clusterId,
  topicName,
  partitions,
  underReplicatedPartitions,
  inSyncReplicas,
  replicas,
  partitionCount,
  internal,
  replicationFactor,
  fetchTopicDetails,
}) => {
  React.useEffect(
    () => { fetchTopicDetails(clusterId, topicName); },
    [fetchTopicDetails, clusterId, topicName],
  );

  if (!isFetched) {
    return null;
  }

  return (
    <>
      <MetricsWrapper>
        <Indicator label="Partitions">
          {partitionCount}
        </Indicator>
        <Indicator label="Replication Factor">
          {replicationFactor}
        </Indicator>
        <Indicator label="URP" title="Under replicated partitions">
          {underReplicatedPartitions}
        </Indicator>
        <Indicator label="In sync replicas">
          {inSyncReplicas}
          <span className="subtitle has-text-weight-light"> of {replicas}</span>
        </Indicator>
        <Indicator label="Type">
          <span className="tag is-primary">
            {internal ? 'Internal' : 'External'}
          </span>
        </Indicator>
      </MetricsWrapper>
      <div className="box">
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Partition ID</th>
              <th>Broker leader</th>
            </tr>
          </thead>
          <tbody>
            {partitions.map(({ partition, leader }) => (
              <tr key={`partition-list-item-key-${partition}`}>
                <td>{partition}</td>
                <td>{leader}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Overview;
