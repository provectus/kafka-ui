import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import {
  RouteParams,
  clusterConnectConnectorRelativePath,
  clusterConnectConnectorsRelativePath,
  clusterConnectorNewRelativePath,
  getNonExactPath,
  clusterConnectorsPath,
} from 'lib/paths';
import useAppParams from 'lib/hooks/useAppParams';
import SuspenseQueryComponent from 'components/common/SuspenseQueryComponent/SuspenseQueryComponent';

import ListPage from './List/ListPage';
import New from './New/New';
import DetailsPage from './Details/DetailsPage';

const Connect: React.FC = () => {
  const { clusterName } = useAppParams();

  return (
    <Routes>
      <Route index element={<ListPage />} />
      <Route path={clusterConnectorNewRelativePath} element={<New />} />
      <Route
        path={getNonExactPath(clusterConnectConnectorRelativePath)}
        element={
          <SuspenseQueryComponent>
            <DetailsPage />
          </SuspenseQueryComponent>
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
