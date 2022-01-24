import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { clusterKsqlDbPath, clusterKsqlDbQueryPath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Query from 'components/KsqlDb/Query/Query';

const KsqlDb: React.FC = () => {
  return (
    <Switch>
      <Route exact path={clusterKsqlDbPath()} component={List} />
      <Route exact path={clusterKsqlDbQueryPath()} component={Query} />
    </Switch>
  );
};

export default KsqlDb;
