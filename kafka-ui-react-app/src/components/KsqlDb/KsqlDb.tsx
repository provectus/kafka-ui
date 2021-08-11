import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { clusterKsqlDbPath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Breadcrumbs from 'components/Connect/Breadcrumbs/Breadcrumbs';

const KsqlDb: React.FC = () => (
  <div className="section">
    <Switch>
      <Route path={clusterKsqlDbPath(':clusterName')} component={Breadcrumbs} />
    </Switch>
    <Switch>
      <Route exact path={clusterKsqlDbPath(':clusterName')} component={List} />
    </Switch>
  </div>
);

export default KsqlDb;
