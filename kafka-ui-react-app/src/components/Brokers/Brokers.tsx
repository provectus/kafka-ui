import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { getNonExactPath, RouteParams } from 'lib/paths';
import BrokersList from 'components/Brokers/BrokersList/BrokersList';
import Broker from 'components/Brokers/Broker/Broker';
import SuspenseQueryComponent from 'components/common/SuspenseQueryComponent/SuspenseQueryComponent';

const Brokers: React.FC = () => (
  <Routes>
    <Route index element={<BrokersList />} />
    <Route
      path={getNonExactPath(RouteParams.brokerId)}
      element={
        <SuspenseQueryComponent>
          <Broker />
        </SuspenseQueryComponent>
      }
    />
  </Routes>
);

export default Brokers;
