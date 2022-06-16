import React from 'react';
import { Link } from 'react-router-dom';
import { ClusterName, TopicName } from 'redux/interfaces';
import { clusterConsumerGroupsPath, RouteParamsClusterTopic } from 'lib/paths';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Tag } from 'components/common/Tag/Tag.styled';
import { TableKeyLink } from 'components/common/table/Table/TableKeyLink.styled';
import PageLoader from 'components/common/PageLoader/PageLoader';
import getTagColor from 'components/common/Tag/getTagColor';
import { useAppSelector } from 'lib/hooks/redux';
import { getTopicConsumerGroups } from 'redux/reducers/topics/selectors';
import useAppParams from 'lib/hooks/useAppParams';

export interface Props {
  isFetched: boolean;
  fetchTopicConsumerGroups(payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }): void;
}

const TopicConsumerGroups: React.FC<Props> = ({
  fetchTopicConsumerGroups,
  isFetched,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const consumerGroups = useAppSelector((state) =>
    getTopicConsumerGroups(state, topicName)
  );

  React.useEffect(() => {
    fetchTopicConsumerGroups({ clusterName, topicName });
  }, [clusterName, fetchTopicConsumerGroups, topicName]);

  if (!isFetched) {
    return <PageLoader />;
  }

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
