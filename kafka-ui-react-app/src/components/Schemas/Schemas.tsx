import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';

export interface SchemasProps {
  isFetched: boolean;
  clusterName: ClusterName;
  fetchSchemasByClusterName: (clusterName: ClusterName) => void;
}

const Schemas: React.FC<SchemasProps> = ({
  isFetched,
  fetchSchemasByClusterName,
  clusterName,
}) => {
  React.useEffect(() => {
    fetchSchemasByClusterName(clusterName);
  }, [fetchSchemasByClusterName, clusterName]);

  if (isFetched) {
    return (
      <Switch>
        <Route
          exact
          path="/ui/clusters/:clusterName/schemas"
          component={ListContainer}
        />
        <Route
          exact
          path="/ui/clusters/:clusterName/schemas/:subject/latest"
          component={DetailsContainer}
        />
      </Switch>
    );
  }

  return <PageLoader />;
};

export default Schemas;
