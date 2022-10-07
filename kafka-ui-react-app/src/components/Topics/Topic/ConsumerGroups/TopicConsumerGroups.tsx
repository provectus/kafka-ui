import React from 'react';
import { Link } from 'react-router-dom';
import { clusterConsumerGroupsPath, RouteParamsClusterTopic } from 'lib/paths';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';
import getTagColor from 'components/common/Tag/getTagColor';
import useAppParams from 'lib/hooks/useAppParams';
import { useTopicConsumerGroups } from 'lib/hooks/api/topics';

const TopicConsumerGroups: React.FC = () => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const { data: consumerGroups } = useTopicConsumerGroups({
    clusterName,
    topicName,
  });
  return (
    <Table isFullwidth>
      <thead>
        <tr>
          <TableHeaderCell title="Consumer Group ID" />
          <TableHeaderCell title="Active Consumers" />
          <TableHeaderCell title="Messages Behind" />
          <TableHeaderCell title="Coordinator" />
          <TableHeaderCell title="State" />
        </tr>
      </thead>
      <tbody>
        {consumerGroups?.map((consumer) => (
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
                <Tag color={getTagColor(consumer.state)}>{`${consumer.state
                  .charAt(0)
                  .toUpperCase()}${consumer.state
                  .slice(1)
                  .toLowerCase()}`}</Tag>
              )}
            </td>
          </tr>
        ))}
        {(!consumerGroups || consumerGroups.length === 0) && (
          <tr>
            <td colSpan={10}>No active consumer groups</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default TopicConsumerGroups;
