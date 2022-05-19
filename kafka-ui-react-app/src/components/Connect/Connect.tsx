import React from 'react';
import { Switch, Redirect } from 'react-router-dom';
import {
  clusterConnectorsPath,
  clusterConnectsPath,
  clusterConnectorNewPath,
  clusterConnectConnectorPath,
  clusterConnectConnectorEditPath,
  clusterConnectConnectorsPath,
} from 'lib/paths';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

import ListContainer from './List/ListContainer';
import NewContainer from './New/NewContainer';
import DetailsContainer from './Details/DetailsContainer';
import EditContainer from './Edit/EditContainer';

const Connect: React.FC = () => (
  <div>
    <Switch>
      <BreadcrumbRoute exact path={clusterConnectorsPath(':clusterName')}>
        <ListContainer />
      </BreadcrumbRoute>
      <BreadcrumbRoute exact path={clusterConnectorNewPath(':clusterName')}>
        <NewContainer />
      </BreadcrumbRoute>
      <BreadcrumbRoute
        exact
        path={clusterConnectConnectorEditPath(
          ':clusterName',
          ':connectName',
          ':connectorName'
        )}
      >
        <EditContainer />
      </BreadcrumbRoute>
      <BreadcrumbRoute
        path={clusterConnectConnectorPath(
          ':clusterName',
          ':connectName',
          ':connectorName'
        )}
      >
        <DetailsContainer />
      </BreadcrumbRoute>
      <Redirect
        from={clusterConnectConnectorsPath(':clusterName', ':connectName')}
        to={clusterConnectorsPath(':clusterName')}
      />
      <Redirect
        from={`${clusterConnectsPath(':clusterName')}/:connectName`}
        to={clusterConnectorsPath(':clusterName')}
      />
    </Switch>
  </div>
);

export default Connect;
