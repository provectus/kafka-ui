import React from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  clusterSchemaNewPath,
  clusterSchemaPath,
  clusterSchemasPath,
  clusterSchemaSchemaEditPath,
  clusterSchemaSchemaDiffPath,
} from 'lib/paths';

import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import NewContainer from './New/NewContainer';
import EditContainer from './Edit/EditContainer';
import DiffContainer from './Diff/DiffContainer';

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
      path={clusterSchemaSchemaEditPath(':clusterName', ':subject')}
      component={EditContainer}
    />
    <Route
      exact
      path={clusterSchemaSchemaDiffPath(
        ':clusterName',
        ':subject',
        ':leftVersion?',
        ':rightVersion?'
      )}
      component={DiffContainer}
    />
  </Switch>
);

export default Schemas;
