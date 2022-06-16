import React from 'react';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { ClusterName, TopicName } from 'redux/interfaces';
import { useAppSelector } from 'lib/hooks/redux';
import { getTopicConfig } from 'redux/reducers/topics/selectors';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';

import ConfigListItem from './ConfigListItem';

export interface Props {
  isFetched: boolean;
  fetchTopicConfig: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }) => void;
}

const Settings: React.FC<Props> = ({ isFetched, fetchTopicConfig }) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const config = useAppSelector((state) => getTopicConfig(state, topicName));

  React.useEffect(() => {
    fetchTopicConfig({ clusterName, topicName });
  }, [fetchTopicConfig, clusterName, topicName]);

  if (!isFetched) {
    return <PageLoader />;
  }

  if (!config) {
    return null;
  }

  return (
    <div>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Key" />
            <TableHeaderCell title="Value" />
            <TableHeaderCell title="Default Value" />
          </tr>
        </thead>
        <tbody>
          {config.map((item) => (
            <ConfigListItem key={item.name} config={item} />
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Settings;
