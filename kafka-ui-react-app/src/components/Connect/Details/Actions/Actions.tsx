import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useIsMutating } from '@tanstack/react-query';
import {
  Action,
  ConnectorAction,
  ConnectorState,
  UserPermissionResourceEnum,
} from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import {
  useConnector,
  useDeleteConnector,
  useUpdateConnectorState,
} from 'lib/hooks/api/kafkaConnect';
import {
  clusterConnectorsPath,
  RouterParamsClusterConnectConnector,
} from 'lib/paths';
import { useConfirm } from 'lib/hooks/useConfirm';
import { Dropdown } from 'components/common/Dropdown';
import { usePermission } from 'lib/hooks/usePermission';
import ActionDropdownItem from 'components/common/Dropdown/ActionDropdownItem';

const ConnectorActionsWrapperStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const Actions: React.FC = () => {
  const navigate = useNavigate();
  const routerProps = useAppParams<RouterParamsClusterConnectConnector>();
  const mutationsNumber = useIsMutating();
  const isMutating = mutationsNumber > 0;

  const { data: connector } = useConnector(routerProps);
  const confirm = useConfirm();

  const canDeleteConnector = usePermission(
    UserPermissionResourceEnum.CONNECT,
    Action.DELETE,
    routerProps.connectorName
  );

  const canEditConnector = usePermission(
    UserPermissionResourceEnum.CONNECT,
    Action.EDIT,
    routerProps.connectorName
  );

  const deleteConnectorMutation = useDeleteConnector(routerProps);
  const deleteConnectorHandler = () =>
    confirm(
      <>
        Are you sure you want to remove <b>{routerProps.connectorName}</b>{' '}
        connector?
      </>,
      async () => {
        try {
          await deleteConnectorMutation.mutateAsync();
          navigate(clusterConnectorsPath(routerProps.clusterName));
        } catch {
          // do not redirect
        }
      }
    );

  const stateMutation = useUpdateConnectorState(routerProps);
  const restartConnectorHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART);
  const restartAllTasksHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART_ALL_TASKS);
  const restartFailedTasksHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESTART_FAILED_TASKS);
  const pauseConnectorHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.PAUSE);
  const resumeConnectorHandler = () =>
    stateMutation.mutateAsync(ConnectorAction.RESUME);

  return (
    <ConnectorActionsWrapperStyled>
      <Dropdown>
        {connector?.status.state === ConnectorState.RUNNING && (
          <ActionDropdownItem
            onClick={pauseConnectorHandler}
            disabled={isMutating}
            canDoAction={canEditConnector}
          >
            Pause
          </ActionDropdownItem>
        )}
        {connector?.status.state === ConnectorState.PAUSED && (
          <ActionDropdownItem
            onClick={resumeConnectorHandler}
            disabled={isMutating}
            canDoAction={canEditConnector}
          >
            Resume
          </ActionDropdownItem>
        )}
        <ActionDropdownItem
          onClick={restartConnectorHandler}
          disabled={isMutating}
          canDoAction={canEditConnector}
        >
          Restart Connector
        </ActionDropdownItem>
        <ActionDropdownItem
          onClick={restartAllTasksHandler}
          disabled={isMutating}
          canDoAction={canEditConnector}
        >
          Restart All Tasks
        </ActionDropdownItem>
        <ActionDropdownItem
          onClick={restartFailedTasksHandler}
          disabled={isMutating}
          canDoAction={canEditConnector}
        >
          Restart Failed Tasks
        </ActionDropdownItem>
        <ActionDropdownItem
          onClick={deleteConnectorHandler}
          disabled={isMutating}
          danger
          canDoAction={canDeleteConnector}
        >
          Delete
        </ActionDropdownItem>
      </Dropdown>
    </ConnectorActionsWrapperStyled>
  );
};

export default Actions;
