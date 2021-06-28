import React from 'react';
import {
  Topic,
  TopicDetails,
  ConsumerTopicPartitionDetail,
} from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  consumerGroups: ConsumerTopicPartitionDetail[];
  fetchTopicConsumerGroups(
    clusterName: ClusterName,
    topicName: TopicName
  ): void;
}

const TopicConsumerGroups: React.FC<Props> = ({
  consumerGroups,
  fetchTopicConsumerGroups,
  clusterName,
  topicName,
}) => {
  React.useEffect(() => {
    fetchTopicConsumerGroups(clusterName, topicName);
  }, []);

  return (
    <div className="box">
      {consumerGroups.length > 0 ? (
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Group ID</th>
              <th>Consumer ID</th>
              <th>Host</th>
              <th>Partition</th>
              <th>Messages behind</th>
              <th>Current offset</th>
              <th>End offset</th>
            </tr>
          </thead>
          <tbody>
            {consumerGroups.map((consumer) => (
              <tr key={consumer.consumerId}>
                <td>{consumer.groupId}</td>
                <td>{consumer.consumerId}</td>
                <td>{consumer.host}</td>
                <td>{consumer.partition}</td>
                <td>{consumer.messagesBehind}</td>
                <td>{consumer.currentOffset}</td>
                <td>{consumer.endOffset}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        'No active consumer groups'
      )}
    </div>
  );
};

export default TopicConsumerGroups;
