import React from 'react';
import { Switch } from 'react-router-dom';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';
import {
  clusterBrokerMetricsPath,
  clusterBrokerPath,
  clusterBrokersPath,
} from 'lib/paths';
import BrokersList from 'components/Brokers/List/BrokersList';
import Broker from 'components/Brokers/Broker/Broker';

const Brokers: React.FC = () => (
  <Switch>
    <BreadcrumbRoute
      exact
      path={clusterBrokersPath(':clusterName')}
      component={BrokersList}
    />
    <BreadcrumbRoute
      exact
      path={clusterBrokerPath(':clusterName', ':brokerId')}
      component={Broker}
    />
    <BreadcrumbRoute
      exact
      path={clusterBrokerMetricsPath(':clusterName', ':brokerId')}
      component={Broker}
    />
  </Switch>
);

export default Brokers;
