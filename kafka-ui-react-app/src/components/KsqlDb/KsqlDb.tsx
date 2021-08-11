import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { clusterKsqlDbPath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';

const KsqlDb: React.FC = () => (
  <Switch>
    <Route exact path={clusterKsqlDbPath(':clusterName')} component={List} />
  </Switch>
);

export default KsqlDb;
