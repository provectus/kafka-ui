import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route, useParams } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';
import NewContainer from './New/NewContainer';

export interface SchemasProps {
  isFetching: boolean;
  fetchSchemasByClusterName: (clusterName: ClusterName) => void;
}

const Schemas: React.FC<SchemasProps> = ({
  isFetching,
  fetchSchemasByClusterName,
}) => {
  const { clusterName } = useParams<{ clusterName: string }>();

  React.useEffect(() => {
    fetchSchemasByClusterName(clusterName);
  }, [fetchSchemasByClusterName, clusterName]);

  if (isFetching) {
    return <PageLoader />;
  }

  return (
    <Switch>
      <Route
        exact
        path="/ui/clusters/:clusterName/schemas"
        component={ListContainer}
      />
      <Route
        exact
        path="/ui/clusters/:clusterName/schemas/new"
        component={NewContainer}
      />
      <Route
        exact
        path="/ui/clusters/:clusterName/schemas/:subject/latest"
        component={DetailsContainer}
      />
    </Switch>
  );
};

export default Schemas;
