import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import {
  RouteParams,
  clusterConnectConnectorEditRelativePath,
  clusterConnectConnectorRelativePath,
  clusterConnectConnectorsRelativePath,
  clusterConnectorNewRelativePath,
  getNonExactPath,
} from 'lib/paths';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

import ListContainer from './List/ListContainer';
import NewContainer from './New/NewContainer';
import DetailsContainer from './Details/DetailsContainer';
import EditContainer from './Edit/EditContainer';

const Connect: React.FC = () => (
  <Routes>
    <Route
      index
      element={
        <BreadcrumbRoute>
          <ListContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterConnectorNewRelativePath}
      element={
        <BreadcrumbRoute>
          <NewContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterConnectConnectorEditRelativePath}
      element={
        <BreadcrumbRoute>
          <EditContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={getNonExactPath(clusterConnectConnectorRelativePath)}
      element={
        <BreadcrumbRoute>
          <DetailsContainer />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={clusterConnectConnectorsRelativePath}
      element={<Navigate to="/" replace />}
    />
    <Route
      path={RouteParams.connectName}
      element={<Navigate to="/" replace />}
    />
  </Routes>
);

export default Connect;
