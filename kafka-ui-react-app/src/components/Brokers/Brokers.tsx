import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { getNonExactPath, RouteParams } from 'lib/paths';
import BrokersList from 'components/Brokers/BrokersList/BrokersList';
import Broker from 'components/Brokers/Broker/Broker';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const Brokers: React.FC = () => (
  <Routes>
    <Route
      index
      element={
        <BreadcrumbRoute>
          <BrokersList />
        </BreadcrumbRoute>
      }
    />
    <Route
      path={getNonExactPath(RouteParams.brokerId)}
      element={
        <BreadcrumbRoute>
          <Broker />
        </BreadcrumbRoute>
      }
    />
  </Routes>
);

export default Brokers;
