import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import NewContainer from './New/NewContainer';

const Schemas: React.FC = () => (
  <Switch>
    <Route
      exact
      path="/ui/clusters/:clusterName/schemas"
      component={ListContainer}
    />
    <Route
      exact
      path="/ui/clusters/:clusterName/schemas/new"
      component={NewContainer}
    />
    <Route
      exact
      path="/ui/clusters/:clusterName/schemas/:subject/latest"
      component={DetailsContainer}
    />
  </Switch>
);

export default Schemas;
