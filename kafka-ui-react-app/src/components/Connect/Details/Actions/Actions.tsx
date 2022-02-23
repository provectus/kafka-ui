import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { ConnectorState } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import {
  clusterConnectConnectorEditPath,
  clusterConnectorsPath,
} from 'lib/paths';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import styled from 'styled-components';
import { Button } from 'components/common/Button/Button';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

const ConnectorActionsWrapperStyled = styled.div`
  display: flex;
  gap: 8px;
`;

export interface ActionsProps {
  deleteConnector(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): Promise<void>;
  isConnectorDeleting: boolean;
  connectorStatus?: ConnectorState;
  restartConnector(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): void;
  pauseConnector(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): void;
  resumeConnector(
    clusterName: ClusterName,
    connectName: ConnectName,
    connectorName: ConnectorName
  ): void;
  isConnectorActionRunning: boolean;
}

const Actions: React.FC<ActionsProps> = ({
  deleteConnector,
  isConnectorDeleting,
  connectorStatus,
  restartConnector,
  pauseConnector,
  resumeConnector,
  isConnectorActionRunning,
}) => {
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();
  const history = useHistory();
  const [
    isDeleteConnectorConfirmationVisible,
    setIsDeleteConnectorConfirmationVisible,
  ] = React.useState(false);

  const deleteConnectorHandler = React.useCallback(async () => {
    try {
      await deleteConnector(clusterName, connectName, connectorName);
      history.push(clusterConnectorsPath(clusterName));
    } catch {
      // do not redirect
    }
  }, [deleteConnector, clusterName, connectName, connectorName, history]);

  const restartConnectorHandler = React.useCallback(() => {
    restartConnector(clusterName, connectName, connectorName);
  }, [restartConnector, clusterName, connectName, connectorName]);

  const pauseConnectorHandler = React.useCallback(() => {
    pauseConnector(clusterName, connectName, connectorName);
  }, [pauseConnector, clusterName, connectName, connectorName]);

  const resumeConnectorHandler = React.useCallback(() => {
    resumeConnector(clusterName, connectName, connectorName);
  }, [resumeConnector, clusterName, connectName, connectorName]);

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
        isLink
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
