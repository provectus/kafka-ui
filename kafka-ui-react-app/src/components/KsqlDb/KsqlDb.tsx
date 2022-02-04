import React from 'react';
import { Switch } from 'react-router-dom';
import { clusterKsqlDbPath, clusterKsqlDbQueryPath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Query from 'components/KsqlDb/Query/Query';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const KsqlDb: React.FC = () => {
  return (
    <Switch>
      <BreadcrumbRoute exact path={clusterKsqlDbPath()} component={List} />
      <BreadcrumbRoute
        exact
        path={clusterKsqlDbQueryPath()}
        component={Query}
      />
    </Switch>
  );
};

export default KsqlDb;
