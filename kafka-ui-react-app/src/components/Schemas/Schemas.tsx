import React from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  clusterSchemaNewPath,
  clusterSchemaPath,
  clusterSchemasPath,
} from 'lib/paths';

import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import NewContainer from './New/NewContainer';
import EditContainer from './Edit/EditContainer';

const Schemas: React.FC = () => (
  <Switch>
    <Route
      exact
      path={clusterSchemasPath(':clusterName')}
      component={ListContainer}
    />
    <Route
      exact
      path={clusterSchemaNewPath(':clusterName')}
      component={NewContainer}
    />
    <Route
      exact
      path={clusterSchemaPath(':clusterName', ':subject')}
      component={DetailsContainer}
    />
    <Route
      exact
      path="/ui/clusters/:clusterName/schemas/:subject/edit"
      component={EditContainer}
    />
  </Switch>
);

export default Schemas;
