import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { clusterKsqlDbPath, clusterKsqlDbQueryPath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Query from 'components/KsqlDb/Query/Query';
import Breadcrumbs from 'components/KsqlDb/BreadCrumbs/BreadCrumbs';

const KsqlDb: React.FC = () => {
  return (
    <div className="section">
      <Switch>
        <Route path={clusterKsqlDbPath()} component={Breadcrumbs} />
      </Switch>
      <Switch>
        <Route exact path={clusterKsqlDbPath()} component={List} />
        <Route exact path={clusterKsqlDbQueryPath()} component={Query} />
      </Switch>
    </div>
  );
};

export default KsqlDb;
