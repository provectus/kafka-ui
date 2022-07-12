import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import {
  RouteParams,
  clusterConnectConnectorEditRelativePath,
  clusterConnectConnectorRelativePath,
  clusterConnectConnectorsRelativePath,
  clusterConnectorNewRelativePath,
  getNonExactPath,
  clusterConnectorsPath,
} from 'lib/paths';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import useAppParams from 'lib/hooks/useAppParams';

import ListPage from './List/ListPage';
import New from './New/New';
import Edit from './Edit/Edit';
import DetailsPage from './Details/DetailsPage';

const Connect: React.FC = () => {
  const { clusterName } = useAppParams();

  return (
    <Routes>
      <Route
        index
        element={
          <BreadcrumbRoute>
            <ListPage />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterConnectorNewRelativePath}
        element={
          <BreadcrumbRoute>
            <New />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterConnectConnectorEditRelativePath}
        element={
          <BreadcrumbRoute>
            <Edit />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={getNonExactPath(clusterConnectConnectorRelativePath)}
        element={
          <BreadcrumbRoute>
            <DetailsPage />
          </BreadcrumbRoute>
        }
      />
      <Route
        path={clusterConnectConnectorsRelativePath}
        element={<Navigate to={clusterConnectorsPath(clusterName)} replace />}
      />
      <Route
        path={RouteParams.connectName}
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default Connect;
