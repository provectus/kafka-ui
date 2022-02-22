import React from 'react';
import { Topic, TopicDetails, ConsumerGroup } from 'generated-sources';
import { ClusterName, TopicName } from 'redux/interfaces';
import { clusterConsumerGroupsPath } from 'lib/paths';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';
import { Link } from 'react-router-dom';
import getTagColor from 'components/ConsumerGroups/Utils/TagColor';

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
  }, [clusterName, fetchTopicConsumerGroups, topicName]);

  return (
    <div>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Consumer Group ID" />
            <TableHeaderCell title="Num Of Members" />
            <TableHeaderCell title="Messages Behind" />
            <TableHeaderCell title="Coordinator" />
            <TableHeaderCell title="State" />
          </tr>
        </thead>
        <tbody>
          {consumerGroups.map((consumer) => (
            <tr key={consumer.groupId}>
              <TableKeyLink>
                <Link
                  to={`${clusterConsumerGroupsPath(clusterName)}/${
                    consumer.groupId
                  }`}
                >
                  {consumer.groupId}
                </Link>
              </TableKeyLink>
              <td>{consumer.members}</td>
              <td>{consumer.messagesBehind}</td>
              <td>{consumer.coordinator?.id}</td>
              <td>
                {consumer.state && (
                  <Tag color={getTagColor(consumer)}>{`${consumer.state
                    .charAt(0)
                    .toUpperCase()}${consumer.state
                    .slice(1)
                    .toLowerCase()}`}</Tag>
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
      </Table>
    </div>
  );
};

export default TopicConsumerGroups;
