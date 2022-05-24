import React from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  clusterSchemaNewPath,
  clusterSchemaPath,
  clusterSchemaEditPath,
  clusterSchemasPath,
  clusterSchemaSchemaDiffPath,
} from 'lib/paths';
import List from 'components/Schemas/List/List';
import Details from 'components/Schemas/Details/Details';
import New from 'components/Schemas/New/New';
import Edit from 'components/Schemas/Edit/Edit';
import DiffContainer from 'components/Schemas/Diff/DiffContainer';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const Schemas: React.FC = () => {
  return (
    <Switch>
      <Route exact path={clusterSchemasPath()}>
        <BreadcrumbRoute>
          <List />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterSchemaNewPath()}>
        <BreadcrumbRoute>
          <New />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterSchemaPath()}>
        <BreadcrumbRoute>
          <Details />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterSchemaEditPath()}>
        <BreadcrumbRoute>
          <Edit />
        </BreadcrumbRoute>
      </Route>
      <Route exact path={clusterSchemaSchemaDiffPath()}>
        <BreadcrumbRoute>
          <DiffContainer />
        </BreadcrumbRoute>
      </Route>
    </Switch>
  );
};

export default Schemas;
