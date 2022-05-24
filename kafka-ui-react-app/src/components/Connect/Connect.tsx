import React from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
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
      <Route exact path={clusterConnectorsPath()}>
        <BreadcrumbRoute>
          <ListContainer />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterConnectorNewPath()}>
        <BreadcrumbRoute>
          <NewContainer />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterConnectConnectorEditPath()}>
        <BreadcrumbRoute>
          <EditContainer />
        </BreadcrumbRoute>
      </Route>
      <Route path={clusterConnectConnectorPath()}>
        <BreadcrumbRoute>
          <DetailsContainer />
        </BreadcrumbRoute>
      </Route>
      <Redirect
        from={clusterConnectConnectorsPath()}
        to={clusterConnectorsPath()}
      />
      <Redirect
        from={`${clusterConnectsPath()}/:connectName`}
        to={clusterConnectorsPath()}
      />
    </Switch>
  </div>
);

export default Connect;
