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
      <BreadcrumbRoute exact path={clusterConnectorsPath()}>
        <ListContainer />
      </BreadcrumbRoute>
      <BreadcrumbRoute exact path={clusterConnectorNewPath()}>
        <NewContainer />
      </BreadcrumbRoute>
      <BreadcrumbRoute exact path={clusterConnectConnectorEditPath()}>
        <EditContainer />
      </BreadcrumbRoute>
      <BreadcrumbRoute path={clusterConnectConnectorPath()}>
        <DetailsContainer />
      </BreadcrumbRoute>
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
