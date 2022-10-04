import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { clusterConnectConnectorPath, ClusterNameRoute } from 'lib/paths';
import Table from 'components/common/NewTable';
import { FullConnectorInfo } from 'generated-sources';
import { useConnectors } from 'lib/hooks/api/kafkaConnect';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ActionsCell from './ActionsCell';
import TopicCell from './TopicCell';
import StatusCell from './StatusCell';
import RunningTasksCell from './RunningTasksCell';

const List: React.FC = () => {
  const navigate = useNavigate();
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const [searchParams] = useSearchParams();
  const { data: connectors } = useConnectors(
    clusterName,
    searchParams.get('q') || ''
  );

  const columns = React.useMemo<ColumnDef<FullConnectorInfo>[]>(
    () => [
      { header: 'Name', accessorKey: 'name' },
      { header: 'Connect', accessorKey: 'connect' },
      { header: 'Type', accessorKey: 'type' },
      { header: 'Plugin', accessorKey: 'connectorClass' },
      { header: 'Topics', cell: TopicCell },
      { header: 'Status', accessorKey: 'status.state', cell: StatusCell },
      { header: 'Running Tasks', cell: RunningTasksCell },
      { header: '', id: 'action', cell: ActionsCell },
    ],
    []
  );

  return (
    <Table
      data={connectors || []}
      columns={columns}
      enableSorting
      onRowClick={({ original: { connect, name } }) =>
        navigate(clusterConnectConnectorPath(clusterName, connect, name))
      }
      emptyMessage="No connectors found"
    />
  );
};

export default List;
