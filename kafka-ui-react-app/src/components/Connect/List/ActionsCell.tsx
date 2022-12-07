import React from 'react';
import { ConnectorAction, FullConnectorInfo } from 'generated-sources';
import { CellContext } from '@tanstack/react-table';
import { ClusterNameRoute } from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import {
  useDeleteConnector,
  useUpdateConnectorState,
} from 'lib/hooks/api/kafkaConnect';
import { useConfirm } from 'lib/hooks/useConfirm';
import { useIsMutating } from '@tanstack/react-query';

const ActionsCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { connect: connectName, name: connectorName } = row.original;

  const { clusterName } = useAppParams<ClusterNameRoute>();
  const mutationsNumber = useIsMutating();
  const isMutating = mutationsNumber > 0;

  const confirm = useConfirm();
  const deleteMutation = useDeleteConnector({
    clusterName,
    connectName,
    connectorName,
  });

  const handleDelete = () => {
    confirm(
      <>
        Are you sure want to remove <b>{connectorName}</b> connector?
      </>,
      async () => {
        await deleteMutation.mutateAsync();
      }
    );
  };

  const stateMutation = useUpdateConnectorState({
    clusterName,
    connectName,
    connectorName,
  });

  const restartConnectorHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART);
  const restartAllTasksHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART_ALL_TASKS);
  const restartFailedTasksHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART_FAILED_TASKS);

  return (
    <Dropdown>
      <DropdownItem onClick={handleDelete} danger>
        Remove Connector
      </DropdownItem>
      <DropdownItem onClick={restartConnectorHandler} disabled={isMutating}>
        Restart Connector
      </DropdownItem>
      <DropdownItem onClick={restartAllTasksHandler} disabled={false}>
        Restart All Tasks
      </DropdownItem>
      <DropdownItem onClick={restartFailedTasksHandler} disabled={isMutating}>
        Restart Failed Tasks
      </DropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
