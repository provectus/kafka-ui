import PageLoader from 'components/common/PageLoader/PageLoader';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { TopicConfig } from 'generated-sources';
import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';

import ConfigListItem from './ConfigListItem';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  config?: TopicConfig[];
  isFetched: boolean;
  fetchTopicConfig: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }) => void;
}

const Settings: React.FC<Props> = ({
  clusterName,
  topicName,
  isFetched,
  fetchTopicConfig,
  config,
}) => {
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
