import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { getNonExactPath, RouteParams } from 'lib/paths';
import BrokersList from 'components/Brokers/BrokersList/BrokersList';
import Broker from 'components/Brokers/Broker/Broker';

const Brokers: React.FC = () => (
  <Routes>
    <Route index element={<BrokersList />} />
    <Route path={getNonExactPath(RouteParams.brokerId)} element={<Broker />} />
  </Routes>
);

export default Brokers;
