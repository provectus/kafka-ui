import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useIsMutating } from '@tanstack/react-query';
import { ConnectorState, ConnectorAction } from 'generated-sources';
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
import { Dropdown, DropdownItem } from 'components/common/Dropdown';

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
          <DropdownItem onClick={pauseConnectorHandler} disabled={isMutating}>
            Pause
          </DropdownItem>
        )}
        {connector?.status.state === ConnectorState.PAUSED && (
          <DropdownItem onClick={resumeConnectorHandler} disabled={isMutating}>
            Resume
          </DropdownItem>
        )}
        <DropdownItem onClick={restartConnectorHandler} disabled={isMutating}>
          Restart Connector
        </DropdownItem>
        <DropdownItem onClick={restartAllTasksHandler} disabled={isMutating}>
          Restart All Tasks
        </DropdownItem>
        <DropdownItem onClick={restartFailedTasksHandler} disabled={isMutating}>
          Restart Failed Tasks
        </DropdownItem>
        <DropdownItem onClick={deleteConnectorHandler} disabled={isMutating}>
          Delete
        </DropdownItem>
      </Dropdown>
    </ConnectorActionsWrapperStyled>
  );
};

export default Actions;
