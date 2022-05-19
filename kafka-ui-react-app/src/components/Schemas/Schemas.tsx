import React from 'react';
import { Switch } from 'react-router-dom';
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
      <BreadcrumbRoute exact path={clusterSchemasPath(':clusterName')}>
        <List />
      </BreadcrumbRoute>
      <BreadcrumbRoute exact path={clusterSchemaNewPath(':clusterName')}>
        <New />
      </BreadcrumbRoute>
      <BreadcrumbRoute
        exact
        path={clusterSchemaPath(':clusterName', ':subject')}
      >
        <Details />
      </BreadcrumbRoute>
      <BreadcrumbRoute
        exact
        path={clusterSchemaEditPath(':clusterName', ':subject')}
      >
        <Edit />
      </BreadcrumbRoute>
      <BreadcrumbRoute
        exact
        path={clusterSchemaSchemaDiffPath(':clusterName', ':subject')}
      >
        <DiffContainer />
      </BreadcrumbRoute>
    </Switch>
  );
};

export default Schemas;
