import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { clusterKsqlDbPath, clusterKsqlDbQueryPath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Query from 'components/KsqlDb/Query/Query';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const KsqlDb: React.FC = () => {
  return (
    <Switch>
      <Route exact path={clusterKsqlDbPath()}>
        <BreadcrumbRoute>
          <List />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterKsqlDbQueryPath()}>
        <BreadcrumbRoute>
          <Query />
        </BreadcrumbRoute>
      </Route>
    </Switch>
  );
};

export default KsqlDb;
