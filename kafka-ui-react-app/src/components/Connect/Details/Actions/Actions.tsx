import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { ConnectorState } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import {
  clusterConnectConnectorEditPath,
  clusterConnectorsPath,
} from 'lib/paths';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

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
  }, [deleteConnector, clusterName, connectName, connectorName]);

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
    <div className="buttons">
      {connectorStatus === ConnectorState.RUNNING && (
        <button
          type="button"
          className="button"
          onClick={pauseConnectorHandler}
          disabled={isConnectorActionRunning}
        >
          <span className="icon">
            <i className="fas fa-pause" />
          </span>
          <span>Pause</span>
        </button>
      )}

      {connectorStatus === ConnectorState.PAUSED && (
        <button
          type="button"
          className="button"
          onClick={resumeConnectorHandler}
          disabled={isConnectorActionRunning}
        >
          <span className="icon">
            <i className="fas fa-play" />
          </span>
          <span>Resume</span>
        </button>
      )}

      <button
        type="button"
        className="button"
        onClick={restartConnectorHandler}
        disabled={isConnectorActionRunning}
      >
        <span className="icon">
          <i className="fas fa-sync-alt" />
        </span>
        <span>Restart all tasks</span>
      </button>

      {isConnectorActionRunning ? (
        <button type="button" className="button" disabled>
          <span className="icon">
            <i className="fas fa-edit" />
          </span>
          <span>Edit config</span>
        </button>
      ) : (
        <Link
          to={clusterConnectConnectorEditPath(
            clusterName,
            connectName,
            connectorName
          )}
          className="button"
        >
          <span className="icon">
            <i className="fas fa-pencil-alt" />
          </span>
          <span>Edit config</span>
        </Link>
      )}

      <button
        className="button is-danger"
        type="button"
        onClick={() => setIsDeleteConnectorConfirmationVisible(true)}
        disabled={isConnectorActionRunning}
      >
        <span className="icon">
          <i className="far fa-trash-alt" />
        </span>
        <span>Delete</span>
      </button>
      <ConfirmationModal
        isOpen={isDeleteConnectorConfirmationVisible}
        onCancel={() => setIsDeleteConnectorConfirmationVisible(false)}
        onConfirm={deleteConnectorHandler}
        isConfirming={isConnectorDeleting}
      >
        Are you sure you want to remove <b>{connectorName}</b> connector?
      </ConfirmationModal>
    </div>
  );
};

export default Actions;
