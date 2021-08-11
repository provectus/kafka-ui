import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { clusterKsqlDbPath } from 'lib/paths';
import List from 'components/KsqlDb/List/List';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

const KsqlDb: React.FC = () => (
  <div className="section">
    <Breadcrumb>KSQLDB</Breadcrumb>
    <Switch>
      <Route exact path={clusterKsqlDbPath(':clusterName')} component={List} />
    </Switch>
  </div>
);

export default KsqlDb;
