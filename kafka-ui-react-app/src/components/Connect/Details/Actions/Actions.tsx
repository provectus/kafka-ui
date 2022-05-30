import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import { ConnectorState, ConnectorAction } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import {
  clusterConnectConnectorEditPath,
  clusterConnectorsPath,
  RouterParamsClusterConnectConnector,
} from 'lib/paths';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import styled from 'styled-components';
import { Button } from 'components/common/Button/Button';

const ConnectorActionsWrapperStyled = styled.div`
  display: flex;
  gap: 8px;
`;

export interface ActionsProps {
  deleteConnector(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): Promise<unknown>;
  isConnectorDeleting: boolean;
  connectorStatus?: ConnectorState;
  restartConnector(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): void;
  restartTasks(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
    action: ConnectorAction;
  }): void;
  pauseConnector(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): void;
  resumeConnector(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): void;
  isConnectorActionRunning: boolean;
}

const Actions: React.FC<ActionsProps> = ({
  deleteConnector,
  isConnectorDeleting,
  connectorStatus,
  restartConnector,
  restartTasks,
  pauseConnector,
  resumeConnector,
  isConnectorActionRunning,
}) => {
  const { clusterName, connectName, connectorName } =
    useAppParams<RouterParamsClusterConnectConnector>();

  const navigate = useNavigate();

  const [
    isDeleteConnectorConfirmationVisible,
    setIsDeleteConnectorConfirmationVisible,
  ] = React.useState(false);

  const deleteConnectorHandler = async () => {
    try {
      await deleteConnector({ clusterName, connectName, connectorName });
      navigate(clusterConnectorsPath(clusterName));
    } catch {
      // do not redirect
    }
  };

  const restartConnectorHandler = () => {
    restartConnector({ clusterName, connectName, connectorName });
  };

  const restartTasksHandler = (actionType: ConnectorAction) => {
    restartTasks({
      clusterName,
      connectName,
      connectorName,
      action: actionType,
    });
  };

  const pauseConnectorHandler = () => {
    pauseConnector({ clusterName, connectName, connectorName });
  };

  const resumeConnectorHandler = () => {
    resumeConnector({ clusterName, connectName, connectorName });
  };

  return (
    <ConnectorActionsWrapperStyled>
      {connectorStatus === ConnectorState.RUNNING && (
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={pauseConnectorHandler}
          disabled={isConnectorActionRunning}
        >
          <span>
            <i className="fas fa-pause" />
          </span>
          <span>Pause</span>
        </Button>
      )}

      {connectorStatus === ConnectorState.PAUSED && (
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={resumeConnectorHandler}
          disabled={isConnectorActionRunning}
        >
          <span>
            <i className="fas fa-play" />
          </span>
          <span>Resume</span>
        </Button>
      )}

      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={restartConnectorHandler}
        disabled={isConnectorActionRunning}
      >
        <span>
          <i className="fas fa-sync-alt" />
        </span>
        <span>Restart Connector</span>
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={() => restartTasksHandler(ConnectorAction.RESTART_ALL_TASKS)}
        disabled={isConnectorActionRunning}
      >
        <span>
          <i className="fas fa-sync-alt" />
        </span>
        <span>Restart All Tasks</span>
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        onClick={() =>
          restartTasksHandler(ConnectorAction.RESTART_FAILED_TASKS)
        }
        disabled={isConnectorActionRunning}
      >
        <span>
          <i className="fas fa-sync-alt" />
        </span>
        <span>Restart Failed Tasks</span>
      </Button>
      <Button
        buttonSize="M"
        buttonType="primary"
        type="button"
        disabled={isConnectorActionRunning}
        to={clusterConnectConnectorEditPath(
          clusterName,
          connectName,
          connectorName
        )}
      >
        <span>
          <i className="fas fa-pencil-alt" />
        </span>
        <span>Edit Config</span>
      </Button>

      <Button
        buttonSize="M"
        buttonType="secondary"
        type="button"
        onClick={() => setIsDeleteConnectorConfirmationVisible(true)}
        disabled={isConnectorActionRunning}
      >
        <span>
          <i className="far fa-trash-alt" />
        </span>
        <span>Delete</span>
      </Button>
      <ConfirmationModal
        isOpen={isDeleteConnectorConfirmationVisible}
        onCancel={() => setIsDeleteConnectorConfirmationVisible(false)}
        onConfirm={deleteConnectorHandler}
        isConfirming={isConnectorDeleting}
      >
        Are you sure you want to remove <b>{connectorName}</b> connector?
      </ConfirmationModal>
    </ConnectorActionsWrapperStyled>
  );
};

export default Actions;
