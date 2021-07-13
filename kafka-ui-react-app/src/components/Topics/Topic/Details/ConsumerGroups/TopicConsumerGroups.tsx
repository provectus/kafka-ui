import React from 'react';
import { Topic, TopicDetails, ConsumerGroup } from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';
import ConsumerGroupStateTag from 'components/common/ConsumerGroupState/ConsumerGroupStateTag';
import { useHistory } from 'react-router';
import { clusterConsumerGroupsPath } from 'lib/paths';

interface Props extends Topic, TopicDetails {
  clusterName: ClusterName;
  topicName: TopicName;
  consumerGroups: ConsumerGroup[];
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

  const history = useHistory();
  function goToConsumerGroupDetails(consumer: ConsumerGroup) {
    history.push(
      `${clusterConsumerGroupsPath(clusterName)}/${consumer.groupId}`
    );
  }

  return (
    <div className="box">
      {consumerGroups.length > 0 ? (
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Consumer group ID</th>
              <th>Num of members</th>
              <th>Messages behind</th>
              <th>Coordinator</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {consumerGroups.map((consumer) => (
              <tr
                key={consumer.groupId}
                className="is-clickable"
                onClick={() => goToConsumerGroupDetails(consumer)}
              >
                <td>{consumer.groupId}</td>
                <td>{consumer.members}</td>
                <td>{consumer.messagesBehind}</td>
                <td>{consumer.coordinator?.id}</td>
                <td>
                  <ConsumerGroupStateTag state={consumer.state} />
                </td>
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
