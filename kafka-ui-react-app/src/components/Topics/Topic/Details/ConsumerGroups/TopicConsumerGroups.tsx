import React from 'react';
import { Topic, TopicDetails, ConsumerGroup } from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';
import { useHistory } from 'react-router';
import { clusterConsumerGroupsPath } from 'lib/paths';
import StyledTable from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import TagStyled from 'components/common/Tag/Tag.styled';

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
    <div>
      <StyledTable isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Consumer group ID" />
            <TableHeaderCell title="Num of members" />
            <TableHeaderCell title="Messages behind" />
            <TableHeaderCell title="Coordinator" />
            <TableHeaderCell title="State" />
          </tr>
        </thead>
        <tbody>
          {consumerGroups.map((consumer) => (
            <tr
              key={consumer.groupId}
              className="is-clickable"
              onClick={() => goToConsumerGroupDetails(consumer)}
            >
              <td style={{ fontWeight: 500 }}>{consumer.groupId}</td>
              <td>{consumer.members}</td>
              <td>{consumer.messagesBehind}</td>
              <td>{consumer.coordinator?.id}</td>
              <td>
                {consumer.state && (
                  <TagStyled
                    color="yellow"
                    text={`${consumer.state
                      .charAt(0)
                      .toUpperCase()}${consumer.state.slice(1).toLowerCase()}`}
                  />
                )}
              </td>
            </tr>
          ))}
          {consumerGroups.length === 0 && (
            <tr>
              <td colSpan={10}>No active consumer groups</td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default TopicConsumerGroups;
