import React from 'react';
import { Action, ResourceType, ConnectorAction, Connector } from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import { useConfirm } from 'lib/hooks/useConfirm';
import { RouterParamsClusterConnectConnector } from 'lib/paths';
import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { ActionCanButton } from 'components/common/ActionComponent';
import { usePermission } from 'lib/hooks/usePermission';
import { useDeleteConnector, useUpdateConnectorState } from 'lib/hooks/api/kafkaConnect';
import { Row } from '@tanstack/react-table';


interface BatchActionsBarProps {
  rows: Row<Connector>[];
  resetRowSelection(): void;
}

const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  rows,
  resetRowSelection,
}) => {

  const confirm = useConfirm();

  const selectedConnectors = rows.map(({ original }) => original);

  const mutationsNumber = useIsMutating();
  const isMutating = mutationsNumber > 0;

  const routerProps = useAppParams<RouterParamsClusterConnectConnector>();
  const clusterName = routerProps.clusterName;
  const client = useQueryClient();

  const canEdit = usePermission(
    ResourceType.CONNECT,
    Action.EDIT,
    routerProps.connectorName
  );
  const canDelete = usePermission(
    ResourceType.CONNECT,
    Action.DELETE,
    routerProps.connectorName
  );

  const deleteConnectorMutation = useDeleteConnector(routerProps);
  const deleteConnectorsHandler = () =>
    confirm(
      <>
        Are you sure you want to remove selected connectors?
      </>,
      async () => {
        try {
          await deleteConnectorMutation.mutateAsync();
          resetRowSelection();
        } catch {
          // do not redirect
        }
      }
    );

  const stateMutation = useUpdateConnectorState(routerProps);
  const updateConnector = (action: ConnectorAction, message: string) => {
    confirm(message, async () => {
      try {
        await Promise.all(
          selectedConnectors.map((connector) => (
            stateMutation.mutateAsync({
              clusterName,
              connectName: connector.connect,
              connectorName: connector.name,
              action,
            })
          ))
        );
        resetRowSelection();
      } catch (e) {
        // do nothing;
      } finally {
        client.invalidateQueries(['clusters', clusterName, 'connectors']);
      }
    });
  };
  const restartConnectorHandler = () => {
    updateConnector(ConnectorAction.RESTART, 'Are you sure you want to restart selected connectors?');
  };
  const restartAllTasksHandler = () =>
    updateConnector(ConnectorAction.RESTART_ALL_TASKS, 'Are you sure you want to restart all tasks in selected connectors?');
  const restartFailedTasksHandler = () =>
    updateConnector(ConnectorAction.RESTART_FAILED_TASKS, 'Are you sure you want to restart failed tasks in selected connectors?');
  const pauseConnectorHandler = () =>
    updateConnector(ConnectorAction.PAUSE, 'Are you sure you want to pause selected connectors?');
  const resumeConnectorHandler = () =>
    updateConnector(ConnectorAction.RESUME, 'Are you sure you want to resume selected connectors?');

  return (
    <>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={pauseConnectorHandler}
        disabled={isMutating}
        canDoAction={canEdit}
      >
        Pause
      </ActionCanButton>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={resumeConnectorHandler}
        disabled={isMutating}
        canDoAction={canEdit}
      >
        Resume
      </ActionCanButton>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={restartConnectorHandler}
        disabled={isMutating}
        canDoAction={canEdit}
      >
        Restart Connector
      </ActionCanButton>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={restartAllTasksHandler}
        disabled={isMutating}
        canDoAction={canEdit}
      >
        Restart All Tasks
      </ActionCanButton>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={restartFailedTasksHandler}
        disabled={isMutating}
        canDoAction={canEdit}
      >
        Restart Failed Tasks
      </ActionCanButton>
      <ActionCanButton
        buttonSize="M"
        buttonType="secondary"
        onClick={deleteConnectorsHandler}
        disabled={isMutating}
        canDoAction={canDelete}
      >
        Delete
      </ActionCanButton>
    </>
  );
};

export default BatchActionsBar;
