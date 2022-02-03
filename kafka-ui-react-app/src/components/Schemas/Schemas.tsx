import React from 'react';
import { Switch } from 'react-router-dom';
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
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const Schemas: React.FC = () => {
  return (
    <Switch>
      <BreadcrumbRoute
        exact
        path={clusterSchemasPath(':clusterName')}
        component={List}
      />
      <BreadcrumbRoute
        exact
        path={clusterSchemaNewPath(':clusterName')}
        component={New}
      />
      <BreadcrumbRoute
        exact
        path={clusterSchemaPath(':clusterName', ':subject')}
        component={Details}
      />
      <BreadcrumbRoute
        exact
        path={clusterSchemaEditPath(':clusterName', ':subject')}
        component={Edit}
      />
    </Switch>
  );
};

export default Schemas;
