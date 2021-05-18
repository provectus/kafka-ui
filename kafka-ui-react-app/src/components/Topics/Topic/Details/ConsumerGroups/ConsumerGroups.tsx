import React from 'react';
import { Topic, TopicDetails, ConsumerGroup } from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';
import ListItem from 'components/ConsumerGroups/List/ListItem';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  consumerGroups: Array<ConsumerGroup>;
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
        <table className="table is-striped is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Consumer group ID</th>
              <th>Num of consumers</th>
              <th>Num of topics</th>
            </tr>
          </thead>
          <tbody>
            {consumerGroups.map((consumerGroup) => (
              <ListItem
                key={consumerGroup.consumerGroupId}
                consumerGroup={consumerGroup}
              />
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
