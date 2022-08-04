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
  clusterConnectConnectorEditPath,
  clusterConnectorsPath,
  RouterParamsClusterConnectConnector,
} from 'lib/paths';
import { Button } from 'components/common/Button/Button';
import { useConfirm } from 'lib/hooks/useConfirm';

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
      {connector?.status.state === ConnectorState.RUNNING && (
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={pauseConnectorHandler}
          disabled={isMutating}
        >
          Pause
        </Button>
      )}

      {connector?.status.state === ConnectorState.PAUSED && (
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={resumeConnectorHandler}
          disabled={isMutating}
        >
          Resume
        </Button>
      )}

      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={restartConnectorHandler}
        disabled={isMutating}
      >
        Restart Connector
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={restartAllTasksHandler}
        disabled={isMutating}
      >
        Restart All Tasks
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={restartFailedTasksHandler}
        disabled={isMutating}
      >
        Restart Failed Tasks
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        disabled={isMutating}
        to={clusterConnectConnectorEditPath(
          routerProps.clusterName,
          routerProps.connectName,
          routerProps.connectorName
        )}
      >
        Edit Config
      </Button>

      <Button
        buttonSize="M"
        buttonType="secondary"
        type="button"
        onClick={deleteConnectorHandler}
        disabled={isMutating}
      >
        Delete
      </Button>
    </ConnectorActionsWrapperStyled>
  );
};

export default Actions;
