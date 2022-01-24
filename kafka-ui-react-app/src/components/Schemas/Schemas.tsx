import React from 'react';
import { Switch, Route, useParams } from 'react-router-dom';
import {
  clusterSchemaNewPath,
  clusterSchemaPath,
  clusterSchemaEditPath,
  clusterSchemasPath,
  clusterSchemaSchemaDiffPath,
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
import DiffContainer from 'components/Schemas/Diff/DiffContainer';

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
};

export default Schemas;
