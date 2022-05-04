import React from 'react';
import { NavLink, Route, Switch, useParams } from 'react-router-dom';
import { Connector, Task } from 'generated-sources';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import {
  clusterConnectConnectorConfigPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorTasksPath,
} from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Navbar from 'components/common/Navigation/Navbar.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';

import OverviewContainer from './Overview/OverviewContainer';
import TasksContainer from './Tasks/TasksContainer';
import ConfigContainer from './Config/ConfigContainer';
import ActionsContainer from './Actions/ActionsContainer';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

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
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();

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
          exact
          to={clusterConnectConnectorPath(
            clusterName,
            connectName,
            connectorName
          )}
          activeClassName="is-active"
        >
          Overview
        </NavLink>
        <NavLink
          exact
          to={clusterConnectConnectorTasksPath(
            clusterName,
            connectName,
            connectorName
          )}
          activeClassName="is-active"
        >
          Tasks
        </NavLink>
        <NavLink
          exact
          to={clusterConnectConnectorConfigPath(
            clusterName,
            connectName,
            connectorName
          )}
          activeClassName="is-active"
        >
          Config
        </NavLink>
      </Navbar>
      <Switch>
        <Route
          exact
          path={clusterConnectConnectorTasksPath(
            ':clusterName',
            ':connectName',
            ':connectorName'
          )}
          component={TasksContainer}
        />
        <Route
          exact
          path={clusterConnectConnectorConfigPath(
            ':clusterName',
            ':connectName',
            ':connectorName'
          )}
          component={ConfigContainer}
        />
        <Route
          exact
          path={clusterConnectConnectorPath(
            ':clusterName',
            ':connectName',
            ':connectorName'
          )}
          component={OverviewContainer}
        />
      </Switch>
    </div>
  );
};

export default Details;
