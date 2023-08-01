import React from 'react';
import {
  Action,
  ConnectorAction,
  ConnectorState,
  FullConnectorInfo,
  ResourceType,
} from 'generated-sources';
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
import { ActionDropdownItem } from 'components/common/ActionComponent';

const ActionsCell: React.FC<CellContext<FullConnectorInfo, unknown>> = ({
  row,
}) => {
  const { connect, name, status } = row.original;
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const mutationsNumber = useIsMutating();
  const isMutating = mutationsNumber > 0;
  const confirm = useConfirm();
  const deleteMutation = useDeleteConnector({
    clusterName,
    connectName: connect,
    connectorName: name,
  });
  const stateMutation = useUpdateConnectorState({
    clusterName,
    connectName: connect,
    connectorName: name,
  });
  const handleDelete = () => {
    confirm(
      <>
        Are you sure want to remove <b>{name}</b> connector?
      </>,
      async () => {
        await deleteMutation.mutateAsync();
      }
    );
  };
  // const stateMutation = useUpdateConnectorState(routerProps);
  const resumeConnectorHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESUME);
  const restartConnectorHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART);

  const restartAllTasksHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART_ALL_TASKS);

  const restartFailedTasksHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART_FAILED_TASKS);

  return (
    <Dropdown>
      {status.state === ConnectorState.PAUSED && (
        <ActionDropdownItem
          onClick={resumeConnectorHandler}
          disabled={isMutating}
          permission={{
            resource: ResourceType.CONNECT,
            action: Action.EDIT,
            value: name,
          }}
        >
          Resume
        </ActionDropdownItem>
      )}
      <ActionDropdownItem
        onClick={restartConnectorHandler}
        disabled={isMutating}
        permission={{
          resource: ResourceType.CONNECT,
          action: Action.RESTART,
          value: name,
        }}
      >
        Restart Connector
      </ActionDropdownItem>
      <ActionDropdownItem
        onClick={restartAllTasksHandler}
        disabled={isMutating}
        permission={{
          resource: ResourceType.CONNECT,
          action: Action.RESTART,
          value: name,
        }}
      >
        Restart All Tasks
      </ActionDropdownItem>
      <ActionDropdownItem
        onClick={restartFailedTasksHandler}
        disabled={isMutating}
        permission={{
          resource: ResourceType.CONNECT,
          action: Action.RESTART,
          value: name,
        }}
      >
        Restart Failed Tasks
      </ActionDropdownItem>
      <DropdownItem onClick={handleDelete} danger>
        Remove Connector
      </DropdownItem>
    </Dropdown>
  );
};

export default ActionsCell;
