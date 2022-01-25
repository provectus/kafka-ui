import React from 'react';
import { Switch, useParams } from 'react-router-dom';
import {
  clusterSchemaNewPath,
  clusterSchemaPath,
  clusterSchemaEditPath,
  clusterSchemasPath,
} from 'lib/paths';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchSchemas,
  getAreSchemasFulfilled,
} from 'redux/reducers/schemas/schemasSlice';
import PageLoader from 'components/common/PageLoader/PageLoader';
import List from 'components/Schemas/List/List';
import Details from 'components/Schemas/Details/Details';
import New from 'components/Schemas/New/New';
import Edit from 'components/Schemas/Edit/Edit';
import { BreadcrumbRoute } from 'components/common/Breadcrumb/Breadcrumb.route';

const Schemas: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName } = useParams<{ clusterName: string }>();
  const isFetched = useAppSelector(getAreSchemasFulfilled);

  React.useEffect(() => {
    dispatch(fetchSchemas(clusterName));
  }, []);

  if (!isFetched) {
    return <PageLoader />;
  }

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
