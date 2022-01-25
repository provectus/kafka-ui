import React from 'react';
import { Switch, Route } from 'react-router-dom';
import {
  clusterSchemaNewPath,
  clusterSchemaPath,
  clusterSchemaEditPath,
  clusterSchemasPath,
} from 'lib/paths';
import List from 'components/Schemas/List/List';
import Details from 'components/Schemas/Details/Details';
import New from 'components/Schemas/New/New';
import Edit from 'components/Schemas/Edit/Edit';

const Schemas: React.FC = () => {
  return (
    <Switch>
      <Route exact path={clusterSchemasPath(':clusterName')} component={List} />
      <Route
        exact
        path={clusterSchemaNewPath(':clusterName')}
        component={New}
      />
      <Route
        exact
        path={clusterSchemaPath(':clusterName', ':subject')}
        component={Details}
      />
      <Route
        exact
        path={clusterSchemaEditPath(':clusterName', ':subject')}
        component={Edit}
      />
    </Switch>
  );
};

export default Schemas;
