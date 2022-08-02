import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useIsMutating } from '@tanstack/react-query';
import { ConnectorState, ConnectorAction } from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import useModal from 'lib/hooks/useModal';
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
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { Button } from 'components/common/Button/Button';

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

  const {
    isOpen: isDeleteConnectorConfirmationOpen,
    setClose: setDeleteConnectorConfirmationClose,
    setOpen: setDeleteConnectorConfirmationOpen,
  } = useModal();

  const deleteConnectorMutation = useDeleteConnector(routerProps);
  const deleteConnectorHandler = async () => {
    try {
      await deleteConnectorMutation.mutateAsync();
      navigate(clusterConnectorsPath(routerProps.clusterName));
    } catch {
      // do not redirect
    }
  };

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
          <span>Pause</span>
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
          <span>Resume</span>
        </Button>
      )}

      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={restartConnectorHandler}
        disabled={isMutating}
      >
        <span>Restart Connector</span>
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={restartAllTasksHandler}
        disabled={isMutating}
      >
        <span>Restart All Tasks</span>
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={restartFailedTasksHandler}
        disabled={isMutating}
      >
        <span>Restart Failed Tasks</span>
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
        <span>Edit Config</span>
      </Button>

      <Button
        buttonSize="M"
        buttonType="secondary"
        type="button"
        onClick={setDeleteConnectorConfirmationOpen}
        disabled={isMutating}
      >
        <span>Delete</span>
      </Button>
      <ConfirmationModal
        isOpen={isDeleteConnectorConfirmationOpen}
        onCancel={setDeleteConnectorConfirmationClose}
        onConfirm={deleteConnectorHandler}
        isConfirming={isMutating}
      >
        Are you sure you want to remove <b>{routerProps.connectorName}</b>{' '}
        connector?
      </ConfirmationModal>
    </ConnectorActionsWrapperStyled>
  );
};

export default Actions;
