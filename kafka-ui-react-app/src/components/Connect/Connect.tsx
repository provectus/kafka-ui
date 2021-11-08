import React from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  clusterConnectorsPath,
  clusterConnectorNewPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorEditPath,
} from 'lib/paths';

import ListContainer from './List/ListContainer';
import NewContainer from './New/NewContainer';
import DetailsContainer from './Details/DetailsContainer';
import EditContainer from './Edit/EditContainer';

const Connect: React.FC = () => (
  <div>
    <Switch>
      <Route
        exact
        path={clusterConnectorsPath(':clusterName')}
        component={ListContainer}
      />
      <Route
        exact
        path={clusterConnectorNewPath(':clusterName')}
        component={NewContainer}
      />
      <Route
        exact
        path={clusterConnectConnectorEditPath(
          ':clusterName',
          ':connectName',
          ':connectorName'
        )}
        component={EditContainer}
      />
      <Route
        path={clusterConnectConnectorPath(
          ':clusterName',
          ':connectName',
          ':connectorName'
        )}
        component={DetailsContainer}
      />
    </Switch>
  </div>
);

export default Connect;
