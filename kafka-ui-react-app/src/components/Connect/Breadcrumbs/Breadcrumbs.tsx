import React from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import { ClusterName, ConnectName, ConnectorName } from 'redux/interfaces';
import {
  clusterConnectorsPath,
  clusterConnectorNewPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorEditPath,
} from 'lib/paths';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

interface RouterParams {
  clusterName: ClusterName;
  connectName: ConnectName;
  connectorName: ConnectorName;
}

const Breadcrumbs: React.FC = () => {
  const { clusterName, connectName, connectorName } = useParams<RouterParams>();

  const rootLinks = [
    {
      href: clusterConnectorsPath(clusterName),
      label: 'All Connectors',
    },
  ];

  const connectorLinks = [
    ...rootLinks,
    {
      href: clusterConnectConnectorPath(
        clusterName,
        connectName,
        connectorName
      ),
      label: connectorName,
    },
  ];

  return (
    <Switch>
      <Route exact path={clusterConnectorsPath(':clusterName')}>
        <Breadcrumb>All Connectors</Breadcrumb>
      </Route>
      <Route exact path={clusterConnectorNewPath(':clusterName')}>
        <Breadcrumb links={rootLinks}>New Connector</Breadcrumb>
      </Route>
      <Route
        exact
        path={clusterConnectConnectorEditPath(
          ':clusterName',
          ':connectName',
          ':connectorName'
        )}
      >
        <Breadcrumb links={connectorLinks}>Edit</Breadcrumb>
      </Route>
      <Route
        path={clusterConnectConnectorPath(
          ':clusterName',
          ':connectName',
          ':connectorName'
        )}
      >
        <Breadcrumb links={rootLinks}>{connectorName}</Breadcrumb>
      </Route>
    </Switch>
  );
};

export default Breadcrumbs;
