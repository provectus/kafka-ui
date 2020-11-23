import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import { Topic, TopicDetails } from 'generated-sources';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';

interface Props extends Topic, TopicDetails {
  isFetched: boolean;
  clusterName: ClusterName;
  topicName: TopicName;
  fetchTopicDetails: (clusterName: ClusterName, topicName: TopicName) => void;
}

const Overview: React.FC<Props> = ({
  isFetched,
  clusterName,
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
  React.useEffect(() => {
    fetchTopicDetails(clusterName, topicName);
  }, [fetchTopicDetails, clusterName, topicName]);

  if (!isFetched) {
    return null;
  }

  return (
    <>
      <MetricsWrapper>
        <Indicator label="Partitions">{partitionCount}</Indicator>
        <Indicator label="Replication Factor">{replicationFactor}</Indicator>
        <Indicator label="URP" title="Under replicated partitions">
          {underReplicatedPartitions}
        </Indicator>
        <Indicator label="In sync replicas">
          {inSyncReplicas}
          <span className="subtitle has-text-weight-light">
            {' '}
            of
            {replicas}
          </span>
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
              <th>Min offset</th>
              <th>Max offset</th>
            </tr>
          </thead>
          <tbody>
            {partitions &&
              partitions.map(({ partition, leader, offsetMin, offsetMax }) => (
                <tr key={`partition-list-item-key-${partition}`}>
                  <td>{partition}</td>
                  <td>{leader}</td>
                  <td>{offsetMin}</td>
                  <td>{offsetMax}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Overview;
