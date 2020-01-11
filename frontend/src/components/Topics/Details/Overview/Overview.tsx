import React from 'react';
import { ClusterId, Topic, TopicDetails, TopicName } from 'types';
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
      <MetricsWrapper wrapperClassName="notification">
        <Indicator title="Partitions">
          {partitionCount}
        </Indicator>
        <Indicator title="Replication Factor">
          {replicationFactor}
        </Indicator>
        <Indicator title="Under replicated partitions">
          {underReplicatedPartitions}
        </Indicator>
        <Indicator title="In sync replicas">
          {inSyncReplicas}
          <span className="subtitle has-text-weight-light"> of {replicas}</span>
        </Indicator>
      </MetricsWrapper>

      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Partition ID</th>
            <th>Broker leader</th>
          </tr>
        </thead>
        <tbody>
          {partitions.map(({ partition, leader }) => (
            <tr>
              <td>{partition}</td>
              <td>{leader}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Overview;
