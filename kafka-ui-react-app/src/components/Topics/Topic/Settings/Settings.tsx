import React from 'react';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { RouteParamsClusterTopic } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { useTopicConfig } from 'lib/hooks/api/topics';

import ConfigListItem from './ConfigListItem';

const Settings: React.FC = () => {
  const props = useAppParams<RouteParamsClusterTopic>();
  const { data } = useTopicConfig(props);
  return (
    <Table isFullwidth>
      <thead>
        <tr>
          <TableHeaderCell title="Key" />
          <TableHeaderCell title="Value" />
          <TableHeaderCell title="Default Value" />
        </tr>
      </thead>
      <tbody>
        {data?.map((item) => (
          <ConfigListItem key={item.name} config={item} />
        ))}
      </tbody>
    </Table>
  );
};

export default Settings;
