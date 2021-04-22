import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { clusterConnectorsPath } from 'lib/paths';
import ListContainer from 'components/Connect/List/ListContainer';

const Connect: React.FC = () => (
  <Switch>
    <Route
      exact
      path={clusterConnectorsPath(':clusterName')}
      component={ListContainer}
    />
  </Switch>
);

export default Connect;
