import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import BrokersContainer from 'components/Brokers/BrokersContainer';
import TopicsContainer from 'components/Topics/TopicsContainer';
import ConsumersGroupsContainer from 'components/ConsumerGroups/ConsumersGroupsContainer';
import Schemas from 'components/Schemas/Schemas';

const Cluster: React.FC = () => (
  <Switch>
    <Route
      path="/ui/clusters/:clusterName/brokers"
      component={BrokersContainer}
    />
    <Route
      path="/ui/clusters/:clusterName/topics"
      component={TopicsContainer}
    />
    <Route
      path="/ui/clusters/:clusterName/consumer-groups"
      component={ConsumersGroupsContainer}
    />
    <Route path="/ui/clusters/:clusterName/schemas" component={Schemas} />
    <Redirect
      from="/ui/clusters/:clusterName"
      to="/ui/clusters/:clusterName/brokers"
    />
  </Switch>
);

export default Cluster;
