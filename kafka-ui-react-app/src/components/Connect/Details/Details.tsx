import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import useAppParams from 'lib/hooks/useAppParams';
import { Connector, Task } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import {
  clusterConnectConnectorConfigPath,
  clusterConnectConnectorConfigRelativePath,
  clusterConnectConnectorPath,
  clusterConnectConnectorTasksPath,
  clusterConnectConnectorTasksRelativePath,
  RouterParamsClusterConnectConnector,
} from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Navbar from 'components/common/Navigation/Navbar.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';

import OverviewContainer from './Overview/OverviewContainer';
import TasksContainer from './Tasks/TasksContainer';
import ConfigContainer from './Config/ConfigContainer';
import ActionsContainer from './Actions/ActionsContainer';

export interface DetailsProps {
  fetchConnector(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): void;
  fetchTasks(payload: {
    clusterName: ClusterName;
    connectName: ConnectName;
    connectorName: ConnectorName;
  }): void;
  isConnectorFetching: boolean;
  areTasksFetching: boolean;
  connector: Connector | null;
  tasks: Task[];
}

const Details: React.FC<DetailsProps> = ({
  fetchConnector,
  fetchTasks,
  isConnectorFetching,
  areTasksFetching,
  connector,
}) => {
  const { clusterName, connectName, connectorName } =
    useAppParams<RouterParamsClusterConnectConnector>();

  React.useEffect(() => {
    fetchConnector({ clusterName, connectName, connectorName });
  }, [fetchConnector, clusterName, connectName, connectorName]);

  React.useEffect(() => {
    fetchTasks({ clusterName, connectName, connectorName });
  }, [fetchTasks, clusterName, connectName, connectorName]);

  if (isConnectorFetching || areTasksFetching) {
    return <PageLoader />;
  }

  if (!connector) return null;

  return (
    <div>
      <PageHeading text={connectorName}>
        <ActionsContainer />
      </PageHeading>
      <Navbar role="navigation">
        <NavLink
          to={clusterConnectConnectorPath(
            clusterName,
            connectName,
            connectorName
          )}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
          end
        >
          Overview
        </NavLink>
        <NavLink
          to={clusterConnectConnectorTasksPath(
            clusterName,
            connectName,
            connectorName
          )}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          Tasks
        </NavLink>
        <NavLink
          to={clusterConnectConnectorConfigPath(
            clusterName,
            connectName,
            connectorName
          )}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          Config
        </NavLink>
      </Navbar>
      <Routes>
        <Route index element={<OverviewContainer />} />
        <Route
          path={clusterConnectConnectorTasksRelativePath}
          element={<TasksContainer />}
        />
        <Route
          path={clusterConnectConnectorConfigRelativePath}
          element={<ConfigContainer />}
        />
      </Routes>
    </div>
  );
};

export default Details;
