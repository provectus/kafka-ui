import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
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
  <Routes>
    <Route
      path={clusterConnectorsPath()}
      element={
        <BreadcrumbRoute>
          <ListContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterConnectorNewPath()}
      element={
        <BreadcrumbRoute>
          <NewContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterConnectConnectorEditPath()}
      element={
        <BreadcrumbRoute>
          <EditContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterConnectConnectorPath()}
      element={
        <BreadcrumbRoute>
          <DetailsContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterConnectConnectorsPath()}
      element={<Navigate to={clusterConnectorsPath()} replace />}
    />
    <Route
      path={`${clusterConnectsPath()}/:connectName`}
      element={<Navigate to={clusterConnectorsPath()} replace />}
    />
  </Routes>
);

export default Connect;
